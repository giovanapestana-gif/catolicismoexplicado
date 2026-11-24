// Uso:
//   node render.mjs <projeto.json> <workdir> --stills 1.0,5.5,12   → PNGs de teste em <workdir>/stills
//   node render.mjs <projeto.json> <workdir> <saida.mp4>           → vídeo completo (usa voice.wav do workdir)
import http from 'http'; import fs from 'fs'; import path from 'path'; import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
let chromium;
for (const p of ['playwright', '/opt/npm-tools/node_modules/playwright/index.mjs']) { try { ({ chromium } = await import(p)); break; } catch {} }
const [proj, work, third, fourth] = process.argv.slice(2);
const project = JSON.parse(fs.readFileSync(proj, 'utf8'));
const timings = JSON.parse(fs.readFileSync(path.join(work, 'timings.json'), 'utf8'));
const FPS = 30;

const MIME = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const f = path.join(here, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+$/, '/page.html'));
  if (!f.startsWith(here) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(0);
const port = server.address().port;

const exe = ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(p => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--use-angle=swiftshader', '--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('console', m => { if (['error', 'warning'].includes(m.type())) console.log('[page]', m.text().slice(0, 300)); });
page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0, 400)));
await page.goto(`http://localhost:${port}/page.html`);
await page.waitForFunction('window.ready === true', null, { timeout: 60000 });
const info = await page.evaluate(([p, t]) => window.init(p, t), [project, timings]);
console.log('init', info);

if (third === '--stills') {
  const dir = path.join(work, 'stills'); fs.mkdirSync(dir, { recursive: true });
  for (const ts of fourth.split(',').map(Number)) {
    const b64 = await page.evaluate(([i]) => window.frame(i, 30, 0.95), [Math.round(ts * FPS)]);
    const f = path.join(dir, `t${ts.toFixed(1)}.jpg`); fs.writeFileSync(f, Buffer.from(b64, 'base64')); console.log('still', f);
  }
} else {
  const total = Math.ceil(timings.duration * FPS);
  const a = fs.existsSync(path.join(work, 'voice.wav')) ? path.join(work, 'voice.wav') : path.join(work, 'voice_raw.wav');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-i', a,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', third], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const b64 = await page.evaluate(([i]) => window.frame(i, 30, 0.92), [i]);
    if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 60 === 0) console.log(`frame ${i}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)}s  (${(((Date.now() - t0) / 1000) / (i + 1)).toFixed(2)} s/frame)`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('pronto', third, ((Date.now() - t0) / 1000).toFixed(0) + 's');
}
await browser.close(); server.close();
