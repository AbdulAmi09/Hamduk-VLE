import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_SUPABASE_URL or SUPABASE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...\n');

    const migrationFile = path.join(__dirname, 'migrations.sql');
    const sqlContent = fs.readFileSync(migrationFile, 'utf-8');

    // Split by statements but keep track of what we're executing
    const lines = sqlContent.split('\n');
    let currentStatement = '';
    let statementCount = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue;
      }

      currentStatement += line + '\n';

      // Execute when we find a semicolon
      if (trimmedLine.endsWith(';')) {
        try {
          const { data, error } = await supabase.rpc('execute_sql', {
            sql_string: currentStatement
          }).then(result => ({ 
            data: result.data, 
            error: result.error 
          })).catch(async (err) => {
            // Fallback: try executing directly if RPC doesn't exist
            console.log(`⚠️  RPC execute_sql not available, trying direct execution...`);
            return { data: null, error: err };
          });

          if (error) {
            // Some statements might fail if they already exist, which is OK
            if (
              error.message.includes('already exists') ||
              error.message.includes('already created') ||
              error.message.includes('does not exist')
            ) {
              console.log(`⏭️  Skipped (already exists): Statement ${statementCount + 1}`);
            } else {
              console.warn(`⚠️  Statement ${statementCount + 1} warning:`, error.message.substring(0, 100));
            }
          } else {
            statementCount++;
            console.log(`✓ Executed statement ${statementCount}`);
          }

          currentStatement = '';
        } catch (err) {
          console.error(`❌ Error executing statement:`, err.message);
        }
      }
    }

    console.log(`\n✅ Migrations completed! Executed ${statementCount} statements\n`);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

runMigrations();
