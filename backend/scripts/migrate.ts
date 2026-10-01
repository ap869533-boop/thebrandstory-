import { dbQueryStrict } from '../config/db';
import { migration001 } from '../migrations/001_add_query_indexes';
import { migration002 } from '../migrations/002_add_creator_social_columns';
import { migration003 } from '../migrations/003_add_creator_event_price';
import { migration004 } from '../migrations/004_add_brand_legal_name';

const migrations = [migration001, migration002, migration003, migration004];

async function runMigrations() {
  await dbQueryStrict(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id VARCHAR(128) PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  const appliedRows: any = await dbQueryStrict('SELECT id FROM schema_migrations');
  const applied = new Set((appliedRows || []).map((row: any) => row.id));

  for (const migration of migrations) {
    if (applied.has(migration.id)) continue;
    await migration.up();
    await dbQueryStrict('INSERT INTO schema_migrations (id) VALUES (?)', [migration.id]);
    console.log(`Applied migration: ${migration.id}`);
  }
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
