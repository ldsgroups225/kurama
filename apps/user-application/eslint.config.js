import config from '@kurama/eslint-config'

/** @type {import("eslint").Linter.Config} */

export default config.append({
  ignores: [
    'dist/',
    '.wrangler/',
    'public/',
    '**/*.md',
    'scripts/',
    'components/ui/**',
    'src/routeTree.gen.ts',
  ],
})
