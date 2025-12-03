import React, { memo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { CheckCircle, FileText } from "lucide-react";

const CompletionSection = memo(({ formData, setFormData }) => {
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, [setFormData]);

  const handleSelectChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, [setFormData]);

  const COMPLETION_STATUSES = [
    "Closed",
    "Recalled", 
    "Final Acct",
    "RTP (Return to Post)",
    "Terminated",
    "Other"
  ];

  // Calculate final accounting date (Actual End Date + 30 days)
  const calculateFinalAccountingDate = () => {
    if (formData.actualEndDate) {
      const endDate = new Date(formData.actualEndDate);
      endDate.setDate(endDate.getDate() + 30);
      return endDate.toISOString().split('T')[0];
    }
    return '';
  };

  const finalAccountingDate = calculateFinalAccountingDate();

  // Calculate deobligation amount
  const calculateDeobligationAmount = () => {
    const totalObligation = formData.totalObligation || 0;
    const airfareApproved = parseFloat(formData.airfareApproved) || 0;
    const perDiemApproved = parseFloat(formData.perDiemApproved) || 0;
    const closedAmount = airfareApproved + perDiemApproved;
    
    return {
      closedAmount,
      deobligationAmount: totalObligation - closedAmount
    };
  };

  const { closedAmount, deobligationAmount } = calculateDeobligationAmount();

  return (
    <Card className="bg-white shadow-lg border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-5 w-5" />
          <CardTitle className="text-lg">Completion & Final Accounting</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Completion Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="completionStatus" className="text-black-pearl font-medium">
              Completion Status *
            </Label>
            <Select onValueChange={(value) => handleSelectChange('completionStatus', value)}>
              <SelectTrigger className="border-gray-300 focus:border-matisse focus:ring-matisse">
                <SelectValue placeholder="Select completion status" />
              </SelectTrigger>
              <SelectContent>
                {COMPLETION_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dateOfFinalAccounting" className="text-black-pearl font-medium">
              Date of Final Accounting
            </Label>
            <Input
              id="dateOfFinalAccounting"
              type="date"
              value={formData.dateOfFinalAccounting || ''}
              onChange={(e) => handleInputChange('dateOfFinalAccounting', e.target.value)}
              className="border-gray-300 focus:border-matisse focus:ring-matisse"
            />
            <p className="text-xs text-gray-600 mt-1">
              Required if status is "Final Acct"
            </p>
          </div>
        </div>

        {/* Actual Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="actualStartDate" className="text-black-pearl font-medium">
              Actual Start Date
            </Label>
            <Input
              id="actualStartDate"
              type="date"
              value={formData.actualStartDate || ''}
              onChange={(e) => handleInputChange('actualStartDate', e.target.value)}
              className="border-gray-300 focus:border-matisse focus:ring-matisse"
            />
          </div>

          <div>
            <Label htmlFor="actualEndDate" className="text-black-pearl font-medium">
              Actual End Date
            </Label>
            <Input
              id="actualEndDate"
              type="date"
              value={formData.actualEndDate || ''}
              onChange={(e) => handleInputChange('actualEndDate', e.target.value)}
              className="border-gray-300 focus:border-matisse focus:ring-matisse"
            />
          </div>
        </div>

        {/* Approved Amounts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="airfareApproved" className="text-black-pearl font-medium">
              Airfare Approved
            </Label>
            <Input
              id="airfareApproved"
              type="number"
              value={formData.airfareApproved || ''}
              onChange={(e) => handleInputChange('airfareApproved', e.target.value)}
              className="border-gray-300 focus:border-matisse focus:ring-matisse"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div>
            <Label htmlFor="perDiemApproved" className="text-black-pearl font-medium">
              Per Diem Approved
            </Label>
            <Input
              id="perDiemApproved"
              type="number"
              value={formData.perDiemApproved || ''}
              onChange={(e) => handleInputChange('perDiemApproved', e.target.value)}
              className="border-gray-300 focus:border-matisse focus:ring-matisse"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>

        {/* Calculated Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-black-pearl font-medium">Closed Amount</Label>
            <Input
              value={`$${closedAmount.toLocaleString()}`}
              className="border-gray-300 bg-gray-100 font-semibold text-green-700"
              readOnly
            />
            <p className="text-xs text-gray-600 mt-1">Airfare + Per Diem Approved</p>
          </div>

          <div>
            <Label className="text-black-pearl font-medium">Amount for Deobligation</Label>
            <Input
              value={`$${deobligationAmount.toLocaleString()}`}
              className={`border-gray-300 bg-gray-100 font-semibold ${
                deobligationAmount > 0 ? 'text-blue-700' : 'text-gray-700'
              }`}
              readOnly
            />
            <p className="text-xs text-gray-600 mt-1">Unused funds to return</p>
          </div>

          <div>
            <Label className="text-black-pearl font-medium">Date to Send Request for FA</Label>
            <Input
              value={finalAccountingDate ? new Date(finalAccountingDate).toLocaleDateString() : ''}
              className="border-gray-300 bg-gray-100"
              readOnly
            />
            <p className="text-xs text-gray-600 mt-1">Actual End + 30 days</p>
          </div>
        </div>

        {/* Comments */}
        <div>
          <Label htmlFor="comments" className="text-black-pearl font-medium">
            Comments
          </Label>
          <textarea
            id="comments"
            value={formData.comments || ''}
            onChange={(e) => handleInputChange('comments', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:border-matisse focus:ring-matisse resize-vertical"
            rows="4"
            maxLength="1000"
            placeholder="Additional comments or notes about the MEDEVAC case..."
          />
          <p className="text-xs text-gray-600 mt-1">
            Maximum 1000 characters ({(formData.comments || '').length}/1000)
          </p>
        </div>

        {/* Summary */}
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="h-4 w-4 text-green-600" />
            <h4 className="font-medium text-black-pearl">Completion Summary</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Status:</strong> {formData.completionStatus || 'Not set'}</p>
              <p><strong>Total Obligation:</strong> ${(formData.totalObligation || 0).toLocaleString()}</p>
              <p><strong>Closed Amount:</strong> ${closedAmount.toLocaleString()}</p>
            </div>
            <div>
              <p><strong>Actual Duration:</strong> {
                formData.actualStartDate && formData.actualEndDate 
                  ? Math.ceil((new Date(formData.actualEndDate) - new Date(formData.actualStartDate)) / (1000 * 60 * 60 * 24)) + 1 
                  : 'Not calculated'
              } days</p>
              <p><strong>Deobligation:</strong> ${deobligationAmount.toLocaleString()}</p>
              <p><strong>FA Request Due:</strong> {
                finalAccountingDate ? new Date(finalAccountingDate).toLocaleDateString() : 'Not calculated'
              }</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CompletionSection.displayName = 'CompletionSection';

export default CompletionSection;