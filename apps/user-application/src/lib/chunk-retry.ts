/**
 * Retry logic for failed chunk loads
 * Implements exponential backoff for chunk loading failures
 */

export async function retryChunkLoad<T>(
  fn: () => Promise<T>,
  retriesLeft = 3,
  interval = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retriesLeft === 0) {
      console.error('Failed to load chunk after retries:', error)
      throw error
    }

    console.warn(`Chunk load failed, retrying... (${retriesLeft} attempts left)`)
    await new Promise(resolve => setTimeout(resolve, interval))
    return retryChunkLoad(fn, retriesLeft - 1, interval * 2)
  }
}
