const fs = require('fs');
const path = require('path');

const loginViewPath = path.join(__dirname, 'frontend/src/views/LoginView.tsx');
let content = fs.readFileSync(loginViewPath, 'utf8');

// Update size to true 9:16
content = content.replace('h-36 w-24 shrink-0', 'h-[160px] w-[90px] shrink-0');

// Insert modal
if (!content.includes('<ImageCropperModal')) {
  content = content.replace('      </div>\n    </div>\n  );\n};', 
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
};`);
}

fs.writeFileSync(loginViewPath, content, 'utf8');

// Do the same for AuthModal.tsx
const authModalPath = path.join(__dirname, 'frontend/src/components/common/AuthModal.tsx');
let authContent = fs.readFileSync(authModalPath, 'utf8');

authContent = authContent.replace('h-36 w-24 shrink-0', 'h-[160px] w-[90px] shrink-0');

if (!authContent.includes('<ImageCropperModal')) {
  authContent = authContent.replace('      </div>\n    </div>\n  );\n};', 
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
};`);
}

fs.writeFileSync(authModalPath, authContent, 'utf8');

console.log('done');
