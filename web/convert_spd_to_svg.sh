#!/bin/bash

# This script converts .spd files in web/input_spd to .svg files in web/.

INPUT_DIR="./web/input_spd"
OUTPUT_DIR="./web"

# Ensure the output directory exists
mkdir -p "$OUTPUT_DIR"

# Loop through all .spd files in the input directory
for spd_file in "$INPUT_DIR"/*.spd;
do
  # Extract the base name of the file (e.g., "block" from "web/input_spd/block.spd")
  base_name=$(basename "$spd_file" .spd)
  
  # Construct the output SVG file path
  output_svg="$OUTPUT_DIR/${base_name}.svg"
  
  echo "Converting $spd_file to $output_svg..."
  
  # Run the padtools_ts CLI tool
  # Assuming padtools_ts is globally installed or available in PATH
  # If not, you might need to use `npx padtools_ts` or specify the full path to the executable
  npm run start -- -i "$spd_file" -o "$output_svg"
  
  if [ $? -eq 0 ]; then
    echo "Successfully converted $spd_file"
  else
    echo "Error converting $spd_file"
  fi
done

echo "Conversion process complete."