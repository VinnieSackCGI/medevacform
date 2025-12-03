// Excel to Location Codes Converter
// Run this script to convert your Excel file to the location codes format

const fs = require('fs');
const path = require('path');

// If you have the xlsx package installed, uncomment this:
// const XLSX = require('xlsx');

// Function to convert Excel file to location codes format
const convertExcelToLocationCodes = async () => {
  try {
    console.log('📁 Looking for Excel file...');
    
    const excelPath = path.join(__dirname, '..', 'Examples', 'Country Location and Post data.xlsx');
    
    if (!fs.existsSync(excelPath)) {
      console.log('❌ Excel file not found at:', excelPath);
      console.log('\n📝 Please either:');
      console.log('1. Install xlsx package: npm install xlsx');
      console.log('2. Export your Excel file as CSV and place it in Examples folder');
      console.log('3. Manually create the location codes data');
      return;
    }
    
    // If XLSX package is available, uncomment this:
    /*
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    const locationCodesData = jsonData
      .filter(row => row['Location Code'] && row.Country && row.Location)
      .map(row => ({
        country: String(row.Country || '').toUpperCase(),
        city: String(row.Location || '').toUpperCase(),
        locationCode: String(row['Location Code'] || ''),
        seasonCode: String(row['Season Code'] || ''),
        seasonStart: row['Season Start Date'] || '',
        seasonEnd: row['Season End Date'] || '',
        maxLodgingRate: parseFloat(row['Lodging($)']) || 0,
        mieRate: parseFloat(row['Meals & Incidentals (M&IE $)']) || 0,
        maxPerDiemRate: parseFloat(row['Per Diem($)']) || 0,
        effectiveDate: row['Effective Date'] || '',
        footnote: row['Footnote Reference'] || '',
        // Add bureau mapping based on region
        bureau: getBureauFromCountry(row.Country),
        region: getRegionFromCountry(row.Country)
      }));
    
    // Save the converted data
    const outputPath = path.join(__dirname, 'locationCodesData.json');
    fs.writeFileSync(outputPath, JSON.stringify(locationCodesData, null, 2));
    
    console.log(`✅ Converted ${locationCodesData.length} location codes`);
    console.log(`💾 Saved to: ${outputPath}`);
    
    // Also update the LocationCodes.js file
    const jsContent = `// Generated from Excel file: ${new Date().toISOString()}
const LOCATION_CODES_DATA = ${JSON.stringify(locationCodesData, null, 2)};

module.exports = {
  LOCATION_CODES_DATA,
  convertExcelToLocationCodes: () => LOCATION_CODES_DATA
};`;
    
    fs.writeFileSync(path.join(__dirname, 'locationCodes.js'), jsContent);
    console.log('📝 Updated locationCodes.js file');
    */
    
    console.log('📋 Sample data structure needed:');
    console.log(JSON.stringify({
      country: 'AFGHANISTAN',
      city: 'KABUL', 
      locationCode: '10323',
      seasonCode: 'Y',
      seasonStart: '01/01',
      seasonEnd: '12/31',
      maxLodgingRate: 150,
      mieRate: 75,
      maxPerDiemRate: 225,
      effectiveDate: '2024-10-01',
      footnote: '',
      bureau: 'SCA',
      region: 'South and Central Asia'
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Error converting Excel file:', error);
  }
};

// Simple bureau mapping - you may need to refine this
const getBureauFromCountry = (country) => {
  const countryUpper = String(country || '').toUpperCase();
  
  // Africa (AF)
  if (['ALGERIA', 'ANGOLA', 'BENIN', 'BOTSWANA', 'BURKINA FASO', 'BURUNDI', 'CAMEROON', 'CAPE VERDE', 'CENTRAL AFRICAN REPUBLIC', 'CHAD', 'COMOROS', 'CONGO', 'DEMOCRATIC REPUBLIC OF CONGO', 'DJIBOUTI', 'EGYPT', 'EQUATORIAL GUINEA', 'ERITREA', 'ETHIOPIA', 'GABON', 'GAMBIA', 'GHANA', 'GUINEA', 'GUINEA-BISSAU', 'IVORY COAST', 'KENYA', 'LESOTHO', 'LIBERIA', 'LIBYA', 'MADAGASCAR', 'MALAWI', 'MALI', 'MAURITANIA', 'MAURITIUS', 'MOROCCO', 'MOZAMBIQUE', 'NAMIBIA', 'NIGER', 'NIGERIA', 'RWANDA', 'SAO TOME AND PRINCIPE', 'SENEGAL', 'SEYCHELLES', 'SIERRA LEONE', 'SOMALIA', 'SOUTH AFRICA', 'SOUTH SUDAN', 'SUDAN', 'SWAZILAND', 'TANZANIA', 'TOGO', 'TUNISIA', 'UGANDA', 'ZAMBIA', 'ZIMBABWE'].includes(countryUpper)) {
    return 'AF';
  }
  
  // East Asia Pacific (EAP)  
  if (['AUSTRALIA', 'BRUNEI', 'BURMA', 'CAMBODIA', 'CHINA', 'FIJI', 'INDONESIA', 'JAPAN', 'KIRIBATI', 'LAOS', 'MALAYSIA', 'MARSHALL ISLANDS', 'MICRONESIA', 'MONGOLIA', 'NAURU', 'NEW ZEALAND', 'NORTH KOREA', 'PALAU', 'PAPUA NEW GUINEA', 'PHILIPPINES', 'SAMOA', 'SINGAPORE', 'SOLOMON ISLANDS', 'SOUTH KOREA', 'TAIWAN', 'THAILAND', 'TIMOR-LESTE', 'TONGA', 'TUVALU', 'VANUATU', 'VIETNAM'].includes(countryUpper)) {
    return 'EAP';
  }
  
  // Europe (EUR)
  if (['ALBANIA', 'ANDORRA', 'ARMENIA', 'AUSTRIA', 'AZERBAIJAN', 'BELARUS', 'BELGIUM', 'BOSNIA AND HERZEGOVINA', 'BULGARIA', 'CROATIA', 'CYPRUS', 'CZECH REPUBLIC', 'DENMARK', 'ESTONIA', 'FINLAND', 'FRANCE', 'GEORGIA', 'GERMANY', 'GREECE', 'HUNGARY', 'ICELAND', 'IRELAND', 'ITALY', 'KOSOVO', 'LATVIA', 'LIECHTENSTEIN', 'LITHUANIA', 'LUXEMBOURG', 'MALTA', 'MOLDOVA', 'MONACO', 'MONTENEGRO', 'NETHERLANDS', 'NORTH MACEDONIA', 'NORWAY', 'POLAND', 'PORTUGAL', 'ROMANIA', 'RUSSIA', 'SAN MARINO', 'SERBIA', 'SLOVAKIA', 'SLOVENIA', 'SPAIN', 'SWEDEN', 'SWITZERLAND', 'TURKEY', 'UKRAINE', 'UNITED KINGDOM', 'VATICAN CITY'].includes(countryUpper)) {
    return 'EUR';
  }
  
  // Near East (NEA)
  if (['ALGERIA', 'BAHRAIN', 'EGYPT', 'IRAN', 'IRAQ', 'ISRAEL', 'JORDAN', 'KUWAIT', 'LEBANON', 'LIBYA', 'MOROCCO', 'OMAN', 'PALESTINE', 'QATAR', 'SAUDI ARABIA', 'SYRIA', 'TUNISIA', 'UNITED ARAB EMIRATES', 'YEMEN'].includes(countryUpper)) {
    return 'NEA';
  }
  
  // South and Central Asia (SCA)
  if (['AFGHANISTAN', 'BANGLADESH', 'BHUTAN', 'INDIA', 'KAZAKHSTAN', 'KYRGYZSTAN', 'MALDIVES', 'NEPAL', 'PAKISTAN', 'SRI LANKA', 'TAJIKISTAN', 'TURKMENISTAN', 'UZBEKISTAN'].includes(countryUpper)) {
    return 'SCA';
  }
  
  // Western Hemisphere (WHA)
  return 'WHA'; // Default for Americas
};

const getRegionFromCountry = (country) => {
  const bureau = getBureauFromCountry(country);
  const regions = {
    'AF': 'Africa',
    'EAP': 'East Asia Pacific', 
    'EUR': 'Europe',
    'NEA': 'Near East',
    'SCA': 'South and Central Asia',
    'WHA': 'Western Hemisphere'
  };
  return regions[bureau] || 'Unknown';
};

// Instructions for manual conversion
console.log('\n📖 EXCEL CONVERSION INSTRUCTIONS:');
console.log('================================');
console.log('1. Export your Excel file as CSV format');
console.log('2. Place it in the Examples folder as "Country Location and Post data.csv"');
console.log('3. Run: node convertFormData.js');
console.log('\nOR manually create location codes data using the sample structure shown above.');

// Run the conversion if called directly
if (require.main === module) {
  convertExcelToLocationCodes();
}

module.exports = { convertExcelToLocationCodes, getBureauFromCountry, getRegionFromCountry };