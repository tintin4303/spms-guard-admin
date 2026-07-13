"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Checkpoint marker icon (Blue)
const checkpointIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// User location marker icon (Red/Different color to distinguish)
// Instead of a different image, we can use a custom HTML div icon or just a CircleMarker, but for simplicity we'll just tint it via css if needed, or use a generic red icon if available.
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// A sub-component to handle map clicks and map centering
function MapController({ 
  onAddCheckpoint, 
  userPosition 
}: { 
  onAddCheckpoint: (latlng: [number, number]) => void,
  userPosition: [number, number] | null
}) {
  const map = useMap();
  
  // Center map on user once location is found
  useEffect(() => {
    if (userPosition) {
      map.flyTo(userPosition, 16);
    }
  }, [userPosition, map]);

  useMapEvents({
    click(e) {
      onAddCheckpoint([e.latlng.lat, e.latlng.lng]);
    }
  });

  return null;
}

export default function MapTest() {
  const [isClient, setIsClient] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [checkpoints, setCheckpoints] = useState<[number, number][]>([]);

  useEffect(() => {
    setIsClient(true);
    
    // Request geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.error("Geolocation error:", err);
          // Fallback location if permission denied
          setUserPosition([51.505, -0.09]);
        }
      );
    } else {
      setUserPosition([51.505, -0.09]);
    }
  }, []);

  const handleAddCheckpoint = (latlng: [number, number]) => {
    setCheckpoints(prev => [...prev, latlng]);
  };

  const handleClearRoute = () => {
    setCheckpoints([]);
  };

  if (!isClient) return <div className="h-[500px] w-full flex items-center justify-center bg-gray-100 rounded-xl text-gray-500">Loading Map...</div>;

  // Render centered somewhere roughly until user location is found
  const initialPosition: [number, number] = userPosition || [51.505, -0.09];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Click anywhere on the map to add a checkpoint.
        </p>
        <button 
          onClick={handleClearRoute}
          className="px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition"
        >
          Clear Route
        </button>
      </div>

      <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-200" style={{position: "relative", zIndex: 0}}>
        <MapContainer
          center={initialPosition}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full"
          key="map-container"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController 
            onAddCheckpoint={handleAddCheckpoint} 
            userPosition={userPosition} 
          />

          {/* User Location Marker */}
          {userPosition && (
            <Marker position={userPosition} icon={userIcon}>
              <Popup>Your Current Location</Popup>
            </Marker>
          )}

          {/* Checkpoint Markers */}
          {checkpoints.map((cp, idx) => (
            <Marker key={idx} position={cp} icon={checkpointIcon}>
              <Popup>Checkpoint {idx + 1}</Popup>
            </Marker>
          ))}

          {/* Route Line connecting checkpoints */}
          {checkpoints.length > 1 && (
            <Polyline 
              positions={checkpoints} 
              color="blue" 
              weight={4}
              opacity={0.7}
              dashArray="10, 10" // Make it dashed
            />
          )}

        </MapContainer>
      </div>
      
      {checkpoints.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2">
          <h3 className="font-semibold text-lg mb-2">Planned Route ({checkpoints.length} Checkpoints)</h3>
          <ul className="text-sm text-gray-600 list-decimal pl-5">
            {checkpoints.map((cp, idx) => (
              <li key={idx}>Lat: {cp[0].toFixed(5)}, Lng: {cp[1].toFixed(5)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
