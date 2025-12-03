const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Documentation files mapping
const DOCS_PATH = path.join(__dirname, '../docs/documentation');
const MODELS_PATH = path.join(__dirname, '../docs/models');

const documentFiles = {
  // Documentation files
  'ai-use-case': { path: DOCS_PATH, file: 'AI_Use_Case_One_Pager.md' },
  'azure-architecture': { path: DOCS_PATH, file: 'AZURE_ARCHITECTURE.md' },
  'project-overview': { path: DOCS_PATH, file: 'PROJECT_OVERVIEW.md' },
  'project-status': { path: DOCS_PATH, file: 'PROJECT-STATUS.md' },
  'readme': { path: DOCS_PATH, file: 'README.md' },
  // Model files
  'component-diagram': { path: MODELS_PATH, file: 'MEDEVAC_ComponentDiagram.md' },
  'data-flow': { path: MODELS_PATH, file: 'MEDEVAC_DataFlow.md' },
  'erd': { path: MODELS_PATH, file: 'MEDEVAC_ERD.md' }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'documentation-api',
    timestamp: new Date().toISOString()
  });
});

// Get list of available documents
app.get('/api/docs', async (req, res) => {
  try {
    const documents = [];
    
    for (const [id, fileInfo] of Object.entries(documentFiles)) {
      const filePath = path.join(fileInfo.path, fileInfo.file);
      
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
          type: path.extname(fileInfo.file).slice(1) || 'txt'
        });
      } catch (error) {
        console.warn(`Could not read file ${fileInfo.file}:`, error.message);
      }
    }
    
    res.json({
      success: true,
      documents,
      count: documents.length
    });
  } catch (error) {
    console.error('Error listing documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list documents'
    });
  }
});

// Get specific document content
app.get('/api/docs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fileInfo = documentFiles[id];
    
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    const filePath = path.join(fileInfo.path, fileInfo.file);
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const stats = await fs.stat(filePath);
      
      res.json({
        success: true,
        document: {
          id,
          filename: fileInfo.file,
          content,
          size: stats.size,
          modified: stats.mtime,
          type: path.extname(fileInfo.file).slice(1) || 'txt'
        }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: 'Document file not found'
      });
    }
  } catch (error) {
    console.error('Error reading document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to read document'
    });
  }
});

// Get raw document content (for downloads)
app.get('/api/docs/:id/raw', async (req, res) => {
  try {
    const { id } = req.params;
    const fileInfo = documentFiles[id];
    
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    const filePath = path.join(fileInfo.path, fileInfo.file);
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Set appropriate headers for download
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.file}"`);
      res.send(content);
    } catch (error) {
      res.status(404).json({
        success: false,
        error: 'Document file not found'
      });
    }
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download document'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`📚 Documentation API server running on port ${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET /api/docs - List all documents`);
  console.log(`   GET /api/docs/:id - Get document content`);
  console.log(`   GET /api/docs/:id/raw - Download document`);
});