import { useState, useEffect, useRef } from 'react';
import Map, { Source, Layer, Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { savePatrolPath, fetchPatrolPaths, updatePatrolPath, deletePatrolPath, fetchContracts } from '../api';

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
      return data.routes[0].geometry.coordinates; // OSRM returns [lng, lat], which MapLibre prefers!
    }
  } catch (e) {
    console.error('OSRM fail', e);
  }
  return [];
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

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Map state
  const mapRef = useRef<any>(null);
  const [viewState, setViewState] = useState({
    longitude: 100.5018,
    latitude: 13.7563,
    zoom: 15,
    pitch: 50, // 3D Gamification
    bearing: -20
  });

  useEffect(() => {
    fetchContracts().then(setContracts).catch(console.error);
    
    // Automatically center map and searches on User's physical GPS location if permitted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setViewState(prev => ({
          ...prev,
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
          zoom: 14
        }));
      }, (err) => {
        console.warn('Geolocation denied or unavailable:', err);
      });
    }
  }, []);

  const searchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSelectResult(searchResults[0].lat, searchResults[0].lon);
    }
  };

  // Auto-search suggestions when typing (Debounced)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Create a ~2 degree bounding box around the current map center to strongly prefer local results
        const { longitude: lng, latitude: lat } = viewState;
        const viewbox = `${lng - 2},${lat + 2},${lng + 2},${lat - 2}`;
        
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&viewbox=${viewbox}`);
        const data = await res.json();
        setSearchResults(data);
      } catch(err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 600); // 600ms debounce to comply with API rate limits

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelectResult = (lat: string, lon: string) => {
    setViewState(prev => ({
      ...prev,
      longitude: parseFloat(lon),
      latitude: parseFloat(lat),
      zoom: 16
    }));
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

  useEffect(() => {
    // Re-center map if viewing a new saved path
    if (viewingPath && viewingPath.pins.length > 0 && mapRef.current) {
       const lats = viewingPath.pins.map((p:any) => p.lat ?? p.latitude);
       const lngs = viewingPath.pins.map((p:any) => p.lng ?? p.longitude);
       setViewState(prev => ({
         ...prev,
         longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
         latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
         zoom: 16
       }));
    }
  }, [viewingPath]);

  // --- API Handlers ---
  const handleSavePath = async () => {
    if (!selectedSiteId) return alert('Select a contract site first');
    const pathName = prompt('Enter a name for this entire sequence (e.g., Midnight Perimeter):');
    if (!pathName) return;

    setIsSaving(true);
    try {
      await savePatrolPath(pathName, pins, selectedSiteId);
      alert('Path saved successfully to backend!');
      setPins([]);
      setSmartGeometry([]);
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
    if (isEditing) setEditPins(prev => prev.slice(0, -1));
    else setPins(prev => prev.slice(0, -1));
  };

  const handleDragStart = (e: any, index: number) => {
    e.dataTransfer.setData('pinIndex', index.toString());
  };

  const handleDrop = (e: any, targetIndex: number) => {
    const sourceIndexStr = e.dataTransfer.getData('pinIndex');
    if (!sourceIndexStr) return;
    const sourceIndex = parseInt(sourceIndexStr, 10);
    const currPins = isEditing ? editPins : pins;
    const newPins = [...currPins];
    const [removed] = newPins.splice(sourceIndex, 1);
    newPins.splice(targetIndex, 0, removed);
    if (isEditing) setEditPins(newPins);
    else setPins(newPins);
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  // --- Map Event Handlers ---
  const onMapClick = (evt: any) => {
    if (viewingPath && !isEditing || !selectedSiteId) return;

    let finalLng = evt.lngLat.lng;
    let finalLat = evt.lngLat.lat;

    const pinName = prompt('Enter a name for this checkpoint:');
    if (pinName) {
      const p = { lat: finalLat, lng: finalLng, name: pinName };
      if (isEditing) setEditPins([...editPins, p]);
      else setPins([...pins, p]);
    }
  };

  // GeoJSON data sources for visualization
  const routeGeoJSON: any = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: smartGeometry.length > 0 ? smartGeometry : activePins.map(p => [p.lng ?? p.longitude, p.lat ?? p.latitude])
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full gap-4 bg-[#F1F5F9]">
      {/* Sidebar for paths */}
      <div className="w-full md:w-1/4 flex flex-col bg-[#1E293B] rounded-xl border border-[#334155] shadow-xl overflow-hidden">
        <div className="px-5 py-5 border-b border-[#334155] bg-[#0F172A]">
          <h2 className="text-[18px] font-semibold tracking-wide text-white">Patrol Routes</h2>
          <p className="text-[12px] text-[#94A3B8] mt-1">Select or sequence waypoints.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
           <div 
             onClick={() => { setViewingPath(null); setIsEditing(false); setPins([]); setSmartGeometry([]); }}
             className={`p-3 rounded-lg border text-[14px] font-medium cursor-pointer transition-all duration-200 ${viewingPath === null ? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow-lg shadow-blue-500/30' : 'bg-[#1E293B] hover:bg-[#334155] border-[#475569] text-gray-200'}`}
           >
             <strong>+ Prepare New Operation</strong>
           </div>

           {/* Render Active Checkpoints for Drag and Drop Reordering */}
           {activePins.length > 0 && (
             <div className="mt-4 mb-6 relative">
                <h3 className="text-gray-400 text-[11px] uppercase font-bold tracking-wider mb-2 px-1">Active Route Checkpoints</h3>
                <div className="space-y-2 border-l-2 border-[#334155] ml-2 pl-3">
                   {activePins.map((pin, i) => (
                     <div 
                       key={i} 
                       draggable 
                       onDragStart={(e) => handleDragStart(e, i)}
                       onDrop={(e) => handleDrop(e, i)}
                       onDragOver={handleDragOver}
                       className="bg-[#0F172A] border border-[#475569] rounded p-2 text-white text-[12px] cursor-grab active:cursor-grabbing flex items-center justify-between shadow-sm relative group hover:border-[#3B82F6]"
                     >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#1E293B] text-gray-400 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                          <span className="font-medium truncate max-w-[120px]">{pin.name}</span>
                        </div>
                        <div className="text-[#64748B] hover:text-red-400 opacity-0 group-hover:opacity-100 cursor-pointer p-1" onClick={(e) => {
                           e.stopPropagation();
                           const curr = isEditing ? editPins : pins;
                           const np = curr.filter((_, idx) => idx !== i);
                           if(isEditing) setEditPins(np); else setPins(np);
                        }}>✕</div>
                     </div>
                   ))}
                </div>
             </div>
           )}
           
           <h3 className="text-gray-400 text-[11px] uppercase font-bold tracking-wider mt-6 mb-2 px-1">Saved Operations</h3>
           {savedPaths.map((path) => (
              <div 
                key={path.id}
                onClick={() => {
                  setViewingPath(path);
                  setIsEditing(false);
                  setEditPins(path.pins);
                }}
                className={`p-3 rounded-lg border text-[13px] cursor-pointer transition-all duration-200 ${viewingPath?.id === path.id ? 'bg-[#0F172A] border-[#3B82F6] border-2 text-white shadow-md' : 'bg-[#1E293B] hover:bg-[#334155] border-[#475569] text-gray-300'}`}
              >
                <div className="flex justify-between items-center">
                   <span className="font-semibold">{path.name}</span>
                   <span className="text-[11px] bg-[#334155] px-2 py-0.5 rounded-full text-gray-300">{path.pins.length} pts</span>
                </div>
              </div>
           ))}
        </div>
      </div>

      {/* Map Area */}
      <div className="w-full md:w-3/4 flex flex-col h-full bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden relative">
        
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-white flex justify-between items-center z-10">
           <div className="flex items-center gap-3">
             <span className="font-medium text-[#1E3A5F] text-[14px]">Assigned Site:</span>
             <select 
               value={selectedSiteId} 
               onChange={(e) => setSelectedSiteId(e.target.value)}
               className="border border-[#CBD5E1] text-[#334155] rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none w-[300px] shadow-sm font-medium"
             >
               <option value="">-- Associate with a Contract --</option>
               {contracts.map(c => 
                  c.sites?.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {c.clientCompanyName} - {s.name}
                    </option>
                  ))
               )}
             </select>
           </div>
        </div>

        <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC] z-10">
          <div>
            <h2 className="text-[18px] font-bold tracking-tight text-[#0F172A]">
              {viewingPath ? (isEditing ? `Live Routing: ${viewingPath.name}` : `Historical Feed: ${viewingPath.name}`) : 'Active Patrol Generator'}
            </h2>
            <p className="text-[12px] text-[#64748B] mt-1">
              Click map to drop rigid pins and route checkpoints.
            </p>
          </div>
          <div className="flex gap-2">
            {!viewingPath && (
              <>
                <button onClick={undoPin} disabled={pins.length===0} className="px-4 py-2 border border-gray-300 rounded-lg text-[13px] font-medium hover:bg-gray-100 disabled:opacity-40 transition-colors">Undo Checkpoint</button>
                <button 
                  onClick={handleSavePath}
                  disabled={pins.length === 0 || isSaving}
                  className="bg-[#3B82F6] disabled:bg-blue-300 text-white px-5 py-2 rounded-lg text-[13px] font-bold hover:bg-[#2563EB] transition-all shadow-md hover:shadow-lg"
                >
                  {isSaving ? 'Synchronizing...' : 'Deploy Sequence'}
                </button>
              </>
            )}
            {viewingPath && !isEditing && (
              <>
                 <button onClick={handleDelete} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-[13px] font-medium hover:bg-red-50 transition-colors">Decommission</button>
                 <button onClick={() => setIsEditing(true)} className="bg-[#1E293B] text-white px-5 py-2 rounded-lg text-[13px] font-bold hover:bg-[#0F172A] shadow-md transition-all">Re-route</button>
              </>
            )}
            {viewingPath && isEditing && (
              <>
                 <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-[13px] font-medium hover:bg-gray-100 transition-colors">Discard Draft</button>
                 <button onClick={handleUpdate} disabled={isSaving} className="bg-[#10B981] text-white px-5 py-2 rounded-lg text-[13px] font-bold hover:bg-[#059669] shadow-md transition-all">Deploy Edits</button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 relative w-full h-[600px] cursor-crosshair">
          {/* Overlay Search */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[100] w-[350px]">
             <form onSubmit={searchLocation} className="flex bg-white/90 backdrop-blur-sm shadow-xl rounded-lg overflow-hidden border border-[#E2E8F0]">
               <input 
                 type="text" 
                 placeholder="Search sector (e.g. Bangkok)" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="flex-1 px-4 py-2.5 border-none focus:ring-0 text-[14px] bg-transparent text-[#0F172A] font-medium placeholder-gray-400 outline-none"
               />
               <button type="submit" disabled={isSearching} className={`px-5 py-2.5 text-white text-[13px] font-semibold uppercase tracking-wider ${isSearching ? 'bg-[#94A3B8]' : 'bg-[#3B82F6] hover:bg-[#2563EB]'} transition-colors`}>
                 {isSearching ? '...' : 'Scan'}
               </button>
             </form>
             {searchResults.length > 0 && (
               <div className="mt-2 bg-white/95 backdrop-blur-md shadow-2xl rounded-lg max-h-[300px] overflow-y-auto border border-gray-100 divide-y divide-gray-100">
                 {searchResults.map((res: any, idx) => (
                   <div 
                     key={idx} 
                     onClick={() => handleSelectResult(res.lat, res.lon)}
                     className="p-3 text-[13px] hover:bg-[#F1F5F9] text-[#334155] cursor-pointer transition-colors"
                   >
                     {res.display_name}
                   </div>
                 ))}
               </div>
             )}
          </div>

          <Map
             ref={mapRef}
             {...viewState}
             onMove={evt => setViewState(evt.viewState)}
             mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
             style={{ width: '100%', height: '600px', minHeight: '600px', display: 'block' }}
             interactiveLayerIds={[]}
             onClick={onMapClick}
             dragPan={true}
             dragRotate={true}
          >
             <NavigationControl position="bottom-right" visualizePitch={true} />

             {/* Finished / Snapped Route */}
             {activePins.length > 1 && (
                <Source type="geojson" data={routeGeoJSON}>
                   <Layer 
                     id="patrol-route"
                     type="line"
                     layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                     paint={{
                        'line-color': '#3B82F6',
                        'line-width': 3,
                        'line-opacity': 0.8,
                        'line-dasharray': [0, 4, 3] // Animated look setup
                     }}
                   />
                   <Layer 
                     id="patrol-route-glow"
                     type="line"
                     layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                     paint={{
                        'line-color': '#60A5FA',
                        'line-width': 7,
                        'line-opacity': 0.2, // Gamified glowing aura
                        'line-blur': 6
                     }}
                   />
                </Source>
             )}

             {/* Markers */}
             {activePins.map((pin: any, idx: number) => (
                <Marker key={idx} longitude={pin.lng ?? pin.longitude} latitude={pin.lat ?? pin.latitude}>
                   <div className="relative flex items-center justify-center">
                     <div className="absolute w-8 h-8 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                     <div className="w-4 h-4 bg-[#3B82F6] border-2 border-white rounded-full shadow-lg z-10"></div>
                   </div>
                </Marker>
             ))}
          </Map>
        </div>
      </div>
    </div>
  );
}
