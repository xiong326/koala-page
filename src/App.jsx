import { useState, useEffect } from 'react';
import KoalaGraph from './components/KoalaGraph';
import KoalaCard from './components/KoalaCard';
import SearchDropdown from './components/SearchDropdown';
import LanguageToggle from './components/LanguageToggle';
import koalasData from './data/koalas.json';
import {
  koalasToGraphElements,
  getConnectedFamily,
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
  const [cardPosition, setCardPosition] = useState(null);

  // Initialize graph elements (always show full graph)
  useEffect(() => {
    const elements = koalasToGraphElements(koalas);
    setGraphElements(elements);
  }, [koalas]);


  const handleNodeClick = (koalaData, position) => {
    // Find the full koala object
    const koala = koalas.find(k => k.id === koalaData.id);

    if (!koala) {
      console.error('Koala not found for id:', koalaData.id);
      return;
    }

    setSelectedKoala(koala);
    setCardPosition(position);

    // Highlight the connected family
    const family = getConnectedFamily(koala.id, koalas);
    setHighlightedNodes(family);
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
    setCardPosition(null);
  };

  const handleParentClick = (koalaId) => {
    const koala = koalas.find(k => k.id === koalaId);
    if (koala) {
      setSelectedKoalaId(koala.id);
      handleNodeClick(koala);
    }
  };

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
          <div className="bg-white p-4 rounded-lg shadow">
            <SearchDropdown
              koalas={koalas}
              onSelectKoala={handleSearchSelect}
            />
          </div>

          <div className="flex-1 min-h-0 relative">
            <KoalaGraph
              elements={graphElements}
              onNodeClick={handleNodeClick}
              highlightedNodes={highlightedNodes}
              selectedKoalaId={selectedKoalaId}
            />

            {/* Koala Detail Card Popover - appears next to clicked node */}
            {selectedKoala && cardPosition && (
              <div
                className="absolute z-30 w-52"
                style={{
                  left: `${cardPosition.x + 50}px`, // Offset to the right of node
                  top: `${cardPosition.y}px`,
                  transform: 'translateY(-50%)',
                }}
              >
                {/* Arrow pointing to the node */}
                <div
                  className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white"
                  style={{ filter: 'drop-shadow(-2px 0 2px rgba(0,0,0,0.1))' }}
                />

                <div className="shadow-2xl">
                  <KoalaCard
                    koala={selectedKoala}
                    onClose={handleCloseCard}
                    allKoalas={koalas}
                    onKoalaClick={handleParentClick}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-700 mb-2">{t('instructionsTitle', language)}</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {t('instructionClick', language)}</li>
              <li>• {t('instructionZoom', language)}</li>
              <li>• {t('instructionPan', language)}</li>
              <li>• {t('instructionSearch', language)}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
