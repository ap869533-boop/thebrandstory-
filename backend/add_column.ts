import { dbQuery } from './config/db';

async function run() {
  try {
    await dbQuery('ALTER TABLE campaign_requirements ADD COLUMN valid_until DATE');
    console.log('Column valid_until added successfully.');
  } catch (err: any) {
    if (err.message.includes('Duplicate column name')) {
        console.log('Column already exists.');
    } else {
        console.error(err);
    }
  }
  process.exit();
}

run();
