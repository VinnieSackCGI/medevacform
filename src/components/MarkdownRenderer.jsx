import React from 'react';
import MermaidDiagram from './MermaidDiagram';

const MarkdownRenderer = ({ content }) => {
  const renderMarkdown = (content) => {
    const lines = content.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      
      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-4xl font-bold text-black-pearl mb-6 mt-8 border-b-2 border-gray-200 pb-2 font-garamond">
            {renderInlineMarkdown(line.slice(2))}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-3xl font-semibold text-black-pearl mb-4 mt-6 font-garamond">
            {renderInlineMarkdown(line.slice(3))}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-2xl font-semibold text-black-pearl mb-3 mt-5 font-garamond">
            {renderInlineMarkdown(line.slice(4))}
          </h3>
        );
      } else if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={i} className="text-xl font-semibold text-black-pearl mb-2 mt-4 font-garamond">
            {renderInlineMarkdown(line.slice(5))}
          </h4>
        );
      }
      // Code blocks and Mermaid diagrams
      else if (line.startsWith('```')) {
        const language = line.slice(3).trim();
        const codeLines = [];
        i++; // Skip opening ```
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        
        if (language === 'mermaid') {
          // Render Mermaid diagram
          elements.push(
            <MermaidDiagram 
              key={i} 
              chart={codeLines.join('\n')} 
              id={`diagram-${i}`} 
            />
          );
        } else {
          // Regular code block
          elements.push(
            <div key={i} className="my-4">
              {language && (
                <div className="bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 rounded-t-lg border-b">
                  {language}
                </div>
              )}
              <pre className={`bg-gray-100 p-4 overflow-x-auto ${language ? 'rounded-b-lg' : 'rounded-lg'}`}>
                <code className="text-sm text-gray-800">
                  {codeLines.join('\n')}
                </code>
              </pre>
            </div>
          );
        }
      }
      // Horizontal rule
      else if (line.trim() === '---') {
        elements.push(<hr key={i} className="my-8 border-gray-300" />);
      }
      // Lists
      else if (line.startsWith('- ') || line.match(/^\d+\. /)) {
        const listItems = [];
        const isOrdered = line.match(/^\d+\. /);
        
        while (i < lines.length && (lines[i].startsWith('- ') || lines[i].match(/^\d+\. /))) {
          const itemText = lines[i].replace(/^(-|\d+\.)\s/, '');
          listItems.push(
            <li key={i} className="mb-1">
              {renderInlineMarkdown(itemText)}
            </li>
          );
          i++;
        }
        i--; // Back up one since we'll increment at the end of the loop
        
        const ListTag = isOrdered ? 'ol' : 'ul';
        const listClass = isOrdered ? 'list-decimal list-inside' : 'list-disc list-inside';
        
        elements.push(
          <ListTag key={i} className={`${listClass} mb-4 ml-4 text-gray-700 font-open-sans`}>
            {listItems}
          </ListTag>
        );
      }
      // Empty lines
      else if (line.trim() === '') {
        elements.push(<div key={i} className="mb-2" />);
      }
      // Regular paragraphs
      else if (line.trim() !== '') {
        elements.push(
          <p key={i} className="text-gray-700 mb-4 leading-relaxed font-open-sans">
            {renderInlineMarkdown(line)}
          </p>
        );
      }
      
      i++;
    }

    return elements;
  };

  const renderInlineMarkdown = (text) => {
    if (!text) return '';
    
    // Handle inline code first to protect it
    const protectedElements = [];
    text = text.replace(/`([^`]+)`/g, (match, content) => {
      const id = protectedElements.length;
      protectedElements.push({ type: 'code', content });
      return `__PROTECTED_${id}__`;
    });
    
    // Bold text with ** - be more specific
    text = text.replace(/\*\*([^*\n]+?)\*\*/g, (match, content) => {
      const id = protectedElements.length;
      protectedElements.push({ type: 'bold', content });
      return `__PROTECTED_${id}__`;
    });
    
    // Bold text with __
    text = text.replace(/__([^_\n]+?)__/g, (match, content) => {
      const id = protectedElements.length;
      protectedElements.push({ type: 'bold', content });
      return `__PROTECTED_${id}__`;
    });
    
    // Italic text with single *
    text = text.replace(/\*([^*\n]+?)\*/g, (match, content) => {
      const id = protectedElements.length;
      protectedElements.push({ type: 'italic', content });
      return `__PROTECTED_${id}__`;
    });
    
    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
      const id = protectedElements.length;
      protectedElements.push({ type: 'link', content: linkText, url });
      return `__PROTECTED_${id}__`;
    });
    
    // Restore all protected elements
    protectedElements.forEach((element, index) => {
      let replacement;
      switch (element.type) {
        case 'code':
          replacement = `<code class="bg-gray-200 px-2 py-1 rounded text-sm font-mono text-gray-800">${element.content}</code>`;
          break;
        case 'bold':
          replacement = `<strong class="font-bold text-gray-900">${element.content}</strong>`;
          break;
        case 'italic':
          replacement = `<em class="italic">${element.content}</em>`;
          break;
        case 'link':
          replacement = `<a href="${element.url}" class="text-matisse hover:text-tarawera underline">${element.content}</a>`;
          break;
        default:
          replacement = element.content;
      }
      text = text.replace(`__PROTECTED_${index}__`, replacement);
    });
    
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return (
    <div className="prose prose-lg max-w-none">
      {renderMarkdown(content)}
    </div>
  );
};

export default MarkdownRenderer;