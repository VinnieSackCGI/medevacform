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

// Mock MEDEVAC data
const mockMedevacData = [
  {
    id: "25100001",
    patientName: "JOHNSON, SARAH",
    agencyType: "MSG",
    region: "EUR",
    homePost: "PARIS",
    medevacLocation: "LONDON",
    route: "OCONUS",
    travelerType: "EMP",
    totalObligation: 45000,
    status: "Completed",
    startDate: "2024-01-15",
    endDate: "2024-02-28",
    caseType: "MEDICAL",
    numberOfTravelers: 1,
    costPerTraveler: 45000
  },
  {
    id: "25900002",
    patientName: "SMITH, MICHAEL",
    agencyType: "DOS",
    region: "AF",
    homePost: "NAIROBI",
    medevacLocation: "JOHANNESBURG",
    route: "OCONUS",
    travelerType: "EFM",
    totalObligation: 62000,
    status: "In Progress",
    startDate: "2024-02-10",
    endDate: "2024-04-15",
    caseType: "DENTEVAC",
    numberOfTravelers: 2,
    costPerTraveler: 31000
  },
  {
    id: "25100003",
    patientName: "DAVIS, JENNIFER",
    agencyType: "MSG",
    region: "EAP",
    homePost: "TOKYO",
    medevacLocation: "SINGAPORE",
    route: "OCONUS",
    travelerType: "DEP",
    totalObligation: 38500,
    status: "Completed",
    startDate: "2024-01-20",
    endDate: "2024-03-05",
    caseType: "MEDICAL",
    numberOfTravelers: 1,
    costPerTraveler: 38500
  },
  {
    id: "25900004",
    patientName: "WILLIAMS, ROBERT",
    agencyType: "DOS",
    region: "NEA",
    homePost: "BAGHDAD",
    medevacLocation: "DUBAI",
    route: "OCONUS",
    travelerType: "EMP",
    totalObligation: 78000,
    status: "Extension Required",
    startDate: "2024-01-05",
    endDate: "2024-05-20",
    caseType: "MEDICAL",
    numberOfTravelers: 3,
    costPerTraveler: 26000
  },
  {
    id: "25100005",
    patientName: "BROWN, LISA",
    agencyType: "MSG",
    region: "SCA",
    homePost: "ISLAMABAD",
    medevacLocation: "BANGKOK",
    route: "OCONUS",
    travelerType: "EFM",
    totalObligation: 55000,
    status: "Completed",
    startDate: "2024-02-01",
    endDate: "2024-03-30",
    caseType: "MEDICAL",
    numberOfTravelers: 2,
    costPerTraveler: 27500
  },
  {
    id: "25900006",
    patientName: "GARCIA, CARLOS",
    agencyType: "DOS",
    region: "WHA",
    homePost: "BOGOTA",
    medevacLocation: "MIAMI",
    route: "CONUS",
    travelerType: "EMP",
    totalObligation: 32000,
    status: "Initiated",
    startDate: "2024-03-10",
    endDate: "2024-04-25",
    caseType: "DENTEVAC",
    numberOfTravelers: 1,
    costPerTraveler: 32000
  },
  {
    id: "25100007",
    patientName: "TAYLOR, AMANDA",
    agencyType: "MSG",
    region: "EUR",
    homePost: "BERLIN",
    medevacLocation: "FRANKFURT",
    route: "OCONUS",
    travelerType: "DEP",
    totalObligation: 41500,
    status: "Amendment Processing",
    startDate: "2024-02-15",
    endDate: "2024-04-10",
    caseType: "MEDICAL",
    numberOfTravelers: 1,
    costPerTraveler: 41500
  },
  {
    id: "25900008",
    patientName: "MARTINEZ, JOSE",
    agencyType: "DOS",
    region: "WHA",
    homePost: "MEXICO_CITY",
    medevacLocation: "HOUSTON",
    route: "CONUS",
    travelerType: "EFM",
    totalObligation: 48000,
    status: "Completed",
    startDate: "2024-01-25",
    endDate: "2024-03-15",
    caseType: "MEDICAL",
    numberOfTravelers: 2,
    costPerTraveler: 24000
  }
];

