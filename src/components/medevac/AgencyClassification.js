import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Shield, Building } from "lucide-react";

const AgencyClassification = ({ formData, setFormData }) => {
  const handleSelectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Generate obligation number when agency changes
  React.useEffect(() => {
    if (formData.agencyType) {
      const currentYear = new Date().getFullYear();
      const fiscalYear = String(currentYear).slice(-2);
      const agencyCode = formData.agencyType === 'MSG' ? '90' : '10';
      
      // In real app, get sequential number from database
      const sequentialNumber = '001'; // Placeholder
      
      const obligationNumber = `${fiscalYear}${agencyCode}${sequentialNumber}`;
      
      setFormData(prev => ({
        ...prev,
        obligationNumber: obligationNumber
      }));
    }
  }, [formData.agencyType, setFormData]);

  const MEDEVAC_TYPES = [
    "MED-MSG",
    "DENTEVAC", 
    "MED In Conj",
    "MHS-MSG",
    "OB",
    "MEDICAL",
    "MHS",
    "MED-AIR AMB",
    "UHIEVAC"
  ];

  const TRAVELER_TYPES = [
    { value: "EMP", label: "EMP (Employee)" },
    { value: "EFM", label: "EFM (Eligible Family Member)" },
    { value: "DEP", label: "DEP (Dependent)" }
  ];

  return (
    <Card className="bg-white shadow-lg border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-smalt to-matisse text-white">
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5" />
          <CardTitle className="text-lg">Agency & Classification</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="agencyType" className="text-black-pearl font-medium">
              Agency Type *
            </Label>
            <Select onValueChange={(value) => handleSelectChange('agencyType', value)}>
              <SelectTrigger className="border-gray-300 focus:border-matisse focus:ring-matisse">
                <SelectValue placeholder="Select agency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MSG">MSG</SelectItem>
                <SelectItem value="DOS">DOS</SelectItem>
                <SelectItem value="Seabee">Seabee</SelectItem>
                <SelectItem value="DOS/Seabee">DOS/Seabee</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600 mt-1">
              Determines obligation number prefix
            </p>
          </div>

          <div>
            <Label htmlFor="medevacType" className="text-black-pearl font-medium">
              MEDEVAC Type *
            </Label>
            <Select onValueChange={(value) => handleSelectChange('medevacType', value)}>
              <SelectTrigger className="border-gray-300 focus:border-matisse focus:ring-matisse">
                <SelectValue placeholder="Select MEDEVAC type" />
              </SelectTrigger>
              <SelectContent>
                {MEDEVAC_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="travelerType" className="text-black-pearl font-medium">
              Traveler Type *
            </Label>
            <Select onValueChange={(value) => handleSelectChange('travelerType', value)}>
              <SelectTrigger className="border-gray-300 focus:border-matisse focus:ring-matisse">
                <SelectValue placeholder="Select traveler type" />
              </SelectTrigger>
              <SelectContent>
                {TRAVELER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="route" className="text-black-pearl font-medium">
              Route *
            </Label>
            <Select onValueChange={(value) => handleSelectChange('route', value)}>
              <SelectTrigger className="border-gray-300 focus:border-matisse focus:ring-matisse">
                <SelectValue placeholder="Select route type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONUS">CONUS (Continental US)</SelectItem>
                <SelectItem value="OCONUS">OCONUS (Outside Continental US)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-matisse">
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-matisse" />
            <h4 className="font-medium text-black-pearl">Classification Summary</h4>
          </div>
          <div className="mt-2 text-sm text-gray-700">
            <p><strong>Agency:</strong> {formData.agencyType || 'Not selected'}</p>
            <p><strong>Type:</strong> {formData.medevacType || 'Not selected'}</p>
            <p><strong>Traveler:</strong> {formData.travelerType || 'Not selected'}</p>
            <p><strong>Route:</strong> {formData.route || 'Not selected'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgencyClassification;