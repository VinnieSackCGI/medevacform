const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;

// Configuration for scraper refinements
const SCRAPER_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 2000,
  rateLimitDelay: 1000,
  cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ]
};

// In-memory cache
let dataCache = {
  data: null,
  timestamp: null,
  attempts: 0,
  lastError: null
};

// Enable CORS for React app
app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use(express.json());

// Serve dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getRandomUserAgent = () => {
  return SCRAPER_CONFIG.userAgents[Math.floor(Math.random() * SCRAPER_CONFIG.userAgents.length)];
};

const makeHttpsRequest = async (options, attempt = 1) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ data, statusCode: res.statusCode, headers: res.headers });
        } else if (res.statusCode === 429) { // Rate limited
          reject(new Error(`Rate limited - attempt ${attempt}`));
        } else {
          reject(new Error(`HTTP error! status: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(SCRAPER_CONFIG.timeout, () => {
      req.abort();
      reject(new Error(`Request timeout after ${SCRAPER_CONFIG.timeout}ms`));
    });
    
    req.end();
  });
};

// Make HTTPS POST request with data
const makeHttpsRequestWithData = async (options, postData, attempt = 1) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ data, statusCode: res.statusCode, headers: res.headers });
        } else if (res.statusCode === 429) { // Rate limited
          reject(new Error(`Rate limited - attempt ${attempt}`));
        } else {
          reject(new Error(`HTTP error! status: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(SCRAPER_CONFIG.timeout, () => {
      req.abort();
      reject(new Error(`Request timeout after ${SCRAPER_CONFIG.timeout}ms`));
    });
    
    // Write the POST data
    req.write(postData);
    req.end();
  });
};

// New function to scrape specific location by code with proper session handling
const scrapeLocationByCode = async (locationCode, attempt = 1) => {
  try {
    console.log(`🎯 Scraping location ${locationCode} (attempt ${attempt})...`);
    
    // Step 1: Follow the redirect with location code to set up session
    const redirectUrl = `https://allowances.state.gov/web920/LinkRedirect.asp?PCode=${locationCode}&Dest=per_diem_action`;
    console.log(`📍 Step 1: Following redirect: ${redirectUrl}`);
    
    const redirectOptions = {
      hostname: 'allowances.state.gov',
      path: `/web920/LinkRedirect.asp?PCode=${locationCode}&Dest=per_diem_action`,
      method: 'GET',
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive'
      }
    };

    const redirectResponse = await makeHttpsRequest(redirectOptions, attempt);
    
    // Extract cookies from redirect response
    const cookies = redirectResponse.headers['set-cookie'];
    const cookieHeader = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';
    console.log(`🍪 Session cookies: ${cookieHeader || 'none'}`);
    
    // Step 2: GET the form page with session cookies
    const formUrl = '/web920/per_diem_action.asp';
    console.log(`📋 Step 2: Getting form with session: ${formUrl}`);
    
    const formOptions = {
      hostname: 'allowances.state.gov',
      path: formUrl,
      method: 'GET',
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        ...(cookieHeader ? { 'Cookie': cookieHeader } : {})
      }
    };
    
    const formResponse = await makeHttpsRequest(formOptions, attempt);
    const formHtml = formResponse.data;
    
    console.log(`📄 Form response: ${formHtml.length} characters`);
    
    // Step 3: Extract populated hidden fields
    const $ = cheerio.load(formHtml);
    const menuHide = $('input[name="MenuHide"]').val() || '1';
    const countryCode = $('input[name="CountryCode"]').val();
    const postCode = $('input[name="PostCode"]').val();
    
    console.log(`📋 Extracted form data: MenuHide=${menuHide}, CountryCode=${countryCode}, PostCode=${postCode}`);
    
    if (!countryCode || !postCode) {
      throw new Error(`Form fields not populated - CountryCode: ${countryCode}, PostCode: ${postCode}`);
    }
    
    // Step 4: POST form data to get per diem table
    const postData = `MenuHide=${menuHide}&CountryCode=${countryCode}&PostCode=${postCode}&PublicationDate=20251101`;
    
    console.log(`🚀 Step 3: Posting form data to get results...`);
    
    const postOptions = {
      hostname: 'allowances.state.gov',
      path: '/web920/per_diem_action.asp',
      method: 'POST',
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Connection': 'keep-alive',
        'Referer': `https://allowances.state.gov${formUrl}`,
        ...(cookieHeader ? { 'Cookie': cookieHeader } : {})
      }
    };

    const dataResponse = await makeHttpsRequestWithData(postOptions, postData, attempt);
    const dataHtml = dataResponse.data;
    
    console.log(`📄 Data response: ${dataHtml.length} characters`);
    
    return await parseLocationSpecificHTML(dataHtml, locationCode);
    
  } catch (error) {
    console.log(`❌ Scraping attempt ${attempt} failed:`, error.message);
    throw error;
  }
};

