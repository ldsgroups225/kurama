/**
 * Intelligent preloading utilities for optimizing route and resource loading
 * Implements requirements 5.1, 5.2 from bundle-optimization spec
 */

/**
 * Preload a route chunk by creating a prefetch link
 */
export function preloadRoute(routePath: string): void {
  if (typeof window === 'undefined') return;

  // Check if already preloaded
  const existingLink = document.querySelector(
    `link[rel="prefetch"][href*="${routePath}"]`
  );
  if (existingLink) return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'script';
  link.href = routePath;
  document.head.appendChild(link);
}

/**
 * Preload multiple routes
 */
export function preloadRoutes(routePaths: string[]): void {
  routePaths.forEach(preloadRoute);
}

/**
 * Setup hover-based preloading for a specific element
 * Preloads the target route when user hovers over the element
 */
export function setupHoverPreload(
  selector: string,
  routePath: string,
  options: {
    delay?: number;
    once?: boolean;
  } = {}
): () => void {
  if (typeof window === 'undefined') return () => { };

  const { delay = 0, once = true } = options;
  let timeoutId: NodeJS.Timeout | null = null;
  let hasPreloaded = false;

  const handleMouseEnter = () => {
    if (once && hasPreloaded) return;

    if (delay > 0) {
      timeoutId = setTimeout(() => {
        preloadRoute(routePath);
        hasPreloaded = true;
      }, delay);
    } else {
      preloadRoute(routePath);
      hasPreloaded = true;
    }
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const element = document.querySelector(selector);
  if (element) {
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
  }

  // Return cleanup function
  return () => {
    if (element) {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}

/**
 * Setup intelligent preloading based on user behavior
 * Preloads likely navigation targets
 */
export function setupIntelligentPreloading(): () => void {
  if (typeof window === 'undefined') return () => { };

  const cleanupFunctions: Array<() => void> = [];

  // Preload dashboard when user hovers over login/auth buttons
  const loginSelectors = [
    '[data-login-button]',
    '[data-auth-button]',
    'button:has-text("Se connecter")',
    'button:has-text("Connexion")',
  ];

  loginSelectors.forEach((selector) => {
    try {
      const cleanup = setupHoverPreload(selector, '/app', {
        delay: 100,
        once: true,
      });
      cleanupFunctions.push(cleanup);
    } catch (e) {
      // Selector might not exist, ignore
    }
  });

  // Preload onboarding when user hovers over "Get Started" buttons
  const getStartedSelectors = [
    '[data-get-started-button]',
    'button:has-text("Commencer")',
    'button:has-text("Démarrer")',
  ];

  getStartedSelectors.forEach((selector) => {
    try {
      const cleanup = setupHoverPreload(selector, '/onboarding', {
        delay: 100,
        once: true,
      });
      cleanupFunctions.push(cleanup);
    } catch (e) {
      // Selector might not exist, ignore
    }
  });

  // Preload profile when user hovers over avatar/profile button
  const profileSelectors = [
    '[data-profile-button]',
    '[data-avatar-button]',
    'button[aria-label*="profile" i]',
  ];

  profileSelectors.forEach((selector) => {
    try {
      const cleanup = setupHoverPreload(selector, '/app/profile', {
        delay: 100,
        once: true,
      });
      cleanupFunctions.push(cleanup);
    } catch (e) {
      // Selector might not exist, ignore
    }
  });

  // Return cleanup function that calls all individual cleanup functions
  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  };
}

/**
 * Preload critical routes based on current location
 */
export function preloadCriticalRoutes(currentPath: string): void {
  if (typeof window === 'undefined') return;

  // Landing page - preload auth and onboarding
  if (currentPath === '/') {
    preloadRoutes(['/onboarding']);
  }

  // Onboarding - preload app dashboard
  if (currentPath === '/onboarding') {
    preloadRoute('/app');
  }

  // App dashboard - preload common routes
  if (currentPath === '/app' || currentPath === '/app/') {
    preloadRoutes(['/app/lessons', '/app/profile', '/app/progress']);
  }

  // Lessons page - preload progress
  if (currentPath === '/app/lessons') {
    preloadRoute('/app/progress');
  }
}

/**
 * Setup intersection observer based preloading
 * Preloads routes when elements come into viewport
 */
export function setupIntersectionPreload(
  selector: string,
  routePath: string,
  options: IntersectionObserverInit = {}
): () => void {
  if (typeof window === 'undefined') return () => { };
  if (!('IntersectionObserver' in window)) return () => { };

  let hasPreloaded = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !hasPreloaded) {
        preloadRoute(routePath);
        hasPreloaded = true;
        observer.disconnect();
      }
    });
  }, options);

  const element = document.querySelector(selector);
  if (element) {
    observer.observe(element);
  }

  // Return cleanup function
  return () => {
    observer.disconnect();
  };
}

/**
 * Preload on idle using requestIdleCallback
 */
export function preloadOnIdle(routePaths: string[]): void {
  if (typeof window === 'undefined') return;

  if ('requestIdleCallback' in window) {
    requestIdleCallback(
      () => {
        preloadRoutes(routePaths);
      },
      { timeout: 2000 }
    );
  } else {
    // Fallback to setTimeout
    setTimeout(() => {
      preloadRoutes(routePaths);
    }, 1000);
  }
}

/**
 * Initialize preloading strategy
 * Sets up all preloading mechanisms
 */
export function initPreloading(currentPath: string): () => void {
  if (typeof window === 'undefined') return () => { };

  const cleanupFunctions: Array<() => void> = [];

  // Setup intelligent hover-based preloading
  const intelligentCleanup = setupIntelligentPreloading();
  cleanupFunctions.push(intelligentCleanup);

  // Preload critical routes based on current location
  preloadCriticalRoutes(currentPath);

  // Preload common routes on idle
  preloadOnIdle(['/app/lessons', '/app/groups', '/app/progress']);

  // Return cleanup function
  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  };
}
