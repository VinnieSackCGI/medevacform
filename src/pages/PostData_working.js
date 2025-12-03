import React, { useState, useMemo } from 'react';

// Extended post data based on the examples and business logic
const POST_DATA = [
  // Africa (AF) - Sample entries with new fields
  { city: 'LUANDA', country: 'ANGOLA', bureau: 'AF', region: 'Africa', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'COTONOU', country: 'BENIN', bureau: 'AF', region: 'Africa', seasonBegin: '01/11', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'OUAGADOUGOU', country: 'BURKINA FASO', bureau: 'AF', region: 'Africa', seasonBegin: '01/10', seasonEnd: '31/05', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },
  { city: 'NAIROBI', country: 'KENYA', bureau: 'AF', region: 'Africa', seasonBegin: '01/06', seasonEnd: '30/09', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'LAGOS', country: 'NIGERIA', bureau: 'AF', region: 'Africa', seasonBegin: '01/12', seasonEnd: '28/02', maxLodgingRate: 190, mieRate: 85, maxPerDiemRate: 275, effectiveDate: '2024-10-01' },

  // East Asia and Pacific (EAP) - Sample entries
  { city: 'TOKYO', country: 'JAPAN', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 225, mieRate: 105, maxPerDiemRate: 330, effectiveDate: '2024-10-01' },
  { city: 'BEIJING', country: 'CHINA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 200, mieRate: 95, maxPerDiemRate: 295, effectiveDate: '2024-10-01' },
  { city: 'SEOUL', country: 'SOUTH KOREA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/11', seasonEnd: '31/03', maxLodgingRate: 210, mieRate: 100, maxPerDiemRate: 310, effectiveDate: '2024-10-01' },
  { city: 'SINGAPORE', country: 'SINGAPORE', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/01', seasonEnd: '31/12', maxLodgingRate: 185, mieRate: 90, maxPerDiemRate: 275, effectiveDate: '2024-10-01' },

  // Europe (EUR) - Sample entries
  { city: 'LONDON', country: 'UNITED KINGDOM', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 245, mieRate: 110, maxPerDiemRate: 355, effectiveDate: '2024-10-01' },
  { city: 'PARIS', country: 'FRANCE', bureau: 'EUR', region: 'Europe', seasonBegin: '01/11', seasonEnd: '31/03', maxLodgingRate: 230, mieRate: 105, maxPerDiemRate: 335, effectiveDate: '2024-10-01' },
  { city: 'BERLIN', country: 'GERMANY', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 205, mieRate: 95, maxPerDiemRate: 300, effectiveDate: '2024-10-01' },
  { city: 'ROME', country: 'ITALY', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 220, mieRate: 100, maxPerDiemRate: 320, effectiveDate: '2024-10-01' },

  // Near East Asia (NEA) - Sample entries
  { city: 'CAIRO', country: 'EGYPT', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 155, mieRate: 75, maxPerDiemRate: 230, effectiveDate: '2024-10-01' },
  { city: 'BAGHDAD', country: 'IRAQ', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 140, mieRate: 70, maxPerDiemRate: 210, effectiveDate: '2024-10-01' },
  { city: 'RIYADH', country: 'SAUDI ARABIA', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },

  // South and Central Asia (SCA) - Sample entries
  { city: 'NEW DELHI', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'ISLAMABAD', country: 'PAKISTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },

  // Western Hemisphere (WHA) - Sample entries
  { city: 'MEXICO CITY', country: 'MEXICO', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 80, maxPerDiemRate: 245, effectiveDate: '2024-10-01' },
  { city: 'BRASILIA', country: 'BRAZIL', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 85, maxPerDiemRate: 260, effectiveDate: '2024-10-01' },
  { city: 'BUENOS AIRES', country: 'ARGENTINA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 155, mieRate: 75, maxPerDiemRate: 230, effectiveDate: '2024-10-01' }
];

const PostData = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [sortBy, setSortBy] = useState('city');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(20);

  // Get unique regions/bureaus for filter dropdown
  const regions = useMemo(() => {
    const uniqueBureaus = [...new Set(POST_DATA.map(post => post.bureau))].sort();
    return uniqueBureaus.map(bureau => {
      const regionName = POST_DATA.find(post => post.bureau === bureau)?.region || bureau;
      return { code: bureau, name: regionName };
    });
  }, []);

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = POST_DATA.filter(post => {
      const matchesSearch = !searchTerm || 
        post.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.bureau.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.region.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRegion = !selectedRegion || post.bureau === selectedRegion;
      
      return matchesSearch && matchesRegion;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedRegion, sortBy, sortOrder]);

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredAndSortedPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredAndSortedPosts.length / postsPerPage);

  // Statistics
  const stats = useMemo(() => {
    const bureauCounts = regions.map(region => ({
      bureau: region.code,
      name: region.name,
      count: POST_DATA.filter(post => post.bureau === region.code).length
    }));
    
    return {
      total: POST_DATA.length,
      bureauCounts,
      filtered: filteredAndSortedPosts.length
    };
  }, [regions, filteredAndSortedPosts.length]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getBureauColor = (bureau) => {
    const colors = {
      'AF': 'bg-red-100 text-red-800',
      'EAP': 'bg-blue-100 text-blue-800',
      'EUR': 'bg-green-100 text-green-800',
      'NEA': 'bg-yellow-100 text-yellow-800',
      'SCA': 'bg-purple-100 text-purple-800',
      'WHA': 'bg-orange-100 text-orange-800'
    };
    return colors[bureau] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Diplomatic Posts Database</h1>
        <p className="text-gray-600">
          Comprehensive database of U.S. diplomatic posts worldwide with per diem rates and travel information.
          Sample data showing {POST_DATA.length} posts across {regions.length} regional bureaus.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Posts</div>
        </div>
        {stats.bureauCounts.map(bureau => (
          <div key={bureau.bureau} className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-gray-800">{bureau.count}</div>
            <div className="text-sm text-gray-600">{bureau.bureau} - {bureau.name}</div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search posts, countries, or regions..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="md:w-48">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Regions</option>
              {regions.map(region => (
                <option key={region.code} value={region.code}>
                  {region.code} - {region.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredAndSortedPosts.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAndSortedPosts.length} posts
          </div>
        )}
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('city')}
                >
                  <div className="flex items-center space-x-1">
                    <span>City/Post</span>
                    <span>{getSortIcon('city')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('country')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Country</span>
                    <span>{getSortIcon('country')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('bureau')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Bureau</span>
                    <span>{getSortIcon('bureau')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('region')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Region</span>
                    <span>{getSortIcon('region')}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Season Begin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Season End
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Lodging ($)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  M&IE Rate ($)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Per Diem ($)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Effective Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPosts.map((post, index) => (
                <tr key={`${post.city}-${post.country}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{post.city}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{post.country}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBureauColor(post.bureau)}`}>
                      {post.bureau}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{post.region}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{post.seasonBegin || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{post.seasonEnd || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${post.maxLodgingRate || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${post.mieRate || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${post.maxPerDiemRate || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{post.effectiveDate || 'N/A'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstPost + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastPost, filteredAndSortedPosts.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredAndSortedPosts.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Regional Bureau Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-4 h-4 bg-red-100 border border-red-200 rounded"></span>
            <span><strong>AF:</strong> Africa</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-4 h-4 bg-blue-100 border border-blue-200 rounded"></span>
            <span><strong>EAP:</strong> East Asia Pacific</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-4 h-4 bg-green-100 border border-green-200 rounded"></span>
            <span><strong>EUR:</strong> Europe</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></span>
            <span><strong>NEA:</strong> Near East Asia</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-4 h-4 bg-purple-100 border border-purple-200 rounded"></span>
            <span><strong>SCA:</strong> South Central Asia</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-4 h-4 bg-orange-100 border border-orange-200 rounded"></span>
            <span><strong>WHA:</strong> Western Hemisphere</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility functions for exporting post data
export const getAlphabeticalPostList = () => {
  return [...POST_DATA]
    .sort((a, b) => a.city.localeCompare(b.city))
    .map(post => post.city);
};

export const getAlphabeticalPostObjects = () => {
  return [...POST_DATA].sort((a, b) => a.city.localeCompare(b.city));
};

export const getRegionFromPostCity = (homePost) => {
  const post = POST_DATA.find(p => p.city.toUpperCase() === homePost?.toUpperCase());
  return post?.bureau || 'Unknown';
};

export const getPostsByRegion = (bureauCode) => {
  return POST_DATA
    .filter(post => post.bureau === bureauCode)
    .sort((a, b) => a.city.localeCompare(b.city));
};

export const getAllRegions = () => {
  const uniqueBureaus = [...new Set(POST_DATA.map(post => post.bureau))].sort();
  return uniqueBureaus.map(bureau => {
    const regionName = POST_DATA.find(post => post.bureau === bureau)?.region || bureau;
    return { code: bureau, name: regionName };
  });
};

// Export the complete post data array as well
export { POST_DATA };

export default PostData;