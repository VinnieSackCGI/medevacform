import React, { useEffect, useRef, useState } from 'react';

const MermaidDiagram = ({ chart, id }) => {
  const elementRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!elementRef.current || !chart) return;

      setLoading(true);
      setError(null);

      try {
        // Dynamically import mermaid to avoid SSR issues
        const mermaid = await import('mermaid');
        
        // Initialize mermaid
        mermaid.default.initialize({
          startOnLoad: false,
          theme: 'default',
          themeVariables: {
            primaryColor: '#f8f9fa',
            primaryTextColor: '#1a202c',
            primaryBorderColor: '#4a5568',
            lineColor: '#4a5568',
            secondaryColor: '#edf2f7',
            tertiaryColor: '#e2e8f0',
            background: '#ffffff',
            mainBkg: '#f8f9fa',
            secondBkg: '#edf2f7',
            tertiaryBkg: '#e2e8f0'
          },
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
          }
        });

        // Clear previous content
        elementRef.current.innerHTML = '';
        
        // Generate unique ID
        const diagramId = `mermaid-diagram-${id || Math.random().toString(36).substr(2, 9)}`;
        
        // Create a temporary div for rendering
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `<div class="mermaid">${chart}</div>`;
        
        // Render the diagram
        const { svg } = await mermaid.default.render(diagramId, chart);
        
        // Insert the SVG
        elementRef.current.innerHTML = svg;
        
        // Apply custom styles to the SVG
        const svgElement = elementRef.current.querySelector('svg');
        if (svgElement) {
          svgElement.style.maxWidth = '100%';
          svgElement.style.height = 'auto';
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    renderDiagram();
  }, [chart, id]);

  if (loading) {
    return (
      <div className="my-6 bg-gray-50 rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-matisse mx-auto mb-4"></div>
        <p className="text-gray-600">Rendering diagram...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-700 font-medium mb-2">Diagram Rendering Error</div>
        <div className="text-red-600 text-sm mb-3">{error}</div>
        <details className="mt-2">
          <summary className="text-red-600 text-sm cursor-pointer hover:text-red-800">
            Show diagram code
          </summary>
          <pre className="bg-gray-100 p-3 mt-2 text-xs overflow-x-auto rounded border">
            {chart}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className="my-8">
      <div 
        ref={elementRef}
        className="mermaid-container bg-white p-6 rounded-lg border border-gray-200 shadow-sm overflow-x-auto"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
};

export default MermaidDiagram;