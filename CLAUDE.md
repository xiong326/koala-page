---
description: 
alwaysApply: true
---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An interactive bilingual (English/Chinese) koala family tree visualization app built with React 19 + Vite 7. Features multiple family boards, relationship calculation, advanced filtering, birthday forecasting, a data analytics dashboard with charts, detailed koala profile modals, and optimized image serving. Uses Cytoscape.js for graph visualization with dagre hierarchical layout and Recharts for statistical charts.

## Development Commands

```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production (runs image optimization as prebuild step)
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview

# Generate optimized WebP thumbnails and medium images from source photos
npm run optimize-images
```

## Architecture

### Multi-Board System

The app supports multiple koala family boards (e.g., Chimelong/长隆, Hongshan/红山) stored as separate JSON files in `src/data/`:
- `koalas.json` - Hongshan family (board1, ~90 lines)
- `koalas-board2.json` - Chimelong family (board2, ~1600 lines)
- `contribution.json` - Per-board credits/contributions data

**Key Implementation Details:**
- `App.jsx` maintains `currentBoard` state and imports all board data into a `boardData` object
- Board switching resets ALL UI state (selections, filters, highlights, sidebars, modals) and triggers graph view reset after 100ms
- `BoardSelector.jsx` component provides dropdown with bilingual board names
- Default board is `board2` (Chimelong)

### Graph Visualization (Cytoscape.js)

**Component:** `KoalaGraph.jsx`

**Layout Configuration:**
- Uses `cytoscape-dagre` for hierarchical top-to-bottom layout
- **Edge Style:** Taxi (orthogonal polylines) with `taxi-direction: 'downward'` for cleaner hierarchical visualization
- Edge styling: Regular edges are 2px gray, highlighted edges are 5px orange with `z-index: 999`
- Node styling: Rounded rectangle nodes (70x70px) with photo thumbnails, pink borders for females, blue for males, dashed borders for deceased
- Node labels show name + gender symbol + deceased symbol + birth year

**Highlight Model:**
Two distinct highlighting modes:
1. **Lineage Mode** (single node click):
   - **Clicked nodes** (orange border): the clicked original node + all its proxy copies. Clicking a proxy counts as clicking the original.
   - **Highlighted nodes** (own-color border): all ancestors + all descendants. Mates are NOT highlighted. For every highlighted original male, all its proxy copies are also highlighted (own color).
   - **Edges** (orange): mother-child edges where both endpoints are highlighted/clicked. Father-child connections via proxies: the proxy's mate edge + the mother-child edge are highlighted only when at least one child through that mate is highlighted/clicked.
   - Proxy copies do not recursively expand further highlights.
2. **Relationship Path Mode**: Highlights only the specific path between two selected koalas (orange endpoints), fits all path nodes in viewport

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

**Key Pattern:** Relationships are bidirectional and gender-aware. The calculator returns a relationship object with `type`, `direction`, `koala1Sex`, `koala2Sex`, and `path` (array of IDs for visualization). The sidebar includes a swap button to reverse the two koalas and color-coded relationship types with emoji icons.

### Data Board (Analytics Dashboard)

**Component:** `DataBoard.jsx`
**Helpers:** `src/utils/statsHelpers.js`

A full-screen modal presenting population statistics and charts using Recharts. Opened via a button in the search bar area.

**Statistics Sections:**
1. **Population Overview:** Total, alive, deceased counts with percentages; sex ratio pie chart
2. **Age Analytics:** Average age, oldest/youngest (clickable links to navigate to graph), average lifespan of deceased
3. **Charts:** Age distribution bar chart (7 buckets: 0-1, 1-3, 3-5, 5-10, 10-15, 15-20, 20+), birth month distribution bar chart
4. **Family & Lineage:** Top 5 parents by offspring count (clickable), generation distribution bar chart, founder count, deepest generation
5. **Births Per Year:** Bar chart showing births over time

