import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { fetchGuardShifts, checkinShiftPin, arriveAtShift } from '../../api';

export default function GuardShifts() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadShifts = () => {
    fetchGuardShifts().then(setShifts).catch(console.error);
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const handleCheckin = async (rosterId: string, mapPinId: string) => {
    if (loading) return;
    setLoading(true);
    try {
      await checkinShiftPin(rosterId, mapPinId, 'Routine check-in');
      toast.success('Checkpoint checked in successfully!');
      loadShifts();
    } catch (e) {
      toast.error('Failed to check in checkpoint.');
    } finally {
      setLoading(false);
    }
  };

  const handleArrive = async (rosterId: string) => {
    if (loading) return;
    setLoading(true);
    try {
      await arriveAtShift(rosterId);
      toast.success('Arrival confirmed! ✅');
      loadShifts();
    } catch (e: any) {
      toast.error(e.message || 'Failed to mark arrival.');
    } finally {
      setLoading(false);
    }
  };

  const getNavUrl = (site: any) => {
    if (site?.latitude && site?.longitude) return `https://maps.google.com/?q=${site.latitude},${site.longitude}`;
    if (site?.address) return `https://maps.google.com/?q=${encodeURIComponent(site.address)}`;
    return null;
  };

  return (
    <div className="bg-white mx-0 sm:mx-4 rounded sm:rounded-xl border border-[#E2E8F0] shadow-sm relative z-0 mb-8 sm:mb-0">
      <div className="px-4 sm:px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1E3A5F]">My Shifts</h2>
          <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1">Check-in at required locations to complete your shift.</p>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {shifts.length === 0 ? (
          <p className="text-[14px] text-gray-500 text-center py-4">You have no assigned shifts.</p>
        ) : (
          shifts.map((shift) => {
            const isCompleted = shift.status.startsWith('Completed');
            // Extract pins filtered by assigned patrolPath if specified, or all paths on the site
            const allPins: any[] = [];
            const pathsToFilter = shift.patrolPathId
              ? shift.site?.patrolPaths?.filter((p: any) => p.id === shift.patrolPathId)
              : shift.site?.patrolPaths;

            pathsToFilter?.forEach((path: any) => {
              path.pins?.forEach((p: any) => {
                allPins.push({ ...p, pathName: path.name });
              });
            });

            // Check which pins have been checked in
            const checkedInIds = new Set(shift.logs?.filter((l:any) => !l.isIncident).map((l:any) => l.mapPinId));
            const navUrl = getNavUrl(shift.site);

            const formattedDate = shift.date
              ? new Date(shift.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
              : 'Date N/A';

            return (
              <div key={shift.id} className="border border-[#E2E8F0] rounded-lg p-4 sm:p-5 bg-white">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2.5 py-0.5 rounded border border-blue-200">
                        {formattedDate}
                      </span>
                    </div>
                    <h3 className="text-[15px] sm:text-[16px] font-bold text-[#0F172A]">{shift.shiftLabel}</h3>
                    <p className="text-[13px] text-gray-600 mt-1">{shift.site?.name} • {shift.startTime} - {shift.endTime}</p>
                    
                    {navUrl && (
                      <a href={navUrl} target="_blank" rel="noreferrer" className="mt-2 w-full sm:w-auto inline-flex items-center justify-center bg-blue-600 text-white rounded text-[13px] px-3 py-1.5 font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm">
                        Navigate to Site
                      </a>
                    )}
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                    <div className={`px-3 py-1 rounded text-[12px] font-medium ${isCompleted ? 'bg-green-100 text-green-700' : shift.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                      {shift.status}
                    </div>
                    {!isCompleted && shift.status === 'Scheduled' && (
                      <button 
                        disabled={loading}
                        onClick={() => handleArrive(shift.id)}
                        className="text-[12px] text-emerald-700 border w-full sm:w-auto border-emerald-200 bg-emerald-50 px-3 py-1.5 rounded font-medium hover:bg-emerald-100 transition-colors"
                      >
                        I've Arrived
                      </button>
                    )}
                  </div>
                </div>

                {allPins.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="text-[13px] font-semibold text-[#1E3A5F] mb-3">Patrol Checkpoints</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {allPins.map(pin => {
                        const isCheckedIn = checkedInIds.has(pin.id);
                        return (
                          <div key={pin.id} className={`p-3 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isCheckedIn ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'}`}>
                            <div>
                              <p className={`text-[13px] font-medium ${isCheckedIn ? 'text-gray-500 line-through' : 'text-[#0F172A]'}`}>{pin.name}</p>
                              <p className="text-[11px] text-gray-500">{pin.pathName}</p>
                            </div>
                            {!isCheckedIn && !isCompleted ? (
                              <button 
                                disabled={loading}
                                onClick={() => handleCheckin(shift.id, pin.id)}
                                className="bg-[#1E3A5F] w-full sm:w-auto text-white px-3 py-1.5 rounded text-[12px] hover:bg-[#162D4A] transition-colors"
                              >
                                Check In
                              </button>
                            ) : (
                              <span className="text-[12px] sm:ml-auto text-green-600 font-semibold self-end sm:self-auto">Done</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
