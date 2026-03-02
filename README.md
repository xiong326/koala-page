# Koala Family Tree

An interactive bilingual (English/Chinese) koala family tree visualization app built with React 19 + Vite 7. Features multiple family boards, relationship calculation, advanced filtering, birthday forecasting, a data analytics dashboard with charts, detailed koala profile modals, and optimized image serving.

## Features

- **Multi-Board Family System**: Support for multiple koala populations
  - Chimelong (长隆) and Hongshan (红山) family boards
  - Board switcher with bilingual names in the header
  - Per-board contribution credits in a collapsible footer

- **Interactive Family Graph**: Visualize koala family trees with zoom, pan, and click interactions
  - Dagre hierarchical layout with parents at the top
  - Color-coded borders (pink for females, blue for males)
  - Optimized WebP photo thumbnails in nodes
  - Special styling for deceased koalas (dashed border, grayed out)
  - Smooth animations when centering on nodes
  - Reset view button to restore default zoom and pan

- **Lineage Highlighting**: Click on any koala to highlight their direct lineage
  - Selected koala gets orange border (6px)
  - All ancestors highlighted (mother → grandmother → etc.)
  - All descendants highlighted (children → grandchildren → etc.)
  - Only ancestor path edges and descendant edges highlighted (not siblings)

- **Advanced Filter Sidebar**: Filter koalas by multiple criteria
  - Filter by sex (male/female)
  - Filter by age range (infant, young, adult, senior, or custom min/max)
  - Filter by generation (1, 2, 3, 4, etc.)
  - Filter by deceased status (alive/deceased)
  - Live-updating results list with thumbnails and precise age display
  - Click any result to jump to that koala in the graph
  - Collapsible sidebar on the left

- **Relationship Calculator**: Calculate relationships between any two koalas
  - Select two koalas using autocomplete search
  - Automatically calculates relationship type
  - Shows detailed relationship description
  - Visualizes exact path between the two koalas
  - Supports: parent-child, siblings, grandparent, aunt-niece, cousins, ancestors, and more
  - Only highlights specific path edges (not entire family)
  - Collapsible sidebar on the right
  - Bilingual relationship descriptions

- **Data Analytics Dashboard**: Population statistics and charts (Recharts)
  - Population overview with sex ratio pie chart
  - Age analytics (average, oldest, youngest, avg lifespan)
  - Age distribution and birth month distribution bar charts
  - Top parents by offspring count, generation distribution
  - Births per year chart
  - Independent filter system (sex, generation, deceased, birth year range)

- **Koala Detail Modal**: Comprehensive individual profiles
  - Photo (medium optimized), family tree (parents, grandparents, mates, siblings)
  - Offspring list, family stats, visual timeline
  - Prev/next navigation sorted by birth date

- **Image Optimization**: Automatic WebP conversion pipeline
  - Source JPGs → optimized thumbnails (128px) and medium (256px) WebP variants
  - Runs automatically on `npm run dev` and `npm run build`
  - `sharp`-based build script in `scripts/optimize-images.js`

- **Search with Autocomplete**: Find koalas by name, nickname, or ID

- **Birthday Forecast**: Shows the nearest upcoming birthday in the header

- **Bilingual Support**: Full English and Chinese translations
  - Language toggle in header
  - Preference saved in localStorage
  - All UI elements translated including relationship types, filter labels, and contribution credits

- **Credits & Contributions**: Collapsible footer showing per-board contributor credits with platform links

## Tech Stack

- **Frontend**: React 19 with Vite 7
- **Graph Visualization**: Cytoscape.js 3.33+ with cytoscape-dagre for hierarchical layout
- **Charts**: Recharts 3.7 (BarChart, PieChart, ResponsiveContainer)
- **Image Optimization**: sharp 0.34 for WebP thumbnail/medium generation
- **Styling**: Tailwind CSS 4 with PostCSS
- **Internationalization**: Custom i18n with React Context
- **Data Storage**: JSON files per board (expandable to backend)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server (automatically optimizes images on first run):
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Other Commands

```bash
npm run build            # Production build (runs image optimization as prebuild)
npm run lint             # Run ESLint
npm run preview          # Preview production build
npm run optimize-images  # Manually regenerate optimized WebP thumbnails/medium images
```

## Usage

- **Graph**: Click a node to see its detail card and highlight lineage. Scroll to zoom, drag to pan, "Reset view" to restore default viewport.
- **Search**: Type a name, nickname, or ID to find and center on a koala.
- **Filter Sidebar** (left): Filter by sex, age range, generation, deceased status. Click results to navigate.
- **Relationship Calculator** (right): Select two koalas to calculate and visualize their relationship path.
- **Data Dashboard**: Open from the header to view population statistics and charts.
- **Detail Modal**: Click a koala's name or info icon for a full profile with family tree, offspring, and timeline.
- **Board Switcher**: Switch between Chimelong and Hongshan families in the header dropdown.
- **Language Toggle**: Switch between English and Chinese (saved to localStorage).

## Data Structure

Koala data is stored as separate JSON files per board in `src/data/`:
- `koalas.json` — Hongshan family (board1, IDs: `k001`, `k002`, ...)
- `koalas-board2.json` — Chimelong family (board2, IDs: `b2k001`, `b2k002`, ...)
- `contribution.json` — Per-board contributor credits

