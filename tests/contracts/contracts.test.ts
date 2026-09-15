import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

async function testContracts() {
  console.log('================================================================');
  console.log('🧪 Running DUSTify Smart Contract Verification Suite');
  console.log('================================================================\n');

  const contractDir = path.join(rootDir, 'contracts', 'managed', 'dustify');
  const zkirDir = path.join(contractDir, 'zkir');
  const contractModulePath = path.join(contractDir, 'contract', 'index.js');
  const dtsPath = path.join(contractDir, 'contract', 'index.d.ts');

  const expectedCircuits = [
    'initialize',
    'registerDApp',
    'authorizeRelayer',
    'revokeRelayer',
    'sponsorTransaction',
    'sponsorMessage',
    'topUpQuota',
    'advanceEpoch',
    'setPaused',
  ];

  console.log('--- Testing Contract: Dustify.compact ---');

  // 1. Check directory structure
  if (!fs.existsSync(zkirDir) || !fs.existsSync(contractModulePath) || !fs.existsSync(dtsPath)) {
    console.error(`❌ Missing compiled artifacts in contracts/managed/dustify!`);
    process.exit(1);
  }
  console.log(`✅ Build artifacts exist (contract, zkir, index.d.ts).`);

  // 2. Import Contract module
  try {
    const mod = await import(`file://${contractModulePath}`);
    if (!mod.Contract) {
      throw new Error('Contract class export missing');
    }
    console.log(`✅ Contract module loaded successfully.`);

    // 3. Inspect generated ZKIR files
    const zkirFiles = fs.readdirSync(zkirDir);
    console.log(`✅ Generated ${zkirFiles.length} ZKIR circuit IR definitions: ${zkirFiles.join(', ')}`);

    // 4. Verify expected circuits
    for (const circuit of expectedCircuits) {
      const found = zkirFiles.some((f) => f.includes(circuit));
      if (found) {
        console.log(`  ✓ Circuit verified: ${circuit}`);
      } else {
        throw new Error(`Circuit file not found for: ${circuit}`);
      }
    }
  } catch (err: any) {
    console.error(`❌ Failed loading or validating module:`, err.message);
    process.exit(1);
  }

  console.log('\n================================================================');
  console.log('🎉 DUSTIFY SMART CONTRACT VERIFICATION PASSED!');
  console.log('================================================================');
}

testContracts().catch((err) => {
  console.error('Fatal error during contract testing:', err);
  process.exit(1);
});