**DataBoard Filter System (independent from FilterSidebar):**
- Sex filter (dropdown)
- Generation multi-select (custom checkbox dropdown component `GenerationMultiSelect`)
- Deceased filter (all/alive/deceased)
- Birth year range (4-digit min/max inputs)
- Clear all button
- All charts and stats update reactively based on filters

**statsHelpers.js exports:**
- `enrichKoala(koala, allKoalas)` / `enrichAll(koalas)` - Adds `ageInYears`, `preciseAge`, `ageForDisplay`, `generation` to each koala
- `computePopulationStats(koalas)` - total, alive, deceased, males, females
- `computeAgeStats(koalas)` - averageAge, oldest, youngest, avgLifespan
- `computeAgeDistribution(koalas)` - 7-bucket histogram data
- `computeBirthMonthDistribution(koalas)` - 12-month counts
- `computeOffspringRanking(filtered, all)` - Top 5 parents by offspring count
- `computeGenerationDistribution(koalas)` - Per-generation counts
- `computeFounderStats(koalas)` - Founder count, deepest generation
- `computeBirthsPerYear(koalas)` - Yearly birth counts

### Koala Detail Modal

**Component:** `KoalaDetailModal.jsx`

A comprehensive individual koala profile view opened by clicking the koala name or info icon in `KoalaCard`.

**Sections:**
1. **Basic Info:** Photo (medium size), sex, birth date, age (months for <1yr), generation, alive/deceased status with date
2. **Family:** Parents, grandparents (maternal/paternal), mates (inferred from shared offspring), siblings (full/half)
3. **Offspring:** Chronologically sorted list with sex, birth year, and other parent
4. **Family Stats:** Total descendants, total ancestors, deepest descendant generation
5. **Timeline:** Visual timeline with birth event and current age or death event

**Navigation:** Prev/next arrows navigate through all koalas sorted by birth date. All koala names are clickable links that navigate within the modal and update the graph.

### Date & Age Utilities

**Location:** `src/utils/`

Date handling is split across three files to prevent timezone-related bugs:

1. **`dateUtils.js`**:
   - `parseKoalaDateString(dateString)` - Parses "YYYY", "YYYY-MM", or "YYYY-MM-DD" into local Date objects (avoids UTC timezone shift)
   - `localDateToISODateString(date)` - Converts Date object to YYYY-MM-DD without timezone shifts
   - Critical for birthday calculations to avoid off-by-one-day errors

2. **`ageUtils.js`**:
   - `calculateAgeParts(birthDate, endDate)` - Returns `{years, months, days}` for precise age calculation; handles partial dates and deceased koalas with end date
   - `calculateAgeInYears(birthDate, endDate)` - Integer age in years (used for filtering and birthday forecasting)
   - `getAgeForDisplay(birthDate, endDate)` - Returns `{value, unit}` where unit is `'months'` for koalas < 1 year old, `'years'` otherwise

3. **`graphHelpers.js`**:
   - `getUpcomingBirthdays(koalas, daysAhead=60)` - Birthday forecast logic
   - Re-exports `calculateAgeInYears` for backward compatibility
   - Contains graph traversal utilities: `getDescendants`, `getAncestors`, `getAncestorPath`, `getLineageHighlight`, `getConnectedFamily`, `searchKoalas`, `calculateGeneration`
   - `koalasToGraphElements(koalas)` - Converts koala data to Cytoscape elements (nodes + edges)

**Date Format Support:**
- Year only: `"2015"`
- Year-Month: `"2018-02"`
- Full date: `"2018-02-01"`

All formats are handled gracefully throughout the app.

### Image Optimization System

**Script:** `scripts/optimize-images.js`
**Utility:** `src/utils/imageUtils.js`

Source photos (JPG) are stored in `public/images/koalas/`. The optimization script generates WebP variants at two sizes:
- `thumb/` - 128px wide, 75% quality (used in graph nodes, filter results, KoalaCard)
- `medium/` - 256px wide, 80% quality (used in KoalaDetailModal)

