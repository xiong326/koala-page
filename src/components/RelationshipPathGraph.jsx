import { useMemo, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import { koalasToGraphElements } from '../utils/graphHelpers';
import { getRelationshipDescription } from '../utils/relationshipDisplay';
import KoalaGraph from './KoalaGraph';

function getRelationshipPathFamily(relationshipPath, koalas) {
  if (!relationshipPath?.length) return [];

  const koalaMap = new Map(koalas.map(koala => [koala.id, koala]));
  const nodesById = new Map();

  relationshipPath.forEach(id => {
    const koala = koalaMap.get(id);
    if (koala) nodesById.set(id, koala);
  });

  for (let i = 0; i < relationshipPath.length - 1; i += 1) {
    const first = koalaMap.get(relationshipPath[i]);
    const second = koalaMap.get(relationshipPath[i + 1]);
    if (!first || !second) continue;

    if (second.father === first.id && second.mother) {
      const mother = koalaMap.get(second.mother);
      if (mother) nodesById.set(mother.id, mother);
    }
    if (first.father === second.id && first.mother) {
      const mother = koalaMap.get(first.mother);
      if (mother) nodesById.set(mother.id, mother);
    }
  }

  const includedIds = new Set(nodesById.keys());

  return [...nodesById.values()].map(koala => ({
    ...koala,
    mother: includedIds.has(koala.mother) ? koala.mother : null,
    father: includedIds.has(koala.father) ? koala.father : null,
  }));
}

export default function RelationshipPathGraph({ relationship, relationshipPath, koalas, isOpen, onClose }) {
  const { language } = useLanguage();
  const graphRef = useRef(null);

  const pathKoalas = useMemo(
    () => getRelationshipPathFamily(relationshipPath, koalas),
    [relationshipPath, koalas],
  );

  const graphElements = useMemo(
    () => koalasToGraphElements(pathKoalas),
    [pathKoalas],
  );

  if (!isOpen) return null;

  const { description, details } = getRelationshipDescription(relationship, language);
  const canExport = pathKoalas.length > 0;

  const handleExport = () => {
    const dataUrl = graphRef.current?.exportPng();
    if (!dataUrl) return;

    const safeName = [
      relationship?.koala1Name,
      relationship?.koala2Name,
      'relationship',
    ]
      .filter(Boolean)
      .join('-')
      .replace(/[^a-z0-9_-]+/gi, '_')
      .toLowerCase();
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${safeName || 'relationship-path'}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-2xl flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-gray-200 bg-white">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-gray-800 truncate">
            {t('relationshipPathGraph', language)}
          </h2>
          {description && (
            <p className="text-xs text-gray-600 truncate">
              {description}{details ? `: ${details}` : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleExport}
            disabled={!canExport}
            className="px-2 py-1 text-xs rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
            title={t('relationshipExportImage', language)}
          >
            {t('relationshipExportImage', language)}
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
      {pathKoalas.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6 text-sm text-gray-500 text-center">
          {t('relationshipNoPath', language)}
        </div>
      ) : (
        <div className="flex-1 min-h-0 p-2">
          <KoalaGraph
            ref={graphRef}
            primaryElements={graphElements.primaryElements}
            proxyElements={graphElements.proxyElements}
            highlightedNodes={relationshipPath}
            selectedKoalaId={null}
            relationshipPath={relationshipPath}
            onNodeClick={() => {}}
          />
        </div>
      )}
    </div>
  );
}
