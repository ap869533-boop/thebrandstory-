import { dbQueryStrict } from '../config/db';

type IndexDefinition = {
  table: string;
  name: string;
  columns: string;
  unique?: boolean;
};

const indexes: IndexDefinition[] = [
  { table: 'creators', name: 'idx_creators_user_id', columns: 'user_id' },
  { table: 'creators', name: 'idx_creators_browse', columns: 'status, current_city, followers' },
  { table: 'campaign_requirements', name: 'idx_campaign_public', columns: 'approval_status, status, created_at' },
  { table: 'campaign_requirements', name: 'idx_campaign_owner', columns: 'user_id, created_at' },
  { table: 'enquiry_leads', name: 'idx_enquiry_creator_created', columns: 'creator_id, created_at' },
  { table: 'creator_reviews', name: 'idx_creator_reviews_creator_created', columns: 'creator_id, created_at' },
  { table: 'saved_folders', name: 'idx_saved_folders_user_created', columns: 'user_id, created_at' },
];

async function addIndexIfMissing(index: IndexDefinition) {
  const rows: any = await dbQueryStrict(
    `SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ? LIMIT 1`,
    [index.table, index.name]
  );
  if (Array.isArray(rows) && rows.length > 0) return;
  await dbQueryStrict(`CREATE ${index.unique ? 'UNIQUE ' : ''}INDEX \`${index.name}\` ON \`${index.table}\` (${index.columns})`);
}

export const migration001 = {
  id: '001_add_query_indexes',
  async up() {
    for (const index of indexes) await addIndexIfMissing(index);

    const duplicateApplicants: any = await dbQueryStrict(
      `SELECT campaign_id, creator_id, COUNT(*) AS total
       FROM campaign_applicants
       GROUP BY campaign_id, creator_id
       HAVING COUNT(*) > 1
       LIMIT 1`
    );
    if (Array.isArray(duplicateApplicants) && duplicateApplicants.length > 0) {
      throw new Error('Cannot add unique campaign applicant constraint until duplicate applications are reviewed.');
    }

    await addIndexIfMissing({
      table: 'campaign_applicants',
      name: 'uq_campaign_applicant',
      columns: 'campaign_id, creator_id',
      unique: true,
    });
  },
};
