rm ./tests/spd/E2E/output/*.svg.txt
cp ./tests/spd/E2E/temp/*.svg ./tests/spd/E2E/output/
for f in ./tests/spd/E2E/output/*.svg; do mv "$f" "${f%.svg}.svg.txt"; done
