# PWA Icon Generation Scripts

This directory contains scripts for generating PWA icons and assets.

## generate-pwa-icons.sh

Generates all required PWA icons from a single source image.

### Prerequisites

Install ImageMagick:
```bash
# Ubuntu/Debian
sudo apt-get install imagemagick

# macOS
brew install imagemagick

# Windows (via Chocolatey)
choco install imagemagick
```

### Usage

```bash
# From apps/user-application directory
./scripts/generate-pwa-icons.sh [source-image]

# Example with default source
./scripts/generate-pwa-icons.sh

# Example with custom source
./scripts/generate-pwa-icons.sh path/to/my-icon.png
```

### Source Image Requirements

- **Minimum size**: 1024x1024 pixels (higher is better)
- **Format**: PNG with transparent background
- **Content**: Simple, recognizable design
- **Safe zone**: Important content should fit within 80% circle for maskable icons

### Generated Files

The script generates:

**Standard PWA Icons** (transparent background):
- pwa-72x72.png
- pwa-96x96.png
- pwa-128x128.png
- pwa-144x144.png
- pwa-152x152.png
- pwa-192x192.png
- pwa-384x384.png
- pwa-512x512.png

**Maskable Icons** (opaque background with padding):
- pwa-192x192-maskable.png
- pwa-384x384-maskable.png
- pwa-512x512-maskable.png

**iOS Assets**:
- apple-touch-icon.png (180x180)
- apple-splash-1125x2436.png (iPhone X/XS/11 Pro)
- apple-splash-828x1792.png (iPhone XR/11)
- apple-splash-1242x2688.png (iPhone XS Max/11 Pro Max)
- apple-splash-2048x2732.png (iPad Pro 12.9")
- apple-splash-1668x2388.png (iPad Pro 11")

**Favicons**:
- favicon-32x32.png
- favicon-16x16.png
- favicon.ico (multi-size)

### After Generation

1. **Update manifest**: Icons are already configured in `vite.config.ts`
2. **Add iOS meta tags**: Copy tags from `public/ios-meta-tags.html` to your HTML template
3. **Test icons**: 
   - Install PWA on Android device
   - Add to Home Screen on iOS device
   - Install on desktop browsers
4. **Verify maskable icons**: Use [Maskable.app](https://maskable.app/) to preview

### Troubleshooting

**Script fails with "convert: command not found"**
- ImageMagick is not installed. Follow prerequisites above.

**Icons appear blurry**
- Use a higher resolution source image (at least 1024x1024)
- Ensure source image is not already compressed

**Maskable icons have wrong background**
- Edit the script to change background color from `white` to your preferred color
- Line: `convert "$SOURCE_IMAGE" ... -background white ...`

**iOS splash screens not showing**
- Ensure meta tags are added to HTML `<head>` section
- Test on actual iOS device (simulator may not show splash)
- Verify splash screen files exist in public directory

## Manual Icon Creation

If you prefer to create icons manually or use online tools:

### Online Tools
- [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
- [Maskable.app](https://maskable.app/) - Preview and generate maskable icons
- [RealFaviconGenerator](https://realfavicongenerator.net/)

### Design Guidelines

**Standard Icons**:
1. Use transparent background
2. Keep design simple and recognizable
3. Ensure visibility at small sizes (16x16)
4. Test on light and dark backgrounds

**Maskable Icons**:
1. Add opaque background color
2. Add 10% padding on all sides
3. Keep important content within 80% safe zone circle
4. Test with different mask shapes

**iOS Splash Screens**:
1. Use solid background color
2. Center icon/logo
3. Keep design minimal
4. Match app's theme color

## Resources

- [MDN: Define app icons](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Define_app_icons)
- [web.dev: Maskable icons](https://web.dev/articles/maskable-icon)
- [Apple: App icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android: Icon design](https://developer.android.com/distribute/google-play/resources/icon-design-specifications)
