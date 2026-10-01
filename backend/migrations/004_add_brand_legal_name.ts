import { dbQueryStrict } from '../config/db';

export const migration004 = {
  id: '004_add_brand_legal_name',
  async up() {
    try {
      await dbQueryStrict(`ALTER TABLE brand_profiles ADD COLUMN legal_name VARCHAR(255) DEFAULT NULL AFTER brand_name`);
      console.log('Added legal_name to brand_profiles');
    } catch (e: any) {
      if (!e.message.includes('Duplicate column name')) {
        throw e;
      }
    }
  },
};
