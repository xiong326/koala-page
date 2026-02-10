import { useState, useEffect, useCallback } from 'react';
import KoalaGraph from './components/KoalaGraph';
import KoalaCard from './components/KoalaCard';
import SearchDropdown from './components/SearchDropdown';
import LanguageToggle from './components/LanguageToggle';
import FilterSidebar from './components/FilterSidebar';
import RelationshipSidebar from './components/RelationshipSidebar';
import koalasData from './data/koalas.json';
import {
  koalasToGraphElements,
  getConnectedFamily,
  getAncestorPath,
  getLineageHighlight,
} from './utils/graphHelpers';
import { useLanguage } from './i18n/LanguageContext';
import { t } from './i18n/translations';

function App() {
  const { language } = useLanguage();
  const [koalas, setKoalas] = useState(koalasData.koalas);
  const [selectedKoala, setSelectedKoala] = useState(null);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [graphElements, setGraphElements] = useState([]);
  const [selectedKoalaId, setSelectedKoalaId] = useState(null);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [relationshipSidebarOpen, setRelationshipSidebarOpen] = useState(false);
  const [relationshipPath, setRelationshipPath] = useState([]);
  const [ancestorLineage, setAncestorLineage] = useState([]);

  // Initialize graph elements (always show full graph)
  useEffect(() => {
    const elements = koalasToGraphElements(koalas);
    setGraphElements(elements);
  }, [koalas]);


  const handleNodeClick = (koalaData) => {
    // Clear relationship path first when clicking a node
    setRelationshipPath([]);

    // Find the full koala object
    const koala = koalas.find(k => k.id === koalaData.id);

    if (!koala) {
      console.error('Koala not found for id:', koalaData.id);
      return;
    }

    setSelectedKoala(koala);
    setSelectedKoalaId(koala.id);

    // Highlight ancestors and descendants
    const lineage = getLineageHighlight(koala.id, koalas);
    setHighlightedNodes(lineage.nodes);
    setAncestorLineage(lineage.ancestorPath);
  };

  const handleSearchSelect = (koala) => {
    // Trigger the same action as clicking on the node
    setSelectedKoalaId(koala.id);
    handleNodeClick(koala);
  };

  const handleCloseCard = () => {
    setSelectedKoala(null);
    setHighlightedNodes([]);
    setSelectedKoalaId(null);
    setRelationshipPath([]);
    setAncestorLineage([]);
  };

  const handleParentClick = (koalaId) => {
    const koala = koalas.find(k => k.id === koalaId);
    if (koala) {
      setSelectedKoalaId(koala.id);
      handleNodeClick(koala);
    }
  };

  const handleFilterKoalaClick = (koala) => {
    // Similar to search select, but don't need position for card
    setSelectedKoalaId(koala.id);
    // The graph will center on the node, and we'll show card after centering
    // For simplicity, we can trigger handleNodeClick without position first
    // The card will appear after the graph centers
    handleNodeClick(koala);
  };

  const handleRelationshipPath = useCallback((path) => {
    // Highlight the relationship path
    setHighlightedNodes(path);
    setRelationshipPath(path);
    setAncestorLineage([]); // Clear ancestor lineage when showing relationship

    // Clear card and selection when showing relationship path
    // Both endpoints will be highlighted in orange, but no card shown
    setSelectedKoalaId(null);
    setSelectedKoala(null);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('title', language)}</h1>
            <p className="text-blue-100">
              {t('subtitle', language)}
            </p>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto p-4 flex gap-4" style={{ overflow: 'visible' }}>
        {/* Left Panel - Graph */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
            <div className="flex-1">
              <SearchDropdown
                koalas={koalas}
                onSelectKoala={handleSearchSelect}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                // Reset graph view
                const event = new CustomEvent('resetGraphView');
                window.dispatchEvent(event);
              }}
              className="px-3 py-2 text-sm rounded-md bg-white border border-gray-300 shadow-sm hover:bg-gray-50 whitespace-nowrap"
            >
              <span className="hidden sm:inline">{t('resetView', language)}</span>
              <span className="sm:hidden">↺</span>
            </button>
          </div>

          <div className="flex-1 min-h-0 relative">
            <KoalaGraph
              elements={graphElements}
              onNodeClick={handleNodeClick}
              highlightedNodes={highlightedNodes}
              selectedKoalaId={selectedKoalaId}
              relationshipPath={relationshipPath}
              ancestorLineage={ancestorLineage}
            />

            {/* Filter Sidebar */}
            <FilterSidebar
              koalas={koalas}
              onKoalaClick={handleFilterKoalaClick}
              isOpen={filterSidebarOpen}
              onToggle={() => setFilterSidebarOpen(!filterSidebarOpen)}
            />

            {/* Relationship Sidebar */}
            <RelationshipSidebar
              koalas={koalas}
              onKoalaClick={handleFilterKoalaClick}
              isOpen={relationshipSidebarOpen}
              onToggle={() => setRelationshipSidebarOpen(!relationshipSidebarOpen)}
              onRelationshipCalculated={handleRelationshipPath}
            />

            {/* Koala Detail Card - fixed at top center */}
            {selectedKoala && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 sm:top-3 z-30 shadow-2xl">
                <KoalaCard
                  koala={selectedKoala}
                  onClose={handleCloseCard}
                  allKoalas={koalas}
                  onKoalaClick={handleParentClick}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
