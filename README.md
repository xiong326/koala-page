# Koala Family Tree

An interactive web application for visualizing and managing koala family relationships and information.

## Features

- **Interactive Family Graph**: Visualize koala family trees with zoom, pan, and click interactions
  - Dagre hierarchical layout with parents at the top
  - Color-coded borders (pink for females, blue for males)
  - Photo display in nodes (if available)
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
  - Filter by age range (infant, young, adult, senior)
  - Filter by generation (1, 2, 3, 4, etc.)
  - Live-updating results list with photos
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

- **Search with Autocomplete**: Find koalas by name, nickname, or ID
  - Live filtering as you type
  - Dropdown shows matching results with names, nicknames, and IDs
  - Click to select and center on the koala

- **Individual Profile Cards**: Compact detail cards with popover positioning
  - Appears next to clicked node with arrow indicator
  - Displays koala photo (128px height)
  - Name and nicknames
  - Sex (color-coded)
  - Birth date and age (with smart formatting)
  - Deceased status with date of death (if applicable)
  - Clickable parent links to navigate the family tree

- **Bilingual Support**: Full English and Chinese translations
  - Language toggle in header
  - Preference saved in localStorage
  - Localized date formatting
  - All UI elements translated

## Tech Stack

- **Frontend**: React 19 with Vite 7
- **Graph Visualization**:
  - Cytoscape.js 3.33+ for graph rendering
  - cytoscape-dagre for hierarchical layout
  - cytoscape-popper for tooltip positioning
- **Styling**: Tailwind CSS 4 with PostCSS
- **Internationalization**: Custom i18n with React Context
- **Data Storage**: JSON file (expandable to backend)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

## Usage

### Viewing Koalas

- The family tree graph displays all koalas and their relationships
- Arrows point from parents to children
- Nodes show photos (if available) and names
- Color-coded borders: pink for females, blue for males
- Deceased koalas shown with dashed borders and gray appearance

### Interacting with the Graph

- **Click** on a koala node to:
  - View their detail card with full information
  - Automatically center and smooth scroll to the node
  - Highlight their direct lineage (ancestors + descendants only)
  - Show orange path edges tracing their maternal lineage
- **Scroll** or use pinch gesture to zoom in/out
- **Drag** to pan around the graph
- **Click "Reset view"** (重置视图) button to restore the default zoom and pan

### Detail Card Navigation

- Click on parent names (mother/father) to navigate to their profiles
- The graph will re-center on the selected parent
- Close button (×) to dismiss the card

### Searching

Use the search dropdown to find koalas by:
- Name (e.g., "茉莉" or "柠檬")
- Nickname (e.g., "柠檬公主")
- ID (e.g., "k001")

As you type:
- Matching results appear in a dropdown
- Click any result to select and center on that koala
- The graph will highlight their lineage

### Using the Filter Sidebar

Click the "Filters" (筛选) button in the top-left to open the filter panel:

1. **Filter by Sex**: Select male, female, or all
2. **Filter by Age**: Choose infant (<1yr), young (1-3yr), adult (3-10yr), senior (10+yr), or all
3. **Filter by Generation**: Select generation 1, 2, 3, 4, etc.
4. **View Results**: Filtered koalas appear in a scrollable list with photos
5. **Jump to Koala**: Click any koala in the list to center on them in the graph
6. **Clear Filters**: Click "Clear All" to reset all filters
7. **Active Filter Badge**: The filter button shows a count of active filters

### Using the Relationship Calculator

Click the "Relationship" (关系计算) button in the top-right to open the calculator:

1. **Select First Koala**: Type name/ID in the first search box
2. **Select Second Koala**: Type name/ID in the second search box
3. **View Relationship**: The relationship is automatically calculated and displayed
4. **See Visual Path**: The graph highlights the exact path connecting the two koalas
5. **Jump to Koala**: Click either koala name in the "Jump to" section to center on them
6. **Swap Koalas**: Click the swap button to switch the two selections

**Supported Relationships:**
- Parent-Child (母子/母女)
- Siblings (姐妹/兄弟)
- Grandparent-Grandchild (祖孙关系)
- Great-grandparent / Ancestor (祖先和后代)
- Aunt-Niece/Nephew (姨妈和侄女/侄子)
- Cousins (表姐妹/表兄弟)
- Extended family (through common ancestor)
- Unrelated (no common maternal ancestor)

### Language Toggle

- Click the language toggle button in the top-right corner
- Switch between English and Chinese
- Your preference is automatically saved

## Data Structure

Koala data is stored in `src/data/koalas.json` with the following format:

```json
{
  "koalas": [
    {
      "id": "k001",
      "name": "茉莉",
      "nicknames": ["茉莉妈妈"],
      "birthDate": "2015",
      "sex": "female",
      "photo": null,
      "mother": null,
      "father": null,
      "deceased": true,
      "dateOfDeath": "2025"
    }
  ]
}
```

### Field Descriptions

- **id** (required): Unique identifier (e.g., "k001")
- **name** (required): Koala's name
- **nicknames** (optional): Array of nicknames
- **birthDate** (required): Birth date in flexible formats:
  - Year only: "2015"
  - Year-Month: "2018-02"
  - Full date: "2018-02-01"
- **sex** (required): "male" or "female"
- **photo** (optional): Path to photo (e.g., "/images/koalas/name.jpg") or null
- **mother** (optional): Mother's koala ID or null
- **father** (optional): Father's koala ID or null
- **deceased** (optional): Boolean, marks koala as deceased
- **dateOfDeath** (optional): Date of death (same format as birthDate)

## Adding New Koalas

Currently, you can add koalas by editing the `src/data/koalas.json` file directly:

1. Add a new entry to the `koalas` array
2. Ensure the `id` is unique
3. Set `mother` and `father` fields to parent IDs to establish relationships
4. Add photos to `public/images/koalas/` and reference the path
5. Save the file and the app will hot-reload automatically

### Future: Backend Integration

For persistent data storage and multi-user editing, you can add a backend:
- Node.js/Express API
- Database (MongoDB, PostgreSQL, etc.)
- Authentication for secure editing
- API endpoints for CRUD operations

## Project Structure

```
koala-page/
├── src/
│   ├── components/
│   │   ├── KoalaGraph.jsx         # Main graph visualization with Cytoscape
│   │   ├── KoalaCard.jsx          # Compact detail card with popover (128px photos)
│   │   ├── FilterSidebar.jsx      # Advanced filter by age/sex/generation
│   │   ├── RelationshipSidebar.jsx # Relationship calculator between two koalas
│   │   ├── SearchDropdown.jsx     # Search with autocomplete dropdown
│   │   ├── SearchBar.jsx          # Basic search input (legacy)
│   │   ├── LanguageToggle.jsx     # Language switcher button
│   │   └── ErrorBoundary.jsx      # Error handling wrapper
│   ├── i18n/
│   │   ├── translations.js        # English and Chinese translations
│   │   └── LanguageContext.jsx    # Language state management
│   ├── data/
│   │   └── koalas.json            # Koala data (4 generations, deceased support)
│   ├── utils/
│   │   ├── graphHelpers.js        # Graph utility functions (lineage, descendants, etc.)
│   │   └── relationshipCalculator.js # Relationship calculation logic
│   ├── App.jsx                    # Main app component with layout
│   ├── App.css                    # Component styles
│   ├── index.css                  # Global styles with Tailwind
│   └── main.jsx                   # App entry point
├── public/
│   └── images/koalas/             # Koala photos
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── README.md
└── TRANSLATION_GUIDE.md
```

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Deployment

The app can be deployed to:
- **Vercel**: `npm i -g vercel && vercel`
- **Netlify**: Drag and drop the `dist/` folder
- **GitHub Pages**: Use `gh-pages` package

## Future Enhancements

### Completed Features
- [x] Bilingual support (English/Chinese) with localStorage persistence
- [x] Deceased koala tracking with special visual styling
- [x] Photo support in nodes and cards (128px in cards)
- [x] Compact detail cards with popover positioning
- [x] Parent navigation links (clickable mother/father)
- [x] Search with autocomplete dropdown
- [x] Color-coded sex indicators (pink/blue borders)
- [x] Lineage highlighting (ancestors + descendants)
- [x] Smart edge highlighting (only lineage paths, not siblings)
- [x] Flexible date formats (year, year-month, full date)
- [x] **Advanced filtering** (by age range, sex, generation)
- [x] **Relationship calculator** (calculate relationship between any two koalas)
- [x] **Path visualization** (highlight exact path between related koalas)
- [x] Generation calculation (automatic generation numbers starting from 1)
- [x] Age calculation with partial date support
- [x] Multiple generations (4 generations in sample data)

### Planned Features
- [ ] Add/edit koala form in the UI
- [ ] Photo upload functionality
- [ ] Export family tree as image/PDF
- [ ] Filter by deceased status
- [ ] Timeline view (show births/deaths chronologically)
- [ ] Backend API for data persistence
- [ ] User authentication and permissions
- [ ] Multiple family tree support (different koala populations)
- [ ] Statistics and analytics dashboard
- [ ] Siblings display in detail cards
- [ ] Children/offspring count and display
- [ ] Birthday/anniversary notifications
- [ ] Import/export data (CSV, JSON)
- [ ] Print-friendly family tree layout

## License

MIT
