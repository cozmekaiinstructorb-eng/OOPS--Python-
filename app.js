// App logic: renders the selected topic from data/lessons.js. Nothing here is specific to OOP,
// except the "objectFactory" demo, which is registered in the Demos table below.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const T = PYTHON_LAB_TOPICS[new URLSearchParams(location.search).get('topic')] || Object.values(PYTHON_LAB_TOPICS)[0];
  const tasks = [...T.exercises, T.project];
  const key = id => T.id + ':' + id;
  const stages = [['learn', 'Learn'], ['explore', 'Explore'], ['practice', 'Practice'], ['build', 'Build'], ['code', 'Code'], ['progress', 'Progress']];
  const badgeList = [...tasks.map(t => t.badge), T.quiz.badge];
  let current = null, hintShown = 0, editor, busy = false;

  // ---------- header ----------
  function header() {
    const xp = Progress.xp, lvl = Math.floor(xp / 50) + 1;
    $('#levelTxt').textContent = 'Level ' + lvl;
    $('#xpTxt').textContent = xp + ' XP';
    $('#xpFill').style.width = (xp % 50) * 2 + '%';
  }
  PyRunner.onStatus = s => { const p = $('#loadState'); p.textContent = s === 'ready' ? 'Python ready' : 'Loading Python…'; p.className = 'pill ' + (s === 'ready' ? 'ok' : 'warn'); };

  // ---------- editor (CodeMirror, with a plain textarea fallback) ----------
  function initEditor() {
    const ta = $('#editor');
    if (window.CodeMirror) {
      const cm = CodeMirror.fromTextArea(ta, { mode: 'python', theme: 'material-darker', lineNumbers: true, indentUnit: 4, extraKeys: { Tab: c => c.replaceSelection('    ') } });
      editor = { get: () => cm.getValue(), set: v => cm.setValue(v), onChange: f => cm.on('change', f) };
    } else {
      ta.style.cssText = 'width:100%;height:300px;font-family:monospace';
      editor = { get: () => ta.value, set: v => ta.value = v, onChange: f => ta.addEventListener('input', f) };
    }
    editor.onChange(() => { Progress.setCode(current ? key(current.id) : key('free'), editor.get()); });
  }

  // ---------- navigation ----------
  function show(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('on', v.id === 'v-' + view));
    document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.v === view));
    const ws = $('#workspace');
    if (['practice', 'build', 'code'].includes(view)) {
      $('#ws-' + view).appendChild(ws); ws.classList.add('show');
      if (view === 'practice') openTask(T.exercises.find(e => !Progress.isDone(key(e.id))) || T.exercises[0]);
      if (view === 'build') openTask(T.project);
      if (view === 'code') openTask(null);
    } else ws.classList.remove('show');
    if (view === 'progress') renderProgress();
    if (view === 'practice') renderTabs();
  }
  function renderNav() {
    $('#nav').innerHTML = stages.map(([v, l]) => `<button data-v="${v}">${l}</button>`).join('');
    $('#nav').onclick = e => e.target.dataset.v && show(e.target.dataset.v);
  }

  // ---------- Stage 1: learn ----------
  function renderLearn() {
    $('#v-learn').innerHTML = `<div class="card"><h1>${esc(T.title)}</h1><p>${T.intro}</p><h3>You will learn to</h3><ul>${T.objectives.map(o => `<li>${esc(o)}</li>`).join('')}</ul></div>` +
      T.learn.map((s, i) => `<div class="card"><h2>${esc(s.title)}</h2><p>${s.text}</p><pre>${esc(s.code)}</pre><button data-run="${i}">Run this example</button><pre class="out" id="lo${i}" hidden></pre><p>${s.explain}</p></div>`).join('');
    $('#v-learn').onclick = async e => {
      const i = e.target.dataset.run; if (i === undefined) return;
      const o = $('#lo' + i); o.hidden = false; o.textContent = 'Running…';
      const r = await PyRunner.run(T.learn[i].code); o.textContent = (r.out + r.err).trim() || '(no output)';
    };
  }

  // ---------- Stage 2: explore ----------
  const Demos = {
    // Create objects from a Pet blueprint and call their methods. Shows matching Python.
    objectFactory(root) {
      const pets = [], log = [];
      root.innerHTML = `<div class="card"><h2>Object factory</h2><p>The class is the blueprint. Every time you press <b>Create object</b>, a new, separate pet is built from it.</p>
        <pre>class Pet:
    def __init__(self, name, kind):
        self.name = name
        self.kind = kind
        self.energy = 5
    def play(self):  self.energy -= 2
    def eat(self):   self.energy += 2</pre>
        <div class="bar"><input id="pn" placeholder="Name" value="Rex" aria-label="Pet name"><select id="pk" aria-label="Kind"><option>dog</option><option>cat</option><option>rabbit</option></select><button class="primary" id="pc">Create object</button></div>
        <div class="pets" id="pp"></div><h3>Python for what you did</h3><pre id="pl">(nothing yet)</pre><button id="po">Open this code in the editor</button></div>`;
      const emoji = { dog: '🐶', cat: '🐱', rabbit: '🐰' };
      const draw = () => {
        $('#pp', root).innerHTML = pets.map((p, i) => `<div class="pet">${emoji[p.kind]} <b>${esc(p.name)}</b><div class="e"><i style="width:${Math.max(0, Math.min(10, p.energy)) * 10}%"></i></div>energy ${p.energy}<br><button data-i="${i}" data-a="play">play()</button> <button data-i="${i}" data-a="eat">eat()</button></div>`).join('') || '<em>No objects yet.</em>';
        $('#pl', root).textContent = log.join('\n') || '(nothing yet)';
      };
      const varName = p => p.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'pet';
      $('#pc', root).onclick = () => { const n = $('#pn', root).value.trim() || 'Pet'; const p = { name: n, kind: $('#pk', root).value, energy: 5 }; pets.push(p); log.push(`${varName(p)} = Pet("${n}", "${p.kind}")`); draw(); };
      $('#pp', root).onclick = e => { const b = e.target; if (!b.dataset.a) return; const p = pets[b.dataset.i]; p.energy += b.dataset.a === 'play' ? -2 : 2; log.push(`${varName(p)}.${b.dataset.a}()`); draw(); };
      $('#po', root).onclick = () => { Progress.setCode(key('free'), 'class Pet:\n    def __init__(self, name, kind):\n        self.name = name\n        self.kind = kind\n        self.energy = 5\n\n    def play(self):\n        self.energy -= 2\n\n    def eat(self):\n        self.energy += 2\n\n' + log.join('\n') + (log.length ? '\n' : '') + 'print(' + (pets[0] ? varName(pets[0]) + '.energy' : '"add objects first"') + ')\n'); show('code'); };
      draw();
    }
  };
  function renderExplore() { Demos[T.demo]($('#v-explore')); }

  // ---------- Stages 3-5: tasks & editor ----------
  function renderTabs() {
    $('#practiceTabs').innerHTML = T.exercises.map(e => `<button data-t="${e.id}" class="${current && current.id === e.id ? 'on' : ''}">${Progress.isDone(key(e.id)) ? '✅ ' : ''}${e.level}: ${esc(e.title)}</button>`).join('');
    $('#practiceTabs').onclick = ev => { const t = T.exercises.find(x => x.id === ev.target.dataset.t); if (t) { openTask(t); renderTabs(); } };
  }
  function openTask(task) {
    current = task; hintShown = 0;
    $('#results').innerHTML = ''; $('#output').textContent = 'Output appears here.'; $('#output').className = '';
    $('#checkBtn').style.display = task ? '' : 'none'; $('#resetBtn').style.display = '';
    $('#taskInfo').innerHTML = task ? `<h2>${esc(task.title)} <span class="lvl">${task.level} · ${task.xp} XP</span>${Progress.isDone(key(task.id)) ? ' ✅' : ''}</h2><p>${task.prompt}</p><div id="hints"></div><button id="hintBtn">Show a hint (${task.hints.length} available)</button>` : '<h2>Free coding</h2><p>Write anything you like. Nothing here is graded.</p>';
    editor.set(Progress.getCode(key(task ? task.id : 'free')) ?? (task ? task.starter : T.freeStarter));
    if (task) $('#hintBtn').onclick = () => {
      $('#hints').insertAdjacentHTML('beforeend', `<div class="hint">Hint ${hintShown + 1}: ${esc(task.hints[hintShown])}</div>`);
      if (++hintShown >= task.hints.length) $('#hintBtn').remove(); else $('#hintBtn').textContent = `Show another hint (${task.hints.length - hintShown} left)`;
    };
  }
  const lastLine = e => e.trim().split('\n').pop();
  function setBusy(b) { busy = b; ['#runBtn', '#checkBtn'].forEach(s => $(s).disabled = b); }
  async function run() {
    if (busy) return; setBusy(true); $('#output').className = ''; $('#output').textContent = 'Running…';
    const r = await PyRunner.run(editor.get(), $('#stdin').value, 8000);
    $('#output').className = r.err ? 'err' : ''; $('#output').textContent = (r.out + r.err).trim() || '(no output)'; setBusy(false);
  }
  async function check() {
    if (busy || !current) return; setBusy(true); $('#results').innerHTML = '<p>Running tests…</p>';
    const code = editor.get(); let pass = 0, html = '';
    for (const t of current.tests) {
      const r = await PyRunner.run(code + "\nprint('<<<T>>>')\n" + t.code, t.stdin || '', 5000);
      let ok = false, msg;
      if (r.err) msg = lastLine(r.err);
      else { const got = (r.out.split('<<<T>>>')[1] || '').trim(); ok = got === t.expect; if (!ok) msg = `expected ${esc(t.expect)}, got ${esc(got) || 'nothing'}`; }
      if (ok) pass++;
      html += `<div class="t ${ok ? 'ok' : 'no'}">${ok ? '✔' : '✘'} ${esc(t.name)}${ok ? '' : ': ' + esc(msg)}</div>`;
    }
    html = `<p><b>${pass} of ${current.tests.length} tests passed.</b></p>` + html;
    if (pass === current.tests.length) {
      const first = Progress.complete(key(current.id), current.xp, current.badge), i = tasks.indexOf(current), next = tasks[i + 1];
      html += `<div class="win"><h3>${current.badge.icon} Challenge complete!</h3><p>${first ? `+${current.xp} XP. Badge unlocked: <b>${current.badge.name}</b>.` : 'Already completed. XP is only awarded once.'}</p><p>Skills: ${current.skills.join(', ')}.</p>${next ? `<button id="nextBtn" class="accent">Next: ${esc(next.title)}</button>` : '<button id="nextBtn" class="accent">Take the final quiz</button>'} <button id="freeBtn">Experiment in the Code tab</button></div>`;
      header();
    } else html += '<p>Not there yet. Read the failed test, then try a hint if you are stuck.</p>';
    $('#results').innerHTML = html; setBusy(false);
    const nb = $('#nextBtn'); if (nb) { const i = tasks.indexOf(current); nb.onclick = () => { const n = tasks[i + 1]; if (!n) show('progress'); else if (n === T.project) show('build'); else { show('practice'); openTask(n); renderTabs(); } }; $('#freeBtn').onclick = () => show('code'); }
  }

  // ---------- Stage 7: progress, badges, final quiz ----------
  function renderProgress() {
    const got = Progress.badges(), done = Progress.doneCount(tasks.map(t => key(t.id))), q = T.quiz;
    $('#v-progress').innerHTML = `<div class="card"><h2>Your progress</h2><p>${Progress.xp} XP · ${done} of ${tasks.length} challenges done</p><div class="badges">${badgeList.map(b => `<div class="badge ${got.includes(b.id) ? 'got' : ''}">${b.icon} ${b.name}</div>`).join('')}</div></div>
      <div class="card" id="quiz"><h2>Final quiz <span class="lvl">${q.xp} XP</span></h2>${q.questions.map((x, i) => `<p><b>${i + 1}. ${esc(x.q)}</b></p>${x.o.map((o, j) => `<button class="opt" data-q="${i}" data-o="${j}">${esc(o)}</button>`).join('')}<div id="qw${i}"></div>`).join('')}<div class="bar"><button class="accent" id="qs">Check quiz</button></div><div id="qr"></div></div>
      <div class="card"><button id="rs">Reset all progress</button> <small>Progress lives in this browser only.</small></div>`;
    const pick = {};
    $('#quiz').onclick = e => { const b = e.target.closest('.opt'); if (!b) return; pick[b.dataset.q] = +b.dataset.o; document.querySelectorAll(`.opt[data-q="${b.dataset.q}"]`).forEach(x => x.classList.toggle('sel', x === b)); };
    $('#qs').onclick = () => {
      let score = 0; q.questions.forEach((x, i) => { const ok = pick[i] === x.a; if (ok) score++; $('#qw' + i).innerHTML = `<div class="t ${ok ? 'ok' : 'no'}">${ok ? '✔' : '✘'} ${esc(x.why)}</div>`; });
      let msg = `You scored ${score} of ${q.questions.length}.`;
      if (score >= q.pass) msg += Progress.complete(key('quiz'), q.xp, q.badge) ? ` +${q.xp} XP and the ${q.badge.name} badge!` : ' Already completed.'; else msg += ' Review the Learn stage and try again.';
      $('#qr').innerHTML = `<div class="win">${msg}</div>`; header();
    };
    $('#rs').onclick = () => { if (confirm('Erase XP, badges and saved code in this browser?')) { Progress.reset(); header(); renderProgress(); } };
  }

  // ---------- start ----------
  $('#topicName').textContent = T.title;
  $('#runBtn').onclick = run; $('#checkBtn').onclick = check;
  $('#clearBtn').onclick = () => { $('#output').textContent = ''; $('#output').className = ''; };
  $('#resetBtn').onclick = () => { editor.set(current ? current.starter : T.freeStarter); };
  renderNav(); initEditor(); renderLearn(); renderExplore(); header(); show('learn');
})();
