#!/usr/bin/env node
/**
 * Performance validation script
 * Checks Core Web Vitals and performance metrics against budgets
 */

import {
  performanceBudgets,
  areWebVitalsWithinBudget,
  formatBytes,
} from '../src/config/performance-budgets'

/**
 * Display performance budgets
 */
function displayBudgets() {
  console.log('\n📊 Performance Budgets\n')
  console.log('─'.repeat(60))
  console.log('Core Web Vitals:')
  console.log(`  LCP (Largest Contentful Paint):  ≤ ${performanceBudgets.maxLCP}ms`)
  console.log(`  FID (First Input Delay):         ≤ ${performanceBudgets.maxFID}ms`)
  console.log(`  INP (Interaction to Next Paint): ≤ ${performanceBudgets.maxINP}ms`)
  console.log(`  CLS (Cumulative Layout Shift):   ≤ ${performanceBudgets.maxCLS}`)
  console.log(`  TTFB (Time to First Byte):       ≤ ${performanceBudgets.maxTTFB}ms`)
  console.log('\nRoute Performance:')
  console.log(`  Max Route Load Time:             ≤ ${performanceBudgets.maxRouteLoadTime}ms`)
  console.log(`  Max Time to Interactive:         ≤ ${performanceBudgets.maxTimeToInteractive}ms`)
  console.log('\nBundle Size Budgets:')
  performanceBudgets.bundles.forEach((budget) => {
    console.log(
      `  ${budget.name.padEnd(20)} ≤ ${formatBytes(budget.maxSizeGzip)} (gzipped)`
    )
  })
  console.log('─'.repeat(60))
}

/**
 * Validate sample metrics (for demonstration)
 */
function validateSampleMetrics() {
  console.log('\n🧪 Sample Metrics Validation\n')
  console.log('─'.repeat(60))

  // Example metrics (in a real scenario, these would come from actual measurements)
  const sampleMetrics = {
    LCP: 2200,
    FID: 80,
    INP: 150,
    CLS: 0.08,
    TTFB: 600,
  }

  console.log('Sample Metrics:')
  console.log(`  LCP: ${sampleMetrics.LCP}ms`)
  console.log(`  FID: ${sampleMetrics.FID}ms`)
  console.log(`  INP: ${sampleMetrics.INP}ms`)
  console.log(`  CLS: ${sampleMetrics.CLS}`)
  console.log(`  TTFB: ${sampleMetrics.TTFB}ms`)

  const { withinBudget, violations } = areWebVitalsWithinBudget(sampleMetrics)

  if (withinBudget) {
    console.log('\n✅ All metrics are within budget!')
  } else {
    console.log('\n❌ Some metrics exceed budget:')
    violations.forEach((v) => console.log(`  - ${v}`))
  }

  console.log('─'.repeat(60))
}

/**
 * Display performance optimization tips
 */
function displayOptimizationTips() {
  console.log('\n💡 Performance Optimization Tips\n')
  console.log('─'.repeat(60))
  console.log('To improve Core Web Vitals:')
  console.log('  1. Optimize LCP:')
  console.log('     - Preload critical resources')
  console.log('     - Optimize images and use modern formats (WebP, AVIF)')
  console.log('     - Minimize render-blocking resources')
  console.log('  2. Optimize FID/INP:')
  console.log('     - Break up long tasks')
  console.log('     - Optimize JavaScript execution')
  console.log('     - Use web workers for heavy computations')
  console.log('  3. Optimize CLS:')
  console.log('     - Set explicit dimensions for images and embeds')
  console.log('     - Avoid inserting content above existing content')
  console.log('     - Use CSS transforms for animations')
  console.log('  4. Optimize TTFB:')
  console.log('     - Use CDN for static assets')
  console.log('     - Optimize server response time')
  console.log('     - Enable HTTP/2 or HTTP/3')
  console.log('\nTo reduce bundle size:')
  console.log('  - Run: npm run analyze')
  console.log('  - Review bundle composition')
  console.log('  - Lazy load non-critical components')
  console.log('  - Remove unused dependencies')
  console.log('  - Enable tree-shaking')
  console.log('─'.repeat(60))
}

/**
 * Main function
 */
function main() {
  console.log('🎯 Performance Budget Checker')

  // Display budgets
  displayBudgets()

  // Validate sample metrics
  validateSampleMetrics()

  // Display optimization tips
  displayOptimizationTips()

  console.log('\n📝 Note: To measure real metrics:')
  console.log('  1. Build the application: npm run build')
  console.log('  2. Check bundle sizes: npm run perf:check-bundles')
  console.log('  3. Test in browser with Lighthouse or WebPageTest')
  console.log('  4. Monitor metrics endpoint: /api/metrics\n')
}

// Run the script
main()
