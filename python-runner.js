// Runs Python with Pyodide inside a Web Worker. If code runs too long we terminate
// the worker, so infinite loops can't freeze the page. Input comes from the "stdin" box
// (browsers can't pause for a real input() prompt without special server headers).
const PyRunner = (() => {
  const workerSrc = `
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
    let py, lines = [];
    const ready = loadPyodide().then(p => { py = p; py.setStdin({ stdin: () => lines.length ? lines.shift() : undefined }); postMessage({ type: 'ready' }); });
    onmessage = async e => {
      await ready;
      let out = '', err = '';
      lines = e.data.stdin ? e.data.stdin.split('\\n') : [];
      py.setStdout({ batched: s => out += s + '\\n' });
      py.setStderr({ batched: s => err += s + '\\n' });
      const g = py.globals.get('dict')();
      try { await py.runPythonAsync(e.data.code, { globals: g }); }
      catch (ex) {
        const m = String(ex.message).split('\\n'); const i = m.findIndex(l => l.includes('<exec>'));
        err += (i > 0 ? 'Traceback (most recent call last):\\n' + m.slice(i).join('\\n') : m.join('\\n'));
      }
      g.destroy();
      postMessage({ type: 'result', out, err });
    };`;
  let worker, ready, onStatus = () => {};
  function start() {
    onStatus('loading');
    worker = new Worker(URL.createObjectURL(new Blob([workerSrc], { type: 'text/javascript' })));
    ready = new Promise(res => { worker.onmessage = e => { if (e.data.type === 'ready') { onStatus('ready'); res(); } }; });
  }
  start();
  return {
    set onStatus(f) { onStatus = f; },
    async run(code, stdin = '', timeoutMs = 8000) {
      await ready;
      return new Promise(resolve => {
        const w = worker;
        const timer = setTimeout(() => {
          w.terminate(); start();
          resolve({ out: '', err: 'Timed out after ' + timeoutMs / 1000 + ' seconds. Check your loop condition.', timedOut: true });
        }, timeoutMs);
        w.onmessage = e => { if (e.data.type === 'result') { clearTimeout(timer); resolve(e.data); } };
        w.postMessage({ code, stdin });
      });
    }
  };
})();
