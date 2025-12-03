import React, { useState, useMemo, useEffect } from 'react';
import PerDiemService from '../services/PerDiemService';
import { ChevronUp } from 'lucide-react';

// Location codes data
const LOCATION_CODES_DATA = [
  { country: 'AFGHANISTAN', city: 'KABUL', locationCode: '10323', maxLodgingRate: 150, mieRate: 75, maxPerDiemRate: 225, bureau: 'SCA', region: 'South and Central Asia' },
  { country: 'AUSTRIA', city: 'LINZ', locationCode: '11410', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, bureau: 'EUR', region: 'Europe' },
  { country: 'AUSTRIA', city: 'VIENNA', locationCode: '11400', maxLodgingRate: 200, mieRate: 90, maxPerDiemRate: 290, bureau: 'EUR', region: 'Europe' },
  { country: 'FRANCE', city: 'PARIS', locationCode: '12300', maxLodgingRate: 250, mieRate: 100, maxPerDiemRate: 350, bureau: 'EUR', region: 'Europe' },
  { country: 'GERMANY', city: 'BERLIN', locationCode: '12500', maxLodgingRate: 190, mieRate: 85, maxPerDiemRate: 275, bureau: 'EUR', region: 'Europe' },
  { country: 'UNITED KINGDOM', city: 'LONDON', locationCode: '13200', maxLodgingRate: 300, mieRate: 120, maxPerDiemRate: 420, bureau: 'EUR', region: 'Europe' },
  { country: 'JAPAN', city: 'TOKYO', locationCode: '25100', maxLodgingRate: 280, mieRate: 110, maxPerDiemRate: 390, bureau: 'EAP', region: 'East Asia Pacific' },
  { country: 'CHINA', city: 'BEIJING', locationCode: '23100', maxLodgingRate: 220, mieRate: 95, maxPerDiemRate: 315, bureau: 'EAP', region: 'East Asia Pacific' }
];

// Static fallback data - used if scraping fails
const FALLBACK_POST_DATA = [
  // Africa (AF) - Comprehensive entries
  { city: 'ABIDJAN', country: 'COTE D\'IVOIRE', bureau: 'AF', region: 'Africa', seasonBegin: '01/12', seasonEnd: '31/03', maxLodgingRate: 185, mieRate: 85, maxPerDiemRate: 270, effectiveDate: '2024-10-01' },
  { city: 'ABUJA', country: 'NIGERIA', bureau: 'AF', region: 'Africa', seasonBegin: '01/12', seasonEnd: '28/02', maxLodgingRate: 180, mieRate: 80, maxPerDiemRate: 260, effectiveDate: '2024-10-01' },
  { city: 'ACCRA', country: 'GHANA', bureau: 'AF', region: 'Africa', seasonBegin: '01/12', seasonEnd: '28/02', maxLodgingRate: 170, mieRate: 75, maxPerDiemRate: 245, effectiveDate: '2024-10-01' },
  { city: 'ADDIS ABABA', country: 'ETHIOPIA', bureau: 'AF', region: 'Africa', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'ANTANANARIVO', country: 'MADAGASCAR', bureau: 'AF', region: 'Africa', seasonBegin: '01/05', seasonEnd: '30/09', maxLodgingRate: 155, mieRate: 70, maxPerDiemRate: 225, effectiveDate: '2024-10-01' },
  { city: 'ASMARA', country: 'ERITREA', bureau: 'AF', region: 'Africa', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'BAMAKO', country: 'MALI', bureau: 'AF', region: 'Africa', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'BANGUI', country: 'CENTRAL AFRICAN REPUBLIC', bureau: 'AF', region: 'Africa', seasonBegin: '01/12', seasonEnd: '28/02', maxLodgingRate: 140, mieRate: 65, maxPerDiemRate: 205, effectiveDate: '2024-10-01' },
  { city: 'BANJUL', country: 'GAMBIA', bureau: 'AF', region: 'Africa', seasonBegin: '01/11', seasonEnd: '31/03', maxLodgingRate: 145, mieRate: 65, maxPerDiemRate: 210, effectiveDate: '2024-10-01' },
  { city: 'BISSAU', country: 'GUINEA-BISSAU', bureau: 'AF', region: 'Africa', seasonBegin: '01/12', seasonEnd: '31/03', maxLodgingRate: 135, mieRate: 60, maxPerDiemRate: 195, effectiveDate: '2024-10-01' },
  { city: 'BRAZZAVILLE', country: 'REPUBLIC OF CONGO', bureau: 'AF', region: 'Africa', seasonBegin: '01/05', seasonEnd: '30/09', maxLodgingRate: 160, mieRate: 70, maxPerDiemRate: 230, effectiveDate: '2024-10-01' },
  { city: 'BUJUMBURA', country: 'BURUNDI', bureau: 'AF', region: 'Africa', seasonBegin: '01/06', seasonEnd: '30/09', maxLodgingRate: 155, mieRate: 65, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'CAPE TOWN', country: 'SOUTH AFRICA', bureau: 'AF', region: 'Africa', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 195, mieRate: 90, maxPerDiemRate: 285, effectiveDate: '2024-10-01' },
  { city: 'CONAKRY', country: 'GUINEA', bureau: 'AF', region: 'Africa', seasonBegin: '01/12', seasonEnd: '31/03', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'COTONOU', country: 'BENIN', bureau: 'AF', region: 'Africa', seasonBegin: '01/11', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'DAKAR', country: 'SENEGAL', bureau: 'AF', region: 'Africa', seasonBegin: '01/11', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'DAR ES SALAAM', country: 'TANZANIA', bureau: 'AF', region: 'Africa', seasonBegin: '01/06', seasonEnd: '30/09', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'DJIBOUTI', country: 'DJIBOUTI', bureau: 'AF', region: 'Africa', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 155, mieRate: 70, maxPerDiemRate: 225, effectiveDate: '2024-10-01' },
  { city: 'DODOMA', country: 'TANZANIA', bureau: 'AF', region: 'Africa', seasonBegin: '01/06', seasonEnd: '30/09', maxLodgingRate: 155, mieRate: 70, maxPerDiemRate: 225, effectiveDate: '2024-10-01' },
  { city: 'DURBAN', country: 'SOUTH AFRICA', bureau: 'AF', region: 'Africa', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'FREETOWN', country: 'SIERRA LEONE', bureau: 'AF', region: 'Africa', seasonBegin: '01/12', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'HARARE', country: 'ZIMBABWE', bureau: 'AF', region: 'Africa', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'JOHANNESBURG', country: 'SOUTH AFRICA', bureau: 'AF', region: 'Africa', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 190, mieRate: 85, maxPerDiemRate: 275, effectiveDate: '2024-10-01' },
  { city: 'JUBA', country: 'SOUTH SUDAN', bureau: 'AF', region: 'Africa', seasonBegin: '01/12', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'KAMPALA', country: 'UGANDA', bureau: 'AF', region: 'Africa', seasonBegin: '01/06', seasonEnd: '30/09', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'KHARTOUM', country: 'SUDAN', bureau: 'AF', region: 'Africa', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 155, mieRate: 70, maxPerDiemRate: 225, effectiveDate: '2024-10-01' },
  { city: 'KIGALI', country: 'RWANDA', bureau: 'AF', region: 'Africa', seasonBegin: '01/06', seasonEnd: '30/09', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'KINSHASA', country: 'DEMOCRATIC REPUBLIC OF CONGO', bureau: 'AF', region: 'Africa', seasonBegin: '01/05', seasonEnd: '30/09', maxLodgingRate: 170, mieRate: 75, maxPerDiemRate: 245, effectiveDate: '2024-10-01' },
  { city: 'LAGOS', country: 'NIGERIA', bureau: 'AF', region: 'Africa', seasonBegin: '01/12', seasonEnd: '28/02', maxLodgingRate: 190, mieRate: 85, maxPerDiemRate: 275, effectiveDate: '2024-10-01' },
  { city: 'LIBREVILLE', country: 'GABON', bureau: 'AF', region: 'Africa', seasonBegin: '01/05', seasonEnd: '30/09', maxLodgingRate: 180, mieRate: 80, maxPerDiemRate: 260, effectiveDate: '2024-10-01' },
  { city: 'LILONGWE', country: 'MALAWI', bureau: 'AF', region: 'Africa', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'LOME', country: 'TOGO', bureau: 'AF', region: 'Africa', seasonBegin: '01/12', seasonEnd: '31/03', maxLodgingRate: 155, mieRate: 70, maxPerDiemRate: 225, effectiveDate: '2024-10-01' },
  { city: 'LUANDA', country: 'ANGOLA', bureau: 'AF', region: 'Africa', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'LUSAKA', country: 'ZAMBIA', bureau: 'AF', region: 'Africa', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'MALABO', country: 'EQUATORIAL GUINEA', bureau: 'AF', region: 'Africa', seasonBegin: '01/12', seasonEnd: '28/02', maxLodgingRate: 180, mieRate: 80, maxPerDiemRate: 260, effectiveDate: '2024-10-01' },
  { city: 'MAPUTO', country: 'MOZAMBIQUE', bureau: 'AF', region: 'Africa', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 170, mieRate: 75, maxPerDiemRate: 245, effectiveDate: '2024-10-01' },
  { city: 'MASERU', country: 'LESOTHO', bureau: 'AF', region: 'Africa', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 145, mieRate: 65, maxPerDiemRate: 210, effectiveDate: '2024-10-01' },
  { city: 'MBABANE', country: 'ESWATINI', bureau: 'AF', region: 'Africa', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'MOGADISHU', country: 'SOMALIA', bureau: 'AF', region: 'Africa', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'MONROVIA', country: 'LIBERIA', bureau: 'AF', region: 'Africa', seasonBegin: '01/12', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'MORONI', country: 'COMOROS', bureau: 'AF', region: 'Africa', seasonBegin: '01/05', seasonEnd: '30/09', maxLodgingRate: 135, mieRate: 60, maxPerDiemRate: 195, effectiveDate: '2024-10-01' },
  { city: 'NAIROBI', country: 'KENYA', bureau: 'AF', region: 'Africa', seasonBegin: '01/06', seasonEnd: '30/09', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'NDJAMENA', country: 'CHAD', bureau: 'AF', region: 'Africa', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'NIAMEY', country: 'NIGER', bureau: 'AF', region: 'Africa', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 155, mieRate: 70, maxPerDiemRate: 225, effectiveDate: '2024-10-01' },
  { city: 'NOUAKCHOTT', country: 'MAURITANIA', bureau: 'AF', region: 'Africa', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'OUAGADOUGOU', country: 'BURKINA FASO', bureau: 'AF', region: 'Africa', seasonBegin: '01/10', seasonEnd: '31/05', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },
  { city: 'PORT LOUIS', country: 'MAURITIUS', bureau: 'AF', region: 'Africa', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 170, mieRate: 75, maxPerDiemRate: 245, effectiveDate: '2024-10-01' },
  { city: 'PRAIA', country: 'CAPE VERDE', bureau: 'AF', region: 'Africa', seasonBegin: '01/11', seasonEnd: '30/04', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'PRETORIA', country: 'SOUTH AFRICA', bureau: 'AF', region: 'Africa', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 185, mieRate: 85, maxPerDiemRate: 270, effectiveDate: '2024-10-01' },
  { city: 'SAO TOME', country: 'SAO TOME AND PRINCIPE', bureau: 'AF', region: 'Africa', seasonBegin: '01/05', seasonEnd: '30/09', maxLodgingRate: 140, mieRate: 65, maxPerDiemRate: 205, effectiveDate: '2024-10-01' },
  { city: 'TRIPOLI', country: 'LIBYA', bureau: 'AF', region: 'Africa', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'TUNIS', country: 'TUNISIA', bureau: 'AF', region: 'Africa', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'WINDHOEK', country: 'NAMIBIA', bureau: 'AF', region: 'Africa', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 155, mieRate: 70, maxPerDiemRate: 225, effectiveDate: '2024-10-01' },
  { city: 'YAOUNDE', country: 'CAMEROON', bureau: 'AF', region: 'Africa', seasonBegin: '01/12', seasonEnd: '28/02', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'ZANZIBAR', country: 'TANZANIA', bureau: 'AF', region: 'Africa', seasonBegin: '01/05', seasonEnd: '30/09', maxLodgingRate: 145, mieRate: 65, maxPerDiemRate: 210, effectiveDate: '2024-10-01' },
  { city: 'BENIN CITY', country: 'NIGERIA', bureau: 'AF', region: 'Africa', seasonBegin: '01/12', seasonEnd: '28/02', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'BISSAU', country: 'GUINEA-BISSAU', bureau: 'AF', region: 'Africa', seasonBegin: '01/12', seasonEnd: '31/03', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'BLANTYRE', country: 'MALAWI', bureau: 'AF', region: 'Africa', seasonBegin: '01/05', seasonEnd: '30/09', maxLodgingRate: 140, mieRate: 65, maxPerDiemRate: 205, effectiveDate: '2024-10-01' },
  { city: 'BRAZZAVILLE', country: 'REPUBLIC OF CONGO', bureau: 'AF', region: 'Africa', seasonBegin: '01/05', seasonEnd: '30/09', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'BUJUMBURA', country: 'BURUNDI', bureau: 'AF', region: 'Africa', seasonBegin: '01/05', seasonEnd: '30/09', maxLodgingRate: 155, mieRate: 70, maxPerDiemRate: 225, effectiveDate: '2024-10-01' },

  // East Asia and Pacific (EAP) - Comprehensive entries
  { city: 'AUCKLAND', country: 'NEW ZEALAND', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 185, mieRate: 90, maxPerDiemRate: 275, effectiveDate: '2024-10-01' },
  { city: 'BANDAR SERI BEGAWAN', country: 'BRUNEI', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/01', seasonEnd: '31/12', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'BANGKOK', country: 'THAILAND', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/11', seasonEnd: '28/02', maxLodgingRate: 175, mieRate: 85, maxPerDiemRate: 260, effectiveDate: '2024-10-01' },
  { city: 'BEIJING', country: 'CHINA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 200, mieRate: 95, maxPerDiemRate: 295, effectiveDate: '2024-10-01' },
  { city: 'BUSAN', country: 'SOUTH KOREA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/11', seasonEnd: '31/03', maxLodgingRate: 190, mieRate: 90, maxPerDiemRate: 280, effectiveDate: '2024-10-01' },
  { city: 'CANBERRA', country: 'AUSTRALIA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 195, mieRate: 95, maxPerDiemRate: 290, effectiveDate: '2024-10-01' },
  { city: 'CEBU', country: 'PHILIPPINES', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/12', seasonEnd: '28/02', maxLodgingRate: 155, mieRate: 75, maxPerDiemRate: 230, effectiveDate: '2024-10-01' },
  { city: 'CHENGDU', country: 'CHINA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'CHIANG MAI', country: 'THAILAND', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/11', seasonEnd: '28/02', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'COLOMBO', country: 'SRI LANKA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/12', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'DILI', country: 'TIMOR-LESTE', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/05', seasonEnd: '30/09', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },
  { city: 'FUKUOKA', country: 'JAPAN', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 190, mieRate: 90, maxPerDiemRate: 280, effectiveDate: '2024-10-01' },
  { city: 'GUANGZHOU', country: 'CHINA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 185, mieRate: 90, maxPerDiemRate: 275, effectiveDate: '2024-10-01' },
  { city: 'HANOI', country: 'VIETNAM', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/11', seasonEnd: '28/02', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'HO CHI MINH CITY', country: 'VIETNAM', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/11', seasonEnd: '28/02', maxLodgingRate: 175, mieRate: 85, maxPerDiemRate: 260, effectiveDate: '2024-10-01' },
  { city: 'JAKARTA', country: 'INDONESIA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/06', seasonEnd: '30/08', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'KAOHSIUNG', country: 'TAIWAN', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'KOROR', country: 'PALAU', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/01', seasonEnd: '31/12', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'KUALA LUMPUR', country: 'MALAYSIA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/01', seasonEnd: '31/12', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'MANILA', country: 'PHILIPPINES', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/12', seasonEnd: '28/02', maxLodgingRate: 165, mieRate: 80, maxPerDiemRate: 245, effectiveDate: '2024-10-01' },
  { city: 'MEDAN', country: 'INDONESIA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/06', seasonEnd: '30/08', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'MELBOURNE', country: 'AUSTRALIA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 200, mieRate: 95, maxPerDiemRate: 295, effectiveDate: '2024-10-01' },
  { city: 'NAHA', country: 'JAPAN', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 185, mieRate: 85, maxPerDiemRate: 270, effectiveDate: '2024-10-01' },
  { city: 'NUKU\'ALOFA', country: 'TONGA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 155, mieRate: 70, maxPerDiemRate: 225, effectiveDate: '2024-10-01' },
  { city: 'OSAKA-KOBE', country: 'JAPAN', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 205, mieRate: 95, maxPerDiemRate: 300, effectiveDate: '2024-10-01' },
  { city: 'PERTH', country: 'AUSTRALIA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 190, mieRate: 90, maxPerDiemRate: 280, effectiveDate: '2024-10-01' },
  { city: 'PHNOM PENH', country: 'CAMBODIA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/11', seasonEnd: '28/02', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'PORT MORESBY', country: 'PAPUA NEW GUINEA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/05', seasonEnd: '30/09', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'SAPPORO', country: 'JAPAN', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'SEOUL', country: 'SOUTH KOREA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/11', seasonEnd: '31/03', maxLodgingRate: 210, mieRate: 100, maxPerDiemRate: 310, effectiveDate: '2024-10-01' },
  { city: 'SHANGHAI', country: 'CHINA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 205, mieRate: 95, maxPerDiemRate: 300, effectiveDate: '2024-10-01' },
  { city: 'SHENYANG', country: 'CHINA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'SINGAPORE', country: 'SINGAPORE', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/01', seasonEnd: '31/12', maxLodgingRate: 185, mieRate: 90, maxPerDiemRate: 275, effectiveDate: '2024-10-01' },
  { city: 'SURABAYA', country: 'INDONESIA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/06', seasonEnd: '30/08', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'SUVA', country: 'FIJI', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'SYDNEY', country: 'AUSTRALIA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 210, mieRate: 100, maxPerDiemRate: 310, effectiveDate: '2024-10-01' },
  { city: 'TAIPEI', country: 'TAIWAN', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 185, mieRate: 85, maxPerDiemRate: 270, effectiveDate: '2024-10-01' },
  { city: 'TOKYO', country: 'JAPAN', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 225, mieRate: 105, maxPerDiemRate: 330, effectiveDate: '2024-10-01' },
  { city: 'ULAANBAATAR', country: 'MONGOLIA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'VIENTIANE', country: 'LAOS', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/11', seasonEnd: '28/02', maxLodgingRate: 155, mieRate: 70, maxPerDiemRate: 225, effectiveDate: '2024-10-01' },
  { city: 'WELLINGTON', country: 'NEW ZEALAND', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'WUHAN', country: 'CHINA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'YANGON', country: 'MYANMAR', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/11', seasonEnd: '28/02', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'CEBU', country: 'PHILIPPINES', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/01', seasonEnd: '31/12', maxLodgingRate: 155, mieRate: 70, maxPerDiemRate: 225, effectiveDate: '2024-10-01' },
  { city: 'CHENGDU', country: 'CHINA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'DAVAO', country: 'PHILIPPINES', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/01', seasonEnd: '31/12', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'DENPASAR', country: 'INDONESIA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/06', seasonEnd: '30/08', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'HONIARA', country: 'SOLOMON ISLANDS', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/01', seasonEnd: '31/12', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'NADI', country: 'FIJI', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/01', seasonEnd: '31/12', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'NUKU\'ALOFA', country: 'TONGA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/01', seasonEnd: '31/12', maxLodgingRate: 155, mieRate: 70, maxPerDiemRate: 225, effectiveDate: '2024-10-01' },
  { city: 'PENANG', country: 'MALAYSIA', bureau: 'EAP', region: 'East Asia Pacific', seasonBegin: '01/01', seasonEnd: '31/12', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },

  // Europe (EUR) - Comprehensive entries
  { city: 'ADANA', country: 'TURKEY', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'ALMATY', country: 'KAZAKHSTAN', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'AMSTERDAM', country: 'NETHERLANDS', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 220, mieRate: 100, maxPerDiemRate: 320, effectiveDate: '2024-10-01' },
  { city: 'ANKARA', country: 'TURKEY', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'ASHGABAT', country: 'TURKMENISTAN', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'ASTANA', country: 'KAZAKHSTAN', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'ATHENS', country: 'GREECE', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 195, mieRate: 90, maxPerDiemRate: 285, effectiveDate: '2024-10-01' },
  { city: 'BAKU', country: 'AZERBAIJAN', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'BARCELONA', country: 'SPAIN', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 210, mieRate: 95, maxPerDiemRate: 305, effectiveDate: '2024-10-01' },
  { city: 'BELFAST', country: 'UNITED KINGDOM', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 190, mieRate: 90, maxPerDiemRate: 280, effectiveDate: '2024-10-01' },
  { city: 'BELGRADE', country: 'SERBIA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'BERLIN', country: 'GERMANY', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 205, mieRate: 95, maxPerDiemRate: 300, effectiveDate: '2024-10-01' },
  { city: 'BERN', country: 'SWITZERLAND', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 250, mieRate: 115, maxPerDiemRate: 365, effectiveDate: '2024-10-01' },
  { city: 'BISHKEK', country: 'KYRGYZSTAN', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 155, mieRate: 70, maxPerDiemRate: 225, effectiveDate: '2024-10-01' },
  { city: 'BRATISLAVA', country: 'SLOVAKIA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'BRUSSELS', country: 'BELGIUM', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 215, mieRate: 100, maxPerDiemRate: 315, effectiveDate: '2024-10-01' },
  { city: 'BUCHAREST', country: 'ROMANIA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'BUDAPEST', country: 'HUNGARY', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 185, mieRate: 85, maxPerDiemRate: 270, effectiveDate: '2024-10-01' },
  { city: 'CHISINAU', country: 'MOLDOVA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'COPENHAGEN', country: 'DENMARK', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 225, mieRate: 105, maxPerDiemRate: 330, effectiveDate: '2024-10-01' },
  { city: 'DUBLIN', country: 'IRELAND', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 200, mieRate: 95, maxPerDiemRate: 295, effectiveDate: '2024-10-01' },
  { city: 'DUSHANBE', country: 'TAJIKISTAN', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'DUSSELDORF', country: 'GERMANY', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 195, mieRate: 90, maxPerDiemRate: 285, effectiveDate: '2024-10-01' },
  { city: 'EDINBURGH', country: 'UNITED KINGDOM', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 195, mieRate: 90, maxPerDiemRate: 285, effectiveDate: '2024-10-01' },
  { city: 'FLORENCE', country: 'ITALY', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 205, mieRate: 95, maxPerDiemRate: 300, effectiveDate: '2024-10-01' },
  { city: 'FRANKFURT', country: 'GERMANY', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 200, mieRate: 95, maxPerDiemRate: 295, effectiveDate: '2024-10-01' },
  { city: 'GENEVA', country: 'SWITZERLAND', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 260, mieRate: 120, maxPerDiemRate: 380, effectiveDate: '2024-10-01' },
  { city: 'HAMBURG', country: 'GERMANY', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 190, mieRate: 90, maxPerDiemRate: 280, effectiveDate: '2024-10-01' },
  { city: 'HELSINKI', country: 'FINLAND', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 210, mieRate: 100, maxPerDiemRate: 310, effectiveDate: '2024-10-01' },
  { city: 'ISTANBUL', country: 'TURKEY', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 185, mieRate: 85, maxPerDiemRate: 270, effectiveDate: '2024-10-01' },
  { city: 'KIEV', country: 'UKRAINE', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'KRAKOW', country: 'POLAND', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'LEIPZIG', country: 'GERMANY', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'LISBON', country: 'PORTUGAL', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 190, mieRate: 90, maxPerDiemRate: 280, effectiveDate: '2024-10-01' },
  { city: 'LJUBLJANA', country: 'SLOVENIA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'LONDON', country: 'UNITED KINGDOM', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 245, mieRate: 110, maxPerDiemRate: 355, effectiveDate: '2024-10-01' },
  { city: 'LUXEMBOURG', country: 'LUXEMBOURG', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 215, mieRate: 100, maxPerDiemRate: 315, effectiveDate: '2024-10-01' },
  { city: 'LYON', country: 'FRANCE', bureau: 'EUR', region: 'Europe', seasonBegin: '01/11', seasonEnd: '31/03', maxLodgingRate: 200, mieRate: 95, maxPerDiemRate: 295, effectiveDate: '2024-10-01' },
  { city: 'MADRID', country: 'SPAIN', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 205, mieRate: 95, maxPerDiemRate: 300, effectiveDate: '2024-10-01' },
  { city: 'MARSEILLE', country: 'FRANCE', bureau: 'EUR', region: 'Europe', seasonBegin: '01/11', seasonEnd: '31/03', maxLodgingRate: 195, mieRate: 90, maxPerDiemRate: 285, effectiveDate: '2024-10-01' },
  { city: 'MILAN', country: 'ITALY', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 225, mieRate: 105, maxPerDiemRate: 330, effectiveDate: '2024-10-01' },
  { city: 'MINSK', country: 'BELARUS', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'MOSCOW', country: 'RUSSIA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 200, mieRate: 95, maxPerDiemRate: 295, effectiveDate: '2024-10-01' },
  { city: 'MUNICH', country: 'GERMANY', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 210, mieRate: 100, maxPerDiemRate: 310, effectiveDate: '2024-10-01' },
  { city: 'NAPLES', country: 'ITALY', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 190, mieRate: 90, maxPerDiemRate: 280, effectiveDate: '2024-10-01' },
  { city: 'NICOSIA', country: 'CYPRUS', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 185, mieRate: 85, maxPerDiemRate: 270, effectiveDate: '2024-10-01' },
  { city: 'OSLO', country: 'NORWAY', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 235, mieRate: 110, maxPerDiemRate: 345, effectiveDate: '2024-10-01' },
  { city: 'PARIS', country: 'FRANCE', bureau: 'EUR', region: 'Europe', seasonBegin: '01/11', seasonEnd: '31/03', maxLodgingRate: 230, mieRate: 105, maxPerDiemRate: 335, effectiveDate: '2024-10-01' },
  { city: 'PODGORICA', country: 'MONTENEGRO', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'PRAGUE', country: 'CZECH REPUBLIC', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'PRISTINA', country: 'KOSOVO', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'REYKJAVIK', country: 'ICELAND', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 220, mieRate: 105, maxPerDiemRate: 325, effectiveDate: '2024-10-01' },
  { city: 'RIGA', country: 'LATVIA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'ROME', country: 'ITALY', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 220, mieRate: 100, maxPerDiemRate: 320, effectiveDate: '2024-10-01' },
  { city: 'SARAJEVO', country: 'BOSNIA AND HERZEGOVINA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'SKOPJE', country: 'NORTH MACEDONIA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'SOFIA', country: 'BULGARIA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'ST. PETERSBURG', country: 'RUSSIA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 185, mieRate: 85, maxPerDiemRate: 270, effectiveDate: '2024-10-01' },
  { city: 'STOCKHOLM', country: 'SWEDEN', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 220, mieRate: 105, maxPerDiemRate: 325, effectiveDate: '2024-10-01' },
  { city: 'STRASBOURG', country: 'FRANCE', bureau: 'EUR', region: 'Europe', seasonBegin: '01/11', seasonEnd: '31/03', maxLodgingRate: 210, mieRate: 100, maxPerDiemRate: 310, effectiveDate: '2024-10-01' },
  { city: 'TALLINN', country: 'ESTONIA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'TASHKENT', country: 'UZBEKISTAN', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'TBILISI', country: 'GEORGIA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'THESSALONIKI', country: 'GREECE', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'TIRANA', country: 'ALBANIA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'VALLETTA', country: 'MALTA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 190, mieRate: 90, maxPerDiemRate: 280, effectiveDate: '2024-10-01' },
  { city: 'VIENNA', country: 'AUSTRIA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 200, mieRate: 95, maxPerDiemRate: 295, effectiveDate: '2024-10-01' },
  { city: 'VILNIUS', country: 'LITHUANIA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'VLADIVOSTOK', country: 'RUSSIA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'WARSAW', country: 'POLAND', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'YEKATERINBURG', country: 'RUSSIA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'YEREVAN', country: 'ARMENIA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'ZAGREB', country: 'CROATIA', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'ZURICH', country: 'SWITZERLAND', bureau: 'EUR', region: 'Europe', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 255, mieRate: 120, maxPerDiemRate: 375, effectiveDate: '2024-10-01' },

  // Near East Asia (NEA) - Comprehensive entries
  { city: 'ABU DHABI', country: 'UAE', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 220, mieRate: 105, maxPerDiemRate: 325, effectiveDate: '2024-10-01' },
  { city: 'ALGIERS', country: 'ALGERIA', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'AMMAN', country: 'JORDAN', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 185, mieRate: 85, maxPerDiemRate: 270, effectiveDate: '2024-10-01' },
  { city: 'BAGHDAD', country: 'IRAQ', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 200, mieRate: 95, maxPerDiemRate: 295, effectiveDate: '2024-10-01' },
  { city: 'BAHRAIN', country: 'BAHRAIN', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 190, mieRate: 90, maxPerDiemRate: 280, effectiveDate: '2024-10-01' },
  { city: 'BEIRUT', country: 'LEBANON', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 195, mieRate: 90, maxPerDiemRate: 285, effectiveDate: '2024-10-01' },
  { city: 'CAIRO', country: 'EGYPT', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'CASABLANCA', country: 'MOROCCO', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'DAMASCUS', country: 'SYRIA', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'DOHA', country: 'QATAR', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 205, mieRate: 95, maxPerDiemRate: 300, effectiveDate: '2024-10-01' },
  { city: 'DUBAI', country: 'UAE', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 215, mieRate: 100, maxPerDiemRate: 315, effectiveDate: '2024-10-01' },
  { city: 'ERBIL', country: 'IRAQ', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'JERUSALEM', country: 'ISRAEL', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 200, mieRate: 95, maxPerDiemRate: 295, effectiveDate: '2024-10-01' },
  { city: 'KUWAIT CITY', country: 'KUWAIT', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 190, mieRate: 90, maxPerDiemRate: 280, effectiveDate: '2024-10-01' },
  { city: 'MANAMA', country: 'BAHRAIN', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 195, mieRate: 90, maxPerDiemRate: 285, effectiveDate: '2024-10-01' },
  { city: 'MUSCAT', country: 'OMAN', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'RABAT', country: 'MOROCCO', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'RIYADH', country: 'SAUDI ARABIA', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 195, mieRate: 90, maxPerDiemRate: 285, effectiveDate: '2024-10-01' },
  { city: 'SANAA', country: 'YEMEN', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'TEL AVIV', country: 'ISRAEL', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 210, mieRate: 100, maxPerDiemRate: 310, effectiveDate: '2024-10-01' },
  { city: 'TRIPOLI', country: 'LIBYA', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 185, mieRate: 85, maxPerDiemRate: 270, effectiveDate: '2024-10-01' },
  { city: 'TUNIS', country: 'TUNISIA', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'ALEPPO', country: 'SYRIA', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'ALEXANDRIA', country: 'EGYPT', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'BASRA', country: 'IRAQ', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 185, mieRate: 85, maxPerDiemRate: 270, effectiveDate: '2024-10-01' },
  { city: 'DAMMAM', country: 'SAUDI ARABIA', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 190, mieRate: 90, maxPerDiemRate: 280, effectiveDate: '2024-10-01' },
  { city: 'FEZ', country: 'MOROCCO', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'HAIFA', country: 'ISRAEL', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 195, mieRate: 90, maxPerDiemRate: 285, effectiveDate: '2024-10-01' },
  { city: 'IRBID', country: 'JORDAN', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'JEDDAH', country: 'SAUDI ARABIA', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 200, mieRate: 95, maxPerDiemRate: 295, effectiveDate: '2024-10-01' },
  { city: 'KIRKUK', country: 'IRAQ', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'MARRAKECH', country: 'MOROCCO', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'MOSUL', country: 'IRAQ', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'ORAN', country: 'ALGERIA', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'PETRA', country: 'JORDAN', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'SHARJAH', country: 'UAE', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 210, mieRate: 100, maxPerDiemRate: 310, effectiveDate: '2024-10-01' },
  { city: 'SALALAH', country: 'OMAN', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'SFAX', country: 'TUNISIA', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'TANGIER', country: 'MOROCCO', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'ZARQA', country: 'JORDAN', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'ADEN', country: 'YEMEN', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'AL-HOCEIMA', country: 'MOROCCO', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'CONSTANTINE', country: 'ALGERIA', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'FUJAIRAH', country: 'UAE', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 200, mieRate: 95, maxPerDiemRate: 295, effectiveDate: '2024-10-01' },
  { city: 'HOMS', country: 'SYRIA', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'MECCA', country: 'SAUDI ARABIA', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 185, mieRate: 85, maxPerDiemRate: 270, effectiveDate: '2024-10-01' },
  { city: 'MEDINA', country: 'SAUDI ARABIA', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'NIZWA', country: 'OMAN', bureau: 'NEA', region: 'Near East Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },

  // South and Central Asia (SCA) - Comprehensive entries
  { city: 'AHMEDABAD', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },
  { city: 'ALMATY', country: 'KAZAKHSTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'ASTANA', country: 'KAZAKHSTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'BANGALORE', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 155, mieRate: 75, maxPerDiemRate: 230, effectiveDate: '2024-10-01' },
  { city: 'BISHKEK', country: 'KYRGYZSTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 155, mieRate: 70, maxPerDiemRate: 225, effectiveDate: '2024-10-01' },
  { city: 'CALCUTTA', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'CHENNAI', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'COLOMBO', country: 'SRI LANKA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'DHAKA', country: 'BANGLADESH', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },
  { city: 'DUSHANBE', country: 'TAJIKISTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'HYDERABAD', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'ISLAMABAD', country: 'PAKISTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'KABUL', country: 'AFGHANISTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'KARACHI', country: 'PAKISTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 155, mieRate: 75, maxPerDiemRate: 230, effectiveDate: '2024-10-01' },
  { city: 'KATHMANDU', country: 'NEPAL', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'LAHORE', country: 'PAKISTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'MALE', country: 'MALDIVES', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 185, mieRate: 85, maxPerDiemRate: 270, effectiveDate: '2024-10-01' },
  { city: 'MUMBAI', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 80, maxPerDiemRate: 245, effectiveDate: '2024-10-01' },
  { city: 'NEW DELHI', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'PESHAWAR', country: 'PAKISTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },
  { city: 'PUNE', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'TASHKENT', country: 'UZBEKISTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'THIMPHU', country: 'BHUTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'AGRA', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },
  { city: 'ASHGABAT', country: 'TURKMENISTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'BHOPAL', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 140, mieRate: 65, maxPerDiemRate: 205, effectiveDate: '2024-10-01' },
  { city: 'CHANDIGARH', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'CHITTAGONG', country: 'BANGLADESH', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 140, mieRate: 65, maxPerDiemRate: 205, effectiveDate: '2024-10-01' },
  { city: 'COCHIN', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },
  { city: 'FAISALABAD', country: 'PAKISTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 140, mieRate: 65, maxPerDiemRate: 205, effectiveDate: '2024-10-01' },
  { city: 'GUWAHATI', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },
  { city: 'JAIPUR', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'JALALABAD', country: 'AFGHANISTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'KANDAHAR', country: 'AFGHANISTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'KANDY', country: 'SRI LANKA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'KOLKATA', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 155, mieRate: 75, maxPerDiemRate: 230, effectiveDate: '2024-10-01' },
  { city: 'KOCHI', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },
  { city: 'LUCKNOW', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },
  { city: 'MULTAN', country: 'PAKISTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 140, mieRate: 65, maxPerDiemRate: 205, effectiveDate: '2024-10-01' },
  { city: 'NAGPUR', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },
  { city: 'PATNA', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 140, mieRate: 65, maxPerDiemRate: 205, effectiveDate: '2024-10-01' },
  { city: 'POKHARA', country: 'NEPAL', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 155, mieRate: 70, maxPerDiemRate: 225, effectiveDate: '2024-10-01' },
  { city: 'QUETTA', country: 'PAKISTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },
  { city: 'RAWALPINDI', country: 'PAKISTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'SAMARKAND', country: 'UZBEKISTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'SRINAGAR', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'SURAT', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },
  { city: 'VADODARA', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },
  { city: 'AGRA', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },
  { city: 'BHOPAL', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 140, mieRate: 65, maxPerDiemRate: 205, effectiveDate: '2024-10-01' },
  { city: 'CHANDIGARH', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'CHITTAGONG', country: 'BANGLADESH', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 140, mieRate: 65, maxPerDiemRate: 205, effectiveDate: '2024-10-01' },
  { city: 'COCHIN', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },
  { city: 'FAISALABAD', country: 'PAKISTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 140, mieRate: 65, maxPerDiemRate: 205, effectiveDate: '2024-10-01' },
  { city: 'GUWAHATI', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },
  { city: 'JAIPUR', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'JALALABAD', country: 'AFGHANISTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'KANDAHAR', country: 'AFGHANISTAN', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'KANDY', country: 'SRI LANKA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'KOLKATA', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 155, mieRate: 75, maxPerDiemRate: 230, effectiveDate: '2024-10-01' },
  { city: 'LUCKNOW', country: 'INDIA', bureau: 'SCA', region: 'South Central Asia', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 145, mieRate: 70, maxPerDiemRate: 215, effectiveDate: '2024-10-01' },

  // Western Hemisphere (WHA) - Comprehensive entries
  { city: 'ANTIGUA', country: 'ANTIGUA AND BARBUDA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/11', seasonEnd: '30/04', maxLodgingRate: 195, mieRate: 90, maxPerDiemRate: 285, effectiveDate: '2024-10-01' },
  { city: 'ASUNCION', country: 'PARAGUAY', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'BARBADOS', country: 'BARBADOS', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/11', seasonEnd: '30/04', maxLodgingRate: 190, mieRate: 90, maxPerDiemRate: 280, effectiveDate: '2024-10-01' },
  { city: 'BELIZE CITY', country: 'BELIZE', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/11', seasonEnd: '30/04', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'BOGOTA', country: 'COLOMBIA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'BRASILIA', country: 'BRAZIL', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 85, maxPerDiemRate: 260, effectiveDate: '2024-10-01' },
  { city: 'BRIDGETOWN', country: 'BARBADOS', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/11', seasonEnd: '30/04', maxLodgingRate: 185, mieRate: 85, maxPerDiemRate: 270, effectiveDate: '2024-10-01' },
  { city: 'BUENOS AIRES', country: 'ARGENTINA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'CALGARY', country: 'CANADA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 185, mieRate: 85, maxPerDiemRate: 270, effectiveDate: '2024-10-01' },
  { city: 'CARACAS', country: 'VENEZUELA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'CIUDAD JUAREZ', country: 'MEXICO', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 155, mieRate: 75, maxPerDiemRate: 230, effectiveDate: '2024-10-01' },
  { city: 'COZUMEL', country: 'MEXICO', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'CURACAO', country: 'CURACAO', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/11', seasonEnd: '30/04', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'GEORGETOWN', country: 'GUYANA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'GUADALAJARA', country: 'MEXICO', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'GUATEMALA CITY', country: 'GUATEMALA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'HALIFAX', country: 'CANADA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'HAMILTON', country: 'BERMUDA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 220, mieRate: 105, maxPerDiemRate: 325, effectiveDate: '2024-10-01' },
  { city: 'HAVANA', country: 'CUBA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'HERMOSILLO', country: 'MEXICO', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 155, mieRate: 75, maxPerDiemRate: 230, effectiveDate: '2024-10-01' },
  { city: 'KINGSTON', country: 'JAMAICA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/11', seasonEnd: '30/04', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'LA PAZ', country: 'BOLIVIA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 155, mieRate: 70, maxPerDiemRate: 225, effectiveDate: '2024-10-01' },
  { city: 'LIMA', country: 'PERU', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'MANAGUA', country: 'NICARAGUA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'MATAMOROS', country: 'MEXICO', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'MERIDA', country: 'MEXICO', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'MEXICO CITY', country: 'MEXICO', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 80, maxPerDiemRate: 245, effectiveDate: '2024-10-01' },
  { city: 'MONTERREY', country: 'MEXICO', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'MONTREAL', country: 'CANADA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 190, mieRate: 90, maxPerDiemRate: 280, effectiveDate: '2024-10-01' },
  { city: 'MONTEVIDEO', country: 'URUGUAY', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'NASSAU', country: 'BAHAMAS', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/11', seasonEnd: '30/04', maxLodgingRate: 200, mieRate: 95, maxPerDiemRate: 295, effectiveDate: '2024-10-01' },
  { city: 'NUEVO LAREDO', country: 'MEXICO', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 150, mieRate: 70, maxPerDiemRate: 220, effectiveDate: '2024-10-01' },
  { city: 'OTTAWA', country: 'CANADA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 185, mieRate: 85, maxPerDiemRate: 270, effectiveDate: '2024-10-01' },
  { city: 'PANAMA CITY', country: 'PANAMA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'PARAMARIBO', country: 'SURINAME', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'PORT AU PRINCE', country: 'HAITI', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'PORT OF SPAIN', country: 'TRINIDAD AND TOBAGO', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/11', seasonEnd: '30/04', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'QUEBEC CITY', country: 'CANADA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'QUITO', country: 'ECUADOR', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'RECIFE', country: 'BRAZIL', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'RIO DE JANEIRO', country: 'BRAZIL', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'SAN JOSE', country: 'COSTA RICA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'SAN SALVADOR', country: 'EL SALVADOR', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'SANTIAGO', country: 'CHILE', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 175, mieRate: 80, maxPerDiemRate: 255, effectiveDate: '2024-10-01' },
  { city: 'SAO PAULO', country: 'BRAZIL', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 185, mieRate: 85, maxPerDiemRate: 270, effectiveDate: '2024-10-01' },
  { city: 'ST. JOHNS', country: 'ANTIGUA AND BARBUDA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/11', seasonEnd: '30/04', maxLodgingRate: 190, mieRate: 90, maxPerDiemRate: 280, effectiveDate: '2024-10-01' },
  { city: 'TEGUCIGALPA', country: 'HONDURAS', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'TIJUANA', country: 'MEXICO', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 155, mieRate: 75, maxPerDiemRate: 230, effectiveDate: '2024-10-01' },
  { city: 'TORONTO', country: 'CANADA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 195, mieRate: 90, maxPerDiemRate: 285, effectiveDate: '2024-10-01' },
  { city: 'VANCOUVER', country: 'CANADA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 200, mieRate: 95, maxPerDiemRate: 295, effectiveDate: '2024-10-01' },
  { city: 'WILLEMSTAD', country: 'CURACAO', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/11', seasonEnd: '30/04', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'ACAPULCO', country: 'MEXICO', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'BARRANQUILLA', country: 'COLOMBIA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'CANCUN', country: 'MEXICO', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 180, mieRate: 85, maxPerDiemRate: 265, effectiveDate: '2024-10-01' },
  { city: 'CARTAGENA', country: 'COLOMBIA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'CORDOBA', country: 'ARGENTINA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 165, mieRate: 75, maxPerDiemRate: 240, effectiveDate: '2024-10-01' },
  { city: 'FORTALEZA', country: 'BRAZIL', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' },
  { city: 'GUAYAQUIL', country: 'ECUADOR', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 155, mieRate: 70, maxPerDiemRate: 225, effectiveDate: '2024-10-01' },
  { city: 'LEON', country: 'MEXICO', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 155, mieRate: 75, maxPerDiemRate: 230, effectiveDate: '2024-10-01' },
  { city: 'MEDELLIN', country: 'COLOMBIA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/10', seasonEnd: '31/03', maxLodgingRate: 160, mieRate: 75, maxPerDiemRate: 235, effectiveDate: '2024-10-01' },
  { city: 'ROSARIO', country: 'ARGENTINA', bureau: 'WHA', region: 'Western Hemisphere', seasonBegin: '01/04', seasonEnd: '30/09', maxLodgingRate: 170, mieRate: 80, maxPerDiemRate: 250, effectiveDate: '2024-10-01' }
];

const PostData = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [sortBy, setSortBy] = useState('city');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(20);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get unique regions/bureaus for filter dropdown
  const regions = useMemo(() => {
    const uniqueBureaus = [...new Set(POST_DATA.map(post => post.bureau))].sort();
    return uniqueBureaus.map(bureau => {
      const regionName = POST_DATA.find(post => post.bureau === bureau)?.region || bureau;
      return { code: bureau, name: regionName };
    });
  }, []);

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = POST_DATA.filter(post => {
      const matchesSearch = !searchTerm || 
        post.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.bureau.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.region.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRegion = !selectedRegion || post.bureau === selectedRegion;
      
      return matchesSearch && matchesRegion;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedRegion, sortBy, sortOrder]);

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredAndSortedPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredAndSortedPosts.length / postsPerPage);

  // Statistics
  const stats = useMemo(() => {
    const bureauCounts = regions.map(region => ({
      bureau: region.code,
      name: region.name,
      count: POST_DATA.filter(post => post.bureau === region.code).length
    }));
    
    return {
      total: POST_DATA.length,
      bureauCounts,
      filtered: filteredAndSortedPosts.length
    };
  }, [regions, filteredAndSortedPosts.length]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getBureauColor = (bureau) => {
    const colors = {
      'AF': 'bg-red-100 text-red-800',
      'EAP': 'bg-blue-100 text-blue-800',
      'EUR': 'bg-green-100 text-green-800',
      'NEA': 'bg-yellow-100 text-yellow-800',
      'SCA': 'bg-purple-100 text-purple-800',
      'WHA': 'bg-orange-100 text-orange-800'
    };
    return colors[bureau] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Diplomatic Posts Database</h1>
        <p className="text-gray-600">
          Comprehensive database of U.S. diplomatic posts worldwide with per diem rates and travel information.
          Sample data showing {POST_DATA.length} posts across {regions.length} regional bureaus.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Posts</div>
        </div>
        {stats.bureauCounts.map(bureau => (
          <div key={bureau.bureau} className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-gray-800">{bureau.count}</div>
            <div className="text-sm text-gray-600">{bureau.bureau} - {bureau.name}</div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search posts, countries, or regions..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="md:w-48">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Regions</option>
              {regions.map(region => (
                <option key={region.code} value={region.code}>
                  {region.code} - {region.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredAndSortedPosts.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAndSortedPosts.length} posts
          </div>
        )}
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('city')}
                >
                  <div className="flex items-center space-x-1">
                    <span>City/Post</span>
                    <span>{getSortIcon('city')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('country')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Country</span>
                    <span>{getSortIcon('country')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('bureau')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Bureau</span>
                    <span>{getSortIcon('bureau')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('region')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Region</span>
                    <span>{getSortIcon('region')}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Season Begin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Season End
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Lodging ($)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  M&IE Rate ($)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Per Diem ($)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Effective Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPosts.map((post, index) => (
                <tr key={`${post.city}-${post.country}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{post.city}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{post.country}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBureauColor(post.bureau)}`}>
                      {post.bureau}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{post.region}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{post.seasonBegin || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{post.seasonEnd || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${post.maxLodgingRate || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${post.mieRate || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${post.maxPerDiemRate || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{post.effectiveDate || 'N/A'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstPost + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastPost, filteredAndSortedPosts.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredAndSortedPosts.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Regional Bureau Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-4 h-4 bg-red-100 border border-red-200 rounded"></span>
            <span><strong>AF:</strong> Africa</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-4 h-4 bg-blue-100 border border-blue-200 rounded"></span>
            <span><strong>EAP:</strong> East Asia Pacific</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-4 h-4 bg-green-100 border border-green-200 rounded"></span>
            <span><strong>EUR:</strong> Europe</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></span>
            <span><strong>NEA:</strong> Near East Asia</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-4 h-4 bg-purple-100 border border-purple-200 rounded"></span>
            <span><strong>SCA:</strong> South Central Asia</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-4 h-4 bg-orange-100 border border-orange-200 rounded"></span>
            <span><strong>WHA:</strong> Western Hemisphere</span>
          </div>
        </div>
      </div>
      
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-matisse hover:bg-black-pearl text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-matisse focus:ring-offset-2"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

// Utility functions for exporting post data
export const getAlphabeticalPostList = () => {
  return [...POST_DATA]
    .sort((a, b) => a.city.localeCompare(b.city))
    .map(post => post.city);
};

export const getAlphabeticalPostObjects = () => {
  return [...POST_DATA].sort((a, b) => a.city.localeCompare(b.city));
};

export const getRegionFromPostCity = (homePost) => {
  const post = POST_DATA.find(p => p.city.toUpperCase() === homePost?.toUpperCase());
  return post?.bureau || 'Unknown';
};

export const getPostsByRegion = (bureauCode) => {
  return POST_DATA
    .filter(post => post.bureau === bureauCode)
    .sort((a, b) => a.city.localeCompare(b.city));
};

export const getAllRegions = () => {
  const uniqueBureaus = [...new Set(POST_DATA.map(post => post.bureau))].sort();
  return uniqueBureaus.map(bureau => {
    const regionName = POST_DATA.find(post => post.bureau === bureau)?.region || bureau;
    return { code: bureau, name: regionName };
  });
};

// Dynamic POST_DATA that prioritizes location codes data
let POST_DATA = [...LOCATION_CODES_DATA]; // Initialize with location codes data

// Function to load fresh per diem data with location code support
export const loadPerDiemData = async () => {
  try {
    console.log('🌐 Attempting to load fresh per diem data with location codes...');
    
    // First try to get updated location codes data
    const locationCodesData = await PerDiemService.getLocationCodesData();
    if (locationCodesData && locationCodesData.length > 0) {
      POST_DATA.length = 0;
      POST_DATA.push(...locationCodesData);
      console.log(`✅ Loaded ${locationCodesData.length} location codes entries`);
      return { success: true, count: locationCodesData.length, source: 'location-codes' };
    }
    
    // Fallback to traditional scraping
    const freshData = await PerDiemService.getPerDiemData(FALLBACK_POST_DATA);
    if (freshData && freshData.length > 0) {
      POST_DATA.length = 0;
      POST_DATA.push(...freshData);
      console.log(`✅ Loaded ${freshData.length} fallback per diem entries`);
      return { success: true, count: freshData.length, source: 'fallback' };
    }
    
  } catch (error) {
    console.error('❌ Failed to load per diem data:', error);
    return { success: false, error: error.message };
  }
};

// Function to get per diem for specific location code
export const getPerDiemByLocationCode = async (locationCode) => {
  try {
    console.log(`🎯 Fetching per diem for location code: ${locationCode}`);
    const data = await PerDiemService.getPerDiemByLocationCode(locationCode);
    return data;
  } catch (error) {
    console.error(`❌ Failed to get per diem for location code ${locationCode}:`, error);
    return null;
  }
};

// Export the complete post data array as well
export { POST_DATA };

export default PostData;