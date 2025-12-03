import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { AlertTriangle, Plus } from "lucide-react";

const AmendmentSection = ({ formData, setFormData }) => {
  const [showAmendment, setShowAmendment] = useState(false);

  const handleAddAmendment = () => {
    setShowAmendment(true);
    setFormData(prev => ({
      ...prev,
      hasAmendment: true,
      amendment: {
        amendedStartDate: '',
        amendedEndDate: '',
        amendedLocation: '',
        cableInDate: '',
        cableSentDate: '',
        bdEmployee: '',
        fundingTotal: 0
      }
    }));
  };

  if (!showAmendment && !formData.hasAmendment) {
    return (
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardHeader className="bg-gradient-to-r from-alizarin-crimson to-merlot text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle className="text-lg">Amendment Section (A1)</CardTitle>
            </div>
            <Button
              onClick={handleAddAmendment}
              variant="secondary"
              size="sm"
              className="bg-white text-alizarin-crimson hover:bg-gray-100"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Amendment
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Amendment Added</h3>
            <p className="text-gray-500 mb-4">
              Add an amendment (A1) if the initial MEDEVAC parameters need to be modified.
            </p>
            <Button
              onClick={handleAddAmendment}
              className="bg-alizarin-crimson hover:bg-merlot text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Amendment A1
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg border border-alizarin-crimson">
      <CardHeader className="bg-gradient-to-r from-alizarin-crimson to-merlot text-white">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5" />
          <CardTitle className="text-lg">Amendment Section (A1) - Active</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-alizarin-crimson">
          <h4 className="font-medium text-black-pearl mb-2">Amendment Implementation</h4>
          <p className="text-sm text-gray-700">
            Amendment section (A1) will include amended dates, location changes, 
            additional funding calculations, and cable tracking specific to the amendment.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            <strong>Coming in Phase 2:</strong> Full amendment form with business logic validation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AmendmentSection;