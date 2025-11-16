# PWA Icons and Splash Screens

This document explains the PWA icon setup for Kurama, including standard icons, maskable icons, and iOS-specific assets.

## Icon Requirements

### Standard PWA Icons
Required sizes for optimal display across devices:
- **72x72**: Small devices, low DPI
- **96x96**: Medium devices
- **128x128**: Medium-high devices
- **144x144**: High DPI devices
- **152x152**: iPad
- **192x192**: Android home screen (minimum recommended)
- **384x384**: High DPI Android devices
- **512x512**: Android splash screen, high DPI (maximum recommended)

### Maskable Icons
Maskable icons support adaptive icons on Android 8.0+:
- **192x192**: Minimum size for maskable
- **384x384**: Medium size for maskable
- **512x512**: Maximum size for maskable

**Important**: Maskable icons must have:
1. Opaque background (no transparency)
2. 10% padding on all sides (safe zone)
3. Important content within the 80% safe zone circle

### iOS Icons
- **180x180**: Apple touch icon for iPhone
- **Splash screens**: Various sizes for different iOS devices

## Icon Generation

### Automatic Generation
Use the provided script to generate all required icons from a source image:

```bash
# From apps/user-application directory
./scripts/generate-pwa-icons.sh public/logo512.png
```

**Requirements**:
- Source image: At least 1024x1024 pixels
- Transparent background (for standard icons)
- ImageMagick installed: `sudo apt-get install imagemagick`

### Manual Generation
If you prefer to create icons manually:

1. **Standard Icons**: Export PNG files at required sizes with transparent background
2. **Maskable Icons**: 
   - Add 10% padding on all sides
   - Add opaque background color
   - Ensure important content is within 80% safe zone
3. **iOS Icons**: Export at exact sizes without transparency

### Online Tools
Alternative tools for icon generation:
- [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
- [Maskable.app](https://maskable.app/) - Preview and generate maskable icons
- [RealFaviconGenerator](https://realfavicongenerator.net/)

## Manifest Configuration

The icons are configured in `vite.config.ts` under the PWA plugin manifest:

```typescript
manifest: {
  icons: [
    // Standard icons
    {
      src: '/pwa-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/pwa-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
    // Maskable icons
    {
      src: '/pwa-192x192-maskable.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable',
    },
    {
      src: '/pwa-512x512-maskable.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable', // Can be used as both standard and maskable
    },
  ],
}
```

## iOS Splash Screens

Add these meta tags to `index.html` for iOS splash screens:

```html
<!-- iPhone X/XS/11 Pro -->
<link rel="apple-touch-startup-image" 
      href="/apple-splash-1125x2436.png" 
      media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)">

<!-- iPhone XR/11 -->
<link rel="apple-touch-startup-image" 
      href="/apple-splash-828x1792.png" 
      media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)">

<!-- iPhone XS Max/11 Pro Max -->
<link rel="apple-touch-startup-image" 
      href="/apple-splash-1242x2688.png" 
      media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)">

<!-- iPad Pro 12.9" -->
<link rel="apple-touch-startup-image" 
      href="/apple-splash-2048x2732.png" 
      media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)">

<!-- iPad Pro 11" -->
<link rel="apple-touch-startup-image" 
      href="/apple-splash-1668x2388.png" 
      media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)">

<!-- Apple touch icon -->
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

## Icon Purpose Values

The `purpose` field in the manifest can have these values:

- **`any`**: Standard icon (default if not specified)
- **`maskable`**: Adaptive icon for Android
- **`any maskable`**: Can be used for both purposes (recommended for 512x512)
- **`monochrome`**: Single-color icon for special contexts

## Testing Icons

### Android
1. Install PWA on Android device
2. Check home screen icon
3. Verify icon shape matches device theme (circle, squircle, etc.)
4. Check app switcher icon

### iOS
1. Add to Home Screen on iOS device
2. Verify apple-touch-icon appears correctly
3. Check splash screen when launching app
4. Test on different iOS devices (iPhone, iPad)

### Desktop
1. Install PWA on Windows/macOS/Linux
2. Check taskbar/dock icon
3. Verify app launcher icon
4. Check window title bar icon

### Tools
- **Chrome DevTools**: Application > Manifest > Icons
- **Maskable.app**: Preview maskable icons with different masks
- **Lighthouse**: PWA audit checks icon requirements

## Icon Design Best Practices

### General Guidelines
1. **Simple and recognizable**: Icon should be identifiable at small sizes
2. **Consistent branding**: Match your app's visual identity
3. **High contrast**: Ensure visibility on various backgrounds
4. **Avoid text**: Text becomes unreadable at small sizes
5. **Test at all sizes**: Verify icon looks good from 16x16 to 512x512

### Maskable Icon Guidelines
1. **Safe zone**: Keep important content within 80% circle
2. **Opaque background**: Use solid color, no transparency
3. **Padding**: Add 10% padding on all sides
4. **Test with masks**: Preview with different shapes (circle, squircle, rounded square)

### Color Considerations
1. **Light and dark modes**: Ensure icon works in both
2. **Background color**: Choose color that complements icon
3. **Contrast ratio**: Maintain WCAG AA contrast standards
4. **Brand colors**: Use your app's primary colors

## File Structure

```
public/
├── pwa-72x72.png              # Standard icon
├── pwa-96x96.png              # Standard icon
├── pwa-128x128.png            # Standard icon
├── pwa-144x144.png            # Standard icon
├── pwa-152x152.png            # Standard icon
├── pwa-192x192.png            # Standard icon (minimum)
├── pwa-384x384.png            # Standard icon
├── pwa-512x512.png            # Standard icon (maximum)
├── pwa-192x192-maskable.png   # Maskable icon
├── pwa-384x384-maskable.png   # Maskable icon
├── pwa-512x512-maskable.png   # Maskable icon
├── apple-touch-icon.png       # iOS home screen (180x180)
├── apple-splash-1125x2436.png # iPhone X/XS/11 Pro
├── apple-splash-828x1792.png  # iPhone XR/11
├── apple-splash-1242x2688.png # iPhone XS Max/11 Pro Max
├── apple-splash-2048x2732.png # iPad Pro 12.9"
├── apple-splash-1668x2388.png # iPad Pro 11"
├── favicon-32x32.png          # Favicon
├── favicon-16x16.png          # Favicon
└── favicon.ico                # Multi-size favicon
```

## Troubleshooting

### Icons not updating
1. Clear browser cache
2. Uninstall and reinstall PWA
3. Check manifest is being served correctly
4. Verify icon paths are correct

### White background on Android
- Ensure maskable icons are configured with `purpose: "maskable"`
- Verify maskable icons have opaque background
- Check safe zone padding is correct

### iOS splash screen not showing
- Verify meta tags are in `<head>` section
- Check media queries match device specifications
- Ensure splash screen images exist and are accessible
- Test on actual iOS device (simulator may not show splash)

### Icon appears blurry
- Use higher resolution source image (at least 1024x1024)
- Ensure PNG files are not compressed too much
- Check icon is being served at correct size
- Verify browser is not scaling icon incorrectly

## Resources

- [MDN: Define app icons](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Define_app_icons)
- [web.dev: Maskable icons](https://web.dev/articles/maskable-icon)
- [Apple: App icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android: Icon design](https://developer.android.com/distribute/google-play/resources/icon-design-specifications)
- [PWA Builder](https://www.pwabuilder.com/imageGenerator)
- [Maskable.app](https://maskable.app/)
