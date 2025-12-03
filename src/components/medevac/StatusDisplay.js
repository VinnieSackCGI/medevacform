import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Calculator, Clock, MapPin, FileText } from "lucide-react";

const StatusDisplay = ({ formData }) => {
  const getStatusBadgeColor = (status) => {
    if (status.includes('Out')) return 'bg-green-100 text-green-800';
    if (status.includes('Processing')) return 'bg-yellow-100 text-yellow-800';
    if (status === 'Initiated') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getCableStatusColor = (status) => {
    if (status === 'Sent') return 'text-green-600';
    if (typeof status === 'number' && status > 5) return 'text-red-600';
    if (typeof status === 'number') return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <Card className="bg-white shadow-lg border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="flex items-center space-x-3">
          <Calculator className="h-5 w-5" />
          <div>
            <CardTitle className="text-lg">Live Calculations</CardTitle>
            <p className="text-emerald-100 text-sm mt-1">
              Auto-calculated status and tracking fields
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {/* Primary Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase font-medium">MEDEVAC Status</p>
              <Badge className={`${getStatusBadgeColor(formData.medevacStatus)} border-0`}>
                {formData.medevacStatus || 'N/A'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <FileText className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase font-medium">Cable Status</p>
              <p className={`font-semibold ${getCableStatusColor(formData.cableStatus)}`}>
                {typeof formData.cableStatus === 'number' 
                  ? `${formData.cableStatus} days processing` 
                  : formData.cableStatus}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <MapPin className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase font-medium">Current Location</p>
              <p className="font-medium text-gray-900">
                {formData.currentMedevacLocation || formData.initialMedevacLocation || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-green-800">Total Obligation</p>
              <p className="text-lg font-bold text-green-900">
                ${(formData.totalObligation || 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-green-800">Initial Funding</p>
              <p className="text-lg font-bold text-green-900">
                ${(formData.initialFundingTotal || 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-green-800">Extensions Total</p>
              <p className="text-lg font-bold text-green-900">
                ${(formData.totalExtensionFunding || 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-green-800">Amendment Total</p>
              <p className="text-lg font-bold text-green-900">
                ${((formData.amendment && formData.amendment.amendmentFundingTotal) || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Tracking Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-gray-500">Obligation Number</p>
            <p className="font-mono text-sm font-medium text-gray-900">
              {formData.obligationNumber || 'Auto-generating...'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Region</p>
            <p className="font-medium text-sm text-gray-900">
              {formData.region || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Active Extensions</p>
            <p className="font-medium text-sm text-gray-900">
              {(formData.extensions || []).length} of 10
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Extension Days</p>
            <p className="font-medium text-sm text-gray-900">
              {formData.extensionDuration || 0} days
            </p>
          </div>
        </div>

        {/* Calculated Fields Notice */}
        <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400 mt-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Calculator className="h-4 w-4 text-blue-500 mt-0.5" />
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-blue-800">Auto-Calculated Fields</p>
              <p className="text-xs text-blue-700 mt-1">
                These fields are automatically calculated and updated in real-time based on your input.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusDisplay;