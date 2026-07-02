const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./src', (filePath) => {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        if (filePath.endsWith('.css')) {
            content = content.replace(/\/\*[\s\S]*?\*\//g, '');
        }
        
        if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
            content = content.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '');
            content = content.replace(/\/\*[\s\S]*?\*\//g, '');
            content = content.replace(/(?<!https?:)\/\/.*$/gm, '');
        }

        content = content.replace(/\n\s*\n/g, '\n\n');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Cleaned: ' + filePath);
    }
});