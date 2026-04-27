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
import LoginModal from './components/LoginModal';
import AdminPanel from './components/AdminPanel';
import KoalaEditForm from './components/KoalaEditForm';
import koalasDataBoard1 from './data/koalas.json';
import koalasDataBoard2 from './data/koalas-board2.json';
import contributionData from './data/contribution.json';
import {
  koalasToGraphElements,
  getLineageHighlight,
  getUpcomingBirthdays,
} from './utils/graphHelpers';
import { useLanguage } from './i18n/LanguageContext';
import { t } from './i18n/translations';
import { useAuth } from './contexts/AuthContext';
import * as api from './api/koalaApi';

const fallbackData = {
  'board1': koalasDataBoard1,
  'board2': koalasDataBoard2
};

const availableBoards = ['board2', 'board1'];

const boardToContributionName = {
  'board1': 'Hongshan',
  'board2': 'Chimelong'
};

const contributionTypeKeys = {
  'Koala Photo': 'contributionKoalaPhoto',
  'Family Tree': 'contributionFamilyTree',
  'Web Design & Development': 'contributionWebDesign',
};

function App() {
  const { language } = useLanguage();
  const { isAuthenticated, role, logout } = useAuth();
  const [currentBoard, setCurrentBoard] = useState('board2');
  const [koalas, setKoalas] = useState(fallbackData['board2'].koalas);
  const [selectedKoala, setSelectedKoala] = useState(null);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [primaryElements, setPrimaryElements] = useState([]);
  const [proxyElements, setProxyElements] = useState([]);
  const [selectedKoalaId, setSelectedKoalaId] = useState(null);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [relationshipSidebarOpen, setRelationshipSidebarOpen] = useState(false);
  const [relationshipPath, setRelationshipPath] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [dataBoardOpen, setDataBoardOpen] = useState(false);
  const [detailModalKoala, setDetailModalKoala] = useState(null);
  const [contributionsOpen, setContributionsOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadKoalas = useCallback(async (board) => {
    try {
      const data = await api.fetchKoalas(board);
      setKoalas(data.koalas);
    } catch {
      setKoalas(fallbackData[board]?.koalas || []);
    }
  }, []);

  useEffect(() => {
    loadKoalas(currentBoard);
  }, [currentBoard, loadKoalas]);

  const handleBoardChange = (newBoard) => {
    setCurrentBoard(newBoard);

    setSelectedKoala(null);
    setHighlightedNodes([]);
    setSelectedKoalaId(null);
    setRelationshipPath([]);
    setFilterSidebarOpen(false);
    setRelationshipSidebarOpen(false);
    setDetailModalKoala(null);

    setTimeout(() => {
      const event = new CustomEvent('resetGraphView');
      window.dispatchEvent(event);
    }, 100);
  };

  const handleDataChange = useCallback(() => {
    loadKoalas(currentBoard);
  }, [currentBoard, loadKoalas]);

  const handleKoalaCreated = useCallback((newKoala) => {
    setCreateModalOpen(false);
    handleDataChange();
    setTimeout(() => {
      setSelectedKoalaId(newKoala.id);
      const koala = { ...newKoala };
      setSelectedKoala(koala);
      const lineage = getLineageHighlight(koala.id, [...koalas, koala]);
      setHighlightedNodes(lineage.nodes);
    }, 200);
  }, [handleDataChange, koalas]);

  const handleKoalaUpdated = useCallback((updated) => {
    handleDataChange();
    setDetailModalKoala(prev => prev?.id === updated.id ? updated : prev);
    setSelectedKoala(prev => prev?.id === updated.id ? updated : prev);
  }, [handleDataChange]);

  const handleKoalaDeleted = useCallback(() => {
    setDetailModalKoala(null);
    setSelectedKoala(null);
    setSelectedKoalaId(null);
    setHighlightedNodes([]);
    handleDataChange();
  }, [handleDataChange]);

  useEffect(() => {
    const { primaryElements: primary, proxyElements: proxy } = koalasToGraphElements(koalas);
    setPrimaryElements(primary);
    setProxyElements(proxy);

    const birthdays = getUpcomingBirthdays(koalas);
    setUpcomingBirthdays(birthdays);

    if (selectedKoala) {
      const fresh = koalas.find(k => k.id === selectedKoala.id);
      if (fresh) {
        setSelectedKoala(fresh);
      } else {
        setSelectedKoala(null);
        setSelectedKoalaId(null);
        setHighlightedNodes([]);
      }
    }
    if (detailModalKoala) {
      const fresh = koalas.find(k => k.id === detailModalKoala.id);
      if (fresh) {
        setDetailModalKoala(fresh);
      }
    }
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

    const lineage = getLineageHighlight(koala.id, koalas);
    setHighlightedNodes(lineage.nodes);
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
    }
  };

  const handleCloseDetail = () => {
    setDetailModalKoala(null);
  };

  const handleRelationshipPath = useCallback((path) => {
    // Highlight the relationship path
    setHighlightedNodes(path);
    setRelationshipPath(path);

    // Clear card and selection when showing relationship path
    // Both endpoints will be highlighted in orange, but no card shown
    setSelectedKoalaId(null);
    setSelectedKoala(null);
  }, []);

  return (
    <div className="h-dvh flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white px-4 py-1.5 shadow-lg">
        <div className="container mx-auto flex justify-between items-center gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold leading-tight">{t('title', language)}</h1>
            {upcomingBirthdays.length > 0 && (() => {
              const nearest = upcomingBirthdays[0];
              return (
                <p className="text-blue-100 text-xs leading-tight">
                  {t('birthdayForecast', language)}: {nearest.koala.name} {t('ageYearsFormat', language, { age: nearest.upcomingAge })} - {nearest.monthDay}
                </p>
              );
            })()}
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded hidden sm:inline">
                  {t('editMode', language)}
                </span>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="px-2 py-1 text-xs rounded-md bg-white/20 hover:bg-white/30 text-white"
                  title={t('editAdd', language)}
                >
                  + {t('editAdd', language)}
                </button>
                {role === 'admin' && (
                  <button
                    onClick={() => setAdminPanelOpen(true)}
                    className="p-1 rounded-md hover:bg-white/20 text-white"
                    title={t('adminTitle', language)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={logout}
                  className="px-2 py-1 text-xs rounded-md bg-white/20 hover:bg-white/30 text-white"
                >
                  {t('editModeLogout', language)}
                </button>
              </>
            )}
            {!isAuthenticated && (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="p-1 rounded-md hover:bg-white/20 text-white"
                title={t('loginTitle', language)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </button>
            )}
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
      <div className="flex-1 min-h-0 container mx-auto p-2 sm:p-4 flex gap-2 sm:gap-4 overflow-hidden">
        {/* Left Panel - Graph */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-2 sm:gap-4">
          <div className="bg-white p-2 sm:p-4 rounded-lg shadow flex items-center gap-2 sm:gap-3">
            <div className="flex-1">
              <SearchDropdown
                koalas={koalas}
                onSelectKoala={handleSearchSelect}
              />
            </div>
            <button
              type="button"
              onClick={() => setDataBoardOpen(true)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 text-sm rounded-md bg-white border border-gray-300 shadow-sm hover:bg-gray-50 whitespace-nowrap"
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
              className="px-2 py-1.5 sm:px-3 sm:py-2 text-sm rounded-md bg-white border border-gray-300 shadow-sm hover:bg-gray-50 whitespace-nowrap"
            >
              <span className="hidden sm:inline">{t('resetView', language)}</span>
              <span className="sm:hidden">↺</span>
            </button>
          </div>

          <div className="flex-1 min-h-0 relative">
            <KoalaGraph
              primaryElements={primaryElements}
              proxyElements={proxyElements}
              onNodeClick={handleNodeClick}
              highlightedNodes={highlightedNodes}
              selectedKoalaId={selectedKoalaId}
              relationshipPath={relationshipPath}
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
          isAuthenticated={isAuthenticated}
          onKoalaUpdated={handleKoalaUpdated}
          onKoalaDeleted={handleKoalaDeleted}
          currentBoard={currentBoard}
        />
      )}

      {/* Login Modal */}
      {loginModalOpen && (
        <LoginModal onClose={() => setLoginModalOpen(false)} />
      )}

      {/* Admin Panel */}
      <AdminPanel isOpen={adminPanelOpen} onClose={() => setAdminPanelOpen(false)} />

      {/* Create Koala Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setCreateModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-2xl max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-800 mb-4">{t('editAdd', language)}</h2>
            <KoalaEditForm
              board={currentBoard}
              allKoalas={koalas}
              onSave={handleKoalaCreated}
              onCancel={() => setCreateModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Contributions Footer */}
      {(() => {
        const boardName = boardToContributionName[currentBoard];
        const boardContributions = contributionData.contributions.find(
          c => c.board === boardName
        );
        if (!boardContributions) return null;
        return (
          <footer className="relative bg-white border-t border-gray-200 shrink-0">
            {contributionsOpen && (
              <div className="absolute bottom-full left-0 right-0 bg-gray-50 border border-gray-200 rounded-t-xl shadow-2xl z-10 max-h-[60vh] overflow-y-auto">
                <div className="px-3 sm:px-4 py-2 sm:py-3 space-y-2">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('contributionsTitle', language)}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {boardContributions.contributions.map((item, idx) => {
                      const typeKey = contributionTypeKeys[item.contribution];
                      const translatedType = typeKey ? t(typeKey, language) : item.contribution;
                      return (
                        <div key={idx} className="bg-white rounded border border-gray-200 px-2 py-1.5">
                          <p className="text-xs text-gray-500 font-semibold mb-1">{translatedType}</p>
                          <div className="space-y-0.5">
                            {item.names.map((entry, ni) => (
                              <p key={ni} className="text-xs text-gray-700 leading-tight">
                                {entry.name}@{entry.platforms.map((p, pi) => (
                                  <span key={pi}>
                                    {pi > 0 && ', '}
                                    <a
                                      href={p.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 underline"
                                    >{p.name}</a>
                                  </span>
                                ))}
                              </p>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            <div className="container mx-auto">
              <button
                type="button"
                onClick={() => setContributionsOpen(!contributionsOpen)}
                className="w-full flex items-center justify-between py-1 px-3 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
              >
                {t('contributionsTitle', language)}
                <span className={`text-[10px] transition-transform duration-200 ${contributionsOpen ? 'rotate-180' : ''}`}>
                  ▲
                </span>
              </button>
            </div>
          </footer>
        );
      })()}
    </div>
  );
}

export default App;
