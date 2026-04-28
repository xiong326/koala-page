import { useState, useEffect, useCallback } from 'react';
import KoalaGraph from './components/KoalaGraph';
import KoalaCard from './components/KoalaCard';
import SearchDropdown from './components/SearchDropdown';
import LanguageToggle from './components/LanguageToggle';
import BoardSelector from './components/BoardSelector';
import FilterSidebar from './components/FilterSidebar';
import RelationshipSidebar from './components/RelationshipSidebar';
import DataBoard from './components/DataBoard';
import SubFamilyGraph from './components/SubFamilyGraph';
import RelationshipPathGraph from './components/RelationshipPathGraph';
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

const contributionStyles = {
  'Koala Photo': {
    icon: 'P',
    accent: 'from-pink-500 to-rose-400',
    badge: 'bg-pink-50 text-pink-700 ring-pink-100',
    link: 'text-pink-700 hover:text-pink-900',
  },
  'Family Tree': {
    icon: 'F',
    accent: 'from-emerald-500 to-teal-400',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    link: 'text-emerald-700 hover:text-emerald-900',
  },
  'Web Design & Development': {
    icon: 'W',
    accent: 'from-indigo-500 to-sky-400',
    badge: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
    link: 'text-indigo-700 hover:text-indigo-900',
  },
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
  const [relationshipResult, setRelationshipResult] = useState(null);
  const [relationshipGraphOpen, setRelationshipGraphOpen] = useState(false);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [dataBoardOpen, setDataBoardOpen] = useState(false);
  const [subFamilyOpen, setSubFamilyOpen] = useState(false);
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
    setRelationshipResult(null);
    setRelationshipGraphOpen(false);
    setFilterSidebarOpen(false);
    setRelationshipSidebarOpen(false);
    setDetailModalKoala(null);
    setSubFamilyOpen(false);

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
        setSubFamilyOpen(false);
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
    setRelationshipResult(null);
    setRelationshipGraphOpen(false);

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
    setRelationshipResult(null);
    setRelationshipGraphOpen(false);
    setSubFamilyOpen(false);
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
      setRelationshipResult(null);
      setRelationshipGraphOpen(false);
      const lineage = getLineageHighlight(koala.id, koalas);
      setHighlightedNodes(lineage.nodes);
    }
  };

  const handleCloseDetail = () => {
    setDetailModalKoala(null);
  };

  const handleRelationshipPath = useCallback((path, result = null) => {
    // Highlight the relationship path
    setHighlightedNodes(path);
    setRelationshipPath(path);
    setRelationshipResult(result);
    if (!path?.length) {
      setRelationshipGraphOpen(false);
    }

    // Clear card and selection when showing relationship path
    // Both endpoints will be highlighted in orange, but no card shown
    setSelectedKoalaId(null);
    setSelectedKoala(null);
    setSubFamilyOpen(false);
  }, []);

  return (
    <div className="h-dvh flex flex-col bg-gray-50">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-zinc-700 to-stone-600 text-white px-3 sm:px-4 py-1.5 shadow-lg ring-1 ring-black/10">
        <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_14%_20%,rgba(255,255,255,0.24),transparent_24%),radial-gradient(circle_at_86%_0%,rgba(134,239,172,0.2),transparent_28%)]" />
        <div className="container relative mx-auto flex flex-wrap justify-between items-center gap-x-3 gap-y-1.5">
          <div className="flex flex-1 min-w-0 basis-0 items-center gap-2">
            <img
              src="/images/koala-badge.png"
              alt=""
              aria-hidden="true"
              className="h-9 w-9 sm:h-11 sm:w-11 shrink-0 drop-shadow-md"
            />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold leading-tight text-slate-50">{t('title', language)}</h1>
              {upcomingBirthdays.length > 0 && (() => {
                const nearest = upcomingBirthdays[0];
                const forecastText = `${t('birthdayForecast', language)}: ${nearest.koala.name} ${t('ageYearsFormat', language, { age: nearest.upcomingAge })} - ${nearest.monthDay}`;
                return (
                  <p
                    className="forecast-ticker mt-0.5 inline-flex max-w-full items-center rounded-full border border-emerald-200/25 bg-white/12 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs leading-tight text-slate-100 shadow-sm backdrop-blur-sm"
                    aria-label={forecastText}
                  >
                    <span className="forecast-ticker-track">
                      <span>{forecastText}</span>
                      <span aria-hidden="true">{forecastText}</span>
                    </span>
                  </p>
                );
              })()}
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs bg-emerald-400/90 text-slate-900 px-1.5 py-0.5 rounded hidden sm:inline font-semibold">
                  {t('editMode', language)}
                </span>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="px-2 py-1 text-xs rounded-md bg-white/15 hover:bg-white/25 text-white border border-white/10"
                  title={t('editAdd', language)}
                >
                  + {t('editAdd', language)}
                </button>
                {role === 'admin' && (
                  <button
                    onClick={() => setAdminPanelOpen(true)}
                    className="p-1 rounded-md hover:bg-white/20 text-white border border-transparent hover:border-white/10"
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
                  className="px-2 py-1 text-xs rounded-md bg-white/15 hover:bg-white/25 text-white border border-white/10"
                >
                  {t('editModeLogout', language)}
                </button>
              </div>
            )}
            {!isAuthenticated && (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="p-1 rounded-md hover:bg-white/20 text-white border border-transparent hover:border-white/10"
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
          {isAuthenticated && (
            <div className="w-full flex sm:hidden items-center justify-end gap-1.5">
              <span className="text-[11px] bg-emerald-400/90 text-slate-900 px-1.5 py-0.5 rounded mr-auto font-semibold">
                {t('editMode', language)}
              </span>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-2 py-1 text-xs rounded-md bg-white/15 hover:bg-white/25 text-white border border-white/10"
                title={t('editAdd', language)}
              >
                + {t('editAdd', language)}
              </button>
              {role === 'admin' && (
                <button
                  onClick={() => setAdminPanelOpen(true)}
                  className="p-1 rounded-md hover:bg-white/20 text-white border border-transparent hover:border-white/10"
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
                className="px-2 py-1 text-xs rounded-md bg-white/15 hover:bg-white/25 text-white border border-white/10"
              >
                {t('editModeLogout', language)}
              </button>
            </div>
          )}
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
              onClick={() => setSubFamilyOpen(true)}
              disabled={!selectedKoala}
              className="px-2 py-1.5 sm:px-3 sm:py-2 text-sm rounded-md bg-white border border-gray-300 shadow-sm hover:bg-gray-50 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              title={selectedKoala ? t('subFamilyGraph', language) : t('subFamilySelectFirst', language)}
            >
              <span className="hidden sm:inline">{t('subFamilyGraph', language)}</span>
              <span className="sm:hidden">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m8-3.13a4 4 0 10-8 0m8 0a4 4 0 11-8 0m8 0c0 1.66-1.34 3-3 3s-3-1.34-3-3" />
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
              onOpenRelationshipGraph={() => setRelationshipGraphOpen(true)}
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

            <SubFamilyGraph
              selectedKoala={selectedKoala}
              koalas={koalas}
              isOpen={subFamilyOpen}
              onClose={() => setSubFamilyOpen(false)}
            />

            <RelationshipPathGraph
              relationship={relationshipResult}
              relationshipPath={relationshipPath}
              koalas={koalas}
              isOpen={relationshipGraphOpen}
              onClose={() => setRelationshipGraphOpen(false)}
            />
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
          <footer className="relative bg-white/95 border-t border-gray-200 shrink-0 backdrop-blur">
            {contributionsOpen && (
              <div className="absolute bottom-full left-0 right-0 z-10 max-h-[54vh] overflow-y-auto border border-gray-200 bg-white/95 shadow-2xl backdrop-blur rounded-t-2xl">
                <div className="container mx-auto px-3 py-3 sm:px-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">{t('contributionsTitle', language)}</h3>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                      {boardName}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {boardContributions.contributions.map((item, idx) => {
                      const typeKey = contributionTypeKeys[item.contribution];
                      const translatedType = typeKey ? t(typeKey, language) : item.contribution;
                      const style = contributionStyles[item.contribution] || {
                        icon: 'C',
                        accent: 'from-gray-500 to-gray-400',
                        badge: 'bg-gray-50 text-gray-700 ring-gray-100',
                        link: 'text-blue-700 hover:text-blue-900',
                      };
                      return (
                        <div key={idx} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                          <div className={`h-1 bg-gradient-to-r ${style.accent}`} />
                          <div className="px-2.5 py-2">
                            <div className="mb-1.5 flex items-center justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-1.5">
                                <span className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] ring-1 ${style.badge}`}>
                                  {style.icon}
                                </span>
                                <p className="truncate text-xs font-bold text-gray-700">{translatedType}</p>
                              </div>
                              <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                                {item.names.length}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                            {item.names.map((entry, ni) => (
                              <span key={ni} className="inline-flex max-w-full items-center rounded-full bg-gray-50 px-2 py-1 text-[11px] leading-none text-gray-700 ring-1 ring-gray-200">
                                <span className="truncate font-semibold">{entry.name}</span>
                                <span className="mx-1 text-gray-300">@</span>
                                <span className="flex shrink-0 items-center gap-1">
                                  {entry.platforms.map((p, pi) => (
                                    <a
                                      key={pi}
                                      href={p.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`font-semibold underline decoration-current/30 underline-offset-2 transition-colors ${style.link}`}
                                    >{p.name}</a>
                                  ))}
                                </span>
                              </span>
                            ))}
                            </div>
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
                aria-expanded={contributionsOpen}
                className="group flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
              >
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-pink-500 via-emerald-500 to-blue-500" />
                  {t('contributionsTitle', language)}
                </span>
                <span className={`text-[10px] text-gray-400 transition-transform duration-200 group-hover:text-gray-600 ${contributionsOpen ? 'rotate-180' : ''}`}>
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
