import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Download, Search, Filter, Eye, Edit, Trash2, ChevronUp } from "lucide-react";

// Sample data for the database view
const SAMPLE_MEDEVAC_DATA = [
  {
    id: "MED-2025-001",
    traveler: "John Smith",
    origin: "Embassy Nairobi",
    destination: "London, UK",
    tripType: "Foreign",
    departDate: "2025-01-15",
    returnDate: "2025-01-18",
    lodgingRate: 300,
    mieRate: 180,
    attendant: true,
    attendantDays: 3,
    totalCost: 2340.00,
    status: "Approved",
    createdDate: "2025-01-10",
    submittedBy: "Medical Officer"
  },
  {
    id: "MED-2025-002",
    traveler: "Jane Doe",
    origin: "Embassy Abuja",
    destination: "Washington, DC, USA",
    tripType: "US",
    departDate: "2025-01-20",
    returnDate: "2025-01-25",
    lodgingRate: 258,
    mieRate: 79,
    attendant: false,
    attendantDays: 0,
    totalCost: 1685.50,
    status: "Pending",
    createdDate: "2025-01-18",
    submittedBy: "Regional Medical Officer"
  },
  {
    id: "MED-2025-003",
    traveler: "Michael Johnson",
    origin: "Consulate Frankfurt",
    destination: "Frankfurt, Germany",
    tripType: "Foreign",
    departDate: "2025-02-01",
    returnDate: "2025-02-03",
    lodgingRate: 260,
    mieRate: 158,
    attendant: true,
    attendantDays: 2,
    totalCost: 1420.00,
    status: "In Review",
    createdDate: "2025-01-28",
    submittedBy: "Medical Officer"
  }
];

export default function DatabaseView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdDate");
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

  // Filter and sort the data
  const filteredData = SAMPLE_MEDEVAC_DATA
    .filter(item => {
      const matchesSearch = 
        item.traveler.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      // Default to descending order (newest first)
      return aValue < bValue ? 1 : -1;
    });

  const getStatusBadge = (status) => {
    const statusClasses = {
      "Approved": "bg-green-600 text-white",
      "Pending": "bg-gold-accent text-black-pearl",
      "In Review": "bg-matisse text-white",
      "Rejected": "bg-alizarin-crimson text-white"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClasses[status] || 'bg-muted text-muted-foreground'}`}>
        {status}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString(undefined, { style: "currency", currency: "USD" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-l-4 border-primary pl-6 bg-card rounded-r-lg shadow-sm py-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Medevac Database
        </h1>
        <p className="text-lg text-primary mb-2 font-medium">
          Complete Medical Evacuation Records
        </p>
        <p className="text-sm text-muted-foreground">
          View, search, and manage all medical evacuation per diem entries.
        </p>
      </div>

      {/* Filters and Controls */}
      <Card className="shadow-lg border-t-4 border-primary">
        <CardHeader className="bg-gradient-to-r from-primary/80 to-primary text-primary-foreground">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by traveler, location, or ID..."
                  className="pl-10 border-2 border-input focus:border-primary focus:ring-ring/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-2 border-input focus:border-primary focus:ring-ring/20">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in review">In Review</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-2 border-input focus:border-primary focus:ring-ring/20">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdDate">Date Created</SelectItem>
                  <SelectItem value="departDate">Departure Date</SelectItem>
                  <SelectItem value="traveler">Traveler Name</SelectItem>
                  <SelectItem value="totalCost">Total Cost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredData.length} of {SAMPLE_MEDEVAC_DATA.length} entries
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className="text-left p-4 font-semibold">ID</th>
                  <th className="text-left p-4 font-semibold">Traveler</th>
                  <th className="text-left p-4 font-semibold">Origin</th>
                  <th className="text-left p-4 font-semibold">Destination</th>
                  <th className="text-left p-4 font-semibold">Dates</th>
                  <th className="text-left p-4 font-semibold">Total Cost</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((entry, index) => (
                  <tr 
                    key={entry.id} 
                    className={`border-b border-border hover:bg-muted/50 transition-colors ${index % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm text-primary font-semibold">{entry.id}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-foreground">{entry.traveler}</div>
                        <div className="text-xs text-muted-foreground">by {entry.submittedBy}</div>
                      </div>
                    </td>
                    <td className="p-4 text-foreground">{entry.origin}</td>
                    <td className="p-4 text-foreground">{entry.destination}</td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="text-foreground">{entry.departDate}</div>
                        <div className="text-muted-foreground">to {entry.returnDate}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-alizarin-crimson">{formatCurrency(entry.totalCost)}</span>
                      {entry.attendant && (
                        <div className="text-xs text-muted-foreground">+ Attendant</div>
                      )}
                    </td>
                    <td className="p-4">{getStatusBadge(entry.status)}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-alizarin-crimson text-alizarin-crimson hover:bg-alizarin-crimson hover:text-white"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No entries found matching your criteria.</p>
              <p className="text-muted-foreground/70 text-sm mt-2">Try adjusting your search or filter settings.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
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
}