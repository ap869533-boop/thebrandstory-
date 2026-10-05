const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({ user: 'root', database: 'brandstory_db' });
  const [rows] = await conn.execute("SELECT * FROM conversations WHERE creator_user_id = 'usr_1791185744226' ORDER BY created_at DESC LIMIT 5");
  console.log(rows);
  process.exit(0);
}
run();
