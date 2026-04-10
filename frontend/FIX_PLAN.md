# Fix Plan - Settings & UI Issues

**Date**: January 17, 2026
**Status**: Planning Complete

---

## Issues Identified

### 1. Settings Not Saving ❌
**Location**: `components/settings/settings-interface.tsx` lines 69-82

**Problem**: API payload format mismatch
- Frontend sends: `{ enabled: true }` for scraper_enabled
- Backend expects: `{ value: true }` for ALL settings
- Backend then wraps it appropriately based on key

**Evidence** (from `storage.ts`):
```typescript
if (key === 'scraper_enabled') {
  jsonbValue = { enabled: value };  // Backend expects "value", wraps it as "enabled"
}
```

**Fix**: Change all settings to send `{ value: <value> }` format

---

### 2. Number Inputs Can't Be Set to 0, 1, 2 ❌
**Location**: `components/settings/settings-interface.tsx` lines 242-271

**Problem**: Input validation too restrictive
- Line 245: `min="1"` prevents setting to 0
- Line 248: `parseInt(e.target.value) || 10` - returns 10 if value is 0 or NaN
- Line 268: `min="1"` prevents setting to 0
- Line 271: `parseInt(e.target.value) || 3` - returns 3 if value is 0 or NaN

**User Experience**:
- Can't set max_ads_per_brand to 0, 1, or 2
- Can only backspace once before it resets to default

**Fix**:
- Remove `min="1"` attribute
- Change `parseInt(e.target.value) || 10` to `parseInt(e.target.value) || 0`
- Add proper validation to ensure non-negative integers

---

### 3. Avatar Text Overflow ❌
**Location**: `components/brands/brand-table.tsx` lines 85-93

**Problem**: Text avatar overflows circular container
- Currently using circular div (h-10 w-10 rounded-full)
- Text like "Spirituality" is too long for circle
- Looks messy and unprofessional

**Fix**: Change to rectangular badge style
- Use `rounded-md` instead of `rounded-full`
- Add padding and text truncation
- Max width with ellipsis for long text

---

### 4. No Logo, Needs Animation ❌
**Location**: `components/layout/navbar.tsx` line 15-17

**Problem**: Plain text "AdSpy Tool", no branding
**Requirement**: Animated star logo with color transitions

**Specification**:
- SVG star icon
- Colors: red → green → blue → yellow → red (cycle)
- Transition every 5 seconds
- Place to the left of "AdSpy Tool" text

**Fix**: Create animated star component with CSS keyframes

---

## Implementation Plan

### Step 1: Fix Settings API Payload (HIGH PRIORITY)

**File**: `components/settings/settings-interface.tsx`

**Changes**:
```typescript
// Line 69-82: Change from
const updates = [
  {
    key: 'scraper_enabled',
    value: { enabled: settings.scraper_enabled },  // ❌ WRONG
  },
  {
    key: 'max_ads_per_brand',
    value: { value: settings.max_ads_per_brand },  // ❌ INCONSISTENT
  },
  // ...
]

// To:
const updates = [
  {
    key: 'scraper_enabled',
    value: settings.scraper_enabled,  // ✅ CORRECT
  },
  {
    key: 'max_ads_per_brand',
    value: settings.max_ads_per_brand,  // ✅ CONSISTENT
  },
  {
    key: 'max_daily_ads_per_brand',
    value: settings.max_daily_ads_per_brand,  // ✅ CONSISTENT
  },
]

// Update fetch calls (lines 84-92)
for (const update of updates) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/settings/${update.key}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: update.value }),  // ✅ Always send { value: X }
    }
  )
}
```

---

### Step 2: Fix Number Inputs (HIGH PRIORITY)

**File**: `components/settings/settings-interface.tsx`

