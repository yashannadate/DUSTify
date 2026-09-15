import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contractsRoot = path.resolve(__dirname, '..');

const targetDir = path.join(contractsRoot, 'managed', 'dustify');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log('================================================================');
console.log('📦 Compiling DUSTify Smart Contract via Midnight Compact Compiler');
console.log('================================================================\n');

console.log('[Compile] Compiling src/Dustify.compact -> managed/dustify...');
try {
  const cmd = `wsl -d Ubuntu -- bash -c "cd /mnt/d/DUSTify/contracts && ~/.local/bin/compact compile src/Dustify.compact managed/dustify"`;
  const out = execSync(cmd, { encoding: 'utf-8' });
  console.log(`✅ [Dustify.compact] Compilation Succeeded:\n${out.trim() || 'Circuits compiled.'}`);
  console.log('\n================================================================');
  console.log('🎉 DUSTIFY SMART CONTRACT COMPILED SUCCESSFULLY!');
  console.log('================================================================');
} catch (err) {
  console.error('❌ Compilation Failed!');
  console.error(err.stdout ? err.stdout.toString() : '');
  console.error(err.stderr ? err.stderr.toString() : '');
  process.exit(1);
}
