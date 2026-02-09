# Translation Guide

## Where to Add Chinese Translations

All translations are located in: **`src/i18n/translations.js`**

### Current Status

Chinese translations have been added. Review and update them as needed for accuracy and cultural appropriateness.

### How to Update Translations

1. Open `src/i18n/translations.js`
2. Find the `zh` object (Chinese translations)
3. Update the Chinese text on the right side of each line
4. Save the file - the app will hot-reload automatically

### Example

```javascript
zh: {
  // Current Chinese translation
  title: "考拉家族树",

  // To update, replace with your improved translation
  title: "Your Better Chinese Translation",
}
```

### Special Translation Notes

- **deceased** ("已回考拉星"): This is a euphemistic way to say "passed away" (literally "returned to koala planet"). You may want to change this to a more direct translation like "已故" if preferred.
- **dateOfDeath** ("回考拉星日期"): Similarly euphemistic. Consider "去世日期" for a more direct translation.

## Translation Keys to Update

Here's a list of all the keys that need Chinese translations:

### Header Section
- `title` - Page title
- `subtitle` - Page subtitle

### Search Section
- `searchPlaceholder` - Search box placeholder text
- `showingCount` - Count display (uses {{filtered}} and {{total}} variables)
- `noResults` - No results message

### Instructions Section
- `instructionsTitle` - "Instructions:" heading
- `instructionClick` - Click instruction
- `instructionZoom` - Zoom instruction
- `instructionPan` - Pan instruction
- `instructionSearch` - Search instruction

### Koala Card Section
- `id` - ID label
- `nicknames` - Nicknames label
- `sex` - Sex label
- `birthDate` - Birth date label
- `age` - Age label
- `mother` - Mother label
- `father` - Father label
- `unknown` - Unknown value
- `deceased` - Deceased label
- `dateOfDeath` - Date of death label

### Values
- `male` - Male sex value
- `female` - Female sex value
- `months` - Months (age unit)
- `years` - Years (age unit)

### Language Toggle
- `language` - The word "Language" in English (shown when in Chinese mode)

## Variable Interpolation

Some translations use variables (marked with `{{variable}}`):

```javascript
showingCount: "Showing {{filtered}} of {{total}} koalas",
```

Make sure to keep the `{{variable}}` parts unchanged in your Chinese translation:

```javascript
showingCount: "显示 {{filtered}} / {{total}} 只考拉",
```

## Testing Your Translations

1. Save your changes to `src/i18n/translations.js`
2. The app will hot-reload automatically
3. Click the language toggle button (top-right) to switch between English and Chinese
4. Verify all text displays correctly in both languages

## Language Toggle Button

The language toggle button is located in the top-right corner of the header:
- When viewing in English, it shows "中文"
- When viewing in Chinese, it shows "English"
- Click to switch between languages
- The language preference is saved in localStorage

## Date Formatting

Dates are automatically formatted based on the selected language:
- English: "January 15, 2015"
- Chinese: Uses `zh-CN` locale formatting

The app supports flexible date formats:
- Year only: "2015" → displays as "2015"
- Year-Month: "2018-02" → displays as "February 2018" / "2018年2月"
- Full date: "2018-02-01" → displays as "February 1, 2018" / "2018年2月1日"

No manual translation needed for dates.

## How the i18n System Works

### Context Provider
The app uses React Context (`LanguageContext.jsx`) to manage the language state globally:
- Current language is stored in state
- Language preference is persisted in `localStorage`
- All components can access the language via `useLanguage()` hook

### Translation Function
The `t()` function in `translations.js` handles:
- Looking up translation keys in the appropriate language object
- Falling back to English if a key is missing
- Variable interpolation for dynamic values (e.g., `{{filtered}}`)

### Usage in Components
Components use the translation system like this:
```jsx
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';

function MyComponent() {
  const { language } = useLanguage();

  return <div>{t('keyName', language)}</div>;
}
```

### Adding New Translation Keys

If you need to add new translatable text:

1. Add the key to both `en` and `zh` objects in `translations.js`:
```javascript
export const translations = {
  en: {
    // ... existing keys
    newKey: "English text",
  },
  zh: {
    // ... existing keys
    newKey: "中文文本",
  }
};
```

2. Use it in your component:
```jsx
{t('newKey', language)}
```
