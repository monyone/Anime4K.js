#!/bin/sh

find src/glsl -type f -name '*.ts' \
  ! -name 'shader.ts' \
  ! -name 'passthrough.ts' \
  | sort \
  | while read -r file; do
    # src/glsl/Restore/Anime4K_Clamp_Highlights.ts -> Anime4K_Clamp_Highlights
    name=$(basename "$file" .ts)
    # src/glsl/Restore/Anime4K_Clamp_Highlights.ts -> ./glsl/Restore/Anime4K_Clamp_Highlights
    path=$(echo "$file" | sed 's|^src/|./|; s|\.ts$||')
    echo "export { default as ${name} } from '${path}';"
  done
