const mysql = require('mysql2/promise');

async function runMigration() {
  console.log('Starting database migration...');
  let conn;
  try {
    conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'brandstory_db'
    });

    console.log('Connected to database.');

    const queries = [
      "ALTER TABLE creators ADD COLUMN phone VARCHAR(50) DEFAULT NULL;",
      "ALTER TABLE creators ADD COLUMN email VARCHAR(255) DEFAULT NULL;",
      "ALTER TABLE creators ADD COLUMN facebook_url VARCHAR(255) DEFAULT NULL;",
      "ALTER TABLE creators ADD COLUMN youtube_url VARCHAR(255) DEFAULT NULL;"
    ];

    for (const q of queries) {
      try {
        await conn.query(q);
        console.log(`Executed: ${q}`);
      } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
          console.log(`Column already exists, skipping: ${q}`);
        } else {
          console.error(`Error executing query: ${q}`, e.message);
        }
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    if (conn) await conn.end();
  }
}

runMigration();
