# Python Lab: Learn, Code, Build

Static site (no backend). Current topic: **Object-Oriented Programming**.

## Run locally
Browsers block Web Workers on `file://`, so serve the folder:
```
cd python-lab
python3 -m http.server 8000
```
Open http://localhost:8000 and wait for "Python ready".

## Publish on GitHub Pages
```
git init && git add . && git commit -m "Python Lab: OOP"
git branch -M main
git remote add origin https://github.com/<you>/python-lab.git
git push -u origin main
```
Then Settings → Pages → Deploy from branch → `main` / root.

## Add a topic
Add an entry to `data/lessons.js` (same shape as `oop`) and open the site with `?topic=<id>`. Register any new demo in `Demos` in `js/app.js`.

## Notes
- `input()` reads from the "Input" box (one line per call), since browsers can't pause for typing.
- Code runs in a Web Worker and is stopped after a timeout (8 s run, 5 s per test).
- Progress is stored in `localStorage` and does not sync across devices.
