# Asset Specifications for Masterly App

## 🎨 Brand Colors to Use

When creating assets, use these exact colors:

```
Primary:   #6366F1 (Indigo)
Secondary: #8B5CF6 (Purple)
Accent:    #A855F7 (Violet)
Success:   #10B981 (Emerald)
White:     #FFFFFF
```

---

## 📱 Mobile App Icons

### 1. App Icon (icon.png)
**Location**: `app/assets/icon.png`

**Specifications**:
- Size: 1024x1024 pixels
- Format: PNG
- Background: Solid color (#6366F1) or gradient
- No transparency (iOS requirement)
- No text (keep it simple)
- Centered design with padding

**Design Ideas**:
- Graduation cap emoji styled
- Letter "M" for Masterly
- Book with sparkles
- Brain with lightbulb
- Abstract geometric shape

**Example Placeholder**:
```
┌─────────────────┐
│                 │
│                 │
│       🎓        │
│    Masterly     │
│                 │
│                 │
└─────────────────┘
```

### 2. Splash Icon (splash-icon.png)
**Location**: `app/assets/splash-icon.png`

**Specifications**:
- Size: 512x512 pixels or larger
- Format: PNG
- Can have transparency
- Centered on splash screen
- Background color: #6366F1 (set in app.config.js)

**Design**: Same as app icon but can be larger/more detailed

### 3. Adaptive Icon (adaptive-icon.png)
**Location**: `app/assets/adaptive-icon.png`

**Specifications**:
- Size: 1024x1024 pixels
- Format: PNG
- Safe zone: 66% of canvas (avoid outer 17% on all sides)
- Background: Transparent or solid
- Android will mask it into various shapes

**Safe Zone Guide**:
```
┌─────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← Avoid this area
│ ▓┌───────────┐▓ │
│ ▓│           │▓ │
│ ▓│   SAFE    │▓ │ ← Keep important content here
│ ▓│   ZONE    │▓ │
│ ▓│           │▓ │
│ ▓└───────────┘▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
└─────────────────┘
```

---

## 🌐 Web App Icons

### 4. Logo SVG (logo.svg)
**Location**: `public/assets/icons/logo.svg`

**Specifications**:
- Format: SVG (scalable)
- ViewBox: 0 0 512 512
- Colors: Use brand colors
- Clean, simple design
- Works at any size

**Example SVG Structure**:
```svg
<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366F1" />
      <stop offset="50%" style="stop-color:#8B5CF6" />
      <stop offset="100%" style="stop-color:#A855F7" />
    </linearGradient>
  </defs>
  <!-- Your logo design here -->
  <circle cx="256" cy="256" r="200" fill="url(#grad)" />
  <text x="256" y="280" font-size="120" fill="white" text-anchor="middle">M</text>
</svg>
```

### 5. Logo White (logo-white.svg)
**Location**: `public/assets/icons/logo-white.svg`

**Specifications**:
- Same as logo.svg but all white (#FFFFFF)
- For use on colored backgrounds
- Same dimensions

### 6. PWA Icons

#### icon-192.png
**Location**: `public/assets/icons/icon-192.png`
- Size: 192x192 pixels
- Format: PNG
- Can have transparency or solid background

#### icon-512.png
**Location**: `public/assets/icons/icon-512.png`
- Size: 512x512 pixels
- Format: PNG
- Can have transparency or solid background

### 7. Favicon (favicon.ico)
**Location**: `public/assets/icons/favicon.ico`

**Specifications**:
- Size: 32x32 or 16x16 pixels
- Format: ICO
- Simple, recognizable at small size
- Usually just the icon without text

---

## 🎨 Design Guidelines

### Style
- **Modern**: Clean, minimal, contemporary
- **Friendly**: Approachable, not too corporate
- **Educational**: Suggests learning, growth
- **Professional**: Polished, high-quality

### Colors
- Use gradient when possible (#6366F1 → #8B5CF6 → #A855F7)
- White for contrast
- Emerald (#10B981) for success/positive elements
- Avoid too many colors (keep it simple)

### Typography (if using text)
- Sans-serif fonts
- Bold, clear, readable
- Avoid thin/light weights at small sizes

### Shapes
- Rounded corners (16-24px radius)
- Smooth, organic shapes
- Avoid sharp angles
- Geometric but friendly

---

## 🛠️ Tools to Create Assets

### Online Tools (Free)
1. **Canva** - https://canva.com
   - Templates for app icons
   - Easy to use
   - Export in multiple formats

2. **Figma** - https://figma.com
   - Professional design tool
   - Free for individuals
   - Export to PNG/SVG

3. **Favicon.io** - https://favicon.io
   - Generate favicons from text/image
   - Multiple sizes automatically

4. **App Icon Generator** - https://appicon.co
   - Upload one image
   - Generates all required sizes

### Desktop Tools
1. **Adobe Illustrator** - Vector graphics
2. **Photoshop** - Raster graphics
3. **Inkscape** - Free vector editor
4. **GIMP** - Free image editor

---

## 📋 Quick Checklist

When creating assets, ensure:
- [ ] Correct dimensions
- [ ] Correct format (PNG/SVG/ICO)
- [ ] Uses brand colors
- [ ] Looks good at small sizes
- [ ] Centered with appropriate padding
- [ ] No copyrighted content
- [ ] Saved in correct location
- [ ] Named exactly as specified

---

## 🚀 Quick Start Options

### Option 1: Simple Text Logo
Create a simple logo with just the letter "M" or "Masterly":
- Background: Gradient (#6366F1 → #A855F7)
- Text: White, bold, centered
- Export in all required sizes

### Option 2: Emoji-Based
Use the graduation cap emoji (🎓) as the base:
- Add gradient background
- Add "Masterly" text below
- Export in all required sizes

### Option 3: Custom Design
Design a unique icon:
- Sketch ideas on paper
- Create in design tool
- Use brand colors
- Export in all required sizes

---

## 📦 Asset Package Structure

Once created, your assets should be organized like this:

```
project/
├── public/
│   └── assets/
│       └── icons/
│           ├── logo.svg
│           ├── logo-white.svg
│           ├── icon-192.png
│           ├── icon-512.png
│           └── favicon.ico
└── app/
    └── assets/
        ├── icon.png
        ├── splash-icon.png
        ├── adaptive-icon.png
        └── favicon.png
```

---

## 💡 Pro Tips

1. **Start with one design**: Create one master icon at 1024x1024, then resize
2. **Test at small sizes**: Make sure it's recognizable at 32x32
3. **Keep it simple**: Less detail = better at small sizes
4. **Use safe zones**: Keep important elements away from edges
5. **Export 2x**: Create assets at 2x size for retina displays
6. **Consistent style**: All assets should feel like they belong together

---

## ✅ Current Status

**Placeholders in use**: ✅ Working
- Emoji icons (🎓, 👋, 📚)
- Text-based branding
- Gradient backgrounds

**Custom assets**: ⏳ Optional
- App works perfectly without them
- Add when ready for production
- Follow specifications above

---

**Need help creating assets? Just let me know what you'd like and I can provide more specific guidance!**
