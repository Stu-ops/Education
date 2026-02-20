# Assets Directory

## Required Assets

### Icons (`/icons/`)
Place the following icon files here:

1. **logo.svg** - Main app logo (SVG format, scalable)
   - Recommended size: 512x512 viewBox
   - Colors: Use brand colors (#6366F1, #8B5CF6, #A855F7)
   - Usage: Header, branding

2. **logo-white.svg** - White version of logo
   - For use on dark/colored backgrounds
   - Same dimensions as logo.svg

3. **icon-192.png** - PWA icon (192x192px)
   - PNG format
   - Transparent or solid background (#6366F1)

4. **icon-512.png** - PWA icon (512x512px)
   - PNG format
   - Transparent or solid background (#6366F1)

5. **favicon.ico** - Browser favicon
   - 32x32px or 16x16px
   - ICO format

### Illustrations (`/illustrations/`)
Optional decorative illustrations:

1. **empty-state.svg** - For empty lists/no data
2. **success.svg** - Success celebrations
3. **error.svg** - Error states
4. **loading.svg** - Loading animations

## Mobile Assets

### Location: `/app/assets/`

1. **icon.png** - Main app icon (1024x1024px)
   - PNG format
   - No transparency for iOS
   - Rounded corners handled by OS

2. **splash-icon.png** - Splash screen icon
   - Recommended: 512x512px or larger
   - Centered on solid background

3. **adaptive-icon.png** - Android adaptive icon (1024x1024px)
   - PNG format
   - Safe zone: 66% of canvas (avoid edges)

4. **favicon.png** - Web favicon (192x192px)

## Placeholder Assets

Until you provide actual assets, the app uses:
- Emoji icons (🎓, 👋, 📚, etc.)
- Text-based logos
- Gradient backgrounds
- System default icons

## Design Guidelines

### Colors
- Primary: #6366F1 (Indigo)
- Secondary: #8B5CF6 (Purple)
- Accent: #A855F7 (Violet)
- Success: #10B981 (Emerald)
- Error: #EF4444 (Red)

### Style
- Modern, clean, minimal
- Rounded corners (16-24px)
- Gradient-friendly
- Works on light and dark backgrounds

## How to Add Assets

1. Create your assets following the guidelines above
2. Name them exactly as specified
3. Place in the correct directory
4. Restart the development server
5. Assets will be automatically loaded

## Asset Generation Tools

### Online Tools
- **Figma** - Design and export
- **Canva** - Quick icon creation
- **Favicon.io** - Generate favicons
- **App Icon Generator** - Generate all sizes

### Command Line
```bash
# Generate multiple sizes from one image
# (requires ImageMagick)
convert icon.png -resize 192x192 icon-192.png
convert icon.png -resize 512x512 icon-512.png
```

## Current Status

✅ Directories created
⏳ Waiting for asset files
📝 Using placeholders in the meantime

Once you add the assets, they will automatically be used throughout the application!
