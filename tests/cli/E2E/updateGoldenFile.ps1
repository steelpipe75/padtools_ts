Remove-Item ./tests/cli/E2E/output/sample_input_base_background_color_black.svg.txt -ErrorAction SilentlyContinue
Remove-Item ./tests/cli/E2E/output/sample_input_base_background_color_gray.svg.txt -ErrorAction SilentlyContinue
Remove-Item ./tests/cli/E2E/output/sample_input_base_background_color_none.svg.txt -ErrorAction SilentlyContinue
Remove-Item ./tests/cli/E2E/output/sample_input_base_background_color_white.svg.txt -ErrorAction SilentlyContinue
Remove-Item ./tests/cli/E2E/output/sample_input_font_size_20.svg.txt -ErrorAction SilentlyContinue
Remove-Item ./tests/cli/E2E/output/sample_input_list_render_type_TerminalOffset.svg.txt -ErrorAction SilentlyContinue
Remove-Item ./tests/cli/E2E/output/sample_input.svg.txt -ErrorAction SilentlyContinue
Remove-Item ./tests/cli/E2E/output_minified/sample_input.svg.txt -ErrorAction SilentlyContinue

Copy-Item ./tests/cli/E2E/temp/sample_input_base_background_color_black.svg ./tests/cli/E2E/output/sample_input_base_background_color_black.svg.txt
Copy-Item ./tests/cli/E2E/temp/sample_input_base_background_color_gray.svg ./tests/cli/E2E/output/sample_input_base_background_color_gray.svg.txt
Copy-Item ./tests/cli/E2E/temp/sample_input_base_background_color_none.svg ./tests/cli/E2E/output/sample_input_base_background_color_none.svg.txt
Copy-Item ./tests/cli/E2E/temp/sample_input_base_background_color_white.svg ./tests/cli/E2E/output/sample_input_base_background_color_white.svg.txt
Copy-Item ./tests/cli/E2E/temp/sample_input_font_size_20.svg ./tests/cli/E2E/output/sample_input_font_size_20.svg.txt
Copy-Item ./tests/cli/E2E/temp/sample_input_list_render_type_TerminalOffset.svg ./tests/cli/E2E/output/sample_input_list_render_type_TerminalOffset.svg.txt
Copy-Item ./tests/cli/E2E/temp/sample_input_with_--prettyprint_option.svg ./tests/cli/E2E/output/sample_input.svg.txt
Copy-Item ./tests/cli/E2E/temp/sample_input_without_prettyprint_option.svg ./tests/cli/E2E/output_minified/sample_input.svg.txt