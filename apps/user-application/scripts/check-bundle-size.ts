#!/usr/bin/env node
/**
 * Bundle size validation script
 * Checks if bundle sizes are within performance budgets
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { gzipSync } from 'zlib'
import {
  isBundleWithinBudget,
  formatBytes,
  getBudgetStatusEmoji,
} from '../src/config/performance-budgets'

interface BundleInfo {
  name: string
  path: string
  size: number
  gzipSize: number
}

/**
 * Get all bundle files from dist directory
 */
function getBundleFiles(distPath: string): BundleInfo[] {
  const assetsPath = join(distPath, 'assets')
  const bundles: BundleInfo[] = []

  try {
    const files = readdirSync(assetsPath)

    for (const file of files) {
      // Only process JavaScript files
      if (!file.endsWith('.js')) continue

      const filePath = join(assetsPath, file)
      const stats = statSync(filePath)
      const content = readFileSync(filePath)
      const gzipSize = gzipSync(content).length

      bundles.push({
        name: file,
        path: filePath,
        size: stats.size,
        gzipSize,
      })
    }
  } catch (error) {
    console.error('Error reading bundle files:', error)
    process.exit(1)
  }

  return bundles
}

/**
 * Check bundle sizes against budgets
 */
function checkBundleSizes(bundles: BundleInfo[]): {
  passed: boolean
  violations: string[]
} {
  const violations: string[] = []
  let totalSize = 0
  let totalGzipSize = 0

  console.log('\n📦 Bundle Size Analysis\n')
  console.log('─'.repeat(80))
  console.log(
    `${'Bundle'.padEnd(30)} ${'Size'.padEnd(15)} ${'Gzipped'.padEnd(15)} ${'Budget'.padEnd(10)} Status`
  )
  console.log('─'.repeat(80))

  for (const bundle of bundles) {
    totalSize += bundle.size
    totalGzipSize += bundle.gzipSize

    // Check against budget
    const { withinBudget, budget, percentage } = isBundleWithinBudget(
      bundle.name,
      bundle.gzipSize,
      true
    )

    const emoji = getBudgetStatusEmoji(percentage)
    const status = withinBudget ? 'PASS' : 'FAIL'
    const budgetStr = budget ? formatBytes(budget.maxSizeGzip) : 'N/A'

    console.log(
      `${bundle.name.padEnd(30)} ${formatBytes(bundle.size).padEnd(15)} ${formatBytes(bundle.gzipSize).padEnd(15)} ${budgetStr.padEnd(10)} ${emoji} ${status}`
    )

    if (!withinBudget && budget) {
      violations.push(
        `${bundle.name}: ${formatBytes(bundle.gzipSize)} exceeds budget of ${formatBytes(budget.maxSizeGzip)} (${percentage.toFixed(1)}%)`
      )
    }
  }

  console.log('─'.repeat(80))
  console.log(
    `${'TOTAL'.padEnd(30)} ${formatBytes(totalSize).padEnd(15)} ${formatBytes(totalGzipSize).padEnd(15)}`
  )
  console.log('─'.repeat(80))

  // Check total initial load size (main + vendor bundles)
  const initialLoadBundles = bundles.filter(
    (b) =>
      b.name.includes('main') ||
      b.name.includes('vendor') ||
      b.name.includes('index')
  )
  const initialLoadSize = initialLoadBundles.reduce(
    (sum, b) => sum + b.gzipSize,
    0
  )
  const maxInitialLoad = 250 * 1024 // 250 KB target

  console.log(`\n📊 Initial Load Size: ${formatBytes(initialLoadSize)}`)
  console.log(`   Target: ${formatBytes(maxInitialLoad)}`)
  console.log(
    `   Status: ${initialLoadSize <= maxInitialLoad ? '✅ PASS' : '❌ FAIL'}`
  )

  if (initialLoadSize > maxInitialLoad) {
    violations.push(
      `Initial load size ${formatBytes(initialLoadSize)} exceeds target of ${formatBytes(maxInitialLoad)}`
    )
  }

  return {
    passed: violations.length === 0,
    violations,
  }
}

/**
 * Main function
 */
function main() {
  const distPath = join(process.cwd(), 'dist', 'client')

  console.log('🔍 Checking bundle sizes against performance budgets...')
  console.log(`📁 Distribution path: ${distPath}`)

  const bundles = getBundleFiles(distPath)

  if (bundles.length === 0) {
    console.error('\n❌ No bundle files found. Did you run the build?')
    process.exit(1)
  }

  const { passed, violations } = checkBundleSizes(bundles)

  if (!passed) {
    console.log('\n❌ Bundle size check FAILED\n')
    console.log('Violations:')
    violations.forEach((v) => console.log(`  - ${v}`))
    console.log('\n💡 Tips to reduce bundle size:')
    console.log('  - Review bundle analysis report (npm run analyze)')
    console.log('  - Check for duplicate dependencies')
    console.log('  - Ensure tree-shaking is working correctly')
    console.log('  - Consider lazy loading more components')
    process.exit(1)
  }

  console.log('\n✅ All bundles are within budget!\n')
  process.exit(0)
}

// Run the script
main()
