import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

// List of environment variables to expose
const ENV_KEYS = [
  'DATABASE_HOST',
  'DATABASE_USERNAME',
  'DATABASE_PASSWORD',
  'BETTER_AUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GEMINI_API_KEY',
]

const config = defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  // Only expose specific environment variables
  const processEnv: Record<string, string> = {}
  for (const key of ENV_KEYS) {
    if (env[key]) {
      processEnv[key] = env[key]
    }
  }

  return {
    plugins: [
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tailwindcss(),
      tanstackStart({
        srcDirectory: 'src',
        start: { entry: './start.tsx' },
        server: { entry: './server.ts' },
      }),
      viteReact(),
      cloudflare({
        viteEnvironment: {
          name: 'ssr',
        },
        persistState: false,
        configPath: './wrangler.jsonc',
        auxiliaryWorkers: [],
        inspectorPort: false,
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-tanstack': [
              '@tanstack/react-router',
              '@tanstack/react-query',
              '@tanstack/react-start',
            ],
            'vendor-radix': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-avatar',
              '@radix-ui/react-label',
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-slot',
              '@radix-ui/react-collapsible',
            ],
            'vendor-ui': [
              'lucide-react',
              'class-variance-authority',
              'clsx',
              'tailwind-merge',
            ],
          },
          chunkFileNames: 'assets/chunk-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
          entryFileNames: 'assets/[name]-[hash].js',
        },
      },
      chunkSizeWarningLimit: 500,
      reportCompressedSize: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_debugger: true,
        },
        format: {
          comments: false,
        },
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@tanstack/react-router',
        '@tanstack/react-query',
      ],
    },
    define: {
      'process.env': JSON.stringify(processEnv),
    },
  }
})

export default config
