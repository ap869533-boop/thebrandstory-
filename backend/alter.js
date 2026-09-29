const mysql = require('mysql2/promise');

async function main() {
  const c = await mysql.createConnection({host: 'localhost', user: 'root', database: 'brandstory_db'});
  await c.query(`ALTER TABLE messages ADD COLUMN attachment_url VARCHAR(500) DEFAULT NULL, ADD COLUMN attachment_type VARCHAR(20) DEFAULT NULL, ADD COLUMN attachment_name VARCHAR(200) DEFAULT NULL;`);
  console.log('Altered successfully');
  process.exit(0);
}

main().catch(console.error);
