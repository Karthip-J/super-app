# Dark Mode Implementation Guide

## ✅ What Was Implemented

### 1. ThemeContext with Context API
**Location:** `src/contexts/ThemeContext.jsx`

- Global theme management using React Context API
- Supports three modes: `light`, `dark`, and `auto` (system preference)
- Automatic localStorage persistence
- System preference detection and listening

**Usage:**
```jsx
import { useTheme } from '../../contexts/ThemeContext';

const { theme, actualTheme, toggleTheme, setThemeMode, isDark } = useTheme();
```

### 2. CSS Variables System
**Location:** `src/index.css`

CSS variables are defined for all theme colors:
- `--bg-primary`: Main background (#ffffff / #0f172a)
- `--bg-secondary`: Secondary background (#f8f9fa / #1e293b)
- `--bg-sidebar`: Sidebar background (#ffffff / #1e293b)
- `--bg-card`: Card/table background (#ffffff / #1e293b)
- `--bg-input`: Input background (#ffffff / #1e293b)
- `--text-primary`: Primary text (#111111 / #f5f5f5)
- `--text-secondary`: Secondary text (#6b7280 / #cbd5e1)
- `--border-color`: Border color (#e5e7eb / #334155)
- `--shadow-color`: Shadow color (rgba with opacity)

### 3. Updated Components

#### Navbar (`src/components/navbar/index.jsx`)
- Uses ThemeContext
- Theme toggle cycles: Light → Dark → Auto → Light
- Shows indicator badge when in auto mode
- All colors use CSS variables

#### Sidebar (`src/components/sidebar/Sidebar.jsx`)
- Full dark mode support with CSS variables
- Hover states work in both themes
- Active link highlighting works in both themes

#### UserModuleHeader (`src/components/common/UserModuleHeader.jsx`)
- Uses CSS variables for all colors
- Inputs and selects support dark mode
- Smooth transitions

#### Users Page (`src/views/admin/Sidenav_pages/Users.jsx`)
- Table with dark mode support
- Modals with dark mode
- Forms with dark mode
- Pagination with dark mode

#### Layout (`src/layouts/admin/index.jsx`)
- Main content area uses CSS variables
- Background switches correctly

## 📋 Sample Usage in Components

### Sidebar Example
```jsx
<div 
  style={{ 
    backgroundColor: 'var(--bg-sidebar)',
    color: 'var(--text-primary)',
    borderColor: 'var(--border-color)'
  }}
>
  {/* Content */}
</div>
```

### Header Example
```jsx
<nav 
  style={{ 
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  }}
>
  {/* Content */}
</nav>
```

### Table Example
```jsx
<div 
  style={{ 
    backgroundColor: 'var(--bg-card)',
    boxShadow: '0 10px 15px -3px var(--shadow-color)'
  }}
>
  <table>
    <thead>
      <tr style={{ color: 'var(--text-secondary)' }}>
        {/* Headers */}
      </tr>
    </thead>
    <tbody>
      <tr style={{ borderColor: 'var(--border-color)' }}>
        <td style={{ color: 'var(--text-primary)' }}>
          {/* Content */}
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Input Example
```jsx
<input
  className="border rounded-lg"
  style={{ 
    backgroundColor: 'var(--bg-input)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-primary)'
  }}
/>
```

### Button Example
```jsx
<button
  className="px-4 py-2 rounded-md hover:opacity-80 transition-opacity"
  style={{ 
    backgroundColor: 'var(--bg-secondary)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-primary)'
  }}
>
  Click Me
</button>
```

## 🎨 Color Scheme

### Light Mode
- Background: `#ffffff`
- Text: `#111111`
- Sidebar: `#ffffff`
- Cards/Tables: `#ffffff`
- Borders: `#e5e7eb`

### Dark Mode
- Background: `#0f172a`
- Text: `#f5f5f5`
- Sidebar: `#1e293b`
- Cards/Tables: `#1e293b`
- Borders: `#334155`

## 🔄 Theme Toggle Behavior

1. **First Click**: Light → Dark
2. **Second Click**: Dark → Auto (follows system)
3. **Third Click**: Auto → Light
4. **Cycle repeats**

When in Auto mode:
- A small blue indicator badge appears on the theme toggle
- Theme automatically switches when system preference changes
- Preference is still saved to localStorage

## 📝 Remaining Components to Update

The following components still need dark mode support (use the patterns above):

1. **CategoryTable.jsx** - Update table, inputs, buttons
2. **RestaurantTable.jsx** - Update table styling
3. **DishTable.jsx** - Update table styling
4. **GroceryTable.jsx** - Update table styling
5. **ProductTable.jsx** - Update table styling
6. **BrandForm.jsx** - Update form inputs and buttons
7. **Other modals and forms** - Use CSS variables

## ✅ Testing Checklist

- [x] Theme persists after page refresh
- [x] Theme toggle works (light/dark/auto)
- [x] Sidebar switches to dark mode
- [x] Navbar switches to dark mode
- [x] Tables switch to dark mode
- [x] Modals switch to dark mode
- [x] Forms switch to dark mode
- [x] Inputs and selects switch to dark mode
- [x] Background color switches correctly
- [ ] All other pages updated (in progress)

## 🚀 Quick Fix Pattern

For any component that needs dark mode:

1. Replace hardcoded colors with CSS variables:
   ```jsx
   // Before
   className="bg-white text-gray-800"
   
   // After
   style={{ 
     backgroundColor: 'var(--bg-primary)',
     color: 'var(--text-primary)'
   }}
   ```

2. For borders:
   ```jsx
   style={{ borderColor: 'var(--border-color)' }}
   ```

3. For shadows:
   ```jsx
   style={{ boxShadow: '0 10px 15px -3px var(--shadow-color)' }}
   ```

The theme system is now fully functional and ready to use across all components!

