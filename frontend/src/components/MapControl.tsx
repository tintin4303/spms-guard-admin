import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { savePatrolPath, fetchPatrolPaths, updatePatrolPath, deletePatrolPath, fetchContracts } from '../api';

// Fix leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Pin {
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  name: string;
}

// Fetches a smart polyline connecting coordinates via roads/footpaths
async function fetchSmartRoute(pins: Pin[]) {
  if (pins.length < 2) return [];
  const coords = pins.map(p => `${p.lng ?? p.longitude},${p.lat ?? p.latitude}`).join(';');
  try {
    const res = await fetch(`https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.routes && data.routes[0]) {
      // OSRM returns [lng, lat], Leaflet wants [lat, lng]
      return data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
    }
  } catch (e) {
    console.error('OSRM fail', e);
  }
  return [];
}

function MapPanner({ pins }: { pins: Pin[] }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length > 0) {
      const bounds = L.latLngBounds(pins.map(p => [p.lat ?? p.latitude!, p.lng ?? p.longitude!]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
      }
    }
  }, [pins, map]);
  return null;
}

function SearchPanner({ center }: { center?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 16, { animate: true });
    }
  }, [center, map]);
  return null;
}

function PinDropper({ onAddPin, disabled, firstPin }: { onAddPin: (p: Pin) => void, disabled: boolean, firstPin?: Pin }) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      
      let finalLat = e.latlng.lat;
      let finalLng = e.latlng.lng;
      let isSnapped = false;
      
      if (firstPin) {
         const firstLatLng = L.latLng(firstPin.lat ?? firstPin.latitude!, firstPin.lng ?? firstPin.longitude!);
         if (e.latlng.distanceTo(firstLatLng) < 40) {
            finalLat = firstLatLng.lat;
            finalLng = firstLatLng.lng;
            isSnapped = true;
         }
      }

      const pinName = isSnapped ? 'Return to Start' : prompt('Enter a name for this patrol pin (e.g., North Gate):');
      if (pinName) {
        onAddPin({ lat: finalLat, lng: finalLng, name: pinName });
      }
    },
  });
  return null;
}

export default function MapControl() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const [savedPaths, setSavedPaths] = useState<any[]>([]);
  const [viewingPath, setViewingPath] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editPins, setEditPins] = useState<Pin[]>([]);
  
  const [smartGeometry, setSmartGeometry] = useState<[number, number][]>([]);

  // Contract Context State
  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');

  useEffect(() => {
    fetchContracts().then(setContracts).catch(console.error);
  }, []);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchCenter, setSearchCenter] = useState<[number, number] | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);

  const searchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch(err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (lat: string, lon: string) => {
    setSearchCenter([parseFloat(lat), parseFloat(lon)]);
    setSearchResults([]);
    setSearchQuery('');
  };

  const loadPaths = () => {
    if (selectedSiteId) {
      fetchPatrolPaths(selectedSiteId).then(setSavedPaths).catch(console.error);
    } else {
      setSavedPaths([]);
    }
  };

  useEffect(() => {
    loadPaths();
    setViewingPath(null);
    setIsEditing(false);
    setPins([]);
  }, [selectedSiteId]);

  const activePins = viewingPath ? (isEditing ? editPins : viewingPath.pins) : pins;

  useEffect(() => {
    if (activePins.length >= 2) {
      fetchSmartRoute(activePins).then(geom => {
        if (geom.length > 0) setSmartGeometry(geom);
      });
    } else {
      setSmartGeometry([]);
    }
  }, [activePins]);

  const handleSavePath = async () => {
    if (!selectedSiteId) return alert('Select a contract site first');
    const pathName = prompt('Enter a name for this entire sequence (e.g., Midnight Perimeter):');
    if (!pathName) return;

    setIsSaving(true);
    try {
      await savePatrolPath(pathName, pins, selectedSiteId);
      alert('Path saved successfully to backend!');
      setPins([]);
      loadPaths();
    } catch (err: any) {
      alert(`Error saving path: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!viewingPath) return;
    setIsSaving(true);
    try {
      await updatePatrolPath(viewingPath.id, editPins);
      alert('Path updated successfully!');
      setIsEditing(false);
      loadPaths();
      setViewingPath((prev: any) => ({ ...prev, pins: editPins }));
    } catch(err: any) {
      alert(`Error updating: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!viewingPath || !confirm('Are you sure you want to delete this route?')) return;
    try {
      await deletePatrolPath(viewingPath.id);
      setViewingPath(null);
      setIsEditing(false);
      loadPaths();
    } catch(err: any) {
      alert(`Error deleting: ${err.message}`);
    }
  };

  const undoPin = () => {
    if (isEditing) {
      setEditPins(prev => prev.slice(0, -1));
    } else {
      setPins(prev => prev.slice(0, -1));
    }
  };

  const addPinMode = (p: Pin) => {
    if (isEditing) setEditPins([...editPins, p]);
    else setPins([...pins, p]);
  };

  return (
    <div className="flex flex-col md:flex-row h-full gap-4">
      {/* Sidebar for paths */}
      <div className="w-full md:w-1/4 flex flex-col bg-white rounded border border-[#E2E8F0] shadow-sm">
        <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h2 className="text-[17px] font-semibold font-serif text-[#1E3A5F]">Saved Paths</h2>
          <p className="text-[12px] text-[#6B7280] mt-1">Select a route to view its mapping.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
           <div 
             onClick={() => { setViewingPath(null); setIsEditing(false); setPins([]); }}
             className={`p-3 rounded border text-[14px] cursor-pointer transition-colors ${viewingPath === null ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'hover:bg-gray-50 border-[#E2E8F0] text-[#0F172A]'}`}
           >
             <strong>+ Create New Path</strong>
           </div>
           
           {savedPaths.map((path) => (
              <div 
                key={path.id}
                onClick={() => {
                  setViewingPath(path);
                  setIsEditing(false);
                  setEditPins(path.pins);
                }}
                className={`p-3 rounded border text-[13px] cursor-pointer transition-colors ${viewingPath?.id === path.id ? 'bg-[#EBF1FA] border-[#1E3A5F] text-[#1E3A5F] font-semibold' : 'hover:bg-gray-50 border-[#E2E8F0] text-[#475569]'}`}
              >
                <div className="flex justify-between">
                   <span>{path.name}</span>
                   <span className="text-[11px] text-[#94A3B8]">{path.pins.length} pins</span>
                </div>
              </div>
           ))}
        </div>
      </div>

      {/* Map Area */}
      <div className="w-full md:w-3/4 flex flex-col h-full bg-white rounded border border-[#E2E8F0] shadow-sm">
        
        <div className="px-6 py-3 border-b border-[#E2E8F0] bg-white flex justify-between items-center text-[13px]">
           <span className="font-medium text-[#1E3A5F]">Context Linkage:</span>
           <select 
             value={selectedSiteId} 
             onChange={(e) => setSelectedSiteId(e.target.value)}
             className="border border-[#CBD5E1] text-[#334155] rounded px-3 py-1.5 focus:ring-0 outline-none w-[350px] shadow-sm"
           >
             <option value="">-- Select a Contract & Site --</option>
             {contracts.map(c => 
                c.sites?.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {c.clientCompanyName} - {s.name}
                  </option>
                ))
             )}
           </select>
        </div>

        <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
          <div>
            <h2 className="text-[18px] font-semibold font-serif text-[#1E3A5F]">
              {viewingPath ? (isEditing ? `Editing: ${viewingPath.name}` : `Viewing: ${viewingPath.name}`) : 'New Patrol Sequence Creator'}
            </h2>
            <p className="text-[12px] text-[#6B7280] mt-1">
              {viewingPath && !isEditing ? 'Historical locked path. Click Edit to unlock modifications.' : 'Click anywhere map to trace sequence.'}
            </p>
          </div>
          <div className="flex gap-2">
            {!viewingPath && (
              <>
                <button onClick={undoPin} disabled={pins.length===0} className="px-3 py-1.5 border border-gray-300 rounded text-[13px] hover:bg-gray-50 disabled:opacity-50">Undo Pin</button>
                <button 
                  onClick={handleSavePath}
                  disabled={pins.length === 0 || isSaving}
                  className="bg-[#1E3A5F] disabled:bg-gray-400 text-white px-4 py-2 rounded text-[13px] font-medium hover:bg-[#162D4A] transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Patrol Path'}
                </button>
              </>
            )}
            {viewingPath && !isEditing && (
              <>
                 <button onClick={handleDelete} className="px-3 py-1.5 border border-red-200 text-red-600 rounded text-[13px] hover:bg-red-50">Delete</button>
                 <button onClick={() => setIsEditing(true)} className="bg-[#1E3A5F] text-white px-4 py-1.5 rounded text-[13px] hover:bg-[#162D4A]">Edit Route</button>
              </>
            )}
            {viewingPath && isEditing && (
              <>
                 <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 border border-gray-300 rounded text-[13px] hover:bg-gray-50">Discard</button>
                 <button onClick={undoPin} disabled={editPins.length===0} className="px-3 py-1.5 border border-gray-300 rounded text-[13px] disabled:opacity-50 hover:bg-gray-50">Undo Pin</button>
                 <button onClick={handleUpdate} disabled={isSaving} className="bg-green-600 text-white px-4 py-1.5 rounded text-[13px] hover:bg-green-700">Submit Edits</button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 w-full relative z-0">
          {/* Overlay Search Bar */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-[350px]">
            <form onSubmit={searchLocation} className="flex bg-white shadow-lg rounded overflow-hidden border border-gray-300">
               <input 
                 type="text" 
                 placeholder="Search location (e.g. Bangkok)" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="flex-1 px-4 py-2 border-none focus:ring-0 text-[14px] bg-transparent text-gray-800"
               />
               <button type="submit" disabled={isSearching} className="bg-[#1E3A5F] px-4 py-2 text-white text-[13px] font-medium {isSearching ? 'opacity-50' : 'hover:bg-[#162D4A]'}">
                 {isSearching ? '...' : 'Search'}
               </button>
            </form>
            {searchResults.length > 0 && (
              <div className="mt-1 bg-white shadow-xl rounded max-h-[250px] overflow-y-auto border border-gray-200">
                {searchResults.map((res: any, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleSelectResult(res.lat, res.lon)}
                    className="p-3 border-b text-[13px] hover:bg-gray-50 cursor-pointer"
                  >
                    {res.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <MapContainer center={[13.7563, 100.5018]} zoom={13} style={{ height: '600px', width: '100%', minHeight: '600px' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapPanner pins={activePins} />
            <SearchPanner center={searchCenter} />
            
            {!viewingPath && <PinDropper onAddPin={addPinMode} disabled={viewingPath !== null || !selectedSiteId} firstPin={activePins[0]} />}
            {viewingPath && isEditing && <PinDropper onAddPin={addPinMode} disabled={!selectedSiteId} firstPin={activePins[0]} />}
            
            {/* Draw Path Lines - using smart footprint OSRM layout, falling back to direct connecting lines if it fails */}
            {activePins.length > 1 && (
              <Polyline 
                 positions={smartGeometry.length > 0 ? smartGeometry : activePins.map((p: any) => [p.lat ?? p.latitude, p.lng ?? p.longitude] as [number, number])} 
                 pathOptions={{ color: '#1E3A5F', weight: 5, opacity: 0.8, lineJoin: 'round' }} 
              />
            )}

            {/* Draw Pins */}
            {activePins.map((pin: any, idx: number) => {
               if (idx > 0 && activePins.length > 1) {
                  const start = activePins[0];
                  if ((pin.lat === start.lat && pin.lat !== undefined) || (pin.latitude === start.latitude && pin.latitude !== undefined)) {
                     if ((pin.lng === start.lng && pin.lng !== undefined) || (pin.longitude === start.longitude && pin.longitude !== undefined)) {
                        return null; 
                     }
                  }
               }
               return (
                 <Marker key={idx} position={[pin.lat ?? pin.latitude, pin.lng ?? pin.longitude]}>
                   <Popup>
                     <strong>Pin {idx + 1}:</strong> {pin.name}
                   </Popup>
                 </Marker>
               );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