// Parse HTML from location-specific per diem page
const parseLocationSpecificHTML = async (html, locationCode) => {
  const $ = cheerio.load(html);
  const perDiemData = [];
  
  console.log(`🔍 Parsing location-specific data for code ${locationCode}`);
  console.log(`📄 HTML length: ${html.length} characters`);
  
  // Check for error messages first
  const errorText = $('p[style*="color: red"]').text();
  if (errorText && errorText.includes('Error')) {
    console.log(`❌ State Department error: ${errorText}`);
    return [];
  }
  
  // Look for per diem table on the redirected page
  const tables = $('table');
  console.log(`📊 Found ${tables.length} tables to analyze`);
  
  let foundDataTable = false;
  
  tables.each((tableIndex, table) => {
    const rows = $(table).find('tr');
    console.log(`📋 Table ${tableIndex}: ${rows.length} rows found`);
    
    // Look for the specific per diem table with standard headers
    const firstRow = $(rows[0]);
    const headerCells = firstRow.find('th, td');
    
    if (headerCells.length > 0) {
      const headerTexts = [];
      headerCells.each((i, cell) => {
        headerTexts.push($(cell).text().trim());
      });
      
      console.log(`📋 Table ${tableIndex} headers/first row: [${headerTexts.join(' | ')}]`);
      
      // Check if this is the main per diem data table (should have specific headers)
      const hasStandardHeaders = (
        headerTexts.some(h => h.toLowerCase().includes('country')) &&
        headerTexts.some(h => h.toLowerCase().includes('post')) &&
        headerTexts.some(h => h.toLowerCase().includes('lodging')) &&
        headerTexts.some(h => h.toLowerCase().includes('per diem'))
      );
      
      if (hasStandardHeaders) {
        console.log(`✅ Found standard per diem data table at index ${tableIndex}`);
        foundDataTable = true;
        
        // Process all rows in this table (skip header row)
        rows.each((rowIndex, row) => {
          if (rowIndex === 0) return; // Skip header row
          
          const cells = $(row).find('td');
          
          if (cells.length >= 7) { // Need at least 7 columns for standard format
            const cellTexts = [];
            cells.each((i, cell) => {
              cellTexts.push($(cell).text().trim());
            });
            
            console.log(`📋 Table ${tableIndex}, Row ${rowIndex}: [${cellTexts.join(' | ')}]`);
            
            // Parse State Department standard format
            const country = cleanText(cellTexts[0]);
            const post = cleanText(cellTexts[1]);
            const seasonBegin = cleanText(cellTexts[2]);
            const seasonEnd = cleanText(cellTexts[3]);
            const maxLodging = parseNumber(cellTexts[4]);
            const mieRate = parseNumber(cellTexts[5]);
            const maxPerDiem = parseNumber(cellTexts[6]);
            const footnote = cellTexts.length > 7 ? cleanText(cellTexts[7]) : '';
            const effectiveDate = cellTexts.length > 8 ? cleanText(cellTexts[8]) : '';
            
            // Validate we have meaningful data
            if (country && post && country.length > 1 && post.length > 1) {
              console.log(`✅ Parsed ${country} - ${post}: Lodging $${maxLodging}, M&IE $${mieRate}, Total $${maxPerDiem}`);
              
              perDiemData.push({
                location: `${country} - ${post}`,
                city: post.toUpperCase(),
                country: country.toUpperCase(),
                maxLodgingRate: maxLodging,
                mieRate: mieRate,
                perDiemRate: maxPerDiem > 0 ? maxPerDiem : maxLodging + mieRate,
                locationCode: locationCode,
                seasonBegin: seasonBegin,
                seasonEnd: seasonEnd,
                footnote: footnote,
                effectiveDate: effectiveDate,
                parseStrategy: 'state-dept-standard',
                tableIndex: tableIndex,
                rowIndex: rowIndex,
                confidence: 0.98
              });
            }
          }
        });
      }
    }
  });
  
  console.log(`✅ Successfully parsed ${perDiemData.length} entries for location code ${locationCode}`);
  
  // If no data found, provide more detailed debugging
  if (perDiemData.length === 0) {
    console.log(`❌ No per diem data found for location code ${locationCode}`);
    console.log(`🔍 Found data table: ${foundDataTable}`);
    console.log(`🔍 First 1000 chars of HTML: ${html.substring(0, 1000)}...`);
    
    // Look for any text that might contain the location
    const bodyText = $('body').text();
    if (bodyText.toLowerCase().includes('austria') || bodyText.toLowerCase().includes('linz')) {
      console.log(`✅ Found location text in HTML body`);
    } else {
      console.log(`❌ No location text found in HTML body`);
    }
  }
  
  return perDiemData;
};

// Parse individual location row with location code context - enhanced for State Dept table format
const tryParseLocationRow = (cells, locationCode, rowIndex) => {
  if (cells.length < 3) return null;
  
  console.log(`🔍 Row ${rowIndex} (${cells.length} cells): [${cells.join(' | ')}]`);
  
  // Skip header rows more aggressively
  const firstCell = cells[0] ? cells[0].toLowerCase() : '';
  if (firstCell.includes('country') || firstCell.includes('post') || 
      firstCell.includes('season') || firstCell.includes('lodging') ||
      firstCell.includes('maximum') || firstCell.includes('effective') ||
      firstCell === '' || cells.every(cell => !cell || cell.trim() === '')) {
    console.log(`🔍 Row ${rowIndex}: Skipped header/empty row`);
    return null;
  }
  
  // State Department table format based on screenshot:
  // Country | Post | Season Begin | Season End | Max Lodging Rate | M & IE Rate | Max Per Diem Rate | Footnote | Effective Date
  if (cells.length >= 7) {
    const country = cleanText(cells[0]);
    const post = cleanText(cells[1]);
    const seasonBegin = cleanText(cells[2]);
    const seasonEnd = cleanText(cells[3]);
    const lodging = parseNumber(cells[4]);
    const mie = parseNumber(cells[5]);
    const perDiem = parseNumber(cells[6]);
    const footnote = cells.length > 7 ? cleanText(cells[7]) : '';
    const effectiveDate = cells.length > 8 ? cleanText(cells[8]) : '';
    
    console.log(`🔍 Row ${rowIndex}: Parsed values - Country: "${country}", Post: "${post}", Lodging: ${lodging}, M&IE: ${mie}, PerDiem: ${perDiem}`);
    
    // More lenient check - just need country and post, rates can be 0
    if (country && post && country.length > 1 && post.length > 1) {
      console.log(`✅ Row ${rowIndex}: State Dept data found: ${country} - ${post}, Lodging: $${lodging}, M&IE: $${mie}, Total: $${perDiem}`);
      
      return {
        city: post.toUpperCase(),
        country: country.toUpperCase(),
        maxLodgingRate: lodging,
        mieRate: mie,
        maxPerDiemRate: perDiem > 0 ? perDiem : lodging + mie,
        locationCode: locationCode,
        seasonBegin: seasonBegin,
        seasonEnd: seasonEnd,
        footnote: footnote,
        effectiveDate: effectiveDate,
        parseStrategy: 'state-dept-standard-table',
        sourceRow: rowIndex,
        confidence: 0.98, // Very high confidence for official State Dept format
        rawCells: cells // Keep raw data for debugging
      };
    } else {
      console.log(`❌ Row ${rowIndex}: Missing required data - Country: "${country}" (${country ? country.length : 0} chars), Post: "${post}" (${post ? post.length : 0} chars)`);
    }
  }
  
  // Fallback: Try to find any location, lodging, and M&IE data
  for (let i = 0; i < cells.length - 2; i++) {
    const location = cleanText(cells[i]);
    const lodging = parseNumber(cells[i + 1]);
    const mie = parseNumber(cells[i + 2]);
    
    if (location && (lodging > 0 || mie > 0)) {
      const [city, country] = parseLocation(location);
      
      return {
        city: city.toUpperCase(),
        country: country.toUpperCase(),
        maxLodgingRate: lodging,
        mieRate: mie,
        maxPerDiemRate: lodging + mie,
        locationCode: locationCode,
        parseStrategy: `location-fallback-${locationCode}`,
        sourceRow: rowIndex,
        confidence: 0.85 // Lower confidence for fallback parsing
      };
    }
  }
  
  return null;
};

