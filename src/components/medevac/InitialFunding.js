import React, { memo, useCallback } from "react";
import CableTracking from "./CableTracking";
import PerDiemCalculator from "./PerDiemCalculator";
import FinancialSummary from "./FinancialSummary";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { CalendarDays } from "lucide-react";

const InitialFunding = memo(({ formData, setFormData }) => {
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, [setFormData]);

  return (
    <div className="space-y-6">
      {/* Date Fields */}
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardHeader className="bg-gradient-to-r from-matisse to-smalt text-white">
          <div className="flex items-center space-x-3">
            <CalendarDays className="h-5 w-5" />
            <CardTitle className="text-lg">Initial Funding Dates</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="initialStartDate" className="text-black-pearl font-medium">
                Initial Start Date *
              </Label>
              <Input
                id="initialStartDate"
                type="date"
                value={formData.initialStartDate || ''}
                onChange={(e) => handleInputChange('initialStartDate', e.target.value)}
                className="border-gray-300 focus:border-matisse focus:ring-matisse"
                required
              />
            </div>

            <div>
              <Label htmlFor="initialEndDate" className="text-black-pearl font-medium">
                Initial End Date *
              </Label>
              <Input
                id="initialEndDate"
                type="date"
                value={formData.initialEndDate || ''}
                onChange={(e) => handleInputChange('initialEndDate', e.target.value)}
                className="border-gray-300 focus:border-matisse focus:ring-matisse"
                required
              />
              <p className="text-xs text-gray-600 mt-1">Must be after start date</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <CableTracking formData={formData} setFormData={setFormData} />
      <PerDiemCalculator formData={formData} setFormData={setFormData} />
      <FinancialSummary formData={formData} />
    </div>
  );
});

InitialFunding.displayName = 'InitialFunding';

export default InitialFunding;