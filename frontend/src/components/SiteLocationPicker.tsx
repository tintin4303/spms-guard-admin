import { useState, useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import { MapPin, X } from 'lucide-react';

// Fix for Vite production worker path issue causing black maps
// Bypass Rolldown's strict immutable import checks
const maplibreglAny = maplibregl as any;
maplibreglAny.workerUrl = 'https://unpkg.com/maplibre-gl@6.4.0/dist/maplibre-gl-csp-worker.js';

interface LocationPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onSelectLocation: (lat: number, lng: number) => void;
  onClose: () => void;
}

export default function SiteLocationPicker({ initialLat, initialLng, onSelectLocation, onClose }: LocationPickerProps) {
  const mapRef = useRef<any>(null);
  const [viewState, setViewState] = useState({
    longitude: initialLng || 100.5018,
    latitude: initialLat || 13.7563,
    zoom: 15,
  });

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat || 13.7563,
    lng: initialLng || 100.5018,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!initialLat && !initialLng && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setViewState((prev) => ({ ...prev, latitude: lat, longitude: lng }));
          setSelectedCoords({ lat, lng });
        },
        (err) => console.warn('Geolocation unavailable:', err)
      );
    }
  }, [initialLat, initialLng]);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { longitude: lng, latitude: lat } = viewState;
        const viewbox = `${lng - 2},${lat + 2},${lng + 2},${lat - 2}`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&viewbox=${viewbox}`
        );
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery, viewState.latitude, viewState.longitude]);

  const handleSelectSearchResult = (latStr: string, lonStr: string) => {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lonStr);
    setViewState((prev) => ({ ...prev, latitude: lat, longitude: lng, zoom: 16 }));
    setSelectedCoords({ lat, lng });
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleMapClick = (evt: any) => {
    const lat = evt.lngLat.lat;
    const lng = evt.lngLat.lng;
    setSelectedCoords({ lat, lng });
  };

  const handleConfirm = () => {
    onSelectLocation(selectedCoords.lat, selectedCoords.lng);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col border border-gray-200 animate-in fade-in duration-200">
        <div className="px-6 py-4 bg-[#0F172A] text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">Pick Site Geographic Location</h3>
            <p className="text-xs text-gray-400">Click anywhere on the map or search to drop pin</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-full h-[450px]">
          {/* Overlay Search Bar */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[10] w-[320px]">
            <input
              type="text"
              placeholder="Search location or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-white/95 backdrop-blur-sm text-sm rounded-lg shadow-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
            {isSearching && <span className="absolute right-3 top-2.5 text-xs text-gray-400">Searching...</span>}
            {searchResults.length > 0 && (
              <div className="mt-1 bg-white shadow-xl rounded-lg border border-gray-200 max-h-[200px] overflow-y-auto divide-y divide-gray-100">
                {searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSearchResult(item.lat, item.lon)}
                    className="px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 cursor-pointer truncate"
                  >
                    {item.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Map
            ref={mapRef}
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            style={{ width: '100%', height: '100%' }}
            onClick={handleMapClick}
          >
            <NavigationControl position="bottom-right" />
            <Marker longitude={selectedCoords.lng} latitude={selectedCoords.lat} anchor="bottom">
              <div className="relative flex flex-col items-center">
                <div className="w-8 h-8 bg-red-500/30 rounded-full animate-ping absolute -top-1"></div>
                <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
              </div>
            </Marker>
          </Map>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <strong>Latitude:</strong> {selectedCoords.lat.toFixed(6)} | <strong>Longitude:</strong> {selectedCoords.lng.toFixed(6)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