// Enhanced scraping function with retry logic and better parsing
const scrapePerDiemData = async (useCache = true) => {
  // Check cache first
  if (useCache && dataCache.data && dataCache.timestamp) {
    const cacheAge = Date.now() - dataCache.timestamp;
    if (cacheAge < SCRAPER_CONFIG.cacheExpiry) {
      console.log(`📦 Using cached data (${Math.round(cacheAge / 1000 / 60)} minutes old)`);
      return dataCache.data;
    }
  }

  let lastError = null;
  
  for (let attempt = 1; attempt <= SCRAPER_CONFIG.retryAttempts; attempt++) {
    try {
      console.log(`🌐 Scraping attempt ${attempt}/${SCRAPER_CONFIG.retryAttempts}...`);
      
      const options = {
        hostname: 'allowances.state.gov',
        path: '/web920/per_diem_action.asp',
        method: 'GET',
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      };

      const response = await makeHttpsRequest(options, attempt);
      const html = response.data;
      return await parsePerDiemHTML(html);
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt < SCRAPER_CONFIG.retryAttempts) {
        const delay = SCRAPER_CONFIG.retryDelay * attempt; // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  
  // All attempts failed
  dataCache.lastError = lastError;
  dataCache.attempts++;
  throw new Error(`All ${SCRAPER_CONFIG.retryAttempts} attempts failed. Last error: ${lastError.message}`);
};

// Enhanced HTML parsing with multiple strategies
const parsePerDiemHTML = async (html) => {
  const $ = cheerio.load(html);
  const perDiemData = [];
  let parseStrategy = 'unknown';
  
  // Strategy 1: Look for standard table with per diem data
  const tables = $('table');
  console.log(`🔍 Found ${tables.length} tables to analyze`);
  
  tables.each((tableIndex, table) => {
    const rows = $(table).find('tr');
    
    rows.each((rowIndex, row) => {
      const cells = $(row).find('td');
      
      if (cells.length >= 3) {
        const cellTexts = [];
        cells.each((i, cell) => {
          cellTexts.push($(cell).text().trim());
        });
        
        // Try different parsing strategies
        const parsed = tryParseRow(cellTexts, rowIndex, tableIndex);
        if (parsed) {
          perDiemData.push(parsed);
          parseStrategy = parsed.parseStrategy;
        }
      }
    });
  });
  
  // Strategy 2: Look for form data or JSON embedded in page
  const scriptTags = $('script');
  scriptTags.each((index, script) => {
    const scriptContent = $(script).html() || '';
    if (scriptContent.includes('per_diem') || scriptContent.includes('perdiem') || scriptContent.includes('allowances')) {
      console.log(`📜 Found potential data in script tag ${index}`);
      // Could extract JSON data here if available
    }
  });
  
  // Data validation and enrichment
  const validatedData = perDiemData
    .filter(item => item && item.city && item.country && item.maxPerDiemRate > 0)
    .map(item => ({
      ...item,
      parseStrategy,
      confidence: calculateConfidence(item),
      effectiveDate: new Date().toISOString().split('T')[0],
      source: 'state.gov',
      lastUpdated: new Date().toISOString()
    }));
  
  // Cache successful results
  if (validatedData.length > 0) {
    dataCache.data = validatedData;
    dataCache.timestamp = Date.now();
    dataCache.attempts = 0;
    
    // Save to file for persistence
    await saveCacheToFile(validatedData);
  }
  
  console.log(`✅ Successfully parsed ${validatedData.length} per diem entries using strategy: ${parseStrategy}`);
  return validatedData;
};

// Multiple parsing strategies for different table formats
const tryParseRow = (cells, rowIndex, tableIndex) => {
  if (cells.length < 3) return null;
  
  // Strategy A: City, Country, Lodging, M&IE
  if (cells.length >= 4) {
    const city = cleanText(cells[0]);
    const country = cleanText(cells[1]);
    const lodging = parseNumber(cells[2]);
    const mie = parseNumber(cells[3]);
    
    if (city && country && (lodging > 0 || mie > 0)) {
      return {
        city: city.toUpperCase(),
        country: country.toUpperCase(),
        maxLodgingRate: lodging,
        mieRate: mie,
        maxPerDiemRate: lodging + mie,
        parseStrategy: `table-${tableIndex}-4col`,
        sourceRow: rowIndex
      };
    }
  }
  
  // Strategy B: Location, Total Per Diem
  if (cells.length >= 2) {
    const location = cleanText(cells[0]);
    const total = parseNumber(cells[1]);
    
    if (location && total > 0) {
      const [city, country] = parseLocation(location);
      if (city && country) {
        return {
          city: city.toUpperCase(),
          country: country.toUpperCase(),
          maxLodgingRate: Math.round(total * 0.75), // Estimate 75% lodging
          mieRate: Math.round(total * 0.25), // Estimate 25% M&IE
          maxPerDiemRate: total,
          parseStrategy: `table-${tableIndex}-2col`,
          sourceRow: rowIndex
        };
      }
    }
  }
  
  return null;
};

// Utility functions for parsing
const cleanText = (text) => {
  return text ? text.replace(/\s+/g, ' ').trim() : '';
};

const parseNumber = (text) => {
  const cleaned = text.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

const parseLocation = (location) => {
  const parts = location.split(',');
  if (parts.length >= 2) {
    return [parts[0].trim(), parts.slice(1).join(',').trim()];
  }
  return [location, ''];
};

const calculateConfidence = (item) => {
  let confidence = 0.5; // Base confidence
  
  if (item.maxLodgingRate > 0 && item.mieRate > 0) confidence += 0.3;
  if (item.city.length > 2 && item.country.length > 2) confidence += 0.2;
  if (item.maxPerDiemRate >= 50 && item.maxPerDiemRate <= 1000) confidence += 0.2;
  
  return Math.min(confidence, 1.0);
};

// File-based caching for persistence
const saveCacheToFile = async (data) => {
  try {
    const cacheDir = path.join(__dirname, 'cache');
    await fs.mkdir(cacheDir, { recursive: true });
    
    const cacheFile = path.join(cacheDir, 'per-diem-cache.json');
    const cacheData = {
      data,
      timestamp: Date.now(),
      count: data.length
    };
    
    await fs.writeFile(cacheFile, JSON.stringify(cacheData, null, 2));
    console.log(`💾 Cached ${data.length} entries to file`);
  } catch (error) {
    console.error('Failed to save cache to file:', error);
  }
};

const loadCacheFromFile = async () => {
  try {
    const cacheFile = path.join(__dirname, 'cache', 'per-diem-cache.json');
    const cacheContent = await fs.readFile(cacheFile, 'utf8');
    const cacheData = JSON.parse(cacheContent);
    
    const age = Date.now() - cacheData.timestamp;
    if (age < SCRAPER_CONFIG.cacheExpiry) {
      console.log(`📂 Loaded ${cacheData.count} entries from file cache`);
      return cacheData.data;
    }
  } catch (error) {
    console.log('No valid file cache found');
  }
  return null;
};

// Enhanced API endpoints
app.get('/api/per-diems', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const useCache = !forceRefresh;
    
    // Try file cache first if available
    if (useCache && !dataCache.data) {
      const fileCache = await loadCacheFromFile();
      if (fileCache) {
        dataCache.data = fileCache;
        dataCache.timestamp = Date.now();
      }
    }
    
    const data = await scrapePerDiemData(useCache);
    
    res.json({
      success: true,
      data: data,
      count: data.length,
      lastUpdated: new Date().toISOString(),
      cached: useCache && dataCache.data === data,
      attempts: dataCache.attempts,
      source: 'state-department-scraper'
    });
  } catch (error) {
    // Try to return cached data if scraping fails
    const fallbackData = dataCache.data || await loadCacheFromFile();
    
    if (fallbackData) {
      res.json({
        success: true,
        data: fallbackData,
        count: fallbackData.length,
        lastUpdated: dataCache.timestamp ? new Date(dataCache.timestamp).toISOString() : 'unknown',
        cached: true,
        fallback: true,
        error: error.message,
        message: 'Using cached data due to scraping failure'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to scrape per diem data and no cache available',
        attempts: dataCache.attempts,
        lastError: dataCache.lastError?.message
      });
    }
  }
});

// Enhanced analytics endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const data = dataCache.data || await loadCacheFromFile() || [];
    
    const analytics = {
      totalPosts: data.length,
      averagePerDiem: data.length > 0 ? data.reduce((sum, item) => sum + item.maxPerDiemRate, 0) / data.length : 0,
      rateDistribution: {
        low: data.filter(item => item.maxPerDiemRate < 200).length,
        medium: data.filter(item => item.maxPerDiemRate >= 200 && item.maxPerDiemRate < 400).length,
        high: data.filter(item => item.maxPerDiemRate >= 400).length
      },
      topExpensivePosts: data
        .sort((a, b) => b.maxPerDiemRate - a.maxPerDiemRate)
        .slice(0, 10)
        .map(item => ({
          location: `${item.city}, ${item.country}`,
          rate: item.maxPerDiemRate,
          lodging: item.maxLodgingRate,
          mie: item.mieRate
        })),
      cacheStatus: {
        hasData: !!dataCache.data,
        lastUpdated: dataCache.timestamp ? new Date(dataCache.timestamp).toISOString() : null,
        failedAttempts: dataCache.attempts,
        lastError: dataCache.lastError?.message
      }
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: 'Failed to generate analytics'
    });
  }
});

