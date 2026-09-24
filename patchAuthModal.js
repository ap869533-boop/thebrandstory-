const fs = require('fs');
const path = require('path');

const authModalPath = path.join(__dirname, 'frontend/src/components/common/AuthModal.tsx');
let authModalContent = fs.readFileSync(authModalPath, 'utf8');

authModalContent = authModalContent.replace(
  "username: instagramHandle, gender, state: creatorState.trim(), primaryCategory: category,",
  "username: instagramHandle, gender, currentCity: creatorState.trim(), state: null, primaryCategory: category,"
);

fs.writeFileSync(authModalPath, authModalContent, 'utf8');
console.log('done');
