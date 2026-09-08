import { useEffect, useState } from 'react';
import { fetchGuardShifts, reportGuardIncident } from '../../api';

export default function GuardIncidents() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [rosterId, setRosterId] = useState('');
  const [mapPinId, setMapPinId] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGuardShifts().then(setShifts).catch(console.error);
  }, []);

  const selectedShift = shifts.find(s => s.id === rosterId);
  
  const allPins: any[] = [];
  if (selectedShift?.site?.patrolPaths) {
    selectedShift.site.patrolPaths.forEach((path: any) => {
      path.pins?.forEach((p: any) => {
        allPins.push({ ...p, pathName: path.name });
      });
    });
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!rosterId || !mapPinId || !description) return;
    setLoading(true);
    try {
      await reportGuardIncident({ rosterId, mapPinId, description });
      alert('Incident reported successfully.');
      setDescription('');
      setMapPinId('');
    } catch (err) {
      alert('Failed to report incident.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded border border-[#E2E8F0] shadow-sm max-w-2xl mx-auto mt-6">
      <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <h2 className="text-[18px] font-semibold text-[#1E3A5F]">Report Incident</h2>
        <p className="text-[13px] text-gray-500 mt-1">Submit a real-time incident report to the Operations Manager.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1">Select Shift</label>
          <select 
            required 
            value={rosterId} 
            onChange={e => { setRosterId(e.target.value); setMapPinId(''); }}
            className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">-- Choose Active Shift --</option>
            {shifts.filter(s => s.status !== 'Completed' && !s.status.startsWith('Completed')).map(s => (
              <option key={s.id} value={s.id}>{s.shiftLabel} ({s.site?.name})</option>
            ))}
            {shifts.filter(s => s.status.startsWith('Completed')).length > 0 && (
               <optgroup label="Past Shifts">
                 {shifts.filter(s => s.status.startsWith('Completed')).map(s => (
                   <option key={s.id} value={s.id}>{s.shiftLabel} ({s.site?.name})</option>
                 ))}
               </optgroup>
            )}
          </select>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1">Incident Location (Checkpoint)</label>
          <select 
            required 
            value={mapPinId} 
            onChange={e => setMapPinId(e.target.value)}
            disabled={!rosterId}
            className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">-- Choose Location --</option>
            {allPins.map(pin => (
              <option key={pin.id} value={pin.id}>{pin.name} ({pin.pathName})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1">Description of Incident</label>
          <textarea 
            required 
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe what happened..."
            className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={loading || !rosterId || !mapPinId || !description}
            className="w-full bg-red-600 text-white font-medium py-2.5 rounded text-[14px] hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Incident Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