**Changes**:
```typescript
// Lines 242-251: Max Ads Per Brand
<Input
  id="max-ads"
  type="number"
  min="0"           // ✅ Changed from "1" to "0"
  max="100"
  value={settings.max_ads_per_brand}
  onChange={(e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 0 && val <= 100) {  // ✅ Proper validation
      handleSettingChange('max_ads_per_brand', val);
    }
  }}
  className="max-w-xs"
/>

// Lines 265-274: Max Daily Ads
<Input
  id="max-daily-ads"
  type="number"
  min="0"           // ✅ Changed from "1" to "0"
  max="50"
  value={settings.max_daily_ads_per_brand}
  onChange={(e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 0 && val <= 50) {  // ✅ Proper validation
      handleSettingChange('max_daily_ads_per_brand', val);
    }
  }}
  className="max-w-xs"
/>
```

---

### Step 3: Fix Avatar Overflow (MEDIUM PRIORITY)

**File**: `components/brands/brand-table.tsx`

**Changes**:
```typescript
// Lines 85-93: Change from circular to badge
<TableCell>
  {brand.avatar ? (
    <div className="inline-flex items-center justify-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium max-w-[80px] truncate">
      {brand.avatar}
    </div>
  ) : (
    <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-xs font-medium text-gray-500">
      {brand.brand_name.charAt(0).toUpperCase()}
    </div>
  )}
</TableCell>
```

---

### Step 4: Add Animated Star Logo (LOW PRIORITY)

**New File**: `components/layout/animated-star.tsx`

```typescript
'use client'

export function AnimatedStar() {
  return (
    <svg
      className="h-6 w-6 star-animate"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  )
}
```

**New File**: `app/globals.css` (add animation)

```css
@keyframes colorCycle {
  0% { color: #ef4444; }      /* red */
  25% { color: #22c55e; }     /* green */
  50% { color: #3b82f6; }     /* blue */
  75% { color: #eab308; }     /* yellow */
  100% { color: #ef4444; }    /* red */
}

.star-animate {
  animation: colorCycle 20s linear infinite;
}
```

**File**: `components/layout/navbar.tsx`

```typescript
import { AnimatedStar } from './animated-star'

// Line 15-17: Change from
<Link href="/" className="flex items-center space-x-2">
  <span className="text-xl font-semibold text-black">AdSpy Tool</span>
</Link>

// To:
<Link href="/" className="flex items-center space-x-2">
  <AnimatedStar />
  <span className="text-xl font-semibold text-black">AdSpy Tool</span>
</Link>
```

---

## Testing Checklist

### Settings Page
- [ ] Toggle scraper enable/disable - should save
- [ ] Set max_ads_per_brand to 0 - should save
- [ ] Set max_ads_per_brand to 1 - should save
- [ ] Set max_ads_per_brand to 100 - should save
- [ ] Set max_daily_ads_per_brand to 0 - should save
- [ ] Set max_daily_ads_per_brand to 50 - should save
- [ ] Click "Save Changes" - should show success toast
- [ ] Reload page - settings should persist

### Brands Page
- [ ] Avatar text (like "Spirituality") should fit in box
- [ ] Long avatar text should truncate with ellipsis
- [ ] Empty avatar should show first letter in box

### Navbar
- [ ] Star logo should appear next to "AdSpy Tool"
- [ ] Star should cycle through colors every 5 seconds
- [ ] Colors: red → green → blue → yellow → red

---

## Deployment Steps

1. **Build locally**: `cd frontend && npm run build`
2. **Test locally**: `npm run dev` - verify all fixes
3. **Copy to VPS**: `scp` updated files
4. **Build on VPS**: `npm run build`
5. **Restart PM2**: `pm2 restart ads-intel-frontend`
6. **Verify**: Test all functionality on VPS

---

## Risk Assessment

| Issue | Risk | Impact |
|-------|------|--------|
| Settings API Fix | LOW | Critical functionality restored |
| Number Input Fix | LOW | Better UX, no breaking changes |
| Avatar Fix | VERY LOW | Visual improvement only |
| Star Logo | VERY LOW | Visual enhancement only |

**Overall Risk**: LOW
**Estimated Time**: 30-45 minutes
**Testing Time**: 15-20 minutes

---

**END OF FIX PLAN**
