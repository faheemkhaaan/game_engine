#!/usr/bin/env bash

set -e

echo "Starting conversion from .mjs to .ts..."

# 1. Update import statements inside all .mjs files, replacing .mjs extensions with .ts
if [[ "$OSTYPE" == "darwin"* ]]; then
  find . -type f -name "*.mjs" -not -path "*/node_modules/*" -exec sed -i '' -E 's/(from\s+["\x27"][^"\x27]+)\.mjs(["\x27"])/\1.ts\2/g' {} +
else
  find . -type f -name "*.mjs" -not -path "*/node_modules/*" -exec sed -i -E 's/(from\s+["\x27"][^"\x27]+)\.mjs(["\x27"])/\1.ts\2/g' {} +
fi

echo "Updated import extensions in source files."

# 2. Rename all .mjs files to .ts
find . -type f -name "*.mjs" -not -path "*/node_modules/*" | while read -r file; do
    new_file="${file%.mjs}.ts"
    echo "Renaming: $file -> $new_file"
    mv "$file" "$new_file"
done

echo "Successfully converted all .mjs files to .ts!"