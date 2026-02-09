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

- **Relationship Highlighting**: Click on any koala to highlight their entire family network
  - Selected koala gets bold border highlighting
  - Connected family members highlighted with thicker borders
  - Related edges highlighted in orange

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
  - Highlight their entire family network
- **Scroll** or use pinch gesture to zoom in/out
- **Drag** to pan around the graph
- **Click "Reset view"** button to restore the default zoom and pan

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
- The graph will highlight their family network

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
│   │   ├── KoalaGraph.jsx      # Main graph visualization with Cytoscape
│   │   ├── KoalaCard.jsx       # Compact detail card with popover
│   │   ├── SearchDropdown.jsx  # Search with autocomplete dropdown
│   │   ├── SearchBar.jsx       # Basic search input (legacy)
│   │   ├── LanguageToggle.jsx  # Language switcher button
│   │   └── ErrorBoundary.jsx   # Error handling wrapper
│   ├── i18n/
│   │   ├── translations.js     # English and Chinese translations
│   │   └── LanguageContext.jsx # Language state management
│   ├── data/
│   │   └── koalas.json         # Koala data with deceased support
│   ├── utils/
│   │   └── graphHelpers.js     # Graph utility functions
│   ├── App.jsx                 # Main app component with layout
│   ├── App.css                 # Component styles
│   ├── index.css               # Global styles with Tailwind
│   └── main.jsx                # App entry point
├── public/
│   └── images/koalas/          # Koala photos
├── package.json
├── vite.config.js
├── tailwind.config.js
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
- [x] Bilingual support (English/Chinese)
- [x] Deceased koala tracking
- [x] Photo support in nodes and cards
- [x] Compact detail cards with popover
- [x] Parent navigation links
- [x] Search with autocomplete
- [x] Color-coded sex indicators
- [x] Family highlighting
- [x] Flexible date formats (year, year-month, full date)

### Planned Features
- [ ] Add/edit koala form in the UI
- [ ] Photo upload functionality
- [ ] Export family tree as image
- [ ] Advanced filtering (by age, sex, generation, deceased status)
- [ ] Timeline view
- [ ] Backend API for data persistence
- [ ] User authentication
- [ ] Multiple family tree support
- [ ] Statistics and analytics dashboard
- [ ] Siblings display in detail cards
- [ ] Children/offspring tracking

## License

MIT
