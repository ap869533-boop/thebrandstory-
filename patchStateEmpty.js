const fs = require('fs');
const path = require('path');

const loginViewPath = path.join(__dirname, 'frontend/src/views/LoginView.tsx');
let loginViewContent = fs.readFileSync(loginViewPath, 'utf8');

loginViewContent = loginViewContent.replace(
  "username: instagramHandle, gender, ageGroup, currentCity: creatorState.trim(), state: null, primaryCategory: category,",
  "username: instagramHandle, gender, ageGroup, currentCity: creatorState.trim(), state: '', primaryCategory: category,"
);
fs.writeFileSync(loginViewPath, loginViewContent, 'utf8');

const authModalPath = path.join(__dirname, 'frontend/src/components/common/AuthModal.tsx');
let authModalContent = fs.readFileSync(authModalPath, 'utf8');

authModalContent = authModalContent.replace(
  "username: instagramHandle, gender, currentCity: creatorState.trim(), state: null, primaryCategory: category,",
  "username: instagramHandle, gender, currentCity: creatorState.trim(), state: '', primaryCategory: category,"
);

fs.writeFileSync(authModalPath, authModalContent, 'utf8');
console.log('done');
