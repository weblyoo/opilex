import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const replacements = [
  { from: /Opilex/g, to: 'Opilex' },
  { from: /opilex/g, to: 'opilex' },
  { from: /OPILEX/g, to: 'OPILEX' },
  { from: /opilex-2a79f/g, to: 'opilex-2a79f' }
];

const extensions = ['.tsx', '.ts', '.js', '.jsx', '.html', '.css', '.json', '.md'];

async function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        await processDirectory(fullPath);
      }
    } else if (extensions.includes(path.extname(file))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      for (const r of replacements) {
        if (r.from.test(content)) {
          content = content.replace(r.from, r.to);
          changed = true;
        }
      }

      if (changed) {
        console.log(`📝 Updated: ${fullPath}`);
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

async function run() {
  console.log('🚀 Starting Rebranding (Opilex -> Opilex)...');
  await processDirectory(rootDir);
  console.log('🎉 Rebranding complete!');
}

run();
