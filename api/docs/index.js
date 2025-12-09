const fs = require('fs').promises;
const path = require('path');

// Documentation files mapping
const documentFiles = {
  // Documentation files
  'ai-use-case': { folder: 'documentation', file: 'AI_Use_Case_One_Pager.md' },
  'azure-architecture': { folder: 'documentation', file: 'AZURE_ARCHITECTURE.md' },
  'azure-deployment': { folder: 'documentation', file: 'AZURE_DEPLOYMENT_GUIDE.md' },
  'authentication': { folder: 'documentation', file: 'AUTHENTICATION_SYSTEM.md' },
  'project-overview': { folder: 'documentation', file: 'PROJECT_OVERVIEW.md' },
  'project-status': { folder: 'documentation', file: 'PROJECT-STATUS.md' },
  'readme': { folder: 'documentation', file: 'README.md' },
  'vp-summary': { folder: 'documentation', file: 'VP_Executive_Summary.md' },
  // Model files
  'component-diagram': { folder: 'models', file: 'MEDEVAC_ComponentDiagram.md' },
  'data-flow': { folder: 'models', file: 'MEDEVAC_DataFlow.md' },
  'erd': { folder: 'models', file: 'MEDEVAC_ERD.md' },
  'azure-dataflow': { folder: 'models', file: 'AZURE_DATAFLOW_MODEL.md' },
  'azure-environment': { folder: 'models', file: 'AZURE_ENVIRONMENT_MODEL.md' }
};

async function listDocuments() {
  const documents = [];
  const basePath = path.join(__dirname, '../docs-content');
  
  for (const [id, fileInfo] of Object.entries(documentFiles)) {
    const filePath = path.join(basePath, fileInfo.folder, fileInfo.file);
    
    try {
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Extract title from first line if it starts with #
      const lines = content.split('\n');
      const title = lines.find(line => line.startsWith('#'))?.replace(/^#+\s*/, '') || fileInfo.file;
      
      documents.push({
        id,
        filename: fileInfo.file,
        title,
        size: stats.size,
        modified: stats.mtime,
        type: path.extname(fileInfo.file).slice(1) || 'txt',
        category: fileInfo.folder
      });
    } catch (error) {
      console.warn(`Could not read file ${fileInfo.file}:`, error.message);
    }
  }
  
  return documents;
}

async function getDocument(id, rawMode = false) {
  const fileInfo = documentFiles[id];
  
  if (!fileInfo) {
    throw new Error('Document not found');
  }
  
  const basePath = path.join(__dirname, '../docs-content');
  const filePath = path.join(basePath, fileInfo.folder, fileInfo.file);
  
  const content = await fs.readFile(filePath, 'utf8');
  const stats = await fs.stat(filePath);
  
  if (rawMode) {
    return {
      content,
      filename: fileInfo.file
    };
  }
  
  return {
    id,
    filename: fileInfo.file,
    content,
    size: stats.size,
    modified: stats.mtime,
    type: path.extname(fileInfo.file).slice(1) || 'txt',
    category: fileInfo.folder
  };
}

module.exports = async function (context, req) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    context.res = {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    };
    return;
  }

  try {
    const docId = req.params.id;
    const rawMode = req.params.raw === 'raw' || req.query.raw === 'true';

    // If no document ID, list all documents
    if (!docId) {
      const documents = await listDocuments();
      
      context.res = {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        body: {
          success: true,
          documents,
          count: documents.length
        }
      };
      return;
    }

    // Get specific document
    const document = await getDocument(docId, rawMode);

    if (rawMode) {
      // Return raw content for download
      context.res = {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "text/markdown",
          "Content-Disposition": `attachment; filename="${document.filename}"`
        },
        body: document.content
      };
    } else {
      // Return JSON response
      context.res = {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        body: {
          success: true,
          document
        }
      };
    }

  } catch (error) {
    context.log.error('Documentation API error:', error);
    
    const status = error.message === 'Document not found' ? 404 : 500;
    
    context.res = {
      status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: {
        success: false,
        error: error.message || 'Failed to process request'
      }
    };
  }
};
