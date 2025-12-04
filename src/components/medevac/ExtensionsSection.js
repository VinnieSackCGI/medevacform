import React, { useEffect, useState, memo, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Clock, Plus, Minus, Calendar, DollarSign, MapPin, User, Mail } from "lucide-react";
import { POST_DATA, loadPerDiemData } from "../../pages/PostData";

const ExtensionForm = memo(({ extension, onUpdate, onRemove, extensionNumber }) => {
  // Memoize extension total calculation
  const extensionTotal = useMemo(() => {
    const airfare = parseFloat(extension.airfare) || 0;
    const additionalTravelers = parseFloat(extension.totalPerDiemAdditionalTravelers) || 0;
    const additionalAmount = parseFloat(extension.additionalPerDiemAmount) || 0;
    
    // Calculate per diem total from dynamic per diems
    const perDiemTotal = (extension.perDiems || []).reduce((total, perDiem) => {
      return total + ((parseFloat(perDiem.rate) || 0) * (parseInt(perDiem.days) || 0));
    }, 0);
    
    return perDiemTotal + airfare + additionalTravelers + additionalAmount;
  }, [extension.airfare, extension.totalPerDiemAdditionalTravelers, extension.additionalPerDiemAmount, extension.perDiems]);

  const handleInputChange = useCallback((field, value) => {
    const updatedExtension = {
      ...extension,
      [field]: value,
      extensionFundingTotal: extensionTotal
    };
    
    onUpdate(updatedExtension);
  }, [extension, extensionTotal, onUpdate]);

  const handleAddPerDiem = () => {
    const updatedExtension = { ...extension };
    if (!updatedExtension.perDiems) {
      updatedExtension.perDiems = [];
    }
    updatedExtension.perDiems.push({
      id: Date.now(),
      rate: '',
      days: '',
      location: ''
    });
    handleInputChange('perDiems', updatedExtension.perDiems);
  };
  
  const handleRemovePerDiem = (perDiemId) => {
    const updatedExtension = { ...extension };
    updatedExtension.perDiems = (updatedExtension.perDiems || []).filter(pd => pd.id !== perDiemId);
    handleInputChange('perDiems', updatedExtension.perDiems);
  };
  
  const handlePerDiemChange = (perDiemId, field, value) => {
    const updatedExtension = { ...extension };
    updatedExtension.perDiems = (updatedExtension.perDiems || []).map(pd => 
      pd.id === perDiemId ? { ...pd, [field]: value } : pd
    );
    handleInputChange('perDiems', updatedExtension.perDiems);
  };

  return (
    <Card className="bg-gray-50 border border-gray-300">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Extension {extensionNumber} (E{extensionNumber})</span>
          </CardTitle>
          <Button
            onClick={onRemove}
            variant="destructive"
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white h-7 w-7 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-6">
        {/* Basic Extension Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor={`extensionEndDate_${extensionNumber}`} className="text-black-pearl font-medium flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>E{extensionNumber} - Extension End Date *</span>
            </Label>
            <Input
              id={`extensionEndDate_${extensionNumber}`}
              type="date"
              value={extension.extensionEndDate || ''}
              onChange={(e) => handleInputChange('extensionEndDate', e.target.value)}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <Label htmlFor={`fundingCableInDate_${extensionNumber}`} className="text-black-pearl font-medium flex items-center space-x-1">
              <Mail className="h-3 w-3" />
              <span>E{extensionNumber} - Funding Cable In Date</span>
            </Label>
            <Input
              id={`fundingCableInDate_${extensionNumber}`}
              type="date"
              value={extension.fundingCableInDate || ''}
              onChange={(e) => handleInputChange('fundingCableInDate', e.target.value)}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <Label htmlFor={`fundingCableOutDate_${extensionNumber}`} className="text-black-pearl font-medium flex items-center space-x-1">
              <Mail className="h-3 w-3" />
              <span>E{extensionNumber} - Funding Cable Out Date</span>
            </Label>
            <Input
              id={`fundingCableOutDate_${extensionNumber}`}
              type="date"
              value={extension.fundingCableOutDate || ''}
              onChange={(e) => handleInputChange('fundingCableOutDate', e.target.value)}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Personnel Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor={`bdEmployee_${extensionNumber}`} className="text-black-pearl font-medium flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>E{extensionNumber} - BD Employee</span>
            </Label>
            <Input
              id={`bdEmployee_${extensionNumber}`}
              type="text"
              value={extension.bdEmployee || ''}
              onChange={(e) => handleInputChange('bdEmployee', e.target.value)}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter BD employee name"
            />
          </div>

          <div>
            <Label htmlFor={`employeeResponseTime_${extensionNumber}`} className="text-black-pearl font-medium flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>E{extensionNumber} - Employee Response Time (Business Days)</span>
            </Label>
            <Input
              id={`employeeResponseTime_${extensionNumber}`}
              type="number"
              min="0"
              step="1"
              value={extension.employeeResponseTime || ''}
              onChange={(e) => handleInputChange('employeeResponseTime', e.target.value)}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor={`medevacLocation_${extensionNumber}`} className="text-black-pearl font-medium flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>E{extensionNumber} - MEDEVAC Location</span>
            </Label>
            <Input
              id={`medevacLocation_${extensionNumber}`}
              type="text"
              value={extension.medevacLocation || ''}
              onChange={(e) => handleInputChange('medevacLocation', e.target.value)}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter location"
            />
          </div>
        </div>

        {/* Per Diem Rates */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-black-pearl flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Per Diem Rates (Lodging + M&IE)</span>
            </h4>
            <button
              type="button"
              onClick={handleAddPerDiem}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              + Add Per Diem
            </button>
          </div>
          
          {(!extension.perDiems || extension.perDiems.length === 0) ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500 italic">No per diems added. Click "Add Per Diem" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {extension.perDiems.map((perDiem, index) => (
                <div key={perDiem.id} className="bg-white p-4 rounded border">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-sm font-medium text-gray-700">Per Diem #{index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => handleRemovePerDiem(perDiem.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-gray-600">Location</Label>
                      <select
                        value={perDiem.location || ''}
                        onChange={(e) => {
                          const selectedPost = POST_DATA.find(post => `${post.city}, ${post.country}` === e.target.value);
                          handlePerDiemChange(perDiem.id, 'location', e.target.value);
                          if (selectedPost && !perDiem.rate) {
                            handlePerDiemChange(perDiem.id, 'rate', selectedPost.maxPerDiemRate.toString());
                          }
                        }}
                        className="w-full p-2 border border-gray-300 rounded focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                      >
                        <option value="">Select location...</option>
                        {POST_DATA.map((post, index) => (
                          <option key={index} value={`${post.city}, ${post.country}`}>
                            {post.city}, {post.country} (${post.maxPerDiemRate}/day)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Rate ($)</Label>
                      <Input
                        type="number" 
                        step="0.01"
                        min="0"
                        value={perDiem.rate || ''}
                        onChange={(e) => handlePerDiemChange(perDiem.id, 'rate', e.target.value)}
                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600"># of Days</Label>
                      <Input
                        type="number" 
                        min="0"
                        value={perDiem.days || ''}
                        onChange={(e) => handlePerDiemChange(perDiem.id, 'days', e.target.value)}
                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  {perDiem.rate && perDiem.days && (
                    <div className="text-xs text-gray-600 mt-2">
                      Subtotal: ${((parseFloat(perDiem.rate) || 0) * (parseInt(perDiem.days) || 0)).toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Costs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor={`airfare_${extensionNumber}`} className="text-black-pearl font-medium text-sm">E{extensionNumber} - Airfare</Label>
            <Input
              id={`airfare_${extensionNumber}`}
              type="number"
              min="0"
              step="0.01"
              value={extension.airfare || ''}
              onChange={(e) => handleInputChange('airfare', e.target.value)}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor={`totalPerDiemAdditionalTravelers_${extensionNumber}`} className="text-black-pearl font-medium text-sm">E{extensionNumber} - Total Per Diem Additional Travelers</Label>
            <Input
              id={`totalPerDiemAdditionalTravelers_${extensionNumber}`}
              type="number"
              min="0"
              step="0.01"
              value={extension.totalPerDiemAdditionalTravelers || ''}
              onChange={(e) => handleInputChange('totalPerDiemAdditionalTravelers', e.target.value)}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor={`additionalPerDiemAmount_${extensionNumber}`} className="text-black-pearl font-medium text-sm">E{extensionNumber} - Additional Per Diem Amount</Label>
            <Input
              id={`additionalPerDiemAmount_${extensionNumber}`}
              type="number"
              min="0"
              step="0.01"
              value={extension.additionalPerDiemAmount || ''}
              onChange={(e) => handleInputChange('additionalPerDiemAmount', e.target.value)}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <Label className="text-black-pearl font-medium text-sm">E{extensionNumber} - Extension Funding Total</Label>
            <div className="p-2 bg-green-50 border border-green-200 rounded text-green-800 font-semibold">
              ${(extension.extensionFundingTotal || 0).toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ExtensionForm.displayName = 'ExtensionForm';

const ExtensionsSection = memo(({ formData, setFormData }) => {
  const extensions = useMemo(() => formData.extensions || [], [formData.extensions]);
  const [isLoadingPerDiems, setIsLoadingPerDiems] = useState(false);
  const [perDiemStatus, setPerDiemStatus] = useState('');

  // Load fresh per diem data when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingPerDiems(true);
      setPerDiemStatus('Loading fresh per diem data...');
      
      const result = await loadPerDiemData();
      
      if (result.success) {
        setPerDiemStatus(`✅ Loaded ${result.count} fresh per diem rates from State Department`);
      } else {
        setPerDiemStatus('⚠️ Using cached per diem rates (State Dept site unavailable)');
      }
      
      setIsLoadingPerDiems(false);
      
      // Clear status after 5 seconds
      setTimeout(() => setPerDiemStatus(''), 5000);
    };
    
    loadData();
  }, []);

  const addExtension = useCallback(() => {
    if (extensions.length >= 10) return;
    
    const newExtension = {
      id: extensions.length + 1,
      extensionNumber: extensions.length + 1,
      extensionEndDate: '',
      fundingCableInDate: '',
      fundingCableOutDate: '',
      bdEmployee: '',
      employeeResponseTime: '',
      medevacLocation: '',
      perDiems: [],
      airfare: '',
      totalPerDiemAdditionalTravelers: '',
      additionalPerDiemAmount: '',
      extensionFundingTotal: 0
    };
    
    setFormData(prev => ({
      ...prev,
      extensions: [...extensions, newExtension]
    }));
  }, [extensions, setFormData]);

  const updateExtension = useCallback((index, updatedExtension) => {
    const updatedExtensions = [...extensions];
    updatedExtensions[index] = updatedExtension;
    
    // Calculate total obligation including all extensions
    const extensionTotal = updatedExtensions.reduce((total, ext) => total + (ext.extensionFundingTotal || 0), 0);
    
    setFormData(prev => ({
      ...prev,
      extensions: updatedExtensions,
      totalObligation: (prev.initialFundingTotal || 0) + extensionTotal + ((prev.amendment && prev.amendment.amendmentFundingTotal) || 0)
    }));
  }, [extensions, setFormData]);

  const removeExtension = useCallback((index) => {
    const updatedExtensions = extensions.filter((_, i) => i !== index);
    
    // Renumber extensions
    const renumberedExtensions = updatedExtensions.map((ext, i) => ({
      ...ext,
      id: i + 1,
      extensionNumber: i + 1
    }));
    
    // Recalculate total obligation
    const extensionTotal = renumberedExtensions.reduce((total, ext) => total + (ext.extensionFundingTotal || 0), 0);
    
    setFormData(prev => ({
      ...prev,
      extensions: renumberedExtensions,
      totalObligation: (prev.initialFundingTotal || 0) + extensionTotal + ((prev.amendment && prev.amendment.amendmentFundingTotal) || 0)
    }));
  }, [extensions, setFormData]);

  // Memoize total calculation
  const totalExtensionFunding = useMemo(() => 
    extensions.reduce((total, ext) => total + (ext.extensionFundingTotal || 0), 0),
    [extensions]
  );

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardHeader className="bg-gradient-to-r from-smalt to-matisse text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5" />
              <div>
                <CardTitle className="text-lg">Extensions Section</CardTitle>
                <p className="text-blue-100 text-sm mt-1">
                  Add extensions as needed (E1-E10) • Dynamic addition as needed
                </p>
                {perDiemStatus && (
                  <p className={`text-xs mt-1 ${isLoadingPerDiems ? 'text-yellow-200' : 'text-green-200'}`}>
                    {perDiemStatus}
                  </p>
                )}
              </div>
            </div>
            {extensions.length < 10 && (
              <Button
                onClick={addExtension}
                variant="secondary"
                size="sm"
                className="bg-white text-smalt hover:bg-gray-100"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Extension E{extensions.length + 1}
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {extensions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Extensions Added Yet</h3>
              <p className="text-gray-500 mb-4">
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full mr-2">
                  ✨ Improved from Excel
                </span>
                Extensions are added dynamically as needed (E1-E10), unlike Excel's static layout.
                Each extension includes detailed per diem rates, cable tracking, and cost calculations.
              </p>
              <Button
                onClick={addExtension}
                className="bg-smalt hover:bg-matisse text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Extension E1
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Extensions Summary */}
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-smalt">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-black-pearl">Extensions Summary</h4>
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Dynamic Addition • Improved UX
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Total Extensions</p>
                    <p className="text-xl font-bold text-smalt">{extensions.length}</p>
                    <p className="text-xs text-gray-500">Maximum: 10</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Total Extension Funding</p>
                    <p className="text-xl font-bold text-green-600">${totalExtensionFunding.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">All extensions combined</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Average per Extension</p>
                    <p className="text-xl font-bold text-blue-600">
                      ${extensions.length > 0 ? (totalExtensionFunding / extensions.length).toFixed(2) : '0.00'}
                    </p>
                    <p className="text-xs text-gray-500">Per extension average</p>
                  </div>
                </div>
              </div>

              {/* Improvement Notice */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-l-4 border-green-400 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-6 w-6 bg-green-400 rounded-full text-white text-sm font-bold">✓</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-green-800">Dynamic Extension System</h4>
                    <p className="text-sm text-green-700 mt-1">
                      This form adds extensions dynamically as needed with flexible E1-E10 management.
                      This prevents clutter and improves data entry efficiency.
                    </p>
                  </div>
                </div>
              </div>

              {extensions.length < 10 && (
                <div className="text-center mb-4">
                  <Button
                    onClick={addExtension}
                    variant="outline"
                    className="border-smalt text-smalt hover:bg-smalt hover:text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Extension E{extensions.length + 1}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Extension Forms */}
      {extensions.map((extension, index) => (
        <ExtensionForm
          key={extension.id}
          extension={extension}
          extensionNumber={extension.extensionNumber}
          onUpdate={(updatedExtension) => updateExtension(index, updatedExtension)}
          onRemove={() => removeExtension(index)}
        />
      ))}
    </div>
  );
});

ExtensionsSection.displayName = 'ExtensionsSection';

export default ExtensionsSection;