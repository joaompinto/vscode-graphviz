#!/usr/bin/env bash
set -e
cd "$(dirname "$(dirname "$(readlink -f "$0")")")"

for file; do
  # https://stackoverflow.com/questions/30167851/how-to-suppress-a-missing-termination-character-warning-in-cpp/30174912#30174912
  scripts/patch.pl "$file" | cpp -DHAVE_COC_NVIM -xassembler-with-cpp -nostdinc -P -C -o"${file#*/}"
done
