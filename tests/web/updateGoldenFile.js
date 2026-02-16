const fs = require("node:fs");
const path = require("node:path");
const glob = require("glob");

// Helper function to normalize path separators for glob, which prefers forward slashes.
const normalizePathForGlob = (p) => p.replace(/\\/g, "/");

// The base directory is the directory where this script is located (tests/web).
const baseDir = __dirname;

const tempDir = path.join(baseDir, "temp");
const outputDir = path.join(baseDir, "output");

// Ensure output directory exists
fs.mkdirSync(outputDir, { recursive: true });

// Function to remove existing golden files from the output directory
const removeFiles = (pattern) => {
	const normalizedPattern = normalizePathForGlob(pattern);
	const files = glob.sync(normalizedPattern);
	files.forEach((file) => {
		if (fs.existsSync(file)) {
			fs.unlinkSync(file);
			console.log(`Removed: ${file}`);
		}
	});
};

// Function to copy new golden files from temp to output, renaming them
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
		const newFileName = baseName.replace(/\.svg$/, ".svg.txt"); // a.svg -> a.svg.txt
		const destinationPath = path.join(destinationDir, newFileName);
		fs.copyFileSync(file, destinationPath);
		console.log(`Copied: ${file} to ${destinationPath}`);
	});
};

console.log("Removing existing web golden files...");
removeFiles(path.join(outputDir, "*.svg.txt"));

console.log("Copying and renaming new web golden files from temp...");
copyAndRenameFiles(tempDir, outputDir);

console.log("Web golden files updated successfully.");
