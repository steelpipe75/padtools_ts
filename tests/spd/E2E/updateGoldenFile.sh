rm ./tests/spd/E2E/output/original/*.svg.txt
rm ./tests/spd/E2E/output/TerminalOffset/*.svg.txt

cp ./tests/spd/E2E/temp/original/*.svg ./tests/spd/E2E/output/original/
for f in ./tests/spd/E2E/output/original/*.svg; do mv "$f" "${f%.svg}.svg.txt"; done

cp ./tests/spd/E2E/temp/TerminalOffset/*.svg ./tests/spd/E2E/output/TerminalOffset/
for f in ./tests/spd/E2E/output/TerminalOffset/*.svg; do mv "$f" "${f%.svg}.svg.txt"; done
