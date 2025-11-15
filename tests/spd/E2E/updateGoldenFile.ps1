# This script updates the golden files for the E2E tests.

# Remove old golden files. The -ErrorAction SilentlyContinue prevents errors if no files exist.
Remove-Item -Path ./tests/spd/E2E/output/original/*.svg.txt -ErrorAction SilentlyContinue
Remove-Item -Path ./tests/spd/E2E/output/TerminalOffset/*.svg.txt -ErrorAction SilentlyContinue

# Copy the newly generated .svg files from the temp directory to the original output directory.
Copy-Item -Path ./tests/spd/E2E/temp/*.svg -Destination ./tests/spd/E2E/output/original/

# Rename the copied .svg files to .svg.txt in the original directory.
Get-ChildItem -Path ./tests/spd/E2E/output/original/*.svg | ForEach-Object {
    Rename-Item -Path $_.FullName -NewName ($_.Name -replace '\.svg$', '.svg.txt')
}

# Copy the newly generated .svg files from the temp directory to the TerminalOffset output directory.
Copy-Item -Path ./tests/spd/E2E/temp/*.svg -Destination ./tests/spd/E2E/output/TerminalOffset/

# Rename the copied .svg files to .svg.txt in the TerminalOffset directory.
Get-ChildItem -Path ./tests/spd/E2E/output/TerminalOffset/*.svg | ForEach-Object {
    Rename-Item -Path $_.FullName -NewName ($_.Name -replace '\.svg$', '.svg.txt')
}
