import { useState, useEffect, useCallback } from 'react';
import KoalaGraph from './components/KoalaGraph';
import KoalaCard from './components/KoalaCard';
import SearchDropdown from './components/SearchDropdown';
import LanguageToggle from './components/LanguageToggle';
import BoardSelector from './components/BoardSelector';
import FilterSidebar from './components/FilterSidebar';
import RelationshipSidebar from './components/RelationshipSidebar';
import DataBoard from './components/DataBoard';
import KoalaDetailModal from './components/KoalaDetailModal';
import koalasDataBoard1 from './data/koalas.json';
import koalasDataBoard2 from './data/koalas-board2.json';
import {
  koalasToGraphElements,
  getConnectedFamily,
  getAncestorPath,
  getLineageHighlight,
  getUpcomingBirthdays,
} from './utils/graphHelpers';
import { useLanguage } from './i18n/LanguageContext';
import { t } from './i18n/translations';

const boardData = {
  'board1': koalasDataBoard1,
  'board2': koalasDataBoard2
};

const availableBoards = ['board2', 'board1'];

function App() {
  const { language } = useLanguage();
  const [currentBoard, setCurrentBoard] = useState('board2');
  const [koalas, setKoalas] = useState(boardData['board2'].koalas);
  const [selectedKoala, setSelectedKoala] = useState(null);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [graphElements, setGraphElements] = useState([]);
  const [selectedKoalaId, setSelectedKoalaId] = useState(null);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [relationshipSidebarOpen, setRelationshipSidebarOpen] = useState(false);
  const [relationshipPath, setRelationshipPath] = useState([]);
  const [ancestorLineage, setAncestorLineage] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [dataBoardOpen, setDataBoardOpen] = useState(false);
  const [detailModalKoala, setDetailModalKoala] = useState(null);

  // Handle board change
  const handleBoardChange = (newBoard) => {
    setCurrentBoard(newBoard);
    setKoalas(boardData[newBoard].koalas);

    // Reset all UI state when switching boards
    setSelectedKoala(null);
    setHighlightedNodes([]);
    setSelectedKoalaId(null);
    setRelationshipPath([]);
    setAncestorLineage([]);
    setFilterSidebarOpen(false);
    setRelationshipSidebarOpen(false);
    setDetailModalKoala(null);

    // Reset graph view
    setTimeout(() => {
      const event = new CustomEvent('resetGraphView');
      window.dispatchEvent(event);
    }, 100);
  };

  // Initialize graph elements (always show full graph)
  useEffect(() => {
    const elements = koalasToGraphElements(koalas);
    setGraphElements(elements);

    // Update upcoming birthdays
    const birthdays = getUpcomingBirthdays(koalas);
    setUpcomingBirthdays(birthdays);
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

  const handleOpenDetail = (koala) => {
    setDetailModalKoala(koala);
  };

  const handleDetailKoalaClick = (koalaId) => {
    const koala = koalas.find(k => k.id === koalaId);
    if (koala) {
      setDetailModalKoala(koala);
      setSelectedKoalaId(koala.id);
      setSelectedKoala(koala);
      setRelationshipPath([]);
      const lineage = getLineageHighlight(koala.id, koalas);
      setHighlightedNodes(lineage.nodes);
      setAncestorLineage(lineage.ancestorPath);
    }
  };

  const handleCloseDetail = () => {
    setDetailModalKoala(null);
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
        <div className="container mx-auto flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold mb-2">{t('title', language)}</h1>
            {upcomingBirthdays.length > 0 && (() => {
              const nearest = upcomingBirthdays[0];
              return (
                <p className="text-blue-100 text-sm">
                  {t('birthdayForecast', language)}: {nearest.koala.name} {language === 'zh' ? `${nearest.upcomingAge}岁` : `(${nearest.upcomingAge})`} - {nearest.monthDay}
                </p>
              );
            })()}
          </div>
          <div className="flex items-center gap-4">
            <BoardSelector
              currentBoard={currentBoard}
              onBoardChange={handleBoardChange}
              boards={availableBoards}
            />
            <LanguageToggle />
          </div>
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
              onClick={() => setDataBoardOpen(true)}
              className="px-3 py-2 text-sm rounded-md bg-white border border-gray-300 shadow-sm hover:bg-gray-50 whitespace-nowrap"
            >
              <span className="hidden sm:inline">{t('dataBoard', language)}</span>
              <span className="sm:hidden">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
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
                  onOpenDetail={handleOpenDetail}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Board Modal */}
      <DataBoard
        koalas={koalas}
        isOpen={dataBoardOpen}
        onClose={() => setDataBoardOpen(false)}
        onKoalaClick={handleFilterKoalaClick}
      />

      {/* Koala Detail Modal */}
      {detailModalKoala && (
        <KoalaDetailModal
          koala={detailModalKoala}
          allKoalas={koalas}
          onClose={handleCloseDetail}
          onKoalaClick={handleDetailKoalaClick}
        />
      )}
    </div>
  );
}

export default App;
