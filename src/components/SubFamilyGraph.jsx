import { useMemo, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import { koalasToGraphElements } from '../utils/graphHelpers';
import KoalaGraph from './KoalaGraph';

function getSubFamily(selectedKoala, koalas) {
  if (!selectedKoala) {
    return { koalas: [], descendants: [], mates: [], selectedMates: [] };
  }

  const koalaMap = new Map(koalas.map(koala => [koala.id, koala]));
  const descendantsById = new Map();

  function collectDescendants(parentId) {
    koalas.forEach(koala => {
      if (koala.mother !== parentId && koala.father !== parentId) return;
      if (descendantsById.has(koala.id)) return;
      descendantsById.set(koala.id, koala);
      collectDescendants(koala.id);
    });
  }

  collectDescendants(selectedKoala.id);

  const descendants = [...descendantsById.values()]
    .sort((a, b) => (a.birthDate || '').localeCompare(b.birthDate || ''));

  const nodesById = new Map([[selectedKoala.id, selectedKoala]]);
  descendants.forEach(descendant => nodesById.set(descendant.id, descendant));

  descendants.forEach(descendant => {
    if (descendant.mother && nodesById.has(descendant.mother) && descendant.father) {
      const father = koalaMap.get(descendant.father);
      if (father) nodesById.set(father.id, father);
    }
    if (descendant.father && nodesById.has(descendant.father) && descendant.mother) {
      const mother = koalaMap.get(descendant.mother);
      if (mother) nodesById.set(mother.id, mother);
    }
  });

  const subFamilyIds = new Set(nodesById.keys());
  const descendantIds = new Set(descendants.map(koala => koala.id));
  const mates = [...nodesById.values()]
    .filter(koala => koala.id !== selectedKoala.id && !descendantIds.has(koala.id))
    .sort((a, b) => (a.birthDate || '').localeCompare(b.birthDate || ''));
  const selectedMateIds = new Set();

  descendants.forEach(descendant => {
    if (descendant.mother === selectedKoala.id && descendant.father) {
      selectedMateIds.add(descendant.father);
    }
    if (descendant.father === selectedKoala.id && descendant.mother) {
      selectedMateIds.add(descendant.mother);
    }
  });

  const selectedMates = [...selectedMateIds]
    .map(id => koalaMap.get(id))
    .filter(Boolean)
    .sort((a, b) => (a.birthDate || '').localeCompare(b.birthDate || ''));

  return {
    koalas: [...nodesById.values()].map(koala => ({
      ...koala,
      mother: subFamilyIds.has(koala.mother) ? koala.mother : null,
      father: subFamilyIds.has(koala.father) ? koala.father : null,
    })),
    descendants,
    mates,
    selectedMates,
  };
}

export default function SubFamilyGraph({ selectedKoala, koalas, isOpen, onClose }) {
  const { language } = useLanguage();
  const graphRef = useRef(null);

  const subFamily = useMemo(
    () => getSubFamily(selectedKoala, koalas),
    [selectedKoala, koalas],
  );

  const graphElements = useMemo(
    () => koalasToGraphElements(subFamily.koalas),
    [subFamily.koalas],
  );

  if (!isOpen || !selectedKoala) return null;

  const canExport = subFamily.descendants.length > 0;

  const handleExport = () => {
    const dataUrl = graphRef.current?.exportPng();
    if (!dataUrl) return;

    const safeName = selectedKoala.name.replace(/[^a-z0-9_-]+/gi, '_').toLowerCase();
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${safeName || selectedKoala.id}-sub-family.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-2xl flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-gray-200 bg-white">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-gray-800 truncate">
            {t('subFamilyGraph', language)}: {selectedKoala.name}
          </h2>
          <p className="text-xs text-gray-500">
            {t('subFamilySummary', language, {
              mates: subFamily.selectedMates.length,
              descendants: subFamily.descendants.length,
            })}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleExport}
            disabled={!canExport}
            className="px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed"
            title={t('subFamilyExportImage', language)}
          >
            {t('subFamilyExportImage', language)}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            title={t('close', language)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      {subFamily.descendants.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6 text-sm text-gray-500 text-center">
          {t('subFamilyNoChildren', language, { name: selectedKoala.name })}
        </div>
      ) : (
        <div className="flex-1 min-h-0 p-2">
          <KoalaGraph
            ref={graphRef}
            primaryElements={graphElements.primaryElements}
            proxyElements={graphElements.proxyElements}
            highlightedNodes={[]}
            selectedKoalaId={null}
            relationshipPath={[]}
            onNodeClick={() => {}}
          />
        </div>
      )}
    </div>
  );
}
