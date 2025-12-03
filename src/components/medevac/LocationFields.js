import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { MapPin, Globe } from "lucide-react";
import { getRegionFromPostCity, getAlphabeticalPostList } from "../../pages/PostData";

const LocationFields = ({ formData, setFormData }) => {
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectChange = (field, value) => {
    const updates = { [field]: value };
    
    // When home post changes, auto-update region
    if (field === 'homePost') {
      updates.region = getRegionFromPostCity(value);
    }
    
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Get comprehensive alphabetical list of all diplomatic posts from PostData
  const HOME_POSTS = getAlphabeticalPostList();

  const ROUTE_OPTIONS = [
    { value: 'CONUS', label: 'CONUS (Continental United States)' },
    { value: 'OCONUS', label: 'OCONUS (Outside Continental United States)' }
  ];

  return (
    <Card className="bg-white shadow-lg border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-matisse to-smalt text-white">
        <div className="flex items-center space-x-3">
          <MapPin className="h-5 w-5" />
          <div>
            <CardTitle className="text-lg">Location Information</CardTitle>
            <p className="text-blue-100 text-sm mt-1">
              Geographic details for MEDEVAC coordination
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="homePost" className="text-black-pearl font-medium">
              Home Post *
            </Label>
            <Select 
              value={formData.homePost || ''}
              onValueChange={(value) => handleSelectChange('homePost', value)}
            >
              <SelectTrigger className="border-gray-300 focus:border-matisse focus:ring-matisse">
                <SelectValue placeholder="Select home post" />
              </SelectTrigger>
              <SelectContent>
                {HOME_POSTS.map((post) => (
                  <SelectItem key={post} value={post}>
                    {post}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600 mt-1">
              Automatically determines region
            </p>
          </div>

          <div>
            <Label className="text-black-pearl font-medium">
              Region (Auto-calculated)
            </Label>
            <div className="p-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700">
              {formData.region || 'Select home post first'}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Auto-lookup region from home post
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="route" className="text-black-pearl font-medium">
              Route (CONUS/OCONUS) *
            </Label>
            <Select 
              value={formData.route || ''}
              onValueChange={(value) => handleSelectChange('route', value)}
            >
              <SelectTrigger className="border-gray-300 focus:border-matisse focus:ring-matisse">
                <SelectValue placeholder="Select route type" />
              </SelectTrigger>
              <SelectContent>
                {ROUTE_OPTIONS.map((route) => (
                  <SelectItem key={route.value} value={route.value}>
                    {route.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="initialMedevacLocation" className="text-black-pearl font-medium">
              Initial MEDEVAC Location *
            </Label>
            <Select 
              value={formData.initialMedevacLocation || ''}
              onValueChange={(value) => handleSelectChange('initialMedevacLocation', value)}
            >
              <SelectTrigger className="border-gray-300 focus:border-matisse focus:ring-matisse">
                <SelectValue placeholder="Select MEDEVAC location" />
              </SelectTrigger>
              <SelectContent>
                {HOME_POSTS.map((post) => (
                  <SelectItem key={post} value={post}>
                    {post}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600 mt-1">
              Current treatment/recovery location
            </p>
          </div>
        </div>

        {/* Calculated location display */}
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-start">
            <Globe className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="ml-2">
              <h4 className="text-sm font-medium text-blue-800">Location Summary</h4>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-blue-600 font-medium">Home Post</p>
                  <p className="text-blue-900">{formData.homePost || 'Not selected'}</p>
                </div>
                <div>
                  <p className="text-blue-600 font-medium">Region (Calculated)</p>
                  <p className="text-blue-900">{formData.region || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-blue-600 font-medium">Current Location</p>
                  <p className="text-blue-900">{formData.currentMedevacLocation || formData.initialMedevacLocation || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationFields;