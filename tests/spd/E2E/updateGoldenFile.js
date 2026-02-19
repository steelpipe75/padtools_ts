const fs = require("node:fs");
const path = require("node:path");
const glob = require("glob");

// Helper function to normalize path separators for glob, which prefers forward slashes.
const normalizePathForGlob = (p) => p.replace(/\\/g, "/");

// The base directory is the directory where this script is located.
const baseDir = __dirname;

const tempOriginalDir = path.join(baseDir, "temp", "original");
const tempTerminalOffsetDir = path.join(baseDir, "temp", "TerminalOffset");
const outputOriginalDir = path.join(baseDir, "output", "original");
const outputTerminalOffsetDir = path.join(baseDir, "output", "TerminalOffset");

// console.log("DEBUG: __dirname:", __dirname);

// Ensure output directories exist
fs.mkdirSync(outputOriginalDir, { recursive: true });
fs.mkdirSync(outputTerminalOffsetDir, { recursive: true });

// Function to remove files
const removeFiles = (pattern) => {
  const normalizedPattern = normalizePathForGlob(pattern);
  const files = glob.sync(normalizedPattern);
  files.forEach((file) => {
    // Note: glob.sync might return paths with forward slashes.
    // fs module on Windows can handle both slash types.
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`Removed: ${file}`);
    }
  });
};

// Function to copy and rename files
const copyAndRenameFiles = (sourceDir, destinationDir) => {
  const normalizedSourceDir = normalizePathForGlob(sourceDir);
  const sourcePattern = `${normalizedSourceDir}/*.svg`;
  const files = glob.sync(sourcePattern);

  if (files.length === 0) {
    console.log(`No .svg files found in ${sourceDir}. Skipping copy.`);
    return;
  }

  files.forEach((file) => {
    const baseName = path.basename(file);
    const newFileName = baseName.replace(/\.svg$/, ".svg.txt"); // Use regex for safer replacement
    const destinationPath = path.join(destinationDir, newFileName);
    fs.copyFileSync(file, destinationPath);
    console.log(`Copied: ${file} to ${destinationPath}`);
  });
};

console.log("Removing existing golden files...");
removeFiles(path.join(outputOriginalDir, "*.svg.txt"));
removeFiles(path.join(outputTerminalOffsetDir, "*.svg.txt"));

console.log("Copying and renaming new golden files from temp...");
copyAndRenameFiles(tempOriginalDir, outputOriginalDir);
copyAndRenameFiles(tempTerminalOffsetDir, outputTerminalOffsetDir);

console.log("Golden files updated successfully.");
