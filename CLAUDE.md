---
description: 
alwaysApply: true
---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An interactive bilingual (English/Chinese) koala family tree visualization app built with React 19 + Vite 7. Features multiple family boards, relationship calculation, advanced filtering, and birthday forecasting. Uses Cytoscape.js for graph visualization with dagre hierarchical layout.

## Development Commands

```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Multi-Board System

The app supports multiple koala family boards (e.g., Chimelong/长隆, Hongshan/红山) stored as separate JSON files in `src/data/`:
- `koalas.json` - Hongshan family (board1)
- `koalas-board2.json` - Chimelong family (board2)

**Key Implementation Details:**
- `App.jsx` maintains `currentBoard` state and imports all board data into a `boardData` object
- Board switching resets ALL UI state (selections, filters, highlights, sidebars) and triggers graph view reset after 100ms
- `BoardSelector.jsx` component provides dropdown with bilingual board names
- Default board is `board2` (Chimelong)

### Graph Visualization (Cytoscape.js)

**Component:** `KoalaGraph.jsx`

**Layout Configuration:**
- Uses `cytoscape-dagre` for hierarchical top-to-bottom layout
- **Edge Style:** Taxi (orthogonal polylines) with `taxi-direction: 'downward'` for cleaner hierarchical visualization
- Edge styling: Regular edges are 2px gray, highlighted edges are 5px orange with `z-index: 999`
- Node styling: Pink borders for females, blue for males, dashed borders for deceased

**Edge Highlighting Logic:**
Three distinct highlighting modes:
1. **Lineage Mode** (single node click): Highlights all ancestors AND descendants, but only lights up edges in the ancestor path (upward) and descendant paths (downward) - NOT sibling edges
2. **Relationship Path Mode**: Highlights only the specific path between two selected koalas (orange endpoints)
3. **Family Network Mode**: Highlights all connected edges (fallback)

**Important:** The graph uses event listeners for viewport reset (`window.addEventListener('resetGraphView')`) which must fire AFTER board data changes.

### Relationship Calculation System

**Component:** `RelationshipSidebar.jsx`
**Calculator:** `src/utils/relationshipCalculator.js`

The relationship calculator determines how any two koalas are related:
- Parent-child (with gender-appropriate terms: mother/father)
- Siblings (full vs half siblings based on shared parents)
- Grandparent-grandchild (grandmother/grandfather based on sex)
- Great-grandparent / Ancestor (multi-generation)
- Aunt/Uncle-Niece/Nephew (with gender-appropriate terms)
- Cousins (shared grandmother)
- Related (through common ancestor with generation count)
- Unrelated (no common maternal ancestor)

**Key Pattern:** Relationships are bidirectional and gender-aware. The calculator returns a relationship object with `type`, `direction`, `koala1Sex`, `koala2Sex`, and `path` (array of IDs for visualization).

### Date & Age Utilities

**Location:** `src/utils/`

Date handling is split across three files to prevent timezone-related bugs:

1. **`dateUtils.js`**:
   - `localDateToISODateString(date)` - Converts Date object to YYYY-MM-DD without timezone shifts
   - Critical for birthday calculations to avoid off-by-one-day errors

2. **`ageUtils.js`**:
   - `calculateAgeInYears(birthDate, endDate)` - Handles partial dates (year-only, year-month, full date)
   - Properly accounts for whether birthday has occurred this year

3. **`graphHelpers.js`**:
   - `getUpcomingBirthdays(koalas, daysAhead=60)` - Birthday forecast logic
   - Re-exports `calculateAgeInYears` for backward compatibility
   - Contains graph traversal utilities (ancestors, descendants, lineage)

**Date Format Support:**
- Year only: `"2015"`
- Year-Month: `"2018-02"`
- Full date: `"2018-02-01"`

All formats are handled gracefully throughout the app.

### Birthday Forecast

**Location:** `App.jsx` header

Shows the NEAREST upcoming birthday (within 60 days) for living koalas:
- English format: `Birthday forecast: Lulu (3) - 09/06`
- Chinese format: `生日预告: Lulu 3岁 - 09/06`

Only displays koalas with complete birth dates (YYYY-MM-DD). Excludes deceased koalas.

### Internationalization (i18n)

**Context:** `src/i18n/LanguageContext.jsx`
**Translations:** `src/i18n/translations.js`

- Default language: Chinese (`zh`)
- Language preference persisted in localStorage
- Translation function: `t(key, language, params)` supports template strings with `{{variable}}` syntax
- Age formatting differs by language: `(age)` in English, `age岁` in Chinese

**Important:** When adding new UI text, add both English and Chinese keys to `translations.js`.

### Filter System

**Component:** `FilterSidebar.jsx`

Three filter types (all can be combined):
1. **Sex:** male, female, all
2. **Age Range:**
   - Preset ranges: infant (<1), young (1-3), adult (3-10), senior (10+)
   - Custom range: User-defined min/max with 2-digit inputs (inclusive boundaries)
3. **Generation:** Calculated dynamically based on maternal lineage depth

**Custom Age Filter Details:**
- Empty min defaults to 0, empty max to Infinity
- Auto-selects "custom" option when user types in input boxes
- Input boxes are `w-12` (48px) with `maxLength="2"` and center-aligned text
- Results always sorted by age (oldest to youngest)

### Search System

**Components:** `SearchDropdown.jsx`, `RelationshipSidebar.jsx` (2 instances)

Search matches against:
- Name
- Nicknames (array)
- ID

**Display Format:** Shows only name and nicknames (no ID) for cleaner UI.

### Data Structure

**Location:** `src/data/koalas.json` and `src/data/koalas-board2.json`

```json
{
  "koalas": [
    {
      "id": "k001",              // Unique ID (required)
      "name": "茉莉",            // Name (required)
      "nicknames": ["茉莉妈妈"], // Array (optional)
      "birthDate": "2015-06-15", // Flexible format (required)
      "sex": "female",           // "male" or "female" (required)
      "photo": "/path.jpg",      // Path or null (optional)
      "mother": "k002",          // Parent ID or null (optional)
      "father": "k003",          // Parent ID or null (optional)
      "deceased": true,          // Boolean (optional)
      "dateOfDeath": "2025-11"   // Same format as birthDate (optional)
    }
  ]
}
```

**Key Conventions:**
- IDs for Hongshan board: `k001`, `k002`, etc.
- IDs for Chimelong board: `b2k001`, `b2k002`, etc. (prefixed to avoid conflicts)
- Mother field is primary for lineage calculations (father is supplementary)
- Generation calculation is based on maternal lineage only

### Component Communication Patterns

**App.jsx** is the central coordinator:
- Manages global state (koalas, selectedKoala, highlightedNodes, relationshipPath, ancestorLineage)
- Passes data and callbacks down to children
- Handles board switching and state reset
- Coordinates graph centering and card display

**Sidebar Components** (FilterSidebar, RelationshipSidebar):
- Are positioned absolutely within the graph container
- Toggle between open/collapsed states
- Call `onKoalaClick` callback to trigger graph navigation
- FilterSidebar passes results through callback, RelationshipSidebar uses `onRelationshipCalculated` for path highlighting

**Graph-Card Interaction:**
- Click on node → centers graph → shows card in fixed position (top center)
- Card's parent links → trigger `handleParentClick` → re-centers graph on parent

### State Management Patterns

No Redux or external state management. Uses React's built-in state with these patterns:

1. **Ref Stability:** `onNodeClickRef` in KoalaGraph prevents re-initialization when parent re-renders
2. **Viewport Caching:** `defaultViewportRef` stores initial zoom/pan for reset functionality
3. **Custom Events:** `window.dispatchEvent(new CustomEvent('resetGraphView'))` for cross-component communication

### Testing Considerations

When testing:
- Mock koala data should include various date formats (year, year-month, full date)
- Test timezone edge cases in birthday calculations (use `localDateToISODateString`)
- Verify age calculations around birthday boundaries (before/after birthday this year)
- Test relationship calculator with complex family structures (cousins, multiple generations)

### Performance Notes

- Graph re-renders are minimized by checking `isReady` state before applying highlights
- Large boards (100+ koalas) render smoothly due to Cytoscape's efficient rendering
- Filter results are limited to reasonable counts (no virtual scrolling needed yet)
- Relationship path calculations use BFS and are optimized to stop early when relationship is found

### Styling Conventions

- Tailwind CSS 4 with PostCSS
- Responsive breakpoints: `sm:`, `md:` for adaptive layouts
- Color coding: Blue (#3b82f6) for males, Pink (#ec4899) for females, Orange (#f59e0b) for selections
- Compact UI with small text (`text-xs`, `text-sm`) and tight spacing in sidebars

### Git Workflow

Commits should include:
- Descriptive multi-line commit messages
- `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>` for Claude-assisted changes
- Update CHANGELOG.md for significant features

### Extending the App

**Adding a new board:**
1. Create new JSON file: `src/data/koalas-boardX.json`
2. Update `boardData` object in `App.jsx`
3. Add to `availableBoards` array
4. Add board name translations to `BoardSelector.jsx`

**Adding new relationship types:**
1. Extend relationship calculator in `relationshipCalculator.js`
2. Add translation keys to `translations.js` (both `en` and `zh`)
3. Update `getRelationshipDescription()` and `getRelationshipIcon()` in `RelationshipSidebar.jsx`

**Adding new filters:**
1. Add filter state to `FilterSidebar.jsx`
2. Implement filter logic in the `useEffect` that processes `koalasWithGeneration`
3. Add UI controls and translation keys
4. Update active filter count calculation
