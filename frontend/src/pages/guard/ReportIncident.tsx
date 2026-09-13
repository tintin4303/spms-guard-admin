import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { fetchGuardShifts, reportGuardIncident } from '../../api';

export default function GuardIncidents() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [rosterId, setRosterId] = useState('');
  const [mapPinId, setMapPinId] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
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
    if (!rosterId || !description) return;
    setLoading(true);
    try {
      const fullDesc = locationDescription 
        ? `[Location: ${locationDescription}] ${description}`
        : description;
      await reportGuardIncident({ rosterId, mapPinId: mapPinId || undefined, description: fullDesc });
      toast.success('Incident report submitted successfully!');
      setDescription('');
      setLocationDescription('');
      setMapPinId('');
    } catch (err) {
      toast.error('Failed to submit incident report.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white mx-0 sm:mx-auto sm:mt-6 max-w-2xl rounded sm:rounded-xl border border-[#E2E8F0] shadow-sm relative z-0 mb-8 sm:mb-0">
      <div className="px-4 sm:px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#1E3A5F]">Report Incident</h2>
        <p className="text-[13px] text-gray-500 mt-1">Submit a real-time incident report to the Operations Manager.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1">Select Shift</label>
          <select 
            required 
            value={rosterId} 
            onChange={e => { setRosterId(e.target.value); setMapPinId(''); }}
            className="w-full border rounded px-3 py-2 text-[14px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          <label className="block text-[13px] font-medium text-gray-700 mb-1">
            Incident Location (Checkpoint - Optional)
          </label>
          <select 
            value={mapPinId} 
            onChange={e => setMapPinId(e.target.value)}
            disabled={!rosterId}
            className="w-full border bg-white rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">-- Choose Checkpoint Pin (If Applicable) --</option>
            {allPins.map(pin => (
              <option key={pin.id} value={pin.id}>{pin.name} ({pin.pathName})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1">
            Specific Location Details (If not at a checkpoint)
          </label>
          <input 
            type="text"
            value={locationDescription}
            onChange={e => setLocationDescription(e.target.value)}
            placeholder="e.g. 2nd Floor East Corridor / Parking Lot B"
            className="w-full border rounded px-3 py-2 text-[14px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
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
            disabled={loading || !rosterId || !description}
            className="w-full bg-red-600 text-white font-medium py-3 sm:py-2.5 rounded text-[14px] hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Submitting...' : 'Submit Incident Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
