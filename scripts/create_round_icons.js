const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

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
  const launcherPath = path.join(dirPath, 'ic_launcher.png');
  const roundLauncherPath = path.join(dirPath, 'ic_launcher_round.png');
  
  if (fs.existsSync(launcherPath)) {
    // Tạo icon tròn từ icon vuông
    sharp(launcherPath)
      .resize(192, 192) // Kích thước lớn nhất
      .composite([{
        input: Buffer.from(`
          <svg width="192" height="192">
            <circle cx="96" cy="96" r="96" fill="white"/>
          </svg>
        `),
        blend: 'dest-in'
      }])
      .toFile(roundLauncherPath)
      .then(() => {
        console.log(`Đã tạo ${roundLauncherPath}`);
      })
      .catch(err => {
        console.error(`Lỗi khi tạo ${roundLauncherPath}:`, err);
      });
  } else {
    console.log(`Không tìm thấy file ic_launcher.png trong ${dir}`);
  }
}); 