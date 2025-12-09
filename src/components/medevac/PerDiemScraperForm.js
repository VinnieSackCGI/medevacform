import React, { useState } from 'react';
import { Search, DollarSign, MapPin, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const PerDiemScraperForm = () => {
  const [pCode, setPCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pCode.trim()) {
      setError('Please enter a valid P-Code');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Call the Azure Function scraper API
      const response = await fetch(`/api/scraper/${pCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const newResult = {
          ...data,
          searchedPCode: pCode
        };
        
        setResult(newResult);
        
        // Add to history
        setHistory(prev => [newResult, ...prev.slice(0, 9)]); // Keep last 10
        
        // Clear any previous errors
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch per diem data');
      }
    } catch (err) {
      console.error('Scraper error:', err);
      
      // Provide fallback mock data if API server is not available
      if (err.message.includes('Failed to fetch') || err.message.includes('Network error')) {
        console.log('API server unavailable, providing demo data');
        const mockData = {
          success: true,
          country: 'AUSTRIA',
          post: 'Linz',
          lodging: 128,
          mie: 75,
          total: 203,
          responseTime: 0,
          source: 'demo-data',
          searchedPCode: pCode,
          note: 'Demo data - API server unavailable'
        };
        
        setResult(mockData);
        setHistory(prev => [mockData, ...prev.slice(0, 9)]);
        setError('⚠️ Using demo data - Per Diem API server is not running. Start the server with "npm run perdiem-api" to get real data.');
      } else {
        setError(`Network error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
    setPCode('');
  };

  const samplePCodes = [
    { code: '11410', location: 'Austria, Linz' },
    { code: '10106', location: 'Austria, Vienna' },
    { code: '12301', location: 'Germany, Frankfurt' },
    { code: '17201', location: 'United Kingdom, London' },
    { code: '95710', location: 'Afghanistan, Other' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Per Diem Scraper
        </h1>
        <p className="text-gray-600">
          Lookup official US State Department per diem rates using location P-Codes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Search Form */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="pcode" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter P-Code (Location Code)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="pcode"
                    value={pCode}
                    onChange={(e) => setPCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 5-digit P-Code (e.g., 11410)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={5}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || !pCode.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  {loading ? 'Searching...' : 'Lookup Per Diem'}
                </button>
                
                <button
                  type="button"
                  onClick={clearResults}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </form>

            {/* Sample P-Codes */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Try these sample P-Codes:</p>
              <div className="flex flex-wrap gap-2">
                {samplePCodes.map((sample) => (
                  <button
                    key={sample.code}
                    onClick={() => setPCode(sample.code)}
                    className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    disabled={loading}
                  >
                    {sample.code} - {sample.location}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-800 font-medium">Error</p>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">
                  Per Diem Data Found
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Location</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {result.country} - {result.post}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">P-Code</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {result.pcode || result.searchedPCode}
                    </p>
                  </div>

                  {result.responseTime && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Response Time</p>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <p className="text-sm text-gray-700">{result.responseTime}ms</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-medium text-gray-600">Lodging Rate</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(result.lodging || result.maxLodging || 0)}
                  </p>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">M&IE Rate</p>
                    <p className="text-xl font-semibold text-gray-800">
                      {formatCurrency(result.mie || result.mieRate || 0)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Per Diem</p>
                    <p className="text-xl font-semibold text-blue-700">
                      {formatCurrency(result.total || result.maxPerDiem || (result.lodging + result.mie) || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {result.source && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-xs text-green-700">
                    Source: {result.source} • Confidence: {result.confidence ? `${Math.round(result.confidence * 100)}%` : 'N/A'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* History Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Lookups</h3>
            
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent searches</p>
            ) : (
              <div className="space-y-3">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-3 border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors"
                    onClick={() => {
                      setPCode(item.searchedPCode);
                      setResult(item);
                      setError(null);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-sm text-gray-800">
                        {item.country} - {item.post}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.searchedPCode}
                      </p>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-semibold text-green-700">
                        {formatCurrency(item.total || item.maxPerDiem || 0)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="bg-blue-50 rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-blue-800 mb-2">About P-Codes</h4>
            <p className="text-sm text-blue-700 mb-3">
              P-Codes are 5-digit location identifiers used by the US State Department 
              to specify per diem rates for official travel.
            </p>
            <div className="text-xs text-blue-600">
              <p>• Data sourced from allowances.state.gov</p>
              <p>• Rates updated regularly by State Dept</p>
              <p>• Includes lodging and meals & incidentals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerDiemScraperForm;