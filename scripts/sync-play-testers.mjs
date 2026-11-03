import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// Load keys from .env.local or .env
function loadEnv() {
  const env = { ...process.env };
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
        if (match && !env[match[1]]) {
          env[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  }
  return env;
}

const env = loadEnv();
const apiKey = env.GOOGLE_PLAY_STORE_API_KEY || env.NEXT_PUBLIC_GOOGLE_PLAY_STORE_API_KEY;
const supabaseUrl = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('==============================================================================');
console.log('MZANSI MIDNIGHT // GOOGLE PLAY "VISITA TESTERS" SYNCHRONIZATION PIPELINE');
console.log('==============================================================================');
console.log(`Package ID: za.co.mzansimidnight.app`);
console.log(`Google Play Store API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'NOT FOUND'}`);
console.log(`Supabase URL: ${supabaseUrl || 'NOT FOUND'}`);

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncTesters() {
  try {
    const { data, error } = await supabase
      .from('mzansi_play_testers')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Note: Could not query mzansi_play_testers table:', error.message);
      console.log('Run the schema at supabase/testers_schema.sql in the Supabase Dashboard SQL editor.');
      return;
    }

    console.log(`\nFound ${data.length} tester record(s) in mzansi_play_testers:\n`);

    const visitaTesters = data.filter((t) => t.list_name === 'Visita Testers');
    console.log(`[Visita Testers List] Total: ${visitaTesters.length} emails`);

    visitaTesters.forEach((tester, index) => {
      console.log(
        `  ${index + 1}. ${tester.email} [Status: ${tester.status}] (Registered: ${new Date(tester.created_at).toLocaleString()})`
      );
    });

    const isCsvFlag = process.argv.includes('--csv');
    if (isCsvFlag) {
      const csvPath = path.join(process.cwd(), 'visita-testers-export.csv');
      const csvContent = ['Email,List,Status,RegisteredAt']
        .concat(visitaTesters.map((t) => `${t.email},${t.list_name},${t.status},${t.created_at}`))
        .join('\n');
      fs.writeFileSync(csvPath, csvContent, 'utf8');
      console.log(`\nExported CSV to: ${csvPath}`);
    }

    console.log('\n[Google Play Closed Testing Policy Checklist]');
    console.log('  Requirement: Minimum 20 opt-in testers continuously engaged for 14 days.');
    console.log(`  Current Visita Testers Count: ${visitaTesters.length} / 20 minimum.`);
    console.log(`  Google Play App URL: https://play.google.com/store/apps/details?id=za.co.mzansimidnight.app&hl=en`);
    console.log(`  Web Testing Opt-In URL: https://play.google.com/apps/testing/za.co.mzansimidnight.app`);
  } catch (err) {
    console.error('Failed to sync testers:', err);
  }
}

syncTesters();

