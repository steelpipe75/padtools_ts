const fs = require("node:fs");
const path = require("node:path");

const baseDir = "./tests/cli/E2E";
const tempDir = path.join(baseDir, "temp");
const outputDir = path.join(baseDir, "output");
const outputMinifiedDir = path.join(baseDir, "output_minified");

const filesToProcess = [
  {
    temp: "sample_input_base_background_color_black.svg",
    output: "sample_input_base_background_color_black.svg.txt",
    targetDir: outputDir,
  },
  {
    temp: "sample_input_base_background_color_gray.svg",
    output: "sample_input_base_background_color_gray.svg.txt",
    targetDir: outputDir,
  },
  {
    temp: "sample_input_base_background_color_none.svg",
    output: "sample_input_base_background_color_none.svg.txt",
    targetDir: outputDir,
  },
  {
    temp: "sample_input_base_background_color_white.svg",
    output: "sample_input_base_background_color_white.svg.txt",
    targetDir: outputDir,
  },
  {
    temp: "sample_input_font_size_20.svg",
    output: "sample_input_font_size_20.svg.txt",
    targetDir: outputDir,
  },
  {
    temp: "sample_input_list_render_type_TerminalOffset.svg",
    output: "sample_input_list_render_type_TerminalOffset.svg.txt",
    targetDir: outputDir,
  },
  {
    temp: "sample_input_with_--prettyprint_option.svg",
    output: "sample_input.svg.txt",
    targetDir: outputDir,
  },
  {
    temp: "sample_input_without_prettyprint_option.svg",
    output: "sample_input.svg.txt",
    targetDir: outputMinifiedDir,
  },
];

// Ensure output directories exist
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(outputMinifiedDir, { recursive: true });

// Remove existing golden files
console.log("Removing existing golden files...");
for (const file of filesToProcess) {
  const outputPath = path.join(file.targetDir, file.output);
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
    console.log(`Removed: ${outputPath}`);
  }
}

// Copy new golden files from temp
console.log("Copying new golden files from temp...");
for (const file of filesToProcess) {
  const tempPath = path.join(tempDir, file.temp);
  const outputPath = path.join(file.targetDir, file.output);
  fs.copyFileSync(tempPath, outputPath);
  console.log(`Copied: ${tempPath} to ${outputPath}`);
}

console.log("Golden files updated successfully.");
