# Changelog

## Recent Updates (2026-02-10)

### New Features

#### 🎂 Birthday Forecast
- Added birthday forecast display in the header, showing the nearest upcoming birthday
- Displays format: `Name Age岁 - MM/DD` (Chinese) or `Name (Age) - MM/DD` (English)
- Only shows birthdays within the next 60 days for living koalas
- Automatically updates when switching between family boards

#### 🎯 Multi-Board Support
- Added support for multiple koala family boards
- Created two family boards:
  - **Chimelong (长隆)**: 117+ koalas from Guangzhou Chimelong Safari Park
  - **Hongshan (红山)**: Original family tree with 32 koalas
- Board selector in header allows easy switching between families
- Chimelong set as the default board
- All UI state (selections, filters, highlights) resets when switching boards

#### 🔍 Enhanced Age Filtering
- Added custom age range filter with user-defined minimum and maximum values
- Inclusive range filtering (min ≤ age ≤ max)
- Compact input boxes (2-digit max) with center-aligned text
- Leave fields blank for unlimited min/max
- Filter results automatically sorted by age (oldest to youngest)

### UI/UX Improvements

#### 📊 Graph Visualization
- Changed edge style from curved bezier to orthogonal polylines (taxi routing)
- Cleaner hierarchical layout with right-angle edges
- Increased highlighted edge width from 3px to 5px for better visibility
- Added z-index to ensure highlighted edges render on top

#### 🔎 Search Improvements
- Simplified search dropdown results to show only name and nicknames
- Removed ID display for cleaner, more focused search results
- Applied to both main search and relationship calculator dropdowns

#### 🌐 Localization
- Changed default language from English to Chinese (zh)
- User language preference saved in localStorage
- Birthday forecast uses culturally appropriate age format ("岁" for Chinese)
- Board selector labels: "Family:" / "家族："

### Code Refactoring

#### 🛠️ Utility Organization
- Extracted age calculation logic to `src/utils/ageUtils.js`
- Created `src/utils/dateUtils.js` for date conversion utilities
- Added `localDateToISODateString()` to prevent timezone-related date shifts
- Maintained backward compatibility with re-exports from `graphHelpers.js`

#### 📦 New Components
- `BoardSelector.jsx`: Dropdown component for switching between family boards
- Bilingual support with proper translations for board names

### Technical Details

#### Data Structure
- Board data stored in separate JSON files:
  - `src/data/koalas.json` (Hongshan family)
  - `src/data/koalas-board2.json` (Chimelong family)
- Each koala entry includes: id, name, nicknames, birthDate, sex, photo, mother, father, deceased, dateOfDeath

#### Graph Rendering
- Cytoscape.js with dagre layout for hierarchical tree structure
- Taxi curve style with downward direction optimization
- 20px turn radius for smooth corners
- 5px edge width for highlighted relationships

#### Filtering Logic
- Multiple filter types: sex, age range, generation
- Custom age range with inclusive boundaries
- Real-time filtering with automatic result count
- Active filter count badge on filter sidebar toggle button

### Bug Fixes
- Fixed date timezone issues in birthday calculations using local date conversion
- Improved age calculation accuracy for partial dates (year-only, year-month)
- Proper handling of deceased koalas in birthday forecast

---

## Previous Releases

See git history for earlier changes including initial implementation of:
- Interactive family tree visualization
- Relationship calculator
- Advanced filtering system
- Bilingual UI support (English/Chinese)
