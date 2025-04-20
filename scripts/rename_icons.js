const fs = require('fs');
const path = require('path');

const mipmapDirs = [
  'mipmap-mdpi',
  'mipmap-hdpi',
  'mipmap-xhdpi',
  'mipmap-xxhdpi',
  'mipmap-xxxhdpi'
];

const androidResPath = path.join(__dirname, '../android/app/src/main/res');

mipmapDirs.forEach(dir => {
  const dirPath = path.join(androidResPath, dir);
  const appIconPath = path.join(dirPath, 'appicon.png');
  const launcherPath = path.join(dirPath, 'ic_launcher.png');
  
  if (fs.existsSync(appIconPath)) {
    fs.renameSync(appIconPath, launcherPath);
    console.log(`Đã đổi tên ${appIconPath} thành ${launcherPath}`);
  } else {
    console.log(`Không tìm thấy file appicon.png trong ${dir}`);
  }
}); 