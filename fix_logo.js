const fs = require('fs');
const b64 = fs.readFileSync('logo_small.b64', 'utf8').trim();
const prefix = 'data:image/webp;base64,';

function replaceInFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('src="/icons/image.png"', 'src="' + prefix + b64 + '"');
  fs.writeFileSync(file, content);
}

replaceInFile('src/app/(lobby)/page.tsx');
replaceInFile('src/app/(lobby)/loading.tsx');
console.log('Replaced successfully');

