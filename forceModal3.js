const fs = require('fs');

const loginViewPath = require('path').join(__dirname, 'frontend/src/views/LoginView.tsx');
let content = fs.readFileSync(loginViewPath, 'utf8');

// Insert before the last `    </div>\r\n  );\r\n};`
// Since regex with \s* is robust, let's just use that.
content = content.replace(/<\/div>\s*<\/div>\s*\);\s*};\s*$/i, 
`      </div>
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
};
`);

fs.writeFileSync(loginViewPath, content, 'utf8');
console.log('LoginView patched');

// AuthModal
const authModalPath = require('path').join(__dirname, 'frontend/src/components/common/AuthModal.tsx');
let authContent = fs.readFileSync(authModalPath, 'utf8');

authContent = authContent.replace(/<\/div>\s*<\/div>\s*\);\s*};\s*$/i, 
`      </div>
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
};
`);

fs.writeFileSync(authModalPath, authContent, 'utf8');
console.log('AuthModal patched');
