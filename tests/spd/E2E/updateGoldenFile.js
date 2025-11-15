const fs = require('fs');
const path = require('path');
const glob = require('glob');

const baseDir = './tests/spd/E2E';
const tempOriginalDir = path.join(baseDir, 'temp', 'original');
const tempTerminalOffsetDir = path.join(baseDir, 'temp', 'TerminalOffset');
const outputOriginalDir = path.join(baseDir, 'output', 'original');
const outputTerminalOffsetDir = path.join(baseDir, 'output', 'TerminalOffset');

// Ensure output directories exist
fs.mkdirSync(outputOriginalDir, { recursive: true });
fs.mkdirSync(outputTerminalOffsetDir, { recursive: true });

// Function to remove files
const removeFiles = (pattern) => {
    const files = glob.sync(pattern);
    files.forEach(file => {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            console.log(`Removed: ${file}`);
        }
    });
};

// Function to copy and rename files
const copyAndRenameFiles = (sourceDir, destinationDir) => {
    const files = glob.sync(path.join(sourceDir, '*.svg'));
    files.forEach(file => {
        const baseName = path.basename(file);
        const newFileName = baseName.replace('.svg', '.svg.txt');
        const destinationPath = path.join(destinationDir, newFileName);
        fs.copyFileSync(file, destinationPath);
        console.log(`Copied: ${file} to ${destinationPath}`);
    });
};

console.log('Removing existing golden files...');
removeFiles(path.join(outputOriginalDir, '*.svg.txt'));
removeFiles(path.join(outputTerminalOffsetDir, '*.svg.txt'));

console.log('Copying and renaming new golden files from temp...');
copyAndRenameFiles(tempOriginalDir, outputOriginalDir);
copyAndRenameFiles(tempTerminalOffsetDir, outputTerminalOffsetDir);

console.log('Golden files updated successfully.');