**`getPhotoUrl(photo, size)`** maps original photo paths to optimized variants:
- `size='thumb'` → `/images/koalas/thumb/filename.webp`
- `size='medium'` → `/images/koalas/medium/filename.webp`
- `size='original'` → original path

The script runs automatically as a `prebuild` step and can be run manually with `npm run optimize-images`. Uses the `sharp` library.

### Birthday Forecast

**Location:** `App.jsx` header

Shows the NEAREST upcoming birthday (within 60 days) for living koalas:
- English format: `Birthday forecast: Lulu (3) - 09/06`
- Chinese format: `生日预告: Lulu 3岁 - 09/06`

Only displays koalas with complete birth dates (YYYY-MM-DD). Excludes deceased koalas.

### Internationalization (i18n)

**Context:** `src/i18n/LanguageContext.jsx`
**Translations:** `src/i18n/translations.js` (~376 lines, ~180 keys per language)

- Default language: Chinese (`zh`)
- Language preference persisted in localStorage
- Translation function: `t(key, language, params)` supports template strings with `{{variable}}` syntax
- Age formatting differs by language: `(age)` in English, `age岁` in Chinese

**Translation categories:** Header, search, instructions, koala card, sex values, age units, filter, relationship types, graph controls, data board, detail modal, contributions, language toggle.

**Important:** When adding new UI text, add both English and Chinese keys to `translations.js`.

### Filter System

**Component:** `FilterSidebar.jsx`

Four filter types (all can be combined):
1. **Sex:** male, female, all
2. **Age Range:**
   - Preset ranges: infant (<1), young (1-3), adult (3-10), senior (10+)
   - Custom range: User-defined min/max with 2-digit inputs (inclusive boundaries)
3. **Generation:** Calculated dynamically based on maternal lineage depth
4. **Deceased Status:** all, alive, deceased

**Filter Result Display:**
- Shows thumbnail photo, name, sex (color-coded), precise age (months for <1yr, years otherwise), and generation
- Results always sorted by age (oldest to youngest) using `preciseAge` (fractional years)
- Clicking a result navigates to that koala in the graph

**Custom Age Filter Details:**
- Empty min defaults to 0, empty max to Infinity
- Auto-selects "custom" option when user types in input boxes
- Input boxes are `w-12` (48px) with `maxLength="2"` and center-aligned text

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

**Contribution Data:** `src/data/contribution.json`
```json
{
  "contributions": [
    {
      "board": "Chimelong",
      "contributions": [
        { "names": ["contributor names"], "contribution": "Koala Photo" }
      ]
    }
  ]
}
```

**Key Conventions:**
- IDs for Hongshan board: `k001`, `k002`, etc.
- IDs for Chimelong board: `b2k001`, `b2k002`, etc. (prefixed to avoid conflicts)
- Mother field is primary for lineage calculations (father is supplementary)
- Generation calculation is based on maternal lineage only

### Contributions Footer

**Location:** `App.jsx` footer

A collapsible footer section showing credits per board. Maps `currentBoard` to `contribution.json` entries via `boardToContributionName`. Contribution types are translated via `contributionTypeKeys` mapping to i18n keys.

### Component Communication Patterns

**App.jsx** is the central coordinator:
- Manages global state (koalas, selectedKoala, highlightedNodes, relationshipPath, dataBoardOpen, detailModalKoala, contributionsOpen)
- Passes data and callbacks down to children
- Handles board switching and state reset
- Coordinates graph centering and card display
- `handleOpenDetail` opens KoalaDetailModal from KoalaCard
- `handleDetailKoalaClick` navigates within KoalaDetailModal and updates graph state simultaneously

**Sidebar Components** (FilterSidebar, RelationshipSidebar):
- Are positioned absolutely within the graph container
- Toggle between open/collapsed states
- Call `onKoalaClick` callback to trigger graph navigation
- FilterSidebar passes results through callback, RelationshipSidebar uses `onRelationshipCalculated` for path highlighting

