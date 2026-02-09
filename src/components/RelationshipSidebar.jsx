import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import { calculateRelationship } from '../utils/relationshipCalculator';

export default function RelationshipSidebar({ koalas, onKoalaClick, isOpen, onToggle, onRelationshipCalculated }) {
  const { language } = useLanguage();
  const [koala1Id, setKoala1Id] = useState('');
  const [koala2Id, setKoala2Id] = useState('');
  const [relationship, setRelationship] = useState(null);
  const [searchTerm1, setSearchTerm1] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);

  // Filter koalas for search
  const filterKoalas = (term) => {
    if (!term.trim()) return [];
    const lowerTerm = term.toLowerCase();
    return koalas.filter(k =>
      k.name?.toLowerCase().includes(lowerTerm) ||
      k.id?.toLowerCase().includes(lowerTerm) ||
      k.nicknames?.some(n => n.toLowerCase().includes(lowerTerm))
    ).slice(0, 5); // Limit to 5 results
  };

  const filteredKoalas1 = filterKoalas(searchTerm1);
  const filteredKoalas2 = filterKoalas(searchTerm2);

  // Calculate relationship when both koalas are selected
  useEffect(() => {
    if (koala1Id && koala2Id) {
      const result = calculateRelationship(koala1Id, koala2Id, koalas);
      setRelationship(result);
      // Notify parent to highlight the path
      if (onRelationshipCalculated && result.path) {
        onRelationshipCalculated(result.path);
      }
    } else {
      setRelationship(null);
      // Clear highlighting when no relationship
      if (onRelationshipCalculated) {
        onRelationshipCalculated([]);
      }
    }
  }, [koala1Id, koala2Id, koalas, onRelationshipCalculated]);

  const handleSelectKoala1 = (koala) => {
    setKoala1Id(koala.id);
    setSearchTerm1(koala.name);
    setShowDropdown1(false);
  };

  const handleSelectKoala2 = (koala) => {
    setKoala2Id(koala.id);
    setSearchTerm2(koala.name);
    setShowDropdown2(false);
  };

  const clearSelection = () => {
    setKoala1Id('');
    setKoala2Id('');
    setSearchTerm1('');
    setSearchTerm2('');
    setRelationship(null);
  };

  const swapKoalas = () => {
    const tempId = koala1Id;
    const tempSearch = searchTerm1;
    setKoala1Id(koala2Id);
    setKoala2Id(tempId);
    setSearchTerm1(searchTerm2);
    setSearchTerm2(tempSearch);
  };

  const getRelationshipDescription = (rel) => {
    if (!rel) return { description: '', details: '' };

    const params = {
      koala1: rel.koala1Name,
      koala2: rel.koala2Name,
      mother: rel.motherName,
      ancestor: rel.ancestorName,
      gens: rel.generations || rel.generationsApart,
    };

    switch (rel.type) {
      case 'self':
        return {
          description: t('relSelf', language),
          details: ''
        };
      case 'unknown':
        return {
          description: t('relUnknown', language),
          details: ''
        };
      case 'parent-child':
        return {
          description: t('relParentChild', language),
          details: rel.direction === 'koala1-is-mother'
            ? t('relParentChildDetail2', language, params)
            : t('relParentChildDetail1', language, params)
        };
      case 'siblings':
        return {
          description: t('relSiblings', language),
          details: t('relSiblingsDetail', language, params)
        };
      case 'grandparent':
        return {
          description: t('relGrandparent', language),
          details: rel.direction === 'koala1-is-grandparent'
            ? t('relGrandparentDetail1', language, params)
            : t('relGrandparentDetail2', language, params)
        };
      case 'ancestor':
        return {
          description: t('relAncestor', language),
          details: rel.direction === 'koala1-is-ancestor'
            ? t('relAncestorDetail1', language, params)
            : t('relAncestorDetail2', language, params)
        };
      case 'aunt-niece':
        return {
          description: t('relAuntNiece', language),
          details: rel.direction === 'koala1-is-aunt'
            ? t('relAuntNieceDetail1', language, params)
            : t('relAuntNieceDetail2', language, params)
        };
      case 'cousins':
        return {
          description: t('relCousins', language),
          details: t('relCousinsDetail', language, params)
        };
      case 'related':
        return {
          description: t('relRelated', language),
          details: t('relRelatedDetail', language, params)
        };
      case 'unrelated':
        return {
          description: t('relUnrelated', language),
          details: t('relUnrelatedDetail', language)
        };
      default:
        return { description: '', details: '' };
    }
  };

  const getRelationshipColor = (type) => {
    switch (type) {
      case 'self': return 'text-gray-600';
      case 'parent-child': return 'text-blue-600';
      case 'siblings': return 'text-purple-600';
      case 'grandparent': return 'text-indigo-600';
      case 'aunt-niece': return 'text-pink-600';
      case 'cousins': return 'text-green-600';
      case 'related': return 'text-teal-600';
      case 'ancestor': return 'text-violet-600';
      case 'unrelated': return 'text-gray-500';
      default: return 'text-gray-600';
    }
  };

  const getRelationshipIcon = (type) => {
    switch (type) {
      case 'parent-child': return '👩‍👧';
      case 'siblings': return '👭';
      case 'grandparent': return '👵';
      case 'aunt-niece': return '👩‍👧‍👦';
      case 'cousins': return '👯';
      case 'related': return '🌳';
      case 'ancestor': return '🧬';
      case 'unrelated': return '❌';
      default: return '❓';
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute top-3 right-32 z-20 px-3 py-1.5 text-sm rounded-md bg-white/90 border border-gray-300 shadow hover:bg-white flex items-center gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {t('relationshipTitle', language)}
      </button>

      {/* Sidebar */}
      <div
        className={`absolute top-0 right-0 h-full bg-white border-l border-gray-300 shadow-lg transition-all duration-300 z-10 flex flex-col ${
          isOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">{t('relationshipTitle', language)}</h3>
          {(koala1Id || koala2Id) && (
            <button
              onClick={clearSelection}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {t('clearFilters', language)}
            </button>
          )}
        </div>

        {/* Selection Area */}
        <div className="p-4 space-y-4 border-b border-gray-200">
          {/* Koala 1 Selection */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('koala1', language)}
            </label>
            <input
              type="text"
              value={searchTerm1}
              onChange={(e) => {
                setSearchTerm1(e.target.value);
                setShowDropdown1(true);
                if (!e.target.value) setKoala1Id('');
              }}
              onFocus={() => setShowDropdown1(true)}
              placeholder={t('searchPlaceholder', language)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {showDropdown1 && filteredKoalas1.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {filteredKoalas1.map(koala => (
                  <button
                    key={koala.id}
                    onClick={() => handleSelectKoala1(koala)}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm"
                  >
                    <div className="font-semibold">{koala.name}</div>
                    <div className="text-xs text-gray-500">{koala.id}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          {koala1Id && koala2Id && (
            <div className="flex justify-center">
              <button
                onClick={swapKoalas}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Swap"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </div>
          )}

          {/* Koala 2 Selection */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('koala2', language)}
            </label>
            <input
              type="text"
              value={searchTerm2}
              onChange={(e) => {
                setSearchTerm2(e.target.value);
                setShowDropdown2(true);
                if (!e.target.value) setKoala2Id('');
              }}
              onFocus={() => setShowDropdown2(true)}
              placeholder={t('searchPlaceholder', language)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {showDropdown2 && filteredKoalas2.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {filteredKoalas2.map(koala => (
                  <button
                    key={koala.id}
                    onClick={() => handleSelectKoala2(koala)}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm"
                  >
                    <div className="font-semibold">{koala.name}</div>
                    <div className="text-xs text-gray-500">{koala.id}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Relationship Result */}
        {relationship && (() => {
          const { description, details } = getRelationshipDescription(relationship);
          return (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{getRelationshipIcon(relationship.type)}</span>
                  <div className="flex-1">
                    <h4 className={`font-bold text-lg ${getRelationshipColor(relationship.type)}`}>
                      {description}
                    </h4>
                  </div>
                </div>
                {details && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {details}
                  </p>
                )}
              </div>

            {/* Quick Navigation */}
            {koala1Id && koala2Id && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  {t('jumpTo', language)}
                </p>
                <button
                  onClick={() => onKoalaClick(koalas.find(k => k.id === koala1Id))}
                  className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md hover:bg-blue-50 text-sm"
                >
                  {koalas.find(k => k.id === koala1Id)?.name}
                </button>
                <button
                  onClick={() => onKoalaClick(koalas.find(k => k.id === koala2Id))}
                  className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md hover:bg-blue-50 text-sm"
                >
                  {koalas.find(k => k.id === koala2Id)?.name}
                </button>
              </div>
            )}
            </div>
          );
        })()}

        {/* Instructions */}
        {!relationship && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-sm text-gray-600 space-y-2">
              <p className="font-semibold">{t('relationshipInstructions', language)}</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>{t('relationshipInstruction1', language)}</li>
                <li>{t('relationshipInstruction2', language)}</li>
                <li>{t('relationshipInstruction3', language)}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
