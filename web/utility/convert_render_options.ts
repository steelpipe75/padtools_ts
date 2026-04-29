import { exec } from "node:child_process";
import * as fs from "node:fs";

const input = "./web/input_spd/commands_diagram.spd";
const outputDir = "./web/svg/render_options";
const outputSetting = [
  {
    file: "./web/svg/render_options/commands_diagram_Original.svg",
    option: "Original",
  },
  {
    file: "./web/svg/render_options/commands_diagram_TerminalOffset.svg",
    option: "TerminalOffset",
  },
];

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

(async () => {
  for (const setting of outputSetting) {
    const outputSvg = setting.file;
    const option = setting.option;

    console.log(`Converting ${input} to ${outputSvg}...`);

    const command = `npm run start -- -i "${input}" --list-render-type ${option} -o "${outputSvg}"`;

    exec(command, (error: Error | null, stdout: string, stderr: string) => {
      if (error) {
        console.error(
          `Error converting ${input} to ${outputSvg}: ${error.message}`,
        );
        return;
      }
      if (stderr) {
        console.error(`Stderr on ${input} to ${outputSvg}: ${stderr}`);
        return;
      }
      console.log(`Successfully converted ${input} to ${outputSvg}`);
      console.log(stdout);
    });
  }
})();
