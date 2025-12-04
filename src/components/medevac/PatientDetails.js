import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { User } from "lucide-react";
import { FieldLabel, QuickTips } from "../ui/HelpComponents";

const PatientDetails = ({ formData, setFormData }) => {
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatPatientName = (name) => {
    // Auto-format to "LAST NAME, FIRST NAME" as user types
    const formatted = name.toUpperCase();
    return formatted;
  };

  const validatePatientNameFormat = (name) => {
    // Check if name follows "LAST NAME, FIRST NAME" format
    const pattern = /^[A-Z\s]+,\s*[A-Z\s]+$/;
    return pattern.test(name);
  };

  return (
    <Card className="bg-white shadow-lg border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-matisse to-smalt text-white">
        <div className="flex items-center space-x-3">
          <User className="h-5 w-5" />
          <CardTitle className="text-lg">Patient Details</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <div>
          <FieldLabel 
            htmlFor="obligationNumber"
            required
            helpText="Unique identifier automatically generated for each MEDEVAC case. Format: Fiscal Year + Agency Code + Sequential Number (e.g., 25010001 for FY25, agency 01, case #0001)"
          >
            Obligation Number
          </FieldLabel>
          <Input
            id="obligationNumber"
            value={formData.obligationNumber || ''}
            className="border-gray-300 focus:border-matisse focus:ring-matisse bg-gray-100"
            placeholder="Auto-generated (e.g., 25010001)"
            readOnly
          />
        </div>

        <div>
          <FieldLabel 
            htmlFor="patientName"
            required
            helpText="Enter patient's full legal name in MILITARY format: LAST NAME, FIRST NAME MIDDLE INITIAL. Example: SMITH, JOHN A. Use all capital letters for consistency with DoD records."
          >
            Patient Name
          </FieldLabel>
          <Input
            id="patientName"
            value={formData.patientName || ''}
            onChange={(e) => handleInputChange('patientName', formatPatientName(e.target.value))}
            className={`border-gray-300 focus:border-matisse focus:ring-matisse ${
              formData.patientName && !validatePatientNameFormat(formData.patientName) 
                ? 'border-alizarin-crimson' 
                : ''
            }`}
            placeholder="SMITH, JOHN A"
            required
          />
          {formData.patientName && !validatePatientNameFormat(formData.patientName) && (
            <p className="text-xs text-alizarin-crimson mt-1">
              Please use format: LAST NAME, FIRST NAME
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FieldLabel 
              htmlFor="medevacStatus"
              helpText="Current status of the MEDEVAC case. Updates automatically as the case progresses: Initiated → Cable Sent → In Transit → Completed"
            >
              MEDEVAC Status
            </FieldLabel>
            <Input
              id="medevacStatus"
              value={formData.medevacStatus || 'Initiated'}
              className="border-gray-300 bg-gray-100"
              readOnly
            />
          </div>

          <div>
            <FieldLabel 
              htmlFor="cableStatus"
              helpText="Tracks cable processing time. Shows 'N/A' until cable dates are entered, then displays days between cable in and cable out dates."
            >
              Cable Status
            </FieldLabel>
            <Input
              id="cableStatus"
              value={formData.cableStatus || 'N/A'}
              className="border-gray-300 bg-gray-100"
              readOnly
            />
          </div>
        </div>

        <div>
          <FieldLabel 
            htmlFor="totalObligation"
            helpText="Running total of all financial obligations for this MEDEVAC case. Includes per diem, airfare, medical costs, and miscellaneous expenses. Updates automatically as costs are added."
          >
            Total Obligation
          </FieldLabel>
          <Input
            id="totalObligation"
            value={formData.totalObligation ? `$${formData.totalObligation.toLocaleString()}` : '$0.00'}
            className="border-gray-300 bg-gray-100 font-semibold text-green-700"
            readOnly
          />
        </div>

        <QuickTips 
          tips={[
            "Patient name must follow military format: LAST NAME, FIRST NAME MIDDLE INITIAL",
            "Obligation numbers are auto-generated and cannot be modified",
            "Status fields update automatically based on case progress",
            "Total obligation reflects all costs entered in the Initial Funding section"
          ]}
          className="mt-6"
        />
      </CardContent>
    </Card>
  );
};

export default PatientDetails;