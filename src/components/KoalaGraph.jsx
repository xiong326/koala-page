import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';

// Register dagre layout
cytoscape.use(dagre);

export default function KoalaGraph({ elements, onNodeClick, highlightedNodes = [], selectedKoalaId = null, relationshipPath = [], ancestorLineage = [] }) {
  const { language } = useLanguage();
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const defaultViewportRef = useRef(null);
  const onNodeClickRef = useRef(onNodeClick);
  const [isReady, setIsReady] = useState(false);

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
    if (!containerRef.current || elements.length === 0) return;

    // Initialize Cytoscape
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: elements,
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
            'width': '70px',
            'height': '70px',
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
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#94a3b8',
            'target-arrow-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 1.5,
          }
        },
        {
          selector: 'edge.highlighted',
          style: {
            'line-color': '#f59e0b',
            'target-arrow-color': '#f59e0b',
            'width': 3,
          }
        }
      ],
      minZoom: 0.3,
      maxZoom: 3,
    });

    // Run layout and capture the initial "default" viewport (zoom + pan)
    const layoutOptions = {
      name: 'dagre',
      rankDir: 'TB',
      nodeSep: 50,
      rankSep: 100,
      padding: 30,
    };

    cyRef.current.one('layoutstop', () => {
      defaultViewportRef.current = {
        zoom: cyRef.current.zoom(),
        pan: { ...cyRef.current.pan() },
      };
    });

    cyRef.current.layout(layoutOptions).run();

    // Add click handler
    cyRef.current.on('tap', 'node', (evt) => {
      const node = evt.target;
      const koalaData = node.data();

      // Center the clicked node (keep user's current zoom level)
      cyRef.current.animate({
        center: { eles: node },
      }, {
        duration: 500,
        complete: () => {
          // Show card in fixed position
          if (onNodeClickRef.current) {
            onNodeClickRef.current(koalaData);
          }
        }
      });
    });

    setIsReady(true);

    // Cleanup
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [elements]);

  // Update highlighting when highlightedNodes changes
  useEffect(() => {
    if (!cyRef.current || !isReady) return;

    // Remove all previous highlighting
    cyRef.current.elements().removeClass('highlighted selected');

    if (highlightedNodes.length > 0) {
      // Check if this is a relationship path (ordered) or family network (unordered)
      const isRelationshipPath = relationshipPath.length > 0;

      // Highlight specified nodes
      highlightedNodes.forEach(nodeId => {
        const node = cyRef.current.getElementById(nodeId);

        if (node.length > 0) {
          // For relationship paths, highlight both endpoints in orange
          if (isRelationshipPath && (nodeId === relationshipPath[0] || nodeId === relationshipPath[relationshipPath.length - 1])) {
            node.addClass('selected');
          }
          // For single clicked node, highlight only that one
          else if (nodeId === selectedKoalaId) {
            node.addClass('selected');
          }
          // All others get regular highlighting
          else {
            node.addClass('highlighted');
          }
        }
      });

      // Highlight edges
      if (isRelationshipPath) {
        // Only highlight edges in the specific relationship path
        for (let i = 0; i < relationshipPath.length - 1; i++) {
          const sourceId = relationshipPath[i];
          const targetId = relationshipPath[i + 1];

          // Find the edge between these two nodes (could be either direction)
          const edge1 = cyRef.current.getElementById(`${sourceId}-${targetId}`);
          const edge2 = cyRef.current.getElementById(`${targetId}-${sourceId}`);

          if (edge1.length > 0) edge1.addClass('highlighted');
          if (edge2.length > 0) edge2.addClass('highlighted');
        }
      } else if (ancestorLineage.length > 0) {
        // Highlight edges in ancestor lineage + all descendant edges
        const selectedId = ancestorLineage[0]; // First in lineage is the selected koala

        // 1. Highlight all edges between ancestors
        // For each ancestor, highlight edges connecting to its parents (if they're also in the ancestor list)
        ancestorLineage.forEach(ancestorId => {
          const node = cyRef.current.getElementById(ancestorId);
          if (node.length > 0) {
            // Highlight incoming edges (from parents) if the parent is in ancestorLineage
            node.connectedEdges('[target = "' + ancestorId + '"]').forEach(edge => {
              const sourceId = edge.data('source');
              if (ancestorLineage.includes(sourceId)) {
                edge.addClass('highlighted');
              }
            });
          }
        });

        // 2. Highlight all edges from the selected koala to its descendants
        highlightedNodes.forEach(nodeId => {
          // Only highlight outgoing edges from selected and descendants (not ancestors)
          // Descendants are nodes in highlightedNodes but not in ancestorLineage (except selected)
          const isDescendant = !ancestorLineage.includes(nodeId) || nodeId === selectedId;
          if (isDescendant) {
            const node = cyRef.current.getElementById(nodeId);
            if (node.length > 0) {
              // Highlight edges where this node is the source (parent → child)
              node.connectedEdges('[source = "' + nodeId + '"]').addClass('highlighted');
            }
          }
        });
      } else {
        // Highlight all connected edges (family network)
        highlightedNodes.forEach(nodeId => {
          const node = cyRef.current.getElementById(nodeId);
          if (node.length > 0) {
            node.connectedEdges().addClass('highlighted');
          }
        });
      }

      // Fit relationship path in viewport
      if (isRelationshipPath && relationshipPath.length > 0) {
        const pathNodes = cyRef.current.collection();
        relationshipPath.forEach(nodeId => {
          const node = cyRef.current.getElementById(nodeId);
          if (node.length > 0) {
            pathNodes.merge(node);
          }
        });

        if (pathNodes.length > 0) {
          cyRef.current.animate({
            fit: {
              eles: pathNodes,
              padding: 50
            }
          }, {
            duration: 500
          });
        }
      }
    }
  }, [highlightedNodes, selectedKoalaId, relationshipPath, ancestorLineage, isReady]);

  // Programmatically center on selected node (from search dropdown)
  // Skip if we're showing a relationship path (already fitted above)
  useEffect(() => {
    if (!cyRef.current || !isReady || !selectedKoalaId) return;

    // Don't center if we're showing a relationship path
    if (relationshipPath.length > 0) return;

    const node = cyRef.current.getElementById(selectedKoalaId);
    if (node && node.length > 0) {
      cyRef.current.animate({
        center: { eles: node },
      }, {
        duration: 500
      });
    }
  }, [selectedKoalaId, isReady, relationshipPath]);

  return (
    <div className="w-full h-full border border-gray-300 rounded-lg bg-white relative">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
