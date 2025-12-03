import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Calculator, Plus, Minus } from "lucide-react";
import { FieldLabel, InfoBubble, QuickTips, SectionHeader } from "../ui/HelpComponents";

const PerDiemCalculator = ({ formData, setFormData }) => {
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Initialize per diem rates array if not exists
  React.useEffect(() => {
    if (!formData.perDiemRates) {
      setFormData(prev => ({
        ...prev,
        perDiemRates: [
          { rate: 0, days: 0, id: 1 }
        ]
      }));
    }
  }, [formData.perDiemRates, setFormData]);

  const updatePerDiemRate = (index, field, value) => {
    const updatedRates = [...(formData.perDiemRates || [])];
    updatedRates[index] = {
      ...updatedRates[index],
      [field]: parseFloat(value) || 0
    };

    setFormData(prev => ({
      ...prev,
      perDiemRates: updatedRates
    }));
  };

  const addPerDiemRate = () => {
    const currentRates = formData.perDiemRates || [];
    if (currentRates.length < 4) {
      setFormData(prev => ({
        ...prev,
        perDiemRates: [
          ...currentRates,
          { rate: 0, days: 0, id: currentRates.length + 1 }
        ]
      }));
    }
  };

  const removePerDiemRate = (index) => {
    const updatedRates = [...(formData.perDiemRates || [])];
    updatedRates.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      perDiemRates: updatedRates
    }));
  };

  // Calculate totals using useMemo to prevent infinite loops
  const totals = React.useMemo(() => {
    // Patient per diem calculation
    const patientPerDiem = (formData.perDiemRates || []).reduce((total, rate) => {
      return total + (rate.rate * rate.days);
    }, 0);

    // Additional travelers per diem
    const additionalTravelersPerDiem = parseFloat(formData.totalPerDiemAdditionalTravelers) || 0;

    // Total per diem (patient + additional travelers)
    const totalPerDiem = patientPerDiem + additionalTravelersPerDiem;

    // Other expenses
    const miscExpenses = parseFloat(formData.miscExpenses) || 0;
    const airfare = parseFloat(formData.airfare) || 0;

    // Total initial funding
    const initialFundingTotal = totalPerDiem + miscExpenses + airfare;

    return {
      patientPerDiem,
      totalPerDiem,
      initialFundingTotal
    };
  }, [
    formData.perDiemRates,
    formData.totalPerDiemAdditionalTravelers,
    formData.miscExpenses,
    formData.airfare
  ]);

  // Update parent form data when totals change
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      totalPerDiemPatient: totals.patientPerDiem,
      totalPerDiem: totals.totalPerDiem,
      initialFundingTotal: totals.initialFundingTotal,
      totalObligation: totals.initialFundingTotal
    }));
  }, [totals, setFormData]);

  return (
    <Card className="bg-white shadow-lg border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-matisse to-smalt text-white">
        <div className="flex items-center space-x-3">
          <Calculator className="h-5 w-5" />
          <CardTitle className="text-lg">Per Diem Calculator (Up to 4 Rates)</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Per Diem Rates */}
        <div className="space-y-4">
          <SectionHeader
            title="Per Diem Rates (Lodging + M&IE)"
            description="Enter daily allowances for different locations during the MEDEVAC journey"
            helpText="Per diem rates vary by location and include lodging costs plus Meals & Incidental Expenses (M&IE). You can add up to 4 different rates if the journey involves multiple locations with different per diem rates."
          />
          
          <div className="flex items-center justify-end">
            {formData.perDiemRates && formData.perDiemRates.length < 4 && (
              <Button
                onClick={addPerDiemRate}
                variant="outline"
                size="sm"
                className="border-matisse text-matisse hover:bg-matisse hover:text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Rate
              </Button>
            )}
          </div>

          {formData.perDiemRates && formData.perDiemRates.map((rateData, index) => (
            <div key={rateData.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <FieldLabel
                  helpText={`Daily per diem rate for location ${index + 1}. Includes lodging + M&IE (Meals & Incidental Expenses). Check current GSA rates or international per diem tables for accurate amounts.`}
                >
                  {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : '4th'} Per Diem Rate (Lodging + M&IE)
                </FieldLabel>
                <Input
                  type="number"
                  value={rateData.rate || ''}
                  onChange={(e) => updatePerDiemRate(index, 'rate', e.target.value)}
                  className="border-gray-300 focus:border-matisse focus:ring-matisse"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <FieldLabel
                  helpText={`Number of days the patient will be at location ${index + 1} receiving this per diem rate. Include travel days and medical treatment days.`}
                >
                  # of Days at {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : '4th'} Rate
                </FieldLabel>
                <Input
                  type="number"
                  value={rateData.days || ''}
                  onChange={(e) => updatePerDiemRate(index, 'days', e.target.value)}
                  className="border-gray-300 focus:border-matisse focus:ring-matisse"
                  placeholder="0"
                />
              </div>

              <div className="flex items-end">
                <div className="w-full">
                  <Label className="text-black-pearl font-medium">Subtotal</Label>
                  <Input
                    value={`$${((rateData.rate || 0) * (rateData.days || 0)).toLocaleString()}`}
                    className="border-gray-300 bg-gray-100 font-semibold"
                    readOnly
                  />
                </div>
                {formData.perDiemRates && formData.perDiemRates.length > 1 && (
                  <Button
                    onClick={() => removePerDiemRate(index)}
                    variant="outline"
                    size="sm"
                    className="ml-2 border-alizarin-crimson text-alizarin-crimson hover:bg-alizarin-crimson hover:text-white"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-black-pearl">Total Patient Per Diem:</span>
              <span className="text-green-700 text-lg">${totals.patientPerDiem.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Additional Travelers */}
        <div className="space-y-4">
          <SectionHeader
            title="Additional Travelers"
            description="Per diem for accompanying family members or medical staff"
            helpText="Enter the total per diem costs for any additional travelers (family members, medical escorts, etc.). This should be calculated separately and entered as a lump sum."
          />
          
          <div>
            <FieldLabel
              htmlFor="totalPerDiemAdditionalTravelers"
              helpText="Total per diem amount for all additional travelers combined. Calculate by multiplying their daily rate by number of days for each traveler."
            >
              Total Per Diem for Additional Travelers
            </FieldLabel>
            <Input
              id="totalPerDiemAdditionalTravelers"
              type="number"
              value={formData.totalPerDiemAdditionalTravelers || ''}
              onChange={(e) => handleInputChange('totalPerDiemAdditionalTravelers', e.target.value)}
              className="border-gray-300 focus:border-matisse focus:ring-matisse"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-black-pearl">Total Per Diem (Patient + Additional):</span>
              <span className="text-green-700 text-lg">${totals.totalPerDiem.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Other Expenses */}
        <div className="space-y-4">
          <SectionHeader
            title="Additional Expenses"
            description="Airfare, medical costs, and miscellaneous expenses"
            helpText="Include all other costs associated with the MEDEVAC that are not covered by per diem rates."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel
                htmlFor="airfare"
                helpText="Total cost of all airline tickets for the MEDEVAC. Include patient and any accompanying travelers. Use actual ticket prices or government rate estimates."
              >
                Airfare
              </FieldLabel>
              <Input
                id="airfare"
                type="number"
                value={formData.airfare || ''}
                onChange={(e) => handleInputChange('airfare', e.target.value)}
                className="border-gray-300 focus:border-matisse focus:ring-matisse"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div>
              <FieldLabel
                htmlFor="miscExpenses"
                helpText="Other expenses such as ground transportation, medical supplies, communication costs, or emergency expenses not covered elsewhere."
              >
                Miscellaneous Expenses
              </FieldLabel>
              <Input
                id="miscExpenses"
                type="number"
                value={formData.miscExpenses || ''}
                onChange={(e) => handleInputChange('miscExpenses', e.target.value)}
                className="border-gray-300 focus:border-matisse focus:ring-matisse"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-300 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-black-pearl">Total Initial Funding</h3>
              <p className="text-sm text-gray-600">Per Diem + Airfare + Miscellaneous</p>
            </div>
            <div className="text-3xl font-bold text-green-700">
              ${totals.initialFundingTotal.toLocaleString()}
            </div>
          </div>
        </div>

        <QuickTips 
          tips={[
            "Per diem rates vary by location - check GSA rates for domestic or State Department rates for international",
            "Include travel days in your day count calculations",
            "You can add up to 4 different per diem rates for complex multi-location journeys",
            "Additional travelers should be calculated separately and entered as a total amount",
            "All calculations update automatically as you enter values"
          ]}
          className="mt-6"
        />
      </CardContent>
    </Card>
  );
};

export default PerDiemCalculator;