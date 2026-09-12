import { useEffect, useState } from 'react';
import { fetchGuardShifts, checkinShiftPin, completeShift } from '../../api';

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
    if (!confirm('Check in at this location?')) return;
    setLoading(true);
    try {
      await checkinShiftPin(rosterId, mapPinId, 'Routine check-in');
      loadShifts();
    } catch (e) {
      alert('Failed to check in');
    }
    setLoading(false);
  };

  const handleCompleteCondition = async (rosterId: string) => {
    const notes = prompt('Enter condition/notes for early completion:');
    if (!notes) return;
    setLoading(true);
    try {
      await completeShift(rosterId, notes);
      loadShifts();
    } catch (e) {
      alert('Failed to complete shift');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded border border-[#E2E8F0] shadow-sm relative z-0">
      <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
        <div>
          <h2 className="text-[18px] font-semibold text-[#1E3A5F]">My Shifts</h2>
          <p className="text-[13px] text-gray-500 mt-1">Check-in at required locations to complete your shift.</p>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {shifts.length === 0 ? (
          <p className="text-[14px] text-gray-500">You have no assigned shifts.</p>
        ) : (
          shifts.map((shift) => {
            const isCompleted = shift.status.startsWith('Completed');
            // Extract all pins across all patrol paths for this site
            const allPins: any[] = [];
            shift.site?.patrolPaths?.forEach((path: any) => {
              path.pins?.forEach((p: any) => {
                allPins.push({ ...p, pathName: path.name });
              });
            });

            // Check which pins have been checked in
            const checkedInIds = new Set(shift.logs?.filter((l:any) => !l.isIncident).map((l:any) => l.mapPinId));

            return (
              <div key={shift.id} className="border border-[#E2E8F0] rounded-lg p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-[16px] font-bold text-[#0F172A]">{shift.shiftLabel}</h3>
                    <p className="text-[13px] text-gray-600 mt-1">{shift.site?.name} • {shift.startTime} - {shift.endTime}</p>
                    <div className={`mt-2 inline-block px-3 py-1 rounded text-[12px] font-medium ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {shift.status}
                    </div>
                  </div>
                  {!isCompleted && (
                    <button 
                      disabled={loading}
                      onClick={() => handleCompleteCondition(shift.id)}
                      className="text-[12px] text-orange-600 border border-orange-200 bg-orange-50 px-3 py-1.5 rounded hover:bg-orange-100 transition-colors"
                    >
                      Complete Early with Notes
                    </button>
                  )}
                </div>

                {allPins.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <p className="text-[13px] font-semibold text-[#1E3A5F] mb-3">Patrol Checkpoints</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {allPins.map(pin => {
                        const isCheckedIn = checkedInIds.has(pin.id);
                        return (
                          <div key={pin.id} className={`p-3 rounded border flex items-center justify-between ${isCheckedIn ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'}`}>
                            <div>
                              <p className={`text-[13px] font-medium ${isCheckedIn ? 'text-gray-500 line-through' : 'text-[#0F172A]'}`}>{pin.name}</p>
                              <p className="text-[11px] text-gray-500">{pin.pathName}</p>
                            </div>
                            {!isCheckedIn && !isCompleted ? (
                              <button 
                                disabled={loading}
                                onClick={() => handleCheckin(shift.id, pin.id)}
                                className="bg-[#1E3A5F] text-white px-3 py-1.5 rounded text-[12px] hover:bg-[#162D4A] transition-colors"
                              >
                                Check In
                              </button>
                            ) : (
                              <span className="text-[12px] text-green-600 font-semibold">Done</span>
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
