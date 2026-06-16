import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '../');
const dirsToClean = [
  path.join(rootDir, 'public'),
  path.join(rootDir, 'backend/public')
];

const subfolders = ['hero', 'logo', 'payment', 'product', 'reviews', 'social'];
const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp4'];

let deletedCount = 0;

dirsToClean.forEach((baseDir) => {
  if (!fs.existsSync(baseDir)) return;
  
  subfolders.forEach((subfolder) => {
    const targetDir = path.join(baseDir, subfolder);
    if (!fs.existsSync(targetDir)) return;
    
    const files = fs.readdirSync(targetDir);
    files.forEach((file) => {
      // Do not delete .gitkeep files
      if (file === '.gitkeep') return;
      
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        const filePath = path.join(targetDir, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted local image: ${path.relative(rootDir, filePath).replace(/\\/g, '/')}`);
          deletedCount++;
        } catch (err) {
          console.error(`Failed to delete local image ${filePath}:`, err);
        }
      }
    });
  });
});

console.log(`\nCleanup complete. Deleted ${deletedCount} local images.`);
process.exit(0);
