# React Hooks Order Fix - Flashcard Session

## Issue

**Error**: "React has detected a change in the order of Hooks called by SessionPage"

**Root Cause**: `useTransform` hooks were being called conditionally inside JSX render logic:

```tsx
{isFlipped && (
  <motion.div
    style={{
      opacity: useTransform(x, [0, 200], [0, 1]), // ❌ Hook called conditionally!
    }}
  >
    ...
  </motion.div>
)}
```

## Problem Explanation

React's Rules of Hooks require that:
1. Hooks must be called in the **same order** on every render
2. Hooks cannot be called conditionally (inside `if`, `&&`, `||`, etc.)
3. Hooks must be called at the **top level** of the component

When `isFlipped` changed from `false` to `true`, React saw:
- **Before flip**: 43 hooks called
- **After flip**: 45 hooks called (2 new `useTransform` calls appeared)

This violated the Rules of Hooks and caused the error.

## Solution

Move all `useTransform` calls to the top level of the component:

```tsx
function SessionPage() {
  // ✅ All hooks at top level
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  // ✅ Swipe indicator opacities defined once
  const swipeRightOpacity = useTransform(x, [0, 200], [0, 1]);
  const swipeLeftOpacity = useTransform(x, [-200, 0], [1, 0]);
  
  // ... rest of component
  
  return (
    // ✅ Use the pre-defined motion values
    {isFlipped && (
      <motion.div
        style={{
          opacity: swipeRightOpacity, // ✅ Just reference the value
        }}
      >
        ...
      </motion.div>
    )}
  );
}
```

## Key Takeaways

1. **Always call hooks at the top level** - Never inside conditions, loops, or nested functions
2. **Define motion values once** - Create all `useMotionValue` and `useTransform` hooks during component initialization
3. **Reference values in JSX** - Use the pre-defined motion values in your JSX, don't create new ones
4. **Conditional rendering is fine** - You can conditionally render elements that USE motion values, just don't conditionally CREATE them

## Performance Benefits

This fix also improves performance:
- Motion values are created once, not on every flip
- React's reconciliation is more efficient
- No unnecessary hook cleanup/recreation

## Related Resources

- [React Rules of Hooks](https://react.dev/link/rules-of-hooks)
- [Motion One useTransform](https://motion.dev/docs/react-use-transform)
- [React Hooks FAQ](https://react.dev/reference/react)