const MedevacDashboard = () => {
  const { user } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedTimeframe, setSelectedTimeframe] = useState("2024");
  const [filteredData, setFilteredData] = useState([]);
  const [medevacData, setMedevacData] = useState([]);
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
        const transformedData = (response.submissions || []).map(sub => ({
          id: sub.obligationNumber || sub.id,
          patientName: sub.patientName || 'Unnamed Patient',
          agencyType: sub.agencyType || 'N/A',
          region: sub.region || 'N/A',
          homePost: sub.homePost || '',
          medevacLocation: sub.initialMedevacLocation || sub.currentMedevacLocation || '',
          route: sub.route || 'N/A',
          travelerType: sub.travelerType || 'N/A',
          totalObligation: sub.totalObligation || 0,
          status: sub.status || 'Pending',
          startDate: sub.initialStartDate || sub.createdAt,
          endDate: sub.initialEndDate || '',
          caseType: sub.medevacType || 'MEDICAL',
          numberOfTravelers: 1,
          costPerTraveler: sub.totalObligation || 0
        }));
        
        console.log('Transformed data:', transformedData);
        
        setMedevacData(transformedData);
        setFilteredData(transformedData);
      } catch (error) {
        console.error('Error loading MEDEVACs:', error);
        // Fallback to mock data on error
        setMedevacData(mockMedevacData);
        setFilteredData(mockMedevacData);
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

  // Calculate summary statistics
  const totalCases = filteredData.length;
  const totalFunding = filteredData.reduce((sum, item) => sum + item.totalObligation, 0);
  const avgCostPerCase = totalFunding / totalCases;
  const avgCostPerTraveler = filteredData.reduce((sum, item) => sum + item.costPerTraveler, 0) / totalCases;

  // Group data by region
  const fundingByRegion = filteredData.reduce((acc, item) => {
    acc[item.region] = (acc[item.region] || 0) + item.totalObligation;
    return acc;
  }, {});

  // Group data by post
  const fundingByPost = filteredData.reduce((acc, item) => {
    acc[item.homePost] = (acc[item.homePost] || 0) + item.totalObligation;
    return acc;
  }, {});

  // Group data by case type
  const casesByType = filteredData.reduce((acc, item) => {
    acc[item.caseType] = (acc[item.caseType] || 0) + 1;
    return acc;
  }, {});

  // Calculate cost breakdown by traveler type
  const costByTravelerType = filteredData.reduce((acc, item) => {
    if (!acc[item.travelerType]) {
      acc[item.travelerType] = { total: 0, count: 0 };
    }
    acc[item.travelerType].total += item.totalObligation;
    acc[item.travelerType].count += 1;
    return acc;
  }, {});

  // Mock world map data - showing MEDEVAC routes
  const medevacRoutes = [
    { from: "Paris", to: "London", cost: 45000, region: "EUR" },
    { from: "Nairobi", to: "Johannesburg", cost: 62000, region: "AF" },
    { from: "Tokyo", to: "Singapore", cost: 38500, region: "EAP" },
    { from: "Baghdad", to: "Dubai", cost: 78000, region: "NEA" },
    { from: "Islamabad", to: "Bangkok", cost: 55000, region: "SCA" },
    { from: "Bogota", to: "Miami", cost: 32000, region: "WHA" },
    { from: "Berlin", to: "Frankfurt", cost: 41500, region: "EUR" },
    { from: "Mexico City", to: "Houston", cost: 48000, region: "WHA" }
  ];

  const regions = {
    "AF": "Africa",
    "EAP": "East Asia Pacific", 
    "EUR": "Europe",
    "NEA": "Near East Asia",
    "SCA": "South Central Asia",
    "WHA": "Western Hemisphere"
  };

  const statusColors = {
    "Completed": "bg-green-600 text-white",
    "In Progress": "bg-matisse text-white",
    "Extension Required": "bg-gold-accent text-black-pearl",
    "Amendment Processing": "bg-smalt text-white",
    "Initiated": "bg-tarawera text-white"
  };

  // Filter data based on selections
  useEffect(() => {
    let filtered = medevacData;
    if (selectedRegion !== "All") {
      filtered = filtered.filter(item => item.region === selectedRegion);
    }
    setFilteredData(filtered);
  }, [selectedRegion, selectedTimeframe, medevacData]);

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
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <select 
                value={selectedRegion} 
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="border border-input bg-background text-foreground rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="All">All Regions</option>
                {Object.entries(regions).map(([code, name]) => (
                  <option key={code} value={code}>{code} - {name}</option>
                ))}
              </select>
              <select 
                value={selectedTimeframe} 
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="border border-input bg-background text-foreground rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="All">All Years</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-matisse to-smalt text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Total Cases</p>
                  <p className="text-3xl font-bold">{totalCases}</p>
                </div>
                <Heart className="w-10 h-10 text-white/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Total Funding</p>
                  <p className="text-3xl font-bold">${(totalFunding/1000).toFixed(0)}K</p>
                </div>
                <DollarSign className="w-10 h-10 text-white/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-black-pearl to-tarawera text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Avg Cost/Case</p>
                  <p className="text-3xl font-bold">${(avgCostPerCase/1000).toFixed(0)}K</p>
                </div>
                <TrendingUp className="w-10 h-10 text-white/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-gold-accent/90 to-yellow-500 text-black-pearl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black-pearl/70 text-sm">Avg Cost/Traveler</p>
                  <p className="text-3xl font-bold">${(avgCostPerTraveler/1000).toFixed(0)}K</p>
                </div>
                <Users className="w-10 h-10 text-black-pearl/50" />
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
                {Object.entries(fundingByRegion).map(([region, amount]) => (
                  <div key={region} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-foreground">{region} - {regions[region]}</span>
                      <span className="text-sm text-muted-foreground">${(amount/1000).toFixed(0)}K</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${(amount / Math.max(...Object.values(fundingByRegion))) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Case Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Cases by Medical Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(casesByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium text-foreground">{type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">{count}</span>
                      <span className="text-sm text-muted-foreground">cases</span>
                    </div>
                  </div>
                ))}
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
                  .sort(([,a], [,b]) => b - a)
                  .map(([post, amount]) => (
                  <div key={post} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded transition-colors">
                    <span className="text-sm font-medium text-foreground">{post.replace('_', ' ')}</span>
                    <Badge variant="secondary">${(amount/1000).toFixed(0)}K</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cost by Traveler Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Average Cost by Traveler Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(costByTravelerType).map(([type, data]) => {
                  const avgCost = data.total / data.count;
                  const typeLabels = {
                    'EMP': 'Employee',
                    'EFM': 'Eligible Family Member', 
                    'DEP': 'Dependent'
                  };
                  return (
                    <div key={type} className="p-4 border border-border rounded-lg bg-card">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-foreground">{typeLabels[type] || type}</h3>
                        <Badge variant="outline">{data.count} cases</Badge>
                      </div>
                      <div className="text-2xl font-bold text-green-600">${(avgCost/1000).toFixed(1)}K</div>
                      <div className="text-sm text-muted-foreground">Average per case</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* World Map Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Interactive MEDEVAC World Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MedevacWorldMap routes={medevacRoutes} cases={filteredData} />
            
            {/* Route Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {medevacRoutes.slice(0, 4).map((route, index) => (
                <div key={index} className="bg-card p-4 rounded-lg border border-border hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Plane className="w-4 h-4 text-primary" />
                    <Badge variant="outline" className="text-xs">{route.region}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-foreground">
                      <span className="font-medium">{route.from}</span> → <span className="font-medium">{route.to}</span>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      ${(route.cost/1000).toFixed(0)}K
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Cases Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Recent MEDEVAC Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-foreground font-medium">Case ID</th>
                    <th className="text-left p-3 text-foreground font-medium">Patient</th>
                    <th className="text-left p-3 text-foreground font-medium">Region</th>
                    <th className="text-left p-3 text-foreground font-medium">Route</th>
                    <th className="text-left p-3 text-foreground font-medium">Status</th>
                    <th className="text-left p-3 text-foreground font-medium">Cost</th>
                    <th className="text-left p-3 text-foreground font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 8).map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-3 font-mono text-primary">{item.id}</td>
                      <td className="p-3 text-foreground">{item.patientName}</td>
                      <td className="p-3">
                        <Badge variant="outline">{item.region}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="text-xs text-muted-foreground">
                          {item.homePost} → {item.medevacLocation}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={statusColors[item.status] || "bg-muted text-muted-foreground"}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-3 font-semibold text-foreground">${item.totalObligation.toLocaleString()}</td>
                      <td className="p-3 text-foreground">{item.caseType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
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

export default MedevacDashboard;