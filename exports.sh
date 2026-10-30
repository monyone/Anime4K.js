#!/bin/sh

# Experimental-Effects と Denoise は WebGL2 を要求する
# Upscale_DTD も webgl1 では無理
# 一旦 サポート対象 から外す

find src/glsl -type f -name '*.ts' \
  ! -path 'src/glsl/Experimental-Effects/*' \
  ! -path 'src/glsl/Denoise/*' \
  ! -name 'Anime4K_Upscale_DTD_x2.ts' \
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
