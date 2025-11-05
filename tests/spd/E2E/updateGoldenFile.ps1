# This script updates the golden files for the E2E tests.

# Remove old golden files. The -ErrorAction SilentlyContinue prevents errors if no files exist.
Remove-Item -Path ./tests/spd/E2E/output/*.svg.txt -ErrorAction SilentlyContinue

# Copy the newly generated .svg files from the temp directory to the output directory.
Copy-Item -Path ./tests/spd/E2E/temp/*.svg -Destination ./tests/spd/E2E/output/

# Rename the copied .svg files to .svg.txt to treat them as text files for comparison.
Get-ChildItem -Path ./tests/spd/E2E/output/*.svg | ForEach-Object {
    Rename-Item -Path $_.FullName -NewName ($_.Name -replace '\.svg$', '.svg.txt')
}
