import { dbQueryStrict } from '../config/db';

export const migration003 = {
  id: '003_add_creator_event_price',
  up: async () => {
    console.log('Running migration 003: Adding event_price column to creators table');
    
    const queries = [
      "ALTER TABLE creators ADD COLUMN event_price INT DEFAULT 0;"
    ];

    for (const q of queries) {
      try {
        await dbQueryStrict(q);
      } catch (e: any) {
        if (e.code === 'ER_DUP_FIELDNAME') {
          console.log(`Column already exists, skipping: ${q}`);
        } else {
          throw e;
        }
      }
    }
  }
};
