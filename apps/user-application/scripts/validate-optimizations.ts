#!/usr/bin/env node
/**
 * Automated validation script for bundle optimizations
 * Runs comprehensive checks to verify optimization implementation
 */

import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'

interface ValidationResult {
  name: string
  passed: boolean
  message: string
  details?: string[]
}

const results: ValidationResult[] = []

/**
 * Add validation result
 */
function addResult(
  name: string,
  passed: boolean,
  message: string,
  details?: string[]
) {
  results.push({ name, passed, message, details })
}

/**
 * Check if route chunks exist
 */
function validateRouteChunks(): void {
  const distPath = join(process.cwd(), 'dist', 'client', 'assets')

  if (!existsSync(distPath)) {
    addResult(
      'Route Chunks',
      false,
      'Distribution directory not found. Run build first.',
      ['Expected: dist/client/assets', 'Run: pnpm run build']
    )
    return
  }

  const files = readdirSync(distPath)
  const jsFiles = files.filter((f) => f.endsWith('.js'))

  // Expected route chunks
  const expectedChunks = [
    'landing',
    'onboarding',
    'app',
    'profile',
    'lessons',
    'groups',
    'progress',
  ]

  const foundChunks: string[] = []
  const missingChunks: string[] = []

  expectedChunks.forEach((chunk) => {
    const found = jsFiles.some((file) =>
      file.toLowerCase().includes(chunk.toLowerCase())
    )
    if (found) {
      foundChunks.push(chunk)
    } else {
      missingChunks.push(chunk)
    }
  })

  const passed = missingChunks.length === 0

  addResult(
    'Route Chunks',
    passed,
    passed
      ? `All ${expectedChunks.length} route chunks found`
      : `Missing ${missingChunks.length} route chunks`,
    passed
      ? foundChunks.map((c) => `✓ ${c}`)
      : [
        ...foundChunks.map((c) => `✓ ${c}`),
        ...missingChunks.map((c) => `✗ ${c}`),
      ]
  )
}

/**
 * Check if vendor chunks exist
 */
function validateVendorChunks(): void {
  const distPath = join(process.cwd(), 'dist', 'client', 'assets')

  if (!existsSync(distPath)) {
    addResult('Vendor Chunks', false, 'Distribution directory not found')
    return
  }

  const files = readdirSync(distPath)
  const vendorChunks = files.filter((f) => f.includes('vendor-'))

  const expectedVendors = ['vendor-react', 'vendor-tanstack', 'vendor-radix', 'vendor-ui']
  const foundVendors: string[] = []
  const missingVendors: string[] = []

  expectedVendors.forEach((vendor) => {
    const found = vendorChunks.some((file) => file.includes(vendor))
    if (found) {
      foundVendors.push(vendor)
    } else {
      missingVendors.push(vendor)
    }
  })

  const passed = missingVendors.length === 0

  addResult(
    'Vendor Chunks',
    passed,
    passed
      ? `All ${expectedVendors.length} vendor chunks found`
      : `Missing ${missingVendors.length} vendor chunks`,
    passed
      ? foundVendors.map((v) => `✓ ${v}`)
      : [
        ...foundVendors.map((v) => `✓ ${v}`),
        ...missingVendors.map((v) => `✗ ${v}`),
      ]
  )
}

/**
 * Check if devtools are excluded from production build
 */
function validateDevtoolsExclusion(): void {
  const distPath = join(process.cwd(), 'dist', 'client', 'assets')

  if (!existsSync(distPath)) {
    addResult('Devtools Exclusion', false, 'Distribution directory not found')
    return
  }

  const files = readdirSync(distPath)
  const jsFiles = files.filter((f) => f.endsWith('.js'))

  let devtoolsFound = false
  const filesWithDevtools: string[] = []

  for (const file of jsFiles) {
    const content = readFileSync(join(distPath, file), 'utf-8')
    if (
      content.includes('react-router-devtools') ||
      content.includes('react-query-devtools') ||
      content.includes('TanStackRouterDevtools') ||
      content.includes('ReactQueryDevtools')
    ) {
      devtoolsFound = true
      filesWithDevtools.push(file)
    }
  }

  addResult(
    'Devtools Exclusion',
    !devtoolsFound,
    devtoolsFound
      ? 'Devtools found in production build'
      : 'Devtools successfully excluded from production',
    devtoolsFound ? filesWithDevtools.map((f) => `Found in: ${f}`) : undefined
  )
}

/**
 * Check if lazy loading utilities exist
 */
function validateLazyLoadingUtilities(): void {
  const files = [
    'src/lib/lazy-component.tsx',
    'src/components/lazy-error-boundary.tsx',
    'src/lib/chunk-retry.ts',
  ]

  const existingFiles: string[] = []
  const missingFiles: string[] = []

  files.forEach((file) => {
    if (existsSync(file)) {
      existingFiles.push(file)
    } else {
      missingFiles.push(file)
    }
  })

  const passed = missingFiles.length === 0

  addResult(
    'Lazy Loading Utilities',
    passed,
    passed
      ? 'All lazy loading utilities found'
      : `Missing ${missingFiles.length} utilities`,
    passed
      ? existingFiles.map((f) => `✓ ${f}`)
      : [
        ...existingFiles.map((f) => `✓ ${f}`),
        ...missingFiles.map((f) => `✗ ${f}`),
      ]
  )
}

