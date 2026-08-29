import fs from 'node:fs';
import path from 'node:path';

const seedFile = path.resolve(process.cwd(), '.data/new_sponsor_seed.json');
const envFile = path.resolve(process.cwd(), '.env');

if (!fs.existsSync(seedFile)) {
  console.error('Seed file not found:', seedFile);
  process.exit(1);
}

const seedData = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
const newSeed = seedData.seedHex;
const newAddr = seedData.publicAddress;

let envContent = fs.readFileSync(envFile, 'utf8');

// Preserve old seed as fallback
if (!envContent.includes('FALLBACK_WALLET_SEED=')) {
  const match = envContent.match(/MASTER_WALLET_SEED=([^\r\n]+)/);
  if (match) {
    envContent += `\nFALLBACK_WALLET_SEED=${match[1]}`;
  }
}

// Update MASTER_WALLET_SEED
envContent = envContent.replace(/MASTER_WALLET_SEED=[^\r\n]+/, `MASTER_WALLET_SEED=${newSeed}`);

// Update WALLET_PERSIST_DIR
if (envContent.includes('WALLET_PERSIST_DIR=')) {
  envContent = envContent.replace(/WALLET_PERSIST_DIR=[^\r\n]+/, 'WALLET_PERSIST_DIR=.data/new-sponsor-state/preview');
} else {
  envContent += '\nWALLET_PERSIST_DIR=.data/new-sponsor-state/preview\n';
}

fs.writeFileSync(envFile, envContent);
console.log('UPDATED_ENV_FOR_NEW_WALLET=' + newAddr);