```json
{
  "koalas": [
    {
      "id": "k001",
      "name": "茉莉",
      "nicknames": ["茉莉妈妈"],
      "birthDate": "2015",
      "sex": "female",
      "photo": "/images/koalas/moli.jpg",
      "mother": null,
      "father": null,
      "deceased": true,
      "dateOfDeath": "2025"
    }
  ]
}
```

### Field Descriptions

- **id** (required): Unique identifier (e.g., `k001` for board1, `b2k001` for board2)
- **name** (required): Koala's name
- **nicknames** (optional): Array of nicknames
- **birthDate** (required): Flexible format — `"2015"`, `"2018-02"`, or `"2018-02-01"`
- **sex** (required): `"male"` or `"female"`
- **photo** (optional): Path to photo (e.g., `"/images/koalas/name.jpg"`) or `null`
- **mother** (optional): Mother's koala ID or `null`
- **father** (optional): Father's koala ID or `null`
- **deceased** (optional): Boolean, marks koala as deceased
- **dateOfDeath** (optional): Date of death (same format as birthDate)

## Adding New Koalas

1. Add a new entry to the appropriate board JSON file in `src/data/`
2. Ensure the `id` is unique (use `b2k` prefix for board2)
3. Set `mother` and `father` fields to parent IDs to establish relationships
4. Add photos to `public/images/koalas/` — optimized WebP variants are generated automatically
5. Save the file and the app will hot-reload

## Project Structure

```
koala-page/
├── scripts/
│   └── optimize-images.js          # WebP thumbnail/medium generation (sharp)
├── src/
│   ├── components/
│   │   ├── KoalaGraph.jsx          # Main graph visualization (Cytoscape.js)
│   │   ├── KoalaCard.jsx           # Compact detail card
│   │   ├── KoalaDetailModal.jsx    # Full koala profile modal
│   │   ├── DataBoard.jsx           # Analytics dashboard with Recharts
│   │   ├── FilterSidebar.jsx       # Advanced filter sidebar
│   │   ├── RelationshipSidebar.jsx # Relationship calculator
│   │   ├── SearchDropdown.jsx      # Search with autocomplete
│   │   ├── BoardSelector.jsx       # Board switcher dropdown
│   │   ├── LanguageToggle.jsx      # Language switcher button
│   │   └── ErrorBoundary.jsx       # Error handling wrapper
│   ├── i18n/
│   │   ├── translations.js         # English and Chinese translations (~380 keys)
│   │   └── LanguageContext.jsx     # Language state management
│   ├── data/
│   │   ├── koalas.json             # Hongshan board data
│   │   ├── koalas-board2.json      # Chimelong board data
│   │   └── contribution.json       # Per-board contributor credits
│   ├── utils/
│   │   ├── graphHelpers.js         # Graph traversal, search, element conversion
│   │   ├── relationshipCalculator.js # Relationship calculation logic
│   │   ├── statsHelpers.js         # DataBoard statistics computation
│   │   ├── imageUtils.js           # Photo URL mapping (original → WebP)
│   │   ├── dateUtils.js            # Date parsing (timezone-safe)
│   │   └── ageUtils.js             # Age calculation utilities
│   ├── App.jsx                     # Main app with state coordination
│   ├── index.css                   # Global styles with Tailwind
│   └── main.jsx                    # App entry point
├── public/
│   └── images/koalas/              # Source photos + generated thumb/ and medium/
├── package.json
├── vite.config.js
├── postcss.config.js
├── eslint.config.js
└── README.md
```

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Deployment

Deploy the `dist/` folder to Vercel, Netlify, GitHub Pages, or any static hosting provider.

## Feature Changelog

### Completed
- [x] Bilingual support (English/Chinese) with localStorage persistence
- [x] Deceased koala tracking with special visual styling
- [x] Photo support with optimized WebP serving (thumb/medium/original)
- [x] Compact detail cards and full profile modals
- [x] Parent navigation links (clickable mother/father)
- [x] Search with autocomplete dropdown
- [x] Color-coded sex indicators (pink/blue borders)
- [x] Lineage highlighting (ancestors + descendants, not siblings)
- [x] Flexible date formats (year, year-month, full date)
- [x] Advanced filtering (age range, sex, generation, deceased status)
- [x] Relationship calculator with path visualization
- [x] Generation calculation (automatic, maternal lineage)
- [x] Multiple family boards (Chimelong, Hongshan)
- [x] Data analytics dashboard with charts (Recharts)
- [x] Birthday forecast in header
- [x] Koala detail modal with family stats and timeline
- [x] Image optimization pipeline (sharp → WebP)
- [x] Credits & contributions footer per board
- [x] Precise age display (months for koalas under 1 year)

### Planned
- [ ] Add/edit koala form in the UI
- [ ] Photo upload functionality
- [ ] Export family tree as image/PDF
- [ ] Timeline view (births/deaths chronologically)
- [ ] Backend API for data persistence
- [ ] Import/export data (CSV, JSON)
- [ ] Print-friendly family tree layout
- [ ] Tag System for Koala fun facts

## License

MIT
