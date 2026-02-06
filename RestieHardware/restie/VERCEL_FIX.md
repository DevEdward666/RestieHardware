# Vercel Deployment Fix - Canvas/jsPDF Issue

## Problem
The `canvas` package (peer dependency of `jspdf-html2canvas`) requires native system libraries (`pixman-1`, `cairo`, etc.) that aren't available in Vercel's serverless build environment, causing build failures.

## Root Cause
- `jspdf-html2canvas` → depends on `canvas`
- `canvas` → requires native C++ compilation with system libraries
- Vercel Linux build environment lacks these libraries

## Solution Applied

### 1. Marked Canvas as Optional Dependency
**File:** `package.json`
```json
"optionalDependencies": {
  "canvas": "^2.11.2"
}
```
This tells npm that canvas can fail to install without breaking the build.

### 2. Created Vercel Configuration
**File:** `vercel.json`
```json
{
  "buildCommand": "npm run build:vercel",
  "installCommand": "npm install --legacy-peer-deps --no-optional",
  "framework": "vite",
  "outputDirectory": "dist"
}
```
- `--no-optional` skips canvas installation
- `--legacy-peer-deps` handles React Router v5 peer dependency warnings

### 3. Added Vercel-Specific Build Script
**File:** `package.json`
```json
"build:vercel": "npm install --no-optional && tsc && vite build"
```

### 4. Created .npmrc Configuration
**File:** `.npmrc`
```
legacy-peer-deps=true
```
Handles React Router v5 peer dependency warnings.

## Local Development Setup

### First-Time Setup or After Clean Install
```bash
# Install dependencies (canvas will fail, that's OK)
npm install --ignore-scripts

# Run dev server (works without canvas)
npm run dev
```

**Note:** The `canvas` package will fail to install locally because it requires system libraries (`pkg-config`, `pixman-1`, `cairo`). This is expected and doesn't affect development - canvas is only used for PDF generation which works in the browser using the native Canvas API.

## Why This Works

### Canvas is Not Actually Needed in Browser
- `jspdf` works fine in browsers without `canvas` 
- `jspdf-html2canvas` uses browser's native Canvas API, not the npm `canvas` package
- The npm `canvas` package is only needed for **server-side** PDF generation (Node.js)
- This is a client-side Ionic/React app - all PDF generation happens in the browser

### PDF Generation Still Works
Your `OrderInfo.tsx` component uses:
```typescript
import html2PDF from "jspdf-html2canvas";
```

This works because:
1. Browser provides native `<canvas>` element
2. `jspdf` uses browser's Canvas API via `html2canvas`
3. No native Node.js `canvas` package needed

## Deploy to Vercel

### Option A: Use Vercel CLI
```bash
cd /Users/edward/Documents/RestieHardware/RestieHardware/restie
npx vercel
```

### Option B: Push to Git (Auto-deploy)
```bash
git add .
git commit -m "fix: Configure Vercel deployment without canvas native dependency"
git push origin release
```

Vercel will automatically:
1. Detect `vercel.json`
2. Run `npm install --no-optional`
3. Run `npm run build:vercel`
4. Deploy to production

## Testing Locally

The app runs fine without canvas installed:

```bash
# Start dev server
npm run dev

# Build for production
npm run build
```

**Canvas Installation Errors Are Normal:**
- Canvas fails to build locally (requires pkg-config, pixman, cairo)
- PDF generation still works (uses browser's native Canvas API)
- No action needed - app functions correctly

## Alternative Solutions (Not Applied)

### If PDF Generation Breaks
If you encounter issues with PDF generation in production:

**Option 1:** Replace `jspdf-html2canvas` with direct imports
```typescript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Manual implementation without jspdf-html2canvas wrapper
```

**Option 2:** Use browser-only PDF libraries
- `pdfmake` - Pure JS, no canvas dependency
- `react-pdf/renderer` - React-based PDF generation

**Option 3:** Server-side PDF generation
- Create API endpoint with canvas installed
- Generate PDFs server-side
- Return PDF blob to client

## Files Changed
- ✅ `package.json` - Added optionalDependencies, build:vercel script
- ✅ `vercel.json` - Vercel deployment configuration
- ✅ `.npmrc` - npm behavior configuration  
- ✅ `.github/copilot-instructions.md` - Updated deployment docs

## Expected Result
✅ Vercel builds successfully
✅ Canvas installation errors ignored
✅ PDF generation works in browser
✅ Mobile app builds (Capacitor) unaffected