/**
 * Check if performance monitoring is implemented
 */
function validatePerformanceMonitoring(): void {
  const files = [
    'src/lib/performance-monitor.ts',
    'src/config/performance-budgets.ts',
    'src/routes/api/metrics.tsx',
  ]

  const existingFiles: string[] = []
  const missingFiles: string[] = []

  files.forEach((file) => {
    if (existsSync(file)) {
      existingFiles.push(file)
    } else {
      missingFiles.push(file)
    }
  })

  const passed = missingFiles.length === 0

  addResult(
    'Performance Monitoring',
    passed,
    passed
      ? 'Performance monitoring implemented'
      : `Missing ${missingFiles.length} files`,
    passed
      ? existingFiles.map((f) => `✓ ${f}`)
      : [
        ...existingFiles.map((f) => `✓ ${f}`),
        ...missingFiles.map((f) => `✗ ${f}`),
      ]
  )
}

/**
 * Check if preloading utilities exist
 */
function validatePreloadingStrategy(): void {
  const preloadFile = 'src/lib/preload.ts'

  if (!existsSync(preloadFile)) {
    addResult('Preloading Strategy', false, 'Preload utilities not found', [
      `Missing: ${preloadFile}`,
    ])
    return
  }

  const content = readFileSync(preloadFile, 'utf-8')
  const requiredFunctions = [
    'preloadRoute',
    'setupHoverPreload',
    'setupIntelligentPreloading',
    'initPreloading',
  ]

  const foundFunctions: string[] = []
  const missingFunctions: string[] = []

  requiredFunctions.forEach((fn) => {
    if (content.includes(`function ${fn}`) || content.includes(`const ${fn}`)) {
      foundFunctions.push(fn)
    } else {
      missingFunctions.push(fn)
    }
  })

  const passed = missingFunctions.length === 0

  addResult(
    'Preloading Strategy',
    passed,
    passed
      ? 'All preloading functions implemented'
      : `Missing ${missingFunctions.length} functions`,
    passed
      ? foundFunctions.map((f) => `✓ ${f}`)
      : [
        ...foundFunctions.map((f) => `✓ ${f}`),
        ...missingFunctions.map((f) => `✗ ${f}`),
      ]
  )
}

/**
 * Check if skeleton components exist
 */
function validateSkeletonComponents(): void {
  const skeletonsDir = 'src/components/skeletons'

  if (!existsSync(skeletonsDir)) {
    addResult('Skeleton Components', false, 'Skeletons directory not found', [
      `Missing: ${skeletonsDir}`,
    ])
    return
  }

  const files = readdirSync(skeletonsDir)
  const skeletonFiles = files.filter((f) => f.endsWith('.tsx'))

  const passed = skeletonFiles.length >= 5 // Expect at least 5 skeleton components

  addResult(
    'Skeleton Components',
    passed,
    passed
      ? `${skeletonFiles.length} skeleton components found`
      : 'Insufficient skeleton components',
    skeletonFiles.map((f) => `✓ ${f}`)
  )
}

/**
 * Print results
 */
function printResults(): void {
  console.log('\n🔍 Bundle Optimization Validation Results\n')
  console.log('═'.repeat(80))

  let passedCount = 0
  let failedCount = 0

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌'
    const status = result.passed ? 'PASS' : 'FAIL'

    console.log(`\n${icon} ${result.name}: ${status}`)
    console.log(`   ${result.message}`)

    if (result.details && result.details.length > 0) {
      result.details.forEach((detail) => {
        console.log(`   ${detail}`)
      })
    }

    if (result.passed) {
      passedCount++
    } else {
      failedCount++
    }
  })

  console.log('\n' + '═'.repeat(80))
  console.log(
    `\n📊 Summary: ${passedCount} passed, ${failedCount} failed (${results.length} total)\n`
  )

  if (failedCount === 0) {
    console.log('✨ All validations passed! Bundle optimization is complete.\n')
  } else {
    console.log('⚠️  Some validations failed. Please review and fix the issues.\n')
    console.log('💡 Tips:')
    console.log('   - Run: pnpm run build (if dist directory is missing)')
    console.log('   - Check: docs/OPTIMIZATION_VALIDATION.md for detailed guide')
    console.log('   - Review: Failed validation details above\n')
  }
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Starting bundle optimization validation...\n')

  // Run all validations
  validateRouteChunks()
  validateVendorChunks()
  validateDevtoolsExclusion()
  validateLazyLoadingUtilities()
  validatePerformanceMonitoring()
  validatePreloadingStrategy()
  validateSkeletonComponents()

  // Print results
  printResults()

  // Exit with appropriate code
  const failed = results.some((r) => !r.passed)
  process.exit(failed ? 1 : 0)
}

// Run the script
main()
