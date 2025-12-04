import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Diplomatic post coordinates
const postCoordinates = {
  'paris': [48.8566, 2.3522],
  'london': [51.5074, -0.1278],
  'nairobi': [-1.2921, 36.8219],
  'johannesburg': [-26.2041, 28.0473],
  'tokyo': [35.6762, 139.6503],
  'singapore': [1.3521, 103.8198],
  'baghdad': [33.3152, 44.3661],
  'dubai': [25.2048, 55.2708],
  'islamabad': [33.6844, 73.0479],
  'bangkok': [13.7563, 100.5018],
  'bogota': [4.7110, -74.0721],
  'miami': [25.7617, -80.1918],
  'berlin': [52.5200, 13.4050],
  'frankfurt': [50.1109, 8.6821],
  'mexico city': [19.4326, -99.1332],
  'houston': [29.7604, -95.3698]
};

const MedevacWorldMap = ({ routes, cases }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);



  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      scrollWheelZoom: true
    });

    mapInstanceRef.current = map;

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Add markers for MEDEVAC routes
    if (routes && routes.length > 0) {
      routes.forEach((route) => {
        const originCoords = postCoordinates[route.from.toLowerCase()];
        const destCoords = postCoordinates[route.to.toLowerCase()];

        if (originCoords && destCoords) {
          // Create custom red icon for origin
          const redIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });

          // Create custom green icon for destination
          const greenIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });

          // Origin marker (red - where patient is evacuated from)
          const originMarker = L.marker(originCoords, {
            icon: redIcon
          }).addTo(map);

          originMarker.bindPopup(`
            <div class="p-3">
              <h3 class="font-bold text-lg mb-2">🏥 Origin: ${route.from}</h3>
              <p class="text-sm text-gray-600 mb-1">Region: ${route.region}</p>
              <p class="text-lg font-bold text-red-600">Cost: $${(route.cost/1000).toFixed(0)}K</p>
              <p class="text-xs text-gray-500 mt-1">Medical evacuation departure point</p>
            </div>
          `);

          // Destination marker (green - where patient is evacuated to)
          const destMarker = L.marker(destCoords, {
            icon: greenIcon
          }).addTo(map);

          destMarker.bindPopup(`
            <div class="p-3">
              <h3 class="font-bold text-lg mb-2">✈️ Destination: ${route.to}</h3>
              <p class="text-sm text-gray-600 mb-1">Medical facility location</p>
              <p class="text-lg font-bold text-green-600">Cost: $${(route.cost/1000).toFixed(0)}K</p>
              <p class="text-xs text-gray-500 mt-1">Treatment destination</p>
            </div>
          `);

          // Draw flight path
          const flightPath = L.polyline([originCoords, destCoords], {
            color: route.cost > 50000 ? '#dc2626' : route.cost > 35000 ? '#f59e0b' : '#16a34a',
            weight: route.cost > 50000 ? 4 : route.cost > 35000 ? 3 : 2,
            opacity: 0.7,
            dashArray: '10, 10'
          }).addTo(map);

          flightPath.bindPopup(`
            <div class="p-3">
              <h3 class="font-bold text-lg mb-2">🛫 MEDEVAC Route</h3>
              <p class="text-sm mb-1"><strong>From:</strong> ${route.from}</p>
              <p class="text-sm mb-1"><strong>To:</strong> ${route.to}</p>
              <p class="text-sm mb-1"><strong>Region:</strong> ${route.region}</p>
              <p class="text-lg font-bold text-blue-600 mb-1">Total Cost: $${route.cost.toLocaleString()}</p>
              <p class="text-xs text-gray-500">Click markers for detailed information</p>
            </div>
          `);
        }
      });
    }

    // Add additional markers for cases if provided
    if (cases && cases.length > 0) {
      cases.forEach((medCase) => {
        const postCoords = postCoordinates[medCase.homePost.toLowerCase()];
        if (postCoords) {
          // Create custom blue icon for cases
          const blueIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [20, 33],
            iconAnchor: [10, 33],
            popupAnchor: [1, -28],
            shadowSize: [33, 33]
          });

          const caseMarker = L.marker(postCoords, {
            icon: blueIcon
          }).addTo(map);

          const statusColor = {
            'Completed': 'green',
            'In Progress': 'blue', 
            'Extension Required': 'orange',
            'Amendment Processing': 'purple',
            'Initiated': 'gray'
          };

          caseMarker.bindPopup(`
            <div class="p-3">
              <h3 class="font-bold text-lg mb-2">📋 Case: ${medCase.id}</h3>
              <p class="text-sm mb-1"><strong>Patient:</strong> ${medCase.patientName}</p>
              <p class="text-sm mb-1"><strong>Type:</strong> ${medCase.caseType}</p>
              <p class="text-sm mb-1"><strong>Agency:</strong> ${medCase.agencyType}</p>
              <p class="text-sm mb-1"><strong>Status:</strong> 
                <span style="color: ${statusColor[medCase.status] || 'gray'}">${medCase.status}</span>
              </p>
              <p class="text-lg font-bold text-blue-600">$${medCase.totalObligation.toLocaleString()}</p>
            </div>
          `);
        }
      });
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [routes, cases]);

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-96 rounded-lg shadow-lg border border-gray-200" />
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-lg p-3 shadow-lg border border-gray-200 z-[1000]">
        <h4 className="font-bold text-sm mb-2">Map Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
            <span>🏥 Origin Posts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            <span>✈️ Medical Destinations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500 opacity-70"></div>
            <span>--- Flight Paths</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <div>Marker size = Cost level</div>
            <div>Line thickness = Total cost</div>
          </div>
        </div>
      </div>

      {/* Map Controls Info */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        Click markers and flight paths for detailed information • Zoom and pan to explore
      </div>
    </div>
  );
};

export default MedevacWorldMap;