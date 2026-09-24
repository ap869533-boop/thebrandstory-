const fs = require('fs');
const path = require('path');

const filePaths = [
  path.join(__dirname, 'frontend/src/views/LoginView.tsx'),
  path.join(__dirname, 'frontend/src/components/common/AuthModal.tsx')
];

filePaths.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Change text
  content = content.replace(/Display card photo/g, 'Display story photo');
  
  // Add ImageCropperModal component if not present
  if (!content.includes('<ImageCropperModal')) {
    const endMatch = "    </div>\n  );\n};";
    const replacement = `      {cropModalData && (
        <ImageCropperModal
          imageSrc={cropModalData.src}
          aspect={cropModalData.type === 'avatar' ? 1 : 9 / 16}
          shape={cropModalData.type === 'avatar' ? 'round' : 'rect'}
          onCropDone={(file) => {
            uploadCreatorMedia(file, cropModalData.type);
            setCropModalData(null);
          }}
          onCancel={() => setCropModalData(null)}
        />
      )}
    </div>
  );
};`;
    
    // AuthModal has different ending
    if (filePath.includes('AuthModal.tsx')) {
        const authEndMatch = "      </div>\n    </div>\n  );\n};";
        const authReplacement = `      </div>
      {cropModalData && (
        <ImageCropperModal
          imageSrc={cropModalData.src}
          aspect={cropModalData.type === 'avatar' ? 1 : 9 / 16}
          shape={cropModalData.type === 'avatar' ? 'round' : 'rect'}
          onCropDone={(file) => {
            uploadCreatorMedia(file, cropModalData.type);
            setCropModalData(null);
          }}
          onCancel={() => setCropModalData(null)}
        />
      )}
    </div>
  );
};`;
        content = content.replace(authEndMatch, authReplacement);
    } else {
        content = content.replace(endMatch, replacement);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
});
console.log('done');