**Graph-Card-Detail Flow:**
- Click on node → centers graph → shows KoalaCard (top center)
- KoalaCard name/info icon → opens KoalaDetailModal
- KoalaDetailModal koala links → navigate within modal AND update graph
- Card's parent links → trigger `handleParentClick` → re-centers graph on parent
- DataBoard koala links → close DataBoard, then navigate to koala in graph after 100ms delay

### State Management Patterns

No Redux or external state management. Uses React's built-in state with these patterns:

1. **Ref Stability:** `onNodeClickRef` in KoalaGraph prevents re-initialization when parent re-renders
2. **Viewport Caching:** `defaultViewportRef` stores initial zoom/pan for reset functionality
3. **Custom Events:** `window.dispatchEvent(new CustomEvent('resetGraphView'))` for cross-component communication
4. **Memoized Computation:** DataBoard uses `useMemo` extensively for derived statistics to avoid recomputation on every render

### Testing Considerations

When testing:
- Mock koala data should include various date formats (year, year-month, full date)
- Test timezone edge cases in birthday calculations (use `localDateToISODateString`)
- Verify age calculations around birthday boundaries (before/after birthday this year)
- Test relationship calculator with complex family structures (cousins, multiple generations)
- Test sub-year age display (months for koalas < 1 year old)
- Test DataBoard filters (especially multi-select generations and birth year range)
- Test KoalaDetailModal navigation (prev/next cycling, koala link navigation)

### Performance Notes

- Graph re-renders are minimized by checking `isReady` state before applying highlights
- Large boards (100+ koalas) render smoothly due to Cytoscape's efficient rendering
- Filter results are limited to reasonable counts (no virtual scrolling needed yet)
- Relationship path calculations use BFS and are optimized to stop early when relationship is found
- Image optimization: WebP thumbnails (128px) significantly reduce graph rendering load vs original JPGs
- DataBoard uses `useMemo` for all computed stats to avoid expensive recalculations

### Styling Conventions

- Tailwind CSS 4 with PostCSS
- Responsive breakpoints: `sm:`, `md:` for adaptive layouts
- Color coding: Blue (#3b82f6) for males, Pink (#ec4899) for females, Orange (#f59e0b) for selections
- Chart colors: Indigo (#6366f1) for age distribution, Amber (#f59e0b) for birth months, Emerald (#10b981) for generations, Purple (#8b5cf6) for births per year
- Compact UI with small text (`text-xs`, `text-sm`) and tight spacing in sidebars
- Modals use `fixed inset-0 z-50` with semi-transparent backdrop (`bg-black/40`)

### Dependencies

**Runtime:**
- `react` / `react-dom` (^19.2.0) - UI framework
- `cytoscape` (^3.33.1) + `cytoscape-dagre` (^2.5.0) + `dagre` (^0.8.5) - Graph visualization
- `recharts` (^3.7.0) - Charts in DataBoard (BarChart, PieChart, ResponsiveContainer)

**Dev:**
- `vite` (^7.2.4) + `@vitejs/plugin-react` - Build tooling
- `@tailwindcss/postcss` (^4.1.18) - CSS framework
- `sharp` (^0.34.5) - Image optimization script
- `eslint` (^9.39.1) - Linting

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
5. Add board mapping in `boardToContributionName` for contributions
6. Add contribution data to `contribution.json`

**Adding new relationship types:**
1. Extend relationship calculator in `relationshipCalculator.js`
2. Add translation keys to `translations.js` (both `en` and `zh`)
3. Update `getRelationshipDescription()` and `getRelationshipIcon()` in `RelationshipSidebar.jsx`

**Adding new filters:**
1. Add filter state to `FilterSidebar.jsx`
2. Implement filter logic in the `useEffect` that processes `koalasWithGeneration`
3. Add UI controls and translation keys
4. Update active filter count calculation

**Adding new DataBoard statistics:**
1. Add compute function to `statsHelpers.js`
2. Call it in `DataBoard.jsx` with `useMemo`
3. Add chart or stat card in the appropriate section
4. Add translation keys for labels
