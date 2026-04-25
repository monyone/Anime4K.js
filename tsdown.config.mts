import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    platform: 'browser',
    dts: true,
    unbundle: true,
    fixedExtension: true,
  },
  {
    entry: {
      'anime4k': 'src/index.ts',
    },
    format: ['umd'],
    platform: 'browser',
    minify: true,
    outputOptions: {
      name: 'Anime4KJS',
      entryFileNames: '[name].js',
    },
  },
])
