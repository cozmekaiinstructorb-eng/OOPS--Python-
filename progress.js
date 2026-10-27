// Saves XP, badges and your code in localStorage (this browser only).
const Progress = (() => {
  const KEY = 'pythonlab.v1';
  let s = { xp: 0, done: {}, badges: [], code: {} };
  try { s = Object.assign(s, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} };
  return {
    get xp() { return s.xp; },
    badges: () => s.badges,
    isDone: id => !!s.done[id],
    doneCount: ids => ids.filter(i => s.done[i]).length,
    getCode: id => s.code[id],
    setCode(id, c) { s.code[id] = c; save(); },
    // Returns true only the first time, so XP can't be farmed.
    complete(id, xp, badge) {
      if (s.done[id]) return false;
      s.done[id] = true; s.xp += xp; if (badge) s.badges.push(badge.id); save(); return true;
    },
    reset() { s = { xp: 0, done: {}, badges: [], code: {} }; save(); }
  };
})();
