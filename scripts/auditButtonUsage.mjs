import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '../');
const searchDirs = ['app', 'components'];

const fileList = [];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  }
}

searchDirs.forEach((dir) => {
  const fullPath = path.join(rootDir, dir);
  if (fs.existsSync(fullPath)) {
    walk(fullPath);
  }
});

let report = '# Button Usage Audit Report\n\n';
report += 'This report lists all frontend components/pages and indicates whether they use the `Button` component.\n\n';
report += '| File | Uses Button? |\n';
report += '| --- | --- |\n';

let totalFiles = 0;
let usedCount = 0;

fileList.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');
  // Simple check for Button usage
  const usesButton = content.includes('<Button') || content.includes('import Button') || content.includes('import { Button');
  
  if (usesButton) {
    usedCount++;
  }
  totalFiles++;
  
  const relativePath = path.relative(rootDir, file).replace(/\\/g, '/');
  report += `| ${relativePath} | ${usesButton ? '✅ Yes' : '❌ No'} |\n`;
});

report += `\n**Summary**: ${usedCount} out of ${totalFiles} files use the Button component.\n`;

const reportPath = path.join(rootDir, 'ButtonUsageReport.md');
fs.writeFileSync(reportPath, report);

console.log(`Audit complete. Report generated at ${reportPath}`);
