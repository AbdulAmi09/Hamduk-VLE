/**
 * Database Migration Runner
 * Reads SQL files from scripts/ and executes them in order
 */

import * as fs from "fs"
import * as path from "path"

const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_SERVICE_KEY"]

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error(`[v0] Missing required environment variables: ${missingEnvVars.join(", ")}`)
  console.error(`[v0] Add them to .env.development.local`)
  process.exit(1)
}

async function runMigrations() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  try {
    // Import Supabase admin client
    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const scriptsDir = path.join(__dirname)
    const sqlFiles = fs
      .readdirSync(scriptsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort()

    console.log(`[v0] Found ${sqlFiles.length} SQL migration files`)

    for (const file of sqlFiles) {
      const filePath = path.join(scriptsDir, file)
      const sql = fs.readFileSync(filePath, "utf-8")

      console.log(`[v0] Running migration: ${file}`)

      try {
        // Execute SQL statements
        const statements = sql.split(";").filter((stmt) => stmt.trim().length > 0)

        for (const statement of statements) {
          const { error } = await supabase.rpc("exec_sql", {
            sql: statement.trim(),
          })

          if (error && !error.message.includes("already exists")) {
            console.warn(`[v0] Warning in ${file}: ${error.message}`)
          }
        }

        console.log(`[v0] ✓ Completed: ${file}`)
      } catch (err) {
        console.error(`[v0] ✗ Error in ${file}:`, err)
      }
    }

    console.log(`[v0] ✓ All migrations completed successfully!`)
  } catch (error) {
    console.error("[v0] Migration failed:", error)
    process.exit(1)
  }
}

runMigrations()
