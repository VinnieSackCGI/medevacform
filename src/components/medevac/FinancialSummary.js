import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { TrendingUp, DollarSign } from "lucide-react";

const FinancialSummary = ({ formData }) => {
  const calculateDates = () => {
    let startDate = formData.initialStartDate;
    let endDate = formData.initialEndDate;
    let numberOfDays = 0;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    return { startDate, endDate, numberOfDays };
  };

  const dates = calculateDates();

  return (
    <Card className="bg-white shadow-lg border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-5 w-5" />
          <CardTitle className="text-lg">Financial Summary</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Date Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-black-pearl font-medium">Start Date</Label>
              <Input
                value={formData.initialStartDate ? new Date(formData.initialStartDate).toLocaleDateString() : ''}
                className="border-gray-300 bg-gray-100"
                readOnly
              />
              <p className="text-xs text-gray-600 mt-1">Initial or amended</p>
            </div>

            <div>
              <Label className="text-black-pearl font-medium">End Date</Label>
              <Input
                value={formData.initialEndDate ? new Date(formData.initialEndDate).toLocaleDateString() : ''}
                className="border-gray-300 bg-gray-100"
                readOnly
              />
              <p className="text-xs text-gray-600 mt-1">Latest extension</p>
            </div>

            <div>
              <Label className="text-black-pearl font-medium">Number of Days</Label>
              <Input
                value={dates.numberOfDays}
                className="border-gray-300 bg-gray-100 font-semibold"
                readOnly
              />
              <p className="text-xs text-gray-600 mt-1">Total duration</p>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-black-pearl mb-4 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Funding Breakdown
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h5 className="font-medium text-gray-700">Initial Funding</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Airfare:</span>
                    <span>${(parseFloat(formData.airfare) || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Patient Per Diem:</span>
                    <span>${(formData.totalPerDiemPatient || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Additional Travelers:</span>
                    <span>${(parseFloat(formData.totalPerDiemAdditionalTravelers) || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Miscellaneous:</span>
                    <span>${(parseFloat(formData.miscExpenses) || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Initial Total:</span>
                    <span>${(formData.initialFundingTotal || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-gray-700">Additional Funding</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Amendment (A1):</span>
                    <span>${(formData.amendmentFundingTotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Extensions (E1-E10):</span>
                    <span>${(formData.extensionsFundingTotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Additional Total:</span>
                    <span>${((formData.amendmentFundingTotal || 0) + (formData.extensionsFundingTotal || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grand Total */}
            <div className="mt-6 pt-4 border-t-2 border-gray-300">
              <div className="flex justify-between items-center text-xl font-bold text-green-700">
                <span>Total Obligation:</span>
                <span>${(formData.totalObligation || 0).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                This is the total estimated cost for the entire MEDEVAC operation including all amendments and extensions.
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">MEDEVAC Status</p>
              <p className="font-semibold text-matisse">{formData.medevacStatus || 'Initiated'}</p>
            </div>

            <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-600">Cable Status</p>
              <p className="font-semibold text-gold-accent">{formData.cableStatus || 'N/A'}</p>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">Funding Stage</p>
              <p className="font-semibold text-green-700">Initial</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSummary;