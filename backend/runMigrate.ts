import { runAutoMigrations } from './utils/autoMigrate';

runAutoMigrations().then(() => {
  console.log('Migrations script finished.');
  process.exit(0);
}).catch(err => {
  console.error('Migration script failed', err);
  process.exit(1);
});
