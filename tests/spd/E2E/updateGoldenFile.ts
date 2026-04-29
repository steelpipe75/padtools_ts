import * as fs from "node:fs";
import * as path from "node:path";
import { globSync } from "glob";

// Helper function to normalize path separators for glob, which prefers forward slashes.
const normalizePathForGlob = (p: string) => p.replace(/\\/g, "/");

// The base directory is the directory where this script is located.
const baseDir = __dirname;

const tempOriginalDir = path.join(baseDir, "temp", "Original");
const tempTerminalOffsetDir = path.join(baseDir, "temp", "TerminalOffset");
const outputOriginalDir = path.join(baseDir, "output", "Original");
const outputTerminalOffsetDir = path.join(baseDir, "output", "TerminalOffset");

// Ensure output directories exist
fs.mkdirSync(outputOriginalDir, { recursive: true });
fs.mkdirSync(outputTerminalOffsetDir, { recursive: true });

// Function to remove files
const removeFiles = (pattern: string) => {
  const normalizedPattern = normalizePathForGlob(pattern);
  const files = globSync(normalizedPattern);
  files.forEach((file) => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`Removed: ${file}`);
    }
  });
};

// Function to copy and rename files
const copyAndRenameFiles = (sourceDir: string, destinationDir: string) => {
  const normalizedSourceDir = normalizePathForGlob(sourceDir);
  const sourcePattern = `${normalizedSourceDir}/*.svg`;
  const files = globSync(sourcePattern);

  if (files.length === 0) {
    console.log(`No .svg files found in ${sourceDir}. Skipping copy.`);
    return;
  }

  files.forEach((file) => {
    const baseName = path.basename(file);
    const newFileName = baseName.replace(/\.svg$/, ".svg.txt");
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
