import { dbQueryStrict } from '../config/db';

export const migration002 = {
  id: '002_add_creator_social_columns',
  up: async () => {
    console.log('Running migration 002: Adding social columns to creators table');
    
    const queries = [
      "ALTER TABLE creators ADD COLUMN phone VARCHAR(50) DEFAULT NULL;",
      "ALTER TABLE creators ADD COLUMN email VARCHAR(255) DEFAULT NULL;",
      "ALTER TABLE creators ADD COLUMN facebook_url VARCHAR(255) DEFAULT NULL;",
      "ALTER TABLE creators ADD COLUMN youtube_url VARCHAR(255) DEFAULT NULL;"
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
