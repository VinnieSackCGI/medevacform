import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Cable, Clock } from "lucide-react";
import { calculateBusinessDays } from "../../utils/businessLogic";

const CableTracking = ({ formData, setFormData }) => {
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate response time and cable status using useMemo
  const calculations = React.useMemo(() => {
    let responseTime = 0;
    if (formData.fundingCableSentDate && formData.fundingCableInDate) {
      // Use business days calculation - from IN date to SENT date
      responseTime = calculateBusinessDays(formData.fundingCableInDate, formData.fundingCableSentDate);
    }

    let cableStatus = "N/A";
    if (formData.fundingCableSentDate) {
      cableStatus = "Sent";
    } else if (formData.fundingCableInDate) {
      // Calculate business days from cable in date to today
      const businessDaysWaiting = calculateBusinessDays(formData.fundingCableInDate, new Date().toISOString().split('T')[0]);
      cableStatus = `${businessDaysWaiting} business days`;
    }

    return { responseTime, cableStatus };
  }, [formData.fundingCableInDate, formData.fundingCableSentDate]);

  React.useEffect(() => {
    // Only update if values have actually changed to avoid infinite loops
    if (formData.employeeResponseTime !== calculations.responseTime || 
        formData.cableStatus !== calculations.cableStatus) {
      setFormData(prev => ({
        ...prev,
        employeeResponseTime: calculations.responseTime,
        cableStatus: calculations.cableStatus
      }));
    }
  }, [calculations.responseTime, calculations.cableStatus, formData.employeeResponseTime, formData.cableStatus, setFormData]);

  return (
    <Card className="bg-white shadow-lg border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-smalt to-matisse text-white">
        <div className="flex items-center space-x-3">
          <Cable className="h-5 w-5" />
          <CardTitle className="text-lg">Cable Tracking</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fundingCableInDate" className="text-black-pearl font-medium">
              Funding Cable In Date *
            </Label>
            <Input
              id="fundingCableInDate"
              type="date"
              value={formData.fundingCableInDate || ''}
              onChange={(e) => handleInputChange('fundingCableInDate', e.target.value)}
              className="border-gray-300 focus:border-matisse focus:ring-matisse"
              required
            />
          </div>

          <div>
            <Label htmlFor="fundingCableSentDate" className="text-black-pearl font-medium">
              Funding Cable Sent Date
            </Label>
            <Input
              id="fundingCableSentDate"
              type="date"
              value={formData.fundingCableSentDate || ''}
              onChange={(e) => handleInputChange('fundingCableSentDate', e.target.value)}
              className="border-gray-300 focus:border-matisse focus:ring-matisse"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bdEmployee" className="text-black-pearl font-medium">
              BD Employee *
            </Label>
            <Select value={formData.bdEmployee} onValueChange={(value) => handleSelectChange('bdEmployee', value)}>
              <SelectTrigger className="border-gray-300 focus:border-matisse focus:ring-matisse">
                <SelectValue placeholder="Select employee type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FS">FS (Foreign Service)</SelectItem>
                <SelectItem value="LS">LS (Local Staff)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="employeeResponseTime" className="text-black-pearl font-medium">
              Employee Response Time (Business Days)
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="employeeResponseTime"
                value={formData.employeeResponseTime || 0}
                className="border-gray-300 bg-gray-100"
                readOnly
              />
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">business days</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Auto-calculated</p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-matisse">
          <h4 className="font-medium text-black-pearl mb-2">Cable Processing Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Cable Status:</p>
              <p className="font-semibold text-black-pearl">{formData.cableStatus || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">BD Employee:</p>
              <p className="font-semibold text-black-pearl">{formData.bdEmployee || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-gray-600">Response Time:</p>
              <p className="font-semibold text-black-pearl">
                {formData.employeeResponseTime || 0} days
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CableTracking;