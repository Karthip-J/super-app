# Dark Mode Fix Guide

## Issues Fixed

### 1. ✅ Dark Mode Hook with localStorage Persistence
- Created `src/hooks/useDarkMode.js` hook
- Automatically persists theme to localStorage
- Initializes from localStorage on page load
- Applies `dark` class to both `html` and `body` elements

### 2. ✅ Updated Navbar Component
- Now uses the `useDarkMode` hook
- Properly toggles dark mode with persistence

### 3. ✅ Updated UserModuleHeader Component
- Added dark mode classes:
  - `bg-white dark:bg-navy-800` for background
  - `border-gray-200 dark:border-gray-700` for borders
  - `text-gray-800 dark:text-white` for text
  - Dark mode support for inputs and selects

### 4. ✅ Updated Users Table
- Added dark mode classes to table container
- Added dark mode classes to table headers

## Components That Still Need Dark Mode Support

### Tables
The following table components need dark mode classes added:

1. **CategoryTable.jsx** (line 453)
   - Table container: `bg-white` → add `dark:bg-navy-800`
   - Table header: `bg-gray-50` → add `dark:bg-navy-700`
   - Table body: `bg-white` → add `dark:bg-navy-800`
   - Text colors: add `dark:text-white` or `dark:text-gray-300`

2. **RestaurantTable.jsx** (line 134)
   - Table container: `bg-white` → add `dark:bg-navy-800`
   - Table headers: add `dark:text-white`

3. **DishTable.jsx** (line 119)
   - Table container: `bg-white` → add `dark:bg-navy-800`
   - Table headers: add `dark:text-white`

4. **GroceryTable.jsx** (line 76)
   - Table container: `bg-white` → add `dark:bg-navy-800`
   - Table header: `bg-gray-50` → add `dark:bg-navy-700`
   - Table body: `bg-white` → add `dark:bg-navy-800`

5. **ProductTable.jsx**
   - Similar updates needed

### Buttons
Check all buttons for dark mode support:
- Cancel buttons: add `dark:bg-navy-700 dark:text-white`
- Primary buttons: ensure they work in dark mode
- Action buttons: add dark mode hover states

### Modals
Modal components should have:
- `bg-white dark:bg-navy-800`
- `text-gray-800 dark:text-white`
- Border colors: `border-gray-300 dark:border-gray-600`

### Forms
Form inputs should have:
- `bg-white dark:bg-navy-900`
- `border-gray-300 dark:border-gray-600`
- `text-gray-800 dark:text-white`
- `placeholder-gray-400 dark:placeholder-gray-500`

## How to Add Dark Mode to Components

### Pattern for Backgrounds
```jsx
// Before
className="bg-white"

// After
className="bg-white dark:bg-navy-800"
```

### Pattern for Text
```jsx
// Before
className="text-gray-800"

// After
className="text-gray-800 dark:text-white"
// or for secondary text
className="text-gray-600 dark:text-gray-300"
```

### Pattern for Borders
```jsx
// Before
className="border border-gray-300"

// After
className="border border-gray-300 dark:border-gray-600"
```

### Pattern for Inputs
```jsx
// Before
className="border border-gray-300 rounded-lg bg-white"

// After
className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-navy-900 text-gray-800 dark:text-white"
```

## Testing Dark Mode

1. Toggle dark mode using the moon/sun icon in the navbar
2. Refresh the page - theme should persist
3. Check all components for proper dark styling
4. Verify no light backgrounds appear in dark mode
5. Check text contrast for readability

## Common Issues

### Issue: Component not changing in dark mode
**Solution**: Add `dark:` variant classes to the component

### Issue: Theme not persisting after refresh
**Solution**: The `useDarkMode` hook handles this automatically. Make sure it's being used.

### Issue: Some elements still light colored
**Solution**: Check for hardcoded colors or missing `dark:` classes

### Issue: CSS specificity problems
**Solution**: Use Tailwind's `dark:` prefix which has proper specificity. Avoid inline styles that override Tailwind.

## Quick Fix Checklist

- [ ] All `bg-white` → `bg-white dark:bg-navy-800`
- [ ] All `text-gray-*` → add `dark:text-white` or `dark:text-gray-300`
- [ ] All `border-gray-*` → add `dark:border-gray-600` or `dark:border-gray-700`
- [ ] All inputs → add dark mode background and text colors
- [ ] All buttons → add dark mode hover states
- [ ] All modals → add dark mode support
- [ ] All tables → add dark mode to headers and rows
- [ ] Test theme persistence (localStorage)
- [ ] Test theme toggle functionality