// Search endpoint for specific locations
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase();
    const data = dataCache.data || await loadCacheFromFile() || [];
    
    if (!query) {
      return res.json({ results: [], count: 0, query: '' });
    }
    
    const results = data.filter(item => 
      item.city.toLowerCase().includes(query) || 
      item.country.toLowerCase().includes(query)
    );
    
    res.json({
      results,
      count: results.length,
      query,
      totalAvailable: data.length
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: 'Search failed'
    });
  }
});

// New endpoint to get per diem by location code
app.get('/api/location/:code', async (req, res) => {
  try {
    const locationCode = req.params.code;
    const fullUrl = `https://allowances.state.gov/web920/LinkRedirect.asp?PCode=${locationCode}&Dest=per_diem_action`;
    
    console.log(`🎯 Fetching per diem data for location code: ${locationCode}`);
    console.log(`🔗 Full URL: ${fullUrl}`);
    
    const data = await scrapeLocationByCode(locationCode);
    
    res.json({
      success: true,
      data: data,
      count: data.length,
      locationCode: locationCode,
      sourceUrl: fullUrl,
      lastUpdated: new Date().toISOString(),
      source: 'state-department-location-specific'
    });
  } catch (error) {
    const fullUrl = `https://allowances.state.gov/web920/LinkRedirect.asp?PCode=${req.params.code}&Dest=per_diem_action`;
    res.status(500).json({
      success: false,
      error: error.message,
      message: `Failed to fetch data for location code ${req.params.code}`,
      locationCode: req.params.code,
      sourceUrl: fullUrl
    });
  }
});

