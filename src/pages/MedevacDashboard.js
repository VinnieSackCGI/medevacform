import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import MedevacWorldMap from "../components/MedevacWorldMap";
import MedevacService from "../services/MedevacService";
import { useAuth } from "../contexts/AuthContext";
import { 
  BarChart3, 
  Globe, 
  TrendingUp, 
  Users, 
  DollarSign, 
  MapPin,
  Plane,
  Heart,
  Filter,
  Download,
  RefreshCw,
  ChevronUp
} from "lucide-react";

const MedevacDashboard = () => {
  const { user } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedTimeframe, setSelectedTimeframe] = useState("2025");
  const [medevacData, setMedevacData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Load real MEDEVAC data from API
  useEffect(() => {
    const loadMedevacs = async () => {
      try {
        setLoading(true);
        const response = await MedevacService.getAllSubmissions();
        
        console.log('API Response:', response);
        
        // Transform API data to match dashboard format
        const transformedData = (response.submissions || []).map(sub => {
          // Calculate total obligation from form data
          const totalObligation = sub.totalObligation || 
                                 sub.initialFundingTotal || 
                                 sub.extensionFundingTotal || 
                                 0;
          
          return {
            id: sub.obligationNumber || sub.id,
            patientName: sub.patientName || 'Unnamed Patient',
            agencyType: sub.agencyType || 'N/A',
            region: sub.region || 'N/A',
            homePost: sub.homePost || '',
            medevacLocation: sub.initialMedevacLocation || sub.currentMedevacLocation || '',
            route: sub.route || 'N/A',
            travelerType: sub.travelerType || 'N/A',
            totalObligation: totalObligation,
            status: sub.status || 'Pending',
            startDate: sub.initialStartDate || sub.createdAt,
            endDate: sub.initialEndDate || '',
            caseType: sub.medevacType || 'MEDICAL',
            numberOfTravelers: 1,
            costPerTraveler: totalObligation
          };
        });
        
        console.log('Transformed data:', transformedData);
        
        setMedevacData(transformedData);
        setFilteredData(transformedData);
      } catch (error) {
        console.error('Error loading MEDEVACs:', error);
        setMedevacData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadMedevacs();
  }, []);

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

  // Filter data based on selections
  useEffect(() => {
    let filtered = medevacData;
    if (selectedRegion !== "All") {
      filtered = filtered.filter(item => item.region === selectedRegion);
    }
    setFilteredData(filtered);
  }, [selectedRegion, selectedTimeframe, medevacData]);

  // Calculate summary statistics from real data
  const totalCases = filteredData.length;
  const totalFunding = filteredData.reduce((sum, item) => sum + (item.totalObligation || 0), 0);
  const avgCostPerCase = totalCases > 0 ? totalFunding / totalCases : 0;
  const avgCostPerTraveler = filteredData.reduce((sum, item) => sum + (item.costPerTraveler || 0), 0) / (totalCases || 1);

  // Group data by region
  const fundingByRegion = filteredData.reduce((acc, item) => {
    if (item.region && item.region !== 'N/A') {
      acc[item.region] = (acc[item.region] || 0) + (item.totalObligation || 0);
    }
    return acc;
  }, {});

  // Group data by post
  const fundingByPost = filteredData.reduce((acc, item) => {
    if (item.homePost) {
      acc[item.homePost] = (acc[item.homePost] || 0) + (item.totalObligation || 0);
    }
    return acc;
  }, {});

  // Group data by case type
  const casesByType = filteredData.reduce((acc, item) => {
    if (item.caseType) {
      acc[item.caseType] = (acc[item.caseType] || 0) + 1;
    }
    return acc;
  }, {});

  // Calculate cost breakdown by traveler type
  const costByTravelerType = filteredData.reduce((acc, item) => {
    const type = item.travelerType || 'Unknown';
    if (!acc[type]) {
      acc[type] = { total: 0, count: 0 };
    }
    acc[type].total += (item.totalObligation || 0);
    acc[type].count += 1;
    return acc;
  }, {});

  // Generate world map data from real submissions
  const medevacRoutes = filteredData
    .filter(item => item.homePost && item.medevacLocation)
    .map(item => ({
      from: item.homePost,
      to: item.medevacLocation,
      cost: item.totalObligation || 0,
      region: item.region || 'N/A'
    }));

  const regions = {
    "AF": "Africa",
    "EAP": "East Asia Pacific", 
    "EUR": "Europe",
    "NEA": "Near East Asia",
    "SCA": "South Central Asia",
    "WHA": "Western Hemisphere"
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-matisse mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">MEDEVAC Analytics Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive medical evacuation data and insights</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-matisse focus:border-matisse"
              >
                <option value="All">All Regions</option>
                {Object.entries(regions).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>

              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-matisse focus:border-matisse"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="All">All Time</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Cases</p>
                  <p className="text-3xl font-bold mt-2">{totalCases}</p>
                </div>
                <Heart className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Funding</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(totalFunding)}</p>
                </div>
                <DollarSign className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Avg Cost/Case</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(avgCostPerCase)}</p>
                </div>
                <TrendingUp className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Avg Cost/Traveler</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(avgCostPerTraveler)}</p>
                </div>
                <Users className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funding by Region */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Total MEDEVAC Funding by Origin Region
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(fundingByRegion)
                  .sort((a, b) => b[1] - a[1])
                  .map(([region, amount]) => {
                    const percentage = totalFunding > 0 ? (amount / totalFunding) * 100 : 0;
                    return (
                      <div key={region}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{regions[region] || region}</span>
                          <span className="text-muted-foreground">{formatCurrency(amount)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-matisse h-2.5 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                {Object.keys(fundingByRegion).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No data available for selected filters
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cases by Medical Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Cases by Medical Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(casesByType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => {
                    const percentage = totalCases > 0 ? (count / totalCases) * 100 : 0;
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{type}</span>
                            <span className="text-muted-foreground">{count} cases</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-green-500 h-2.5 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {Object.keys(casesByType).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No data available for selected filters
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funding by Post */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Total Funding by Diplomatic Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {Object.entries(fundingByPost)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([post, amount]) => (
                    <div key={post} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="font-medium text-sm">{post.toUpperCase()}</span>
                      <span className="text-sm text-muted-foreground">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                {Object.keys(fundingByPost).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No data available for selected filters
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Average Cost by Traveler Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Average Cost by Traveler Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(costByTravelerType)
                  .filter(([type]) => type !== 'Unknown' && type !== 'N/A')
                  .map(([type, data]) => {
                    const avgCost = data.count > 0 ? data.total / data.count : 0;
                    const typeLabel = {
                      'EMP': 'Employee',
                      'EFM': 'Eligible Family Member',
                      'DEP': 'Dependent'
                    }[type] || type;
                    
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{typeLabel}</span>
                          <span className="text-sm text-muted-foreground">{data.count} cases</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-green-600">{formatCurrency(avgCost)}</span>
                          <span className="text-xs text-muted-foreground">Average per case</span>
                        </div>
                      </div>
                    );
                  })}
                {Object.keys(costByTravelerType).filter(k => k !== 'Unknown' && k !== 'N/A').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No data available for selected filters
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* World Map */}
        {medevacRoutes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                MEDEVAC Routes & Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MedevacWorldMap routes={medevacRoutes} cases={filteredData} />
            </CardContent>
          </Card>
        )}

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 bg-matisse hover:bg-black-pearl text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-matisse focus:ring-offset-2"
            aria-label="Scroll to top"
          >
            <ChevronUp className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MedevacDashboard;
