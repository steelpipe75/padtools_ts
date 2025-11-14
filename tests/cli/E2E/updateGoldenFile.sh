rm ./tests/cli/E2E/output/sample_input_base_background_color_black.svg.txt
rm ./tests/cli/E2E/output/sample_input_base_background_color_gray.svg.txt
rm ./tests/cli/E2E/output/sample_input_base_background_color_none.svg.txt
rm ./tests/cli/E2E/output/sample_input_base_background_color_white.svg.txt
rm ./tests/cli/E2E/output/sample_input.svg.txt
rm ./tests/cli/E2E/output_minified/sample_input.svg.txt

cp ./tests/cli/E2E/temp/sample_input_base_background_color_black.svg ./tests/cli/E2E/output/sample_input_base_background_color_black.svg.txt
cp ./tests/cli/E2E/temp/sample_input_base_background_color_gray.svg ./tests/cli/E2E/output/sample_input_base_background_color_gray.svg.txt
cp ./tests/cli/E2E/temp/sample_input_base_background_color_none.svg ./tests/cli/E2E/output/sample_input_base_background_color_none.svg.txt
cp ./tests/cli/E2E/temp/sample_input_base_background_color_white.svg ./tests/cli/E2E/output/sample_input_base_background_color_white.svg.txt
cp ./tests/cli/E2E/temp/sample_input_with_--prettyprint_option.svg ./tests/cli/E2E/output/sample_input.svg.txt
cp ./tests/cli/E2E/temp/sample_input_without_prettyprint_option.svg ./tests/cli/E2E/output_minified/sample_input.svg.txt
