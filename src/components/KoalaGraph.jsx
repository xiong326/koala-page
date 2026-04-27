import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

const PROXY_SIZE = 42;
const NODE_SIZE = 70;
// Extra vertical space for the text label below each node
const LABEL_ALLOWANCE = 22;

const SATELLITE_OFFSETS = [
  { dx: -80, dy: 0 },    // left
  { dx: 80, dy: 0 },     // right
  { dx: -50, dy: -15 },  // top-left
  { dx: 50, dy: -15 },   // top-right
  { dx: -50, dy: 15 },   // bottom-left
  { dx: 50, dy: 15 },    // bottom-right
];

const KoalaGraph = forwardRef(function KoalaGraph({
  primaryElements,
  proxyElements,
  onNodeClick,
  highlightedNodes = [],
  selectedKoalaId = null,
  relationshipPath = [],
}, ref) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const defaultViewportRef = useRef(null);
  const onNodeClickRef = useRef(onNodeClick);
  const centeredByClickRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useImperativeHandle(ref, () => ({
    exportPng(options = {}) {
      if (!cyRef.current) return null;
      return cyRef.current.png({
        full: true,
        scale: 2,
        bg: '#ffffff',
        ...options,
      });
    },
  }), []);

  // Avoid re-initializing Cytoscape when parent re-renders and passes a new function identity
  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  // Listen for reset view event
  useEffect(() => {
    const handleReset = () => {
      if (!cyRef.current || !defaultViewportRef.current) return;
      cyRef.current.animate(
        {
          zoom: defaultViewportRef.current.zoom,
          pan: defaultViewportRef.current.pan,
        },
        { duration: 400 }
      );
    };

    window.addEventListener('resetGraphView', handleReset);
    return () => window.removeEventListener('resetGraphView', handleReset);
  }, []);

  useEffect(() => {
    if (!containerRef.current || primaryElements.length === 0) return;

    // Phase 1: dagre on the maternal tree only
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: primaryElements,
      style: [
        {
          selector: 'node',
          style: {
            'shape': 'roundrectangle',
            'background-color': '#ffffff',
            'label': 'data(label)',
            'color': '#1f2937',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'font-size': '9px',
            'font-weight': '600',
            'width': `${NODE_SIZE}px`,
            'height': `${NODE_SIZE}px`,
            'border-width': '2px',
            'border-color': '#9ca3af',
            'text-wrap': 'wrap',
            'text-max-width': '65px',
            'text-margin-y': 3,
            'padding': '3px',
          }
        },
        {
          selector: 'node[photo]',
          style: {
            'background-image': 'data(photo)',
            'background-fit': 'contain',
            'background-width': '60%',
            'background-height': '60%',
            'background-position-x': '50%',
            'background-position-y': '20%',
            'background-clip': 'node',
          }
        },
        {
          selector: 'node[sex="female"]',
          style: {
            'border-color': '#ec4899',
          }
        },
        {
          selector: 'node[sex="male"]',
          style: {
            'border-color': '#3b82f6',
          }
        },
        {
          selector: 'node[deceased="true"]',
          style: {
            'background-color': '#f3f4f6',
            'border-color': '#6b7280',
            'border-style': 'dashed',
            'color': '#6b7280',
            'opacity': 0.7,
          }
        },
        // Proxy nodes: small satellites
        {
          selector: 'node.proxy',
          style: {
            'width': `${PROXY_SIZE}px`,
            'height': `${PROXY_SIZE}px`,
            'opacity': 0.8,
            'font-size': '7px',
            'text-max-width': `${PROXY_SIZE}px`,
            'background-width': '55%',
            'background-height': '55%',
          }
        },
        {
          selector: 'node.proxy[fatherColor]',
          style: {
            'border-color': 'data(fatherColor)',
            'border-width': '4px',
          }
        },
        {
          selector: 'node[sex="female"].highlighted',
          style: {
            'border-color': '#be185d',
            'border-width': '5px',
          }
        },
        {
          selector: 'node[sex="male"].highlighted',
          style: {
            'border-color': '#1d4ed8',
            'border-width': '5px',
          }
        },
        {
          selector: 'node.selected',
          style: {
            'border-color': '#f59e0b',
            'border-width': '6px',
            'border-style': 'solid',
          }
        },
        {
          selector: 'node.selected[photo]',
          style: {
            'border-color': '#f59e0b',
            'border-width': '6px',
          }
        },
        // Mother->child edges
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#94a3b8',
            'target-arrow-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'taxi',
            'taxi-direction': 'downward',
            'taxi-turn': 20,
            'taxi-turn-min-distance': 5,
            'arrow-scale': 1.5,
          }
        },
        {
          selector: 'edge[edgeType = "mother-child"][fatherColor]',
          style: {
            'line-color': 'data(fatherColor)',
            'target-arrow-color': 'data(fatherColor)',
            'width': 3,
          }
        },
        // Mate edges: dashed pink, no arrow
        {
          selector: 'edge.mate-edge',
          style: {
            'width': 1.5,
            'line-color': '#f472b6',
            'line-style': 'dashed',
            'target-arrow-shape': 'none',
            'curve-style': 'straight',
            'z-index': 0,
          }
        },
        {
          selector: 'edge.mate-edge[fatherColor]',
          style: {
            'line-color': 'data(fatherColor)',
            'width': 2.5,
          }
        },
        {
          selector: 'edge.highlighted',
          style: {
            'line-color': '#f59e0b',
            'target-arrow-color': '#f59e0b',
            'width': 5,
            'z-index': 999,
          }
        },
        {
          selector: 'edge.mate-edge.highlighted',
          style: {
            'line-color': '#f59e0b',
            'target-arrow-shape': 'none',
            'width': 4,
            'z-index': 999,
          }
        },
      ],
      minZoom: 0.3,
      maxZoom: 3,
      autoungrabify: true,
    });

    const layoutOptions = {
      name: 'dagre',
      rankDir: 'TB',
      nodeSep: 50,
      rankSep: 100,
      padding: 30,
    };

    cyRef.current.one('layoutstop', () => {
      const cy = cyRef.current;

      // Phase 2: add proxy nodes + mate edges as satellites
      if (proxyElements.length > 0) {
        cy.add(proxyElements);
        positionSatellites(cy);
      }

      defaultViewportRef.current = {
        zoom: cy.zoom(),
        pan: { ...cy.pan() },
      };
    });

    cyRef.current.layout(layoutOptions).run();

    // Click handler: resolve proxy -> original, center on clicked node
    cyRef.current.on('tap', 'node', (evt) => {
      const node = evt.target;
      const koalaData = node.data();

      const resolvedData = koalaData.nodeType === 'proxy'
        ? { ...koalaData, id: koalaData.originalId }
        : koalaData;

      centeredByClickRef.current = true;

      cyRef.current.animate({
        center: { eles: node },
      }, {
        duration: 500,
        complete: () => {
          if (onNodeClickRef.current) {
            onNodeClickRef.current(resolvedData);
          }
        }
      });
    });

    setIsReady(true);

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [primaryElements, proxyElements]);

  useEffect(() => {
    if (!isReady) return;

    const refreshImages = () => {
      const cy = cyRef.current;
      if (!cy || document.visibilityState === 'hidden') return;

      const nodesWithPhotos = cy.nodes().filter(node => !!node.data('photo'));
      if (nodesWithPhotos.length === 0) {
        cy.resize();
        return;
      }

      const photos = nodesWithPhotos.map(node => ({
        node,
        photo: node.data('photo'),
      }));

      cy.batch(() => {
        photos.forEach(({ node }) => node.removeData('photo'));
      });
      cy.elements().updateStyle();
      cy.resize();

      requestAnimationFrame(() => {
        const latestCy = cyRef.current;
        if (!latestCy || latestCy.destroyed()) return;

        latestCy.batch(() => {
          photos.forEach(({ node, photo }) => {
            if (!node.removed()) {
              node.data('photo', photo);
            }
          });
        });
        latestCy.elements().updateStyle();
        latestCy.resize();
      });
    };

    const refreshSoon = () => {
      if (document.visibilityState === 'hidden') return;
      setTimeout(refreshImages, 50);
      setTimeout(refreshImages, 300);
    };

    window.addEventListener('pageshow', refreshSoon);
    window.addEventListener('focus', refreshSoon);
    document.addEventListener('visibilitychange', refreshSoon);

    return () => {
      window.removeEventListener('pageshow', refreshSoon);
      window.removeEventListener('focus', refreshSoon);
      document.removeEventListener('visibilitychange', refreshSoon);
    };
  }, [isReady]);

  // Highlighting logic
  useEffect(() => {
    if (!cyRef.current || !isReady) return;

    const cy = cyRef.current;
    cy.batch(() => {
      cy.elements().removeClass('highlighted selected');
    });
    cy.elements().updateStyle();

    if (highlightedNodes.length === 0) return;

    const isRelationshipPath = relationshipPath.length > 0;

    if (isRelationshipPath) {
      relationshipPath.forEach((nodeId, idx) => {
        const node = cy.getElementById(nodeId);
        if (node.length === 0) return;
        if (idx === 0 || idx === relationshipPath.length - 1) {
          node.addClass('selected');
        } else {
          node.addClass('highlighted');
        }
      });
      highlightRelationshipPathEdges(cy, relationshipPath);

      const pathNodes = cy.collection();
      relationshipPath.forEach(nodeId => {
        const node = cy.getElementById(nodeId);
        if (node.length > 0) pathNodes.merge(node);
      });
      if (pathNodes.length > 0) {
        cy.animate({
          fit: { eles: pathNodes, padding: 50 }
        }, { duration: 500 });
      }
    } else {
      // Lineage mode

      // Step 1: Clicked nodes -> orange (original + all proxy copies)
      if (selectedKoalaId) {
        const sel = cy.getElementById(selectedKoalaId);
        if (sel.length > 0) sel.addClass('selected');
        cy.nodes(`[originalId = "${selectedKoalaId}"]`).addClass('selected');
      }

      // Step 2: Highlighted nodes -> own color; expand proxy copies for males
      highlightedNodes.forEach(nodeId => {
        if (nodeId === selectedKoalaId) return;
        const node = cy.getElementById(nodeId);
        if (node.length === 0) return;
        node.addClass('highlighted');
        if (node.data('sex') === 'male') {
          cy.nodes(`[originalId = "${nodeId}"]`).forEach(proxy => {
            if (!proxy.hasClass('selected')) proxy.addClass('highlighted');
          });
        }
      });

      // Step 3: Edge highlighting
      highlightLineageEdges(cy);
    }
  }, [highlightedNodes, selectedKoalaId, relationshipPath, isReady]);

  // Center on selected node (from search/filter, NOT from click)
  useEffect(() => {
    if (!cyRef.current || !isReady || !selectedKoalaId) return;
    if (relationshipPath.length > 0) return;

    if (centeredByClickRef.current) {
      centeredByClickRef.current = false;
      return;
    }

    const node = cyRef.current.getElementById(selectedKoalaId);
    if (node && node.length > 0) {
      cyRef.current.animate({
        center: { eles: node },
      }, { duration: 500 });
    }
  }, [selectedKoalaId, isReady, relationshipPath]);

  return (
    <div className="w-full h-full border border-gray-300 rounded-lg bg-white relative">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
});

export default KoalaGraph;

/**
 * Position proxy nodes as satellites around their female mate.
 * Uses collision avoidance against dagre-placed nodes AND edge segments.
 */
function positionSatellites(cy) {
  const occupiedBoxes = [];
  cy.nodes(':not(.proxy)').forEach(node => {
    const pos = node.position();
    const halfW = NODE_SIZE / 2 + 4;
    const halfH = NODE_SIZE / 2 + LABEL_ALLOWANCE + 4;
    occupiedBoxes.push({
      x1: pos.x - halfW, y1: pos.y - halfW,
      x2: pos.x + halfW, y2: pos.y + halfH,
    });
  });

  // Approximate taxi-routed edge segments as thin bounding boxes
  const EDGE_PAD = 5;
  const TAXI_TURN = 15;
  const edgeBoxes = [];
  cy.edges('[edgeType = "mother-child"]').forEach(edge => {
    const srcNode = cy.getElementById(edge.data('source'));
    const tgtNode = cy.getElementById(edge.data('target'));
    if (srcNode.length === 0 || tgtNode.length === 0) return;
    const src = srcNode.position();
    const tgt = tgtNode.position();

    const srcBottom = src.y + NODE_SIZE / 2;
    const tgtTop = tgt.y - NODE_SIZE / 2;
    const turnY = srcBottom + TAXI_TURN;

    // Segment 1: vertical from source bottom down to turn point
    edgeBoxes.push({
      x1: src.x - EDGE_PAD, y1: srcBottom,
      x2: src.x + EDGE_PAD, y2: Math.min(turnY, tgtTop),
    });
    // Segment 2: horizontal from src.x to tgt.x at turnY
    if (Math.abs(src.x - tgt.x) > EDGE_PAD * 2 && turnY < tgtTop) {
      edgeBoxes.push({
        x1: Math.min(src.x, tgt.x), y1: turnY - EDGE_PAD,
        x2: Math.max(src.x, tgt.x), y2: turnY + EDGE_PAD,
      });
    }
    // Segment 3: vertical from turn point down to target top
    if (turnY < tgtTop) {
      edgeBoxes.push({
        x1: tgt.x - EDGE_PAD, y1: turnY,
        x2: tgt.x + EDGE_PAD, y2: tgtTop,
      });
    }
  });

  const boxesOverlap = (a, b) =>
    a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;

  const proxiesByMate = new Map();
  cy.nodes('.proxy').forEach(proxy => {
    const mateOfId = proxy.data('mateOf');
    if (!proxiesByMate.has(mateOfId)) {
      proxiesByMate.set(mateOfId, []);
    }
    proxiesByMate.get(mateOfId).push(proxy);
  });

  const proxyHalfW = PROXY_SIZE / 2 + 2;
  const proxyHalfH = PROXY_SIZE / 2 + LABEL_ALLOWANCE + 2;
  const stackGap = PROXY_SIZE + LABEL_ALLOWANCE + 8;

  proxiesByMate.forEach((proxies, mateOfId) => {
    const mateNode = cy.getElementById(mateOfId);
    if (mateNode.length === 0) return;
    const femalePos = mateNode.position();

    proxies.forEach((proxy) => {
      const makeBox = (cx, cy_pos) => ({
        x1: cx - proxyHalfW, y1: cy_pos - proxyHalfW,
        x2: cx + proxyHalfW, y2: cy_pos + proxyHalfH,
      });

      const tryPlace = (shift, checkEdges) => {
        for (const { dx, dy } of SATELLITE_OFFSETS) {
          const cx = femalePos.x + dx;
          const shiftDir = dy !== 0 ? Math.sign(dy) : 1;
          const cy_pos = femalePos.y + dy + shift * shiftDir;
          const box = makeBox(cx, cy_pos);

          if (occupiedBoxes.some(ob => boxesOverlap(box, ob))) continue;
          if (checkEdges && edgeBoxes.some(eb => boxesOverlap(box, eb))) continue;

          proxy.position({ x: cx, y: cy_pos });
          occupiedBoxes.push(box);
          return true;
        }
        return false;
      };

      // Try base positions first, then progressively stack outward
      for (let level = 0; level < 3; level++) {
        const shift = level * stackGap;
        if (tryPlace(shift, true)) return;
        if (tryPlace(shift, false)) return;
      }

      const cx = femalePos.x + SATELLITE_OFFSETS[0].dx;
      const cy_pos = femalePos.y + SATELLITE_OFFSETS[0].dy;
      proxy.position({ x: cx, y: cy_pos });
      occupiedBoxes.push(makeBox(cx, cy_pos));
    });
  });
}

/**
 * Highlight edges for lineage mode based on node CSS classes already applied.
 */
function highlightLineageEdges(cy) {
  const isActive = (node) => node.hasClass('highlighted') || node.hasClass('selected');

  // 1. Mother-child edges where both endpoints are highlighted/clicked
  cy.edges('[edgeType = "mother-child"]').forEach(edge => {
    const src = cy.getElementById(edge.data('source'));
    const tgt = cy.getElementById(edge.data('target'));
    if (isActive(src) && isActive(tgt)) {
      edge.addClass('highlighted');
    }
  });

  // 2. Father-child connections via proxies: highlight the mate edge + mother-child
  //    edge only when at least one child through that mate is highlighted/clicked
  cy.nodes('.proxy.highlighted, .proxy.selected').forEach(proxy => {
    const mateOfId = proxy.data('mateOf');
    const originalId = proxy.data('originalId');
    let hasHighlightedChild = false;

    cy.edges(`[source = "${mateOfId}"][edgeType = "mother-child"]`).forEach(edge => {
      const childNode = cy.getElementById(edge.data('target'));
      if (childNode.length === 0) return;
      if (!isActive(childNode)) return;
      if (childNode.data('father') !== originalId) return;
      edge.addClass('highlighted');
      hasHighlightedChild = true;
    });

    if (hasHighlightedChild) {
      proxy.connectedEdges('.mate-edge').addClass('highlighted');
    }
  });
}

/**
 * Highlight edges for a relationship path.
 * Handles father->child connections that go through proxy + mate edges.
 */
function highlightRelationshipPathEdges(cy, relationshipPath) {
  for (let i = 0; i < relationshipPath.length - 1; i++) {
    const idA = relationshipPath[i];
    const idB = relationshipPath[i + 1];

    // Try direct mother->child edge in either direction
    const edgeAB = cy.getElementById(`${idA}-${idB}`);
    const edgeBA = cy.getElementById(`${idB}-${idA}`);

    if (edgeAB.length > 0) { edgeAB.addClass('highlighted'); continue; }
    if (edgeBA.length > 0) { edgeBA.addClass('highlighted'); continue; }

    // No direct edge: must be a father->child link going through a proxy
    const nodeA = cy.getElementById(idA);
    const nodeB = cy.getElementById(idB);
    if (nodeA.length === 0 || nodeB.length === 0) continue;

    // Check if idA is the father of idB
    if (nodeB.data('father') === idA) {
      const motherId = nodeB.data('mother');
      if (motherId) {
        highlightFatherChildConnection(cy, idA, motherId, idB);
        // Also highlight the mother node as an intermediary
        const motherNode = cy.getElementById(motherId);
        if (motherNode.length > 0) motherNode.addClass('highlighted');
      }
    } else if (nodeA.data('father') === idB) {
      const motherId = nodeA.data('mother');
      if (motherId) {
        highlightFatherChildConnection(cy, idB, motherId, idA);
        const motherNode = cy.getElementById(motherId);
        if (motherNode.length > 0) motherNode.addClass('highlighted');
      }
    }
  }
}

/**
 * Highlight the proxy node, mate edge, and mother->child edge
 * that visually represent a father->child connection.
 */
function highlightFatherChildConnection(cy, fatherId, motherId, childId) {
  const proxyId = `${fatherId}_m_${motherId}`;
  const proxyNode = cy.getElementById(proxyId);
  if (proxyNode.length > 0) proxyNode.addClass('highlighted');

  const mateEdge = cy.getElementById(`mate_${proxyId}_${motherId}`);
  if (mateEdge.length > 0) mateEdge.addClass('highlighted');

  const motherChildEdge = cy.getElementById(`${motherId}-${childId}`);
  if (motherChildEdge.length > 0) motherChildEdge.addClass('highlighted');
}
