const fs = require('fs');
const path = require('path');

const filePaths = [
  path.join(__dirname, 'frontend/src/views/LoginView.tsx'),
  path.join(__dirname, 'frontend/src/components/common/AuthModal.tsx')
];

filePaths.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace flex gap-3 container with new layout
  content = content.replace(/<div className="flex gap-3">[\s\S]*?<label className="relative flex h-28 w-28[\s\S]*?<\/label>[\s\S]*?<label className="relative flex h-28 min-w-0 flex-1[\s\S]*?<\/label>\s*<\/div>/g, 
    `<div className="flex gap-6 justify-center items-center py-2">
                      <label className="relative flex h-28 w-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50 text-center text-slate-500 hover:bg-slate-100 transition-colors">
                        {profilePhotoUrl ? <img src={profilePhotoUrl} alt="Profile photo preview" className="h-full w-full object-cover" /> : <span className="px-2 text-xs">{uploadingMedia === 'avatar' ? 'Uploading...' : 'Profile photo'}</span>}
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0" disabled={uploadingMedia !== null} onChange={e => { const file = e.target.files?.[0]; if (file) { setCropModalData({ src: URL.createObjectURL(file), type: 'avatar' }); e.target.value = ''; } }} />
                      </label>
                      <label className="relative flex h-36 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center text-slate-500 hover:bg-slate-100 transition-colors shadow-sm">
                        {bannerUrl ? <img src={bannerUrl} alt="Display card photo preview" className="h-full w-full object-cover" /> : <span className="px-2 text-xs">{uploadingMedia === 'cover' ? 'Uploading...' : 'Display card photo'}</span>}
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0" disabled={uploadingMedia !== null} onChange={e => { const file = e.target.files?.[0]; if (file) { setCropModalData({ src: URL.createObjectURL(file), type: 'cover' }); e.target.value = ''; } }} />
                      </label>
                    </div>`);

  fs.writeFileSync(filePath, content, 'utf8');
});
console.log('done');
