const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = process.cwd();
const translationsDir = path.join(root, 'lib', 'translations');
const enPath = path.join(translationsDir, 'en.ts');

const langOrder = [
  ['ar','Arabic','ar'],
  ['hi','Hindi','hi'],
  ['fr','French','fr'],
  ['bn','Bengali','bn'],
  ['ru','Russian','ru'],
  ['pt','Portuguese (Brazil)','pt'],
  ['de','German','de'],
  ['ja','Japanese','ja'],
  ['ko','Korean','ko'],
  ['vi','Vietnamese','vi'],
  ['tr','Turkish','tr'],
  ['th','Thai','th'],
  ['nl','Dutch','nl'],
  ['pl','Polish','pl'],
];

function parseEnObject() {
  const raw = fs.readFileSync(enPath, 'utf8');
  const match = raw.match(/const en = ([\s\S]*?)\n} as const/);
  if (!match) throw new Error('Could not parse en.ts object');
  const objLiteral = match[1] + '\n}';
  const script = new vm.Script(`(${objLiteral})`);
  return script.runInNewContext({});
}

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

async function translateText(text, target, tries=3) {
  if (!text || !text.trim()) return text;
  if (/^\s*\/\//.test(text)) return text;
  for (let attempt=1; attempt<=tries; attempt++) {
    try {
      const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=' +
        encodeURIComponent(target) + '&dt=t&q=' + encodeURIComponent(text);
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      const translated = (json?.[0] || []).map(x => x?.[0] || '').join('');
      return translated || text;
    } catch (e) {
      if (attempt === tries) return text;
      await sleep(300 * attempt);
    }
  }
  return text;
}

function isPrimitive(val){ return val === null || ['string','number','boolean'].includes(typeof val); }

async function deepTranslate(node, target, cache) {
  if (Array.isArray(node)) {
    const out = [];
    for (const item of node) out.push(await deepTranslate(item, target, cache));
    return out;
  }
  if (node && typeof node === 'object') {
    const out = {};
    for (const [k,v] of Object.entries(node)) {
      out[k] = await deepTranslate(v, target, cache);
    }
    return out;
  }
  if (typeof node === 'string') {
    if (cache.has(node)) return cache.get(node);
    const t = await translateText(node, target);
    cache.set(node, t);
    return t;
  }
  if (isPrimitive(node)) return node;
  return node;
}

function toTs(value, indent = 0) {
  const sp = '  '.repeat(indent);
  if (typeof value === 'string') {
    return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  }
  if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const lines = value.map(v => `${'  '.repeat(indent+1)}${toTs(v, indent+1)}`);
    return `[\n${lines.join(',\n')}\n${sp}]`;
  }
  const entries = Object.entries(value || {});
  if (entries.length === 0) return '{}';
  const lines = entries.map(([k,v]) => {
    const key = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : `'${k.replace(/'/g, "\\'")}'`;
    return `${'  '.repeat(indent+1)}${key}: ${toTs(v, indent+1)}`;
  });
  return `{\n${lines.join(',\n')}\n${sp}}`;
}

async function run() {
  const enObj = parseEnObject();
  for (const [code, label, target] of langOrder) {
    const outPath = path.join(translationsDir, `${code}.ts`);
    if (fs.existsSync(outPath)) {
      console.log(`skip ${code}.ts (exists)`);
      continue;
    }
    console.log(`creating ${code}.ts ...`);
    const cache = new Map();
    const translatedObj = await deepTranslate(enObj, target, cache);
    const content = `// ═══════════════════════════════════════════════════════════════════════════\n// PROGREX — ${label} Translation File\n// ═══════════════════════════════════════════════════════════════════════════\nconst ${code} = ${toTs(translatedObj, 0)} as const\n\nexport default ${code}\n`;
    fs.writeFileSync(outPath, content, 'utf8');
    console.log(`done ${code}.ts`);
  }
  console.log('ALL REQUESTED LANGUAGES PROCESSED');
}

run().catch(err => { console.error(err); process.exit(1); });
