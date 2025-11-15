import antfu from '@antfu/eslint-config'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'

export default antfu({
  react: true,
  ignores: [
    'components/ui/**',
    'scripts/**',
    '*.config.js',
    '*.config.ts',
    '*.d.ts',
    '*.jsonc',
    '*.md',
    'build',
    'coverage',
    'coverage/**',
    'dist/**',
    'eslint.config.mjs',
    'node_modules',
    'package-lock.json',
    'package.json',
    'pnpm-lock.yaml',
    'public',
    'yarn.lock',
  ],
}, {
  plugins: {
    'better-tailwindcss': betterTailwindcss,
  },
  settings: {
    'better-tailwindcss': {
      // Tailwind CSS v4: path to the CSS entry file
      entryPoint: 'apps/user-application/src/styles.css',
    },
  },
  rules: {
    // Stylistic rules (recommended config)
    'better-tailwindcss/enforce-consistent-line-wrapping': 'warn',
    'better-tailwindcss/enforce-consistent-class-order': 'warn',
    'better-tailwindcss/no-duplicate-classes': 'warn',
    'better-tailwindcss/no-unnecessary-whitespace': 'warn',

    // Correctness rules (recommended config)
    'better-tailwindcss/no-unregistered-classes': 'error',
    'better-tailwindcss/no-conflicting-classes': 'error',

    // Optional stylistic rules (not in recommended by default)
    'better-tailwindcss/enforce-consistent-variable-syntax': 'off',
    'better-tailwindcss/enforce-consistent-important-position': 'off',
    'better-tailwindcss/enforce-shorthand-classes': 'off',
    'better-tailwindcss/no-deprecated-classes': 'warn',
    'better-tailwindcss/no-restricted-classes': 'off',
  },
})
