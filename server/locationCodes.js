// Sample post data with location codes from the Excel file
// This will be replaced with the full dataset from your Excel file
const LOCATION_CODES_SAMPLE = [
  { country: 'AFGHANISTAN', location: 'KABUL', locationCode: '10323', lodging: 150, mie: 75, perDiem: 225 },
  { country: 'AUSTRIA', location: 'LINZ', locationCode: '11410', lodging: 180, mie: 85, perDiem: 265 },
  { country: 'AUSTRIA', location: 'VIENNA', locationCode: '11400', lodging: 200, mie: 90, perDiem: 290 },
  { country: 'FRANCE', location: 'PARIS', locationCode: '12300', lodging: 250, mie: 100, perDiem: 350 },
  { country: 'GERMANY', location: 'BERLIN', locationCode: '12500', lodging: 190, mie: 85, perDiem: 275 },
  { country: 'UNITED KINGDOM', location: 'LONDON', locationCode: '13200', lodging: 300, mie: 120, perDiem: 420 },
  { country: 'JAPAN', location: 'TOKYO', locationCode: '25100', lodging: 280, mie: 110, perDiem: 390 },
  { country: 'CHINA', location: 'BEIJING', locationCode: '23100', lodging: 220, mie: 95, perDiem: 315 }
];

// Function to convert Excel data to our format
const convertExcelToLocationCodes = (excelData) => {
  return excelData.map(row => ({
    country: row.Country?.toUpperCase() || '',
    location: row.Location?.toUpperCase() || '',
    seasonCode: row['Season Code'] || '',
    seasonStart: row['Season Start Date'] || '',
    seasonEnd: row['Season End Date'] || '',
    lodging: parseFloat(row['Lodging($)']) || 0,
    mie: parseFloat(row['Meals & Incidentals (M&IE $)']) || 0,
    perDiem: parseFloat(row['Per Diem($)']) || 0,
    effectiveDate: row['Effective Date'] || '',
    footnote: row['Footnote Reference'] || '',
    locationCode: row['Location Code'] || ''
  })).filter(item => item.locationCode && item.country && item.location);
};

module.exports = {
  LOCATION_CODES_SAMPLE,
  convertExcelToLocationCodes
};