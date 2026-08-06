import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const m = fs.readFileSync('.env','utf8').match(/^VERCEL_TOKEN=\"?([^\"\r\n]+)/m);
if (!m) { console.log('missing'); process.exit(1); }
const r = spawnSync('vercel', ['whoami'], { encoding: 'utf8', shell: true, env: { ...process.env, VERCEL_TOKEN: m[1] } });
console.log((r.stdout || r.stderr || '').trim());
console.log('exit', r.status);
