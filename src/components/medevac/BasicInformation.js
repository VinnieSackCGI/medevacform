import React, { memo } from "react";
import PatientDetails from "./PatientDetails";
import AgencyClassification from "./AgencyClassification";
import LocationFields from "./LocationFields";
import StatusDisplay from "./StatusDisplay";

const BasicInformation = memo(({ formData, setFormData }) => {
  return (
    <div className="space-y-6">
      <PatientDetails formData={formData} setFormData={setFormData} />
      <AgencyClassification formData={formData} setFormData={setFormData} />
      <LocationFields formData={formData} setFormData={setFormData} />
      <StatusDisplay formData={formData} />
    </div>
  );
});

BasicInformation.displayName = 'BasicInformation';

export default BasicInformation;