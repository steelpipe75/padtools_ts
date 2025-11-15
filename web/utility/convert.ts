import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { glob } from "glob";

const inputDir = "./web/input_spd";
const outputDir = "./web/svg";

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

(async () => {
  const spdFiles = await glob(`${inputDir}/*.spd`);

  for (const spdFile of spdFiles) {
    const baseName = path.basename(spdFile, ".spd");
    const outputSvg = path.join(outputDir, `${baseName}.svg`);

    console.log(`Converting ${spdFile} to ${outputSvg}...`);

    const command = `npm run start -- -i "${spdFile}" -o "${outputSvg}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error converting ${spdFile}: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr on ${spdFile}: ${stderr}`);
        return;
      }
      console.log(`Successfully converted ${spdFile}`);
      console.log(stdout);
    });
  }
})();
