#!/bin/sh

find Anime4K/glsl -type f | xargs -I {} sh -c 'infile="{}"; ./generate_shader.py -i $infile -o $(echo $infile | sed "s/^Anime4K/src/" | sed "s/\.glsl$/\.ts/")'
