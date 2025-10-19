import { execSync } from 'child_process';
import { platform } from 'os';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('🔧 Loading .env file...');
  dotenv.config({ path: envPath });
}

// Check if at least one API key is available
const hasYescaleKey = !!process.env.YESCALE_API_KEY;
const hasOpenaiKey = !!process.env.OPENAI_API_KEY;

if (!hasYescaleKey && !hasOpenaiKey) {
  console.error('❌ Missing API keys: Neither YESCALE_API_KEY nor OPENAI_API_KEY is set');
  console.log('\n🔑 Set at least one API key:');
  
  if (platform() === 'win32') {
    console.log('\n# Windows PowerShell');
    console.log('$env:YESCALE_API_KEY="your_api_key"');
    console.log('$env:OPENAI_API_KEY="your_api_key"');
  } else {
    console.log('\n# Linux/MacOS');
    console.log('export YESCALE_API_KEY=your_api_key');
    console.log('export OPENAI_API_KEY=your_api_key');
  }
  
  console.log('\nOr create a .env file in the project root.\n');
  process.exit(1);
}

try {
  console.log('🚀 Starting Content Generation...');
  execSync('node src/worker.js', { stdio: 'inherit' });
} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
