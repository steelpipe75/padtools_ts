Remove-Item ./tests/cli/E2E/output/sample_input.svg.txt -ErrorAction SilentlyContinue
Remove-Item ./tests/cli/E2E/output_minified/sample_input.svg.txt -ErrorAction SilentlyContinue
Copy-Item ./tests/cli/E2E/temp/sample_input_with_--prettyprint_option.svg ./tests/cli/E2E/output/sample_input.svg.txt
Copy-Item ./tests/cli/E2E/temp/sample_input_without_prettyprint_option.svg ./tests/cli/E2E/output_minified/sample_input.svg.txt