// Endpoint to get available location codes (sample data)
app.get('/api/location-codes', async (req, res) => {
  try {
    const { LOCATION_CODES_SAMPLE } = require('./locationCodes');
    
    res.json({
      success: true,
      data: LOCATION_CODES_SAMPLE,
      count: LOCATION_CODES_SAMPLE.length,
      message: 'Sample location codes - replace with full Excel data'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to load location codes'
    });
  }
});

// Batch endpoint to get multiple locations
app.post('/api/locations/batch', async (req, res) => {
  try {
    const { locationCodes } = req.body;
    
    if (!Array.isArray(locationCodes) || locationCodes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of location codes'
      });
    }
    
    console.log(`🎯 Batch fetching ${locationCodes.length} location codes`);
    
    const results = [];
    const errors = [];
    
    for (const code of locationCodes) {
      try {
        await sleep(SCRAPER_CONFIG.rateLimitDelay); // Rate limiting
        const data = await scrapeLocationByCode(code);
        results.push({
          locationCode: code,
          success: true,
          data: data,
          count: data.length
        });
      } catch (error) {
        errors.push({
          locationCode: code,
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      results: results,
      errors: errors,
      totalRequested: locationCodes.length,
      successCount: results.length,
      errorCount: errors.length,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Batch request failed'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint to check if the site is accessible
app.get('/api/test-connection', async (req, res) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'allowances.state.gov',
        path: '/web920/per_diem_action.asp',
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      };

      const req = https.request(options, (res) => {
        resolve({
          status: res.statusCode,
          accessible: res.statusCode >= 200 && res.statusCode < 300,
          contentType: res.headers['content-type']
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.setTimeout(10000, () => {
        req.abort();
        reject(new Error('Request timeout'));
      });
      
      req.end();
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      accessible: false,
      error: error.message
    });
  }
});

// Status and monitoring endpoint
app.get('/api/status', async (req, res) => {
  const data = dataCache.data || await loadCacheFromFile();
  
  res.json({
    server: 'running',
    uptime: process.uptime(),
    cache: {
      hasData: !!data,
      entryCount: data?.length || 0,
      lastUpdated: dataCache.timestamp ? new Date(dataCache.timestamp).toISOString() : null,
      cacheAge: dataCache.timestamp ? Date.now() - dataCache.timestamp : null,
      failedAttempts: dataCache.attempts
    },
    config: {
      timeout: SCRAPER_CONFIG.timeout,
      retryAttempts: SCRAPER_CONFIG.retryAttempts,
      cacheExpiry: SCRAPER_CONFIG.cacheExpiry,
      userAgents: SCRAPER_CONFIG.userAgents.length
    },
    lastError: dataCache.lastError?.message
  });
});

// Initialize cache on startup
const initializeCache = async () => {
  console.log('🚀 Initializing per diem scraper...');
  
  try {
    const fileCache = await loadCacheFromFile();
    if (fileCache) {
      dataCache.data = fileCache;
      dataCache.timestamp = Date.now();
      console.log(`📦 Loaded ${fileCache.length} entries from file cache`);
    } else {
      console.log('🌐 No cache found, will scrape on first request');
    }
  } catch (error) {
    console.log('⚠️ Failed to initialize cache:', error.message);
  }
};

app.listen(PORT, async () => {
  console.log(`🌐 Enhanced Per Diem Scraper with Location Codes running on http://localhost:${PORT}`);
  console.log('\n📋 Available Endpoints:');
  console.log('  GET /api/per-diems?refresh=true  - Get per diem data (force refresh)');
  console.log('  GET /api/location/:code          - Get specific location by code (e.g., /api/location/10323)');
  console.log('  POST /api/locations/batch        - Batch fetch multiple location codes');
  console.log('  GET /api/location-codes          - Get available location codes');
  console.log('  GET /api/analytics              - Analytics and statistics');
  console.log('  GET /api/search?q=london        - Search locations');
  console.log('  GET /api/status                 - Server status and cache info');
  console.log('  GET /api/health                 - Health check');
  console.log('  GET /api/test-connection        - Test State Dept site');
  console.log('  GET /dashboard                  - Monitoring dashboard');
  
  console.log('\n🔧 Enhanced Features:');
  console.log('  ✅ Location Code Support - Dynamic per diem by specific posts');
  console.log('  ✅ Batch Processing - Multiple locations in one request');
  console.log('  ✅ Retry logic with exponential backoff');
  console.log('  ✅ Multiple parsing strategies');
  console.log('  ✅ File-based caching for persistence');
  console.log('  ✅ Rate limiting protection');
  console.log('  ✅ Analytics and search capabilities');
  console.log('  ✅ Fallback to cached data on failures');
  
  console.log('\n🎯 Location Code Examples:');
  console.log('  Kabul (10323): http://localhost:3001/api/location/10323');
  console.log('  Linz (11410):  http://localhost:3001/api/location/11410');
  console.log('  Vienna (11400): http://localhost:3001/api/location/11400');
  
  await initializeCache();
});