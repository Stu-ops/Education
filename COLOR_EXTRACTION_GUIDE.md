# Color Extraction Guide from Figma Designs

## Images to Analyze
Located in `/image` folder:
1. login.png - Login screen design
2. home.png - Home/main screen design
3. explore.png - Explore/stats screen design
4. history.png - History/chat list screen design
5. profile.png - Profile screen design

## What to Extract

### 1. Background Gradients
- Top color (start)
- Middle color (if any)
- Bottom color (end)
- Gradient direction (vertical, diagonal, etc.)

### 2. Card/Component Colors
- Card background color (with opacity)
- Card border color (if any)
- Shadow colors

### 3. Button Colors
- Primary button gradient (start → end)
- Secondary button colors
- Success/Error button colors

### 4. Text Colors
- Primary text (usually white)
- Secondary text (with opacity)
- Muted text

### 5. Accent Colors
- Highlight colors
- Icon colors
- Badge colors

## How to Extract Colors

### Method 1: Using Image Viewer
1. Open each PNG in an image editor (Paint, Photoshop, etc.)
2. Use eyedropper/color picker tool
3. Note down RGB or HEX values

### Method 2: Using Online Tools
1. Upload PNG to https://imagecolorpicker.com/
2. Click on different areas to get HEX codes
3. Document all colors

### Method 3: Using Browser DevTools
1. Open PNG in browser
2. Right-click → Inspect
3. Use color picker in DevTools

## Color Documentation Template

```
LOGIN SCREEN (login.png):
- Background Gradient: #XXXXXX → #XXXXXX → #XXXXXX
- Card Background: rgba(255, 255, 255, 0.X)
- Primary Button: #XXXXXX → #XXXXXX
- Text Primary: #XXXXXX
- Text Secondary: rgba(255, 255, 255, 0.X)

HOME SCREEN (home.png):
- Background Gradient: #XXXXXX → #XXXXXX → #XXXXXX
- Card Background: rgba(255, 255, 255, 0.X)
- Feature Cards: #XXXXXX
- Chat Bubble: #XXXXXX

EXPLORE SCREEN (explore.png):
- Background Gradient: #XXXXXX → #XXXXXX → #XXXXXX
- Progress Card: rgba(255, 255, 255, 0.X)
- Accuracy Card: rgba(255, 255, 255, 0.X)
- Badge Colors: [#XXXXXX, #XXXXXX, #XXXXXX]

HISTORY SCREEN (history.png):
- Background Gradient: #XXXXXX → #XXXXXX → #XXXXXX
- List Item Background: rgba(255, 255, 255, 0.X)
- Divider Color: rgba(255, 255, 255, 0.X)

PROFILE SCREEN (profile.png):
- Background Gradient: #XXXXXX → #XXXXXX → #XXXXXX
- Avatar Border: #XXXXXX → #XXXXXX
- Stats Card: rgba(255, 255, 255, 0.X)
- Edit Button: #XXXXXX → #XXXXXX
- Logout Button: #XXXXXX → #XXXXXX
```

## Next Steps
1. Extract colors from each image
2. Update `EXTRACTED_COLORS.md` with findings
3. Update `tailwind.config.js` with exact colors
4. Update `app/src/styles/colors.js` with exact colors
5. Apply colors to all pages
