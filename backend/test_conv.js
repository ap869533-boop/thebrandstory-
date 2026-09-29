const mysql = require('mysql2/promise');
async function main() {
  const c = await mysql.createConnection({host: 'localhost', user: 'root', database: 'brandstory_db'});
  const [rows] = await c.query(`
    SELECT c.id, c.brand_user_id, c.creator_user_id, c.last_message, bp.brand_name, cr.name as creator_name 
    FROM conversations c 
    LEFT JOIN brand_profiles bp ON bp.user_id = c.brand_user_id 
    LEFT JOIN creators cr ON cr.id = c.creator_id 
    WHERE c.brand_user_id = 'usr_1790295943478'
  `);
  console.log(rows);
  process.exit(0);
}
main().catch(console.error);
