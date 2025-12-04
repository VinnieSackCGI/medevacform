import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, DocumentArrowDownIcon, FolderOpenIcon } from '@heroicons/react/24/outline';
import { ChevronUp } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';

const DocumentationPage = () => {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Documentation files available in the system
  const documentationFiles = [
    {
      id: 'ai-use-case',
      title: 'AI Use Case One Pager',
      type: 'markdown',
      path: '/docs/documentation/AI_Use_Case_One_Pager.md',
      description: 'Comprehensive overview of AI implementation and development approach',
      category: 'Technical'
    },
    {
      id: 'azure-architecture',
      title: 'Azure Architecture',
      type: 'markdown',
      path: '/docs/documentation/AZURE_ARCHITECTURE.md',
      description: 'Cloud infrastructure and deployment architecture documentation',
      category: 'Technical'
    },
    {
      id: 'project-overview',
      title: 'Project Overview',
      type: 'markdown',
      path: '/docs/documentation/PROJECT_OVERVIEW.md',
      description: 'High-level project summary and objectives',
      category: 'Overview'
    },
    {
      id: 'project-status',
      title: 'Project Status',
      type: 'markdown',
      path: '/docs/documentation/PROJECT-STATUS.md',
      description: 'Current development status and milestones',
      category: 'Status'
    },
    {
      id: 'readme',
      title: 'System README',
      type: 'markdown',
      path: '/docs/documentation/README.md',
      description: 'System setup and configuration guide',
      category: 'Technical'
    },
    // Models section
    {
      id: 'component-diagram',
      title: 'Component Diagram',
      type: 'markdown',
      path: '/docs/models/MEDEVAC_ComponentDiagram.md',
      description: 'System component architecture and relationships',
      category: 'Models'
    },
    {
      id: 'data-flow',
      title: 'Data Flow Model',
      type: 'markdown',
      path: '/docs/models/MEDEVAC_DataFlow.md',
      description: 'Data flow processes and information architecture',
      category: 'Models'
    },
    {
      id: 'erd',
      title: 'Entity Relationship Diagram',
      type: 'markdown',
      path: '/docs/models/MEDEVAC_ERD.md',
      description: 'Database entity relationship model with detailed attributes',
      category: 'Models'
    }
  ];

  const categories = [...new Set(documentationFiles.map(doc => doc.category))];

  const loadMarkdownContent = async (docId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3003/api/docs/${docId}`);
      const data = await response.json();
      
      if (data.success) {
        setMarkdownContent(data.document.content);
      } else {
        setMarkdownContent(`# Error Loading Document\n\n${data.error}`);
      }
    } catch (error) {
      console.error('Error loading document:', error);
      setMarkdownContent(`# Error Loading Document\n\nUnable to connect to documentation server. Please ensure the documentation API is running on port 3003.`);
    }
    setLoading(false);
  };

  const handleDocumentSelect = (doc) => {
    setSelectedDoc(doc);
    if (doc.type === 'markdown') {
      loadMarkdownContent(doc.id);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const response = await fetch(`http://localhost:3003/api/docs/${doc.id}/raw`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title.replace(/\s+/g, '_')}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Unable to download document. Please try again.');
    }
  };



  return (
    <div className="min-h-screen bg-white">
      {/* Custom styles for Mermaid diagrams */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .mermaid-container svg {
            max-width: 100%;
            height: auto;
          }
          .mermaid-container .node rect,
          .mermaid-container .node circle,
          .mermaid-container .node ellipse,
          .mermaid-container .node polygon {
            fill: #f8f9fa;
            stroke: #4a5568;
            stroke-width: 2px;
          }
          .mermaid-container .node .label {
            font-family: 'Open Sans', sans-serif;
            font-size: 12px;
            fill: #1a202c;
          }
          .mermaid-container .edgePath path {
            stroke: #4a5568;
            stroke-width: 2px;
          }
          .mermaid-container .edgeLabel {
            background-color: white;
            font-family: 'Open Sans', sans-serif;
            font-size: 11px;
          }
        `
      }} />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 font-garamond">
            Documentation Center
          </h1>
          <p className="text-xl text-muted-foreground font-open-sans">
            Access project documentation, technical specifications, and system guides
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Document Library Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-muted rounded-lg p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center font-garamond">
                <FolderOpenIcon className="w-5 h-5 mr-2" />
                Document Library
              </h2>

              {categories.map(category => (
                <div key={category} className="mb-6">
                  <h3 className={`text-sm font-medium uppercase tracking-wider mb-2 font-open-sans ${
                    category === 'Models' 
                      ? 'text-primary flex items-center' 
                      : 'text-muted-foreground'
                  }`}>
                    {category === 'Models' && (
                      <span className="mr-1">📐</span>
                    )}
                    {category}
                  </h3>
                  
                  {documentationFiles
                    .filter(doc => doc.category === category)
                    .map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => handleDocumentSelect(doc)}
                        className={`w-full text-left p-3 rounded-md mb-2 transition-colors duration-200 ${
                          selectedDoc?.id === doc.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card hover:bg-muted/50 text-foreground'
                        }`}
                      >
                        <div className="flex items-start">
                          {doc.category === 'Models' ? (
                            <span className="text-base mt-0.5 mr-2 flex-shrink-0">📐</span>
                          ) : (
                            <DocumentTextIcon className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                          )}
                          <div>
                            <div className="font-medium text-sm">{doc.title}</div>
                            <div className="text-xs opacity-75 mt-1">{doc.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              ))}
            </div>
          </div>

          {/* Document Viewer */}
          <div className="lg:col-span-3">
            {!selectedDoc ? (
              <div className="bg-muted rounded-lg p-12 text-center">
                <DocumentTextIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  Select a Document
                </h3>
                <p className="text-muted-foreground/70">
                  Choose a document from the library to view its contents
                </p>
              </div>
            ) : (
              <div className="bg-card rounded-lg shadow-md border border-border">
                {/* Document Header */}
                <div className="border-b border-border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {selectedDoc.title}
                      </h2>
                      <p className="text-muted-foreground mt-1">{selectedDoc.description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                        {selectedDoc.type.toUpperCase()}
                      </span>
                      <button 
                        onClick={() => handleDownload(selectedDoc)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-foreground bg-muted rounded-md hover:bg-muted/80 transition-colors"
                      >
                        <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>

                {/* Document Content */}
                <div className="p-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-3 text-muted-foreground font-open-sans">Loading document...</span>
                    </div>
                  ) : selectedDoc.type === 'markdown' ? (
                    <MarkdownRenderer content={markdownContent} />
                  ) : selectedDoc.type === 'pdf' ? (
                    <div className="bg-muted rounded-lg p-8 text-center">
                      <DocumentTextIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">PDF Viewer</p>
                      <p className="text-sm text-muted-foreground/70">
                        PDF viewing would be implemented here using a PDF viewer library
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Unsupported document type</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default DocumentationPage;