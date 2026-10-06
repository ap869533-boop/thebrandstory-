const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'autoMigrate.ts');
let content = fs.readFileSync(filePath, 'utf8');

const supportTables = `
      \`CREATE TABLE IF NOT EXISTS support_faqs (
        id VARCHAR(64) PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_support_faqs_category (category),
        INDEX idx_support_faqs_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci\`,
      \`CREATE TABLE IF NOT EXISTS support_tickets (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) DEFAULT NULL,
        user_role ENUM('BRAND', 'CREATOR', 'GUEST') DEFAULT 'GUEST',
        guest_name VARCHAR(120) DEFAULT NULL,
        guest_email VARCHAR(150) DEFAULT NULL,
        category VARCHAR(100) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
        access_token VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_support_tickets_user (user_id),
        INDEX idx_support_tickets_status (status),
        INDEX idx_support_tickets_token (access_token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci\`,
      \`CREATE TABLE IF NOT EXISTS support_ticket_replies (
        id VARCHAR(64) PRIMARY KEY,
        ticket_id VARCHAR(64) NOT NULL,
        sender_id VARCHAR(64) DEFAULT NULL,
        sender_role ENUM('USER', 'ADMIN', 'GUEST') NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ticket_replies_ticket (ticket_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci\`
    ];
`;

content = content.replace(/    \];\r?\n\r?\n    for \(const sql of coreTables\) \{/, supportTables + '\n    for (const sql of coreTables) {');
fs.writeFileSync(filePath, content);
console.log('Update successful');
