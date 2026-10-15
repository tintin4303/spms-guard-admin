import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, UserX, AlertCircle, UserCheck, ShieldAlert, AlertTriangle, CheckCircle2, Calendar, X } from 'lucide-react';
import MapControl from '../../components/MapControl';
import Pagination from '../../components/common/Pagination';
import { 
  fetchContracts, fetchGuards, fetchSchedules, generateSchedules, 
  assignGuard, createRoster, deleteRoster, createException, 
  batchAssignGuard, fetchAutoScheduleRecommendations, logAbsence, 
  fetchReplacementSuggestions 
} from '../../api';

export default function SchedulesPage({ role }: { role?: string }) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [guards, setGuards] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'monthly'>('monthly');
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    today.setDate(today.getDate() - today.getDay());
    return today;
  });
  const [isCreatingRoster, setIsCreatingRoster] = useState(false);
  const [isCreatingException, setIsCreatingException] = useState(false);
  const [siteFilter, setSiteFilter] = useState('All Sites');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [contracts, setContracts] = useState<any[]>([]);

  const defaultFormData = {
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '20:00',
    guardId: '',
    siteId: '',
    type: 'Absent',
    replacementGuardId: '',
    rosterId: ''
  };
  const [formData, setFormData] = useState(defaultFormData);
  const [errorMsg, setErrorMsg] = useState('');
  

  const [isAssigning, setIsAssigning] = useState<any>(null);

  // Guard Absence & 1-Click Replacement State
  const [isLoggingAbsence, setIsLoggingAbsence] = useState<any>(null);
  const [absenceReason, setAbsenceReason] = useState('');
  const [replacementData, setReplacementData] = useState<any>(null);
  const [isLoadingReplacement, setIsLoadingReplacement] = useState(false);

  const handleOpenReplacementModal = async (sched: any) => {
    setIsLoadingReplacement(true);
    setReplacementData(null);
    try {
      const res = await fetchReplacementSuggestions(sched.id || sched.rosterId);
      setReplacementData({ ...res, targetRoster: sched });
    } catch (err: any) {
      alert('Failed to load replacement guard recommendations.');
    } finally {
      setIsLoadingReplacement(false);
    }
  };

  const handleConfirmAbsence = async (e: any) => {
    e.preventDefault();
    if (!isLoggingAbsence) return;
    try {
      await logAbsence(isLoggingAbsence.id, absenceReason || 'Admin Logged Guard Absence');
      const targetRoster = isLoggingAbsence;
      setIsLoggingAbsence(null);
      setAbsenceReason('');
      loadSchedules();
      // Automatically prompt 1-click replacement options
      handleOpenReplacementModal(targetRoster);
    } catch (err: any) {
      alert(err.message || 'Failed to log absence');
    }
  };

  const loadSchedules = () => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
    const sFilter = siteFilter === 'All Sites' ? undefined : siteFilter;
    fetchSchedules(sFilter, startDate, endDate).then(setSchedules).catch(console.error);
  };

  useEffect(() => {
    loadSchedules();
  }, [currentMonthDate, siteFilter]);

  useEffect(() => {
    fetchContracts().then(setContracts).catch(console.error);
    if (role === 'OPERATION_MANAGER' || !role) {
      fetchGuards().then(setGuards).catch(console.error);
    }
  }, [role]);

  // Combined site list from both contracts (including newly added sites with 0 slots) and existing schedules
  const allAvailableSites = useMemo(() => {
    const map = new Map<string, any>();
    contracts.forEach(c => {
      if (c.sites) {
        c.sites.forEach((s: any) => {
          map.set(s.id, {
            ...s,
            contract: s.contract || { id: c.id, clientCompanyName: c.clientCompanyName }
          });
        });
      }
    });
    schedules.forEach(sched => {
      if (sched.site && sched.site.id && !map.has(sched.site.id)) {
        map.set(sched.site.id, sched.site);
      }
    });
    return Array.from(map.values());
  }, [contracts, schedules]);

  const uniqueSites = allAvailableSites;

  // Full global sites extracted straight from contracts for Ops deployment menu
  const allGlobalSites = useMemo(() => {
    const arr: any[] = [];
    contracts.forEach(c => {
      if (c.sites) c.sites.forEach((s: any) => arr.push({ ...s, clientName: c.clientCompanyName }));
    });
    return arr;
  }, [contracts]);

  const isOps = role === 'OPERATION_MANAGER' || !role;

  const formatGuardName = (g: any) => {
    if (!g) return 'Unassigned';
    if (role === 'CLIENT') return `${g.firstName || 'Unknown'} ${g.lastName?.[0] || '?'}.`;
    return `${g.firstName || ''} ${g.lastName || ''}`.trim() || 'Unknown Guard';
  };

  const formatSiteName = (s: any) => {
    if (!s) return 'Unknown Site';
    if (isOps && s.contract?.clientCompanyName) {
      return `${s.contract.clientCompanyName} - ${s.name}`;
    }
    return s.name;
  };



  const openCreateException = (sched: any) => {
    setFormData({
      ...defaultFormData,
      date: sched.date?.split('T')[0],
      rosterId: sched.rosterId,
      startTime: sched.startTime,
      endTime: sched.endTime,
      type: 'Absent'
    });
    setIsCreatingException(true);
  };

  const handleDeleteRoster = async (rosterId: string) => {
    if (!confirm('Are you sure you want to delete this Permanent Post? This affects all upcoming days indefinitely.')) return;
    try {
      await deleteRoster(rosterId);
      loadSchedules();
    } catch (err) {
      alert("Failed to delete permanent post.");
    }
  };




  const [isSubmittingRoster, setIsSubmittingRoster] = useState(false);
  const handleRosterSubmit = async (e: any) => {
    e.preventDefault();
    if (isSubmittingRoster) return;
    setIsSubmittingRoster(true);
    setErrorMsg('');
    if (!formData.guardId || !formData.siteId) {
      setIsSubmittingRoster(false);
      return setErrorMsg('Guard and Site are required.');
    }

    const selectedGuard = guards.find(g => g.id === formData.guardId);
    const targetSite = uniqueSites.find((s: any) => s.id === formData.siteId);

    // Site Gender Requirement Check
    if (selectedGuard && targetSite && targetSite.guardQualifications) {
      const lowerQual = targetSite.guardQualifications.toLowerCase();
      let reqGender: string | null = null;
      if (lowerQual.includes('female only') || lowerQual.includes('female guard')) reqGender = 'Female';
      if (lowerQual.includes('male only') || lowerQual.includes('male guard')) reqGender = 'Male';

      const guardGen = selectedGuard.gender || 'Not Specified';
      if (reqGender && guardGen !== reqGender) {
        const confirmMsg = `Caution: This site requires a ${reqGender} guard, but the selected guard is registered as ${guardGen}. Do you want to proceed with this assignment?`;
        if (!window.confirm(confirmMsg)) {
          setIsSubmittingRoster(false);
          return;
        }
      }
    }

    if (selectedGuard && selectedGuard.shiftPreference) {
      const startHour = parseInt(formData.startTime.split(':')[0], 10);
      const isNightShift = startHour >= 18 || startHour < 6;
      const pref = selectedGuard.shiftPreference.toLowerCase();
      let mismatch = false;
      if (pref.includes('day') && isNightShift) mismatch = true;
      if (pref.includes('night') && !isNightShift) mismatch = true;

      if (mismatch) {
        const confirmMsg = `Caution: You are assigning a ${isNightShift ? 'Night' : 'Day'} shift to a guard who prefers ${selectedGuard.shiftPreference} shifts. Do you want to proceed?`;
        if (!window.confirm(confirmMsg)) {
          setIsSubmittingRoster(false);
          return;
        }
      }
    }

    try {
      await createRoster({ startTime: formData.startTime, endTime: formData.endTime, guardId: formData.guardId, siteId: formData.siteId });
      setIsCreatingRoster(false);
      loadSchedules();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setIsSubmittingRoster(false);
    }
  };

  const [isSubmittingException, setIsSubmittingException] = useState(false);
  const handleExceptionSubmit = async (e: any) => {
    e.preventDefault();
    if (isSubmittingException) return;
    setIsSubmittingException(true);
    setErrorMsg('');
    if (formData.type === 'Swap' && !formData.replacementGuardId) {
      setIsSubmittingException(false);
      return setErrorMsg('Replacement guard is required for a Swap.');
    }
    try {
      await createException({ date: formData.date, type: formData.type, rosterId: formData.rosterId, replacementGuardId: formData.replacementGuardId });
      setIsCreatingException(false);
      loadSchedules();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setIsSubmittingException(false);
    }
  };

  const [isGeneratingSlots, setIsGeneratingSlots] = useState(false);
  const [isSubmittingSlotGen, setIsSubmittingSlotGen] = useState(false);
  const [ungeneratedPageIndex, setUngeneratedPageIndex] = useState(0);
  const [unassignedPageIndex, setUnassignedPageIndex] = useState(0);
  const [generateSlotData, setGenerateSlotData] = useState({
    siteId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  });

  const handleGenerateSlotsSubmit = async (e: any) => {
    e.preventDefault();
    if (isSubmittingSlotGen) return;
    setIsSubmittingSlotGen(true);
    setErrorMsg('');
    try {
      const res = await generateSchedules({
        siteId: generateSlotData.siteId || undefined,
        startDate: generateSlotData.startDate,
        endDate: generateSlotData.endDate
      });
      setIsGeneratingSlots(false);
      alert(`Successfully generated ${res.inserted} shift slots!`);
      loadSchedules();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate shift slots');
    } finally {
      setIsSubmittingSlotGen(false);
    }
  };

  const [isBatchAssigning, setIsBatchAssigning] = useState(false);
  const [isSubmittingBatchAssign, setIsSubmittingBatchAssign] = useState(false);
  const [batchFormData, setBatchFormData] = useState({
    siteId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
    guardId: '',
    startTime: '08:00',
    endTime: '20:00'
  });

  const handleBatchAssignSubmit = async (e: any) => {
    e.preventDefault();
    if (isSubmittingBatchAssign) return;
    setIsSubmittingBatchAssign(true);
    setErrorMsg('');
    if (!batchFormData.siteId || !batchFormData.guardId) {
      setIsSubmittingBatchAssign(false);
      return setErrorMsg('Site and Guard are required');
    }
    try {
      const res = await batchAssignGuard(batchFormData);
      setIsBatchAssigning(false);
      alert(`Successfully assigned guard to ${res.updatedCount} shift slots!${res.skippedCount > 0 ? ` (${res.skippedCount} skipped due to daily shift limits)` : ''}`);
      loadSchedules();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to batch assign guard');
    } finally {
      setIsSubmittingBatchAssign(false);
    }
  };

  const [isAutoScheduling, setIsAutoScheduling] = useState(false);
  const [isCalculatingAutoSchedule, setIsCalculatingAutoSchedule] = useState(false);
  const [isSubmittingAutoSchedule, setIsSubmittingAutoSchedule] = useState(false);
  const [autoScheduleFilter, setAutoScheduleFilter] = useState({
    siteId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  });
  const [autoRecommendations, setAutoRecommendations] = useState<any[]>([]);
  const [selectedGuardMap, setSelectedGuardMap] = useState<{ [rosterId: string]: string }>({});
  const [acceptedRosterMap, setAcceptedRosterMap] = useState<{ [rosterId: string]: boolean }>({});

  const handleCalculateAutoSchedule = async (filterObj?: any) => {
    setIsCalculatingAutoSchedule(true);
    setErrorMsg('');
    const targetFilter = filterObj || autoScheduleFilter;
    try {
      const res = await fetchAutoScheduleRecommendations({
        siteId: targetFilter.siteId || undefined,
        startDate: targetFilter.startDate,
        endDate: targetFilter.endDate
      });
      const recs = res.recommendations || [];
      setAutoRecommendations(recs);

      const initialGuards: { [rId: string]: string } = {};
      const initialAccepted: { [rId: string]: boolean } = {};
      recs.forEach((item: any) => {
        if (item.recommendedGuard) {
          initialGuards[item.rosterId] = item.recommendedGuard.guardId;
          initialAccepted[item.rosterId] = true;
        }
      });
      setSelectedGuardMap(initialGuards);
      setAcceptedRosterMap(initialAccepted);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to calculate auto-schedule recommendations');
    } finally {
      setIsCalculatingAutoSchedule(false);
    }
  };

  const handleApplyAutoScheduleSubmit = async () => {
    if (isSubmittingAutoSchedule) return;
    setIsSubmittingAutoSchedule(true);
    setErrorMsg('');
    const targetRosterIds = Object.keys(acceptedRosterMap).filter(rId => acceptedRosterMap[rId] && selectedGuardMap[rId]);
    if (targetRosterIds.length === 0) {
      setIsSubmittingAutoSchedule(false);
      return setErrorMsg('No assignments selected to apply.');
    }

    try {
      let appliedCount = 0;
      for (const rId of targetRosterIds) {
        const guardId = selectedGuardMap[rId];
        await assignGuard(rId, guardId);
        appliedCount++;
      }
      setIsAutoScheduling(false);
      alert(`Successfully applied ${appliedCount} recommended shift assignments!`);
      loadSchedules();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error applying recommendations');
    } finally {
      setIsSubmittingAutoSchedule(false);
    }
  };

  const [isSubmittingAssignGuard, setIsSubmittingAssignGuard] = useState(false);
  const [preferenceMismatchConfirm, setPreferenceMismatchConfirm] = useState<{
    guard: any;
    targetShiftType: 'Day' | 'Night';
    shiftLabel: string;
    siteName: string;
    rosterId: string;
    guardId: string;
    source?: 'manual' | 'autoSchedule';
    warningTitle?: string;
    warningSubtitle?: string;
    warningReason?: string;
    previousGuardId?: string;
  } | null>(null);

  const handleAutoScheduleGuardChange = (rec: any, newGuardId: string, currentGuardId: string) => {
    if (!newGuardId) {
      setSelectedGuardMap(prev => ({ ...prev, [rec.rosterId]: '' }));
      return;
    }

    const sg = rec.allScoredGuards?.find((g: any) => String(g.guardId) === String(newGuardId));
    const matchedGuardObj = guards.find((g: any) => String(g.id) === String(newGuardId)) || {
      firstName: sg?.guardName?.split(' ')[0] || sg?.guardName || 'Guard',
      lastName: sg?.guardName?.split(' ').slice(1).join(' ') || '',
      guardId: sg?.guardCode || newGuardId,
      shiftPreference: sg?.shiftPreference || 'Flexible'
    };

    const startHour = parseInt((rec.startTime || '08:00').split(':')[0], 10);
    const targetShiftType: 'Day' | 'Night' = (startHour >= 6 && startHour < 18) ? 'Day' : 'Night';

    // Check if guard has a warning, is preference mismatched, or is unsuggested
    const isUnsuggestedOrWarning = Boolean(
      sg?.hasWarning || 
      sg?.isPreferenceMismatch || 
      (sg && !sg.isEligible && !sg.isHardBlocked) || 
      (matchedGuardObj.shiftPreference && matchedGuardObj.shiftPreference !== 'Flexible' && matchedGuardObj.shiftPreference !== targetShiftType)
    );

    if (isUnsuggestedOrWarning) {
      const pref = matchedGuardObj.shiftPreference || sg?.shiftPreference || 'Flexible';
      const reason = sg?.warningReason || (sg?.isPreferenceMismatch ? `Prefers ${pref} Shifts` : (sg?.disqualificationReason || 'Shift preference mismatch'));

      setPreferenceMismatchConfirm({
        guard: matchedGuardObj,
        targetShiftType,
        shiftLabel: rec.shiftLabel || rec.timing,
        siteName: rec.siteName,
        rosterId: rec.rosterId,
        guardId: newGuardId,
        source: 'autoSchedule',
        warningTitle: 'Shift Preference Mismatch',
        warningSubtitle: 'Operations Manager Override Confirmation',
        warningReason: reason,
        previousGuardId: currentGuardId
      });
      return;
    }

    setSelectedGuardMap(prev => ({ ...prev, [rec.rosterId]: newGuardId }));
    setAcceptedRosterMap(prev => ({ ...prev, [rec.rosterId]: true }));
  };

  const executeAssignGuard = async (rosterId: string, guardId: string) => {
    setIsSubmittingAssignGuard(true);
    setErrorMsg('');
    try {
      await assignGuard(rosterId, guardId);
      setIsAssigning(null);
      setPreferenceMismatchConfirm(null);
      alert('Changes saved');
      loadSchedules();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to assign guard due to constraints');
    } finally {
      setIsSubmittingAssignGuard(false);
    }
  };

  const handleAssignGuardSubmit = async (e: any) => {
    e.preventDefault();
    if (isSubmittingAssignGuard) return;
    setErrorMsg('');
    if (!formData.guardId) {
      return setErrorMsg('Select a guard first');
    }

    const selectedGuard = guards.find(g => g.id === formData.guardId);
    const targetSite = isAssigning?.site;
    if (selectedGuard && targetSite && targetSite.guardQualifications) {
      const lowerQual = targetSite.guardQualifications.toLowerCase();
      let reqGender: string | null = null;
      if (lowerQual.includes('female only') || lowerQual.includes('female guard')) reqGender = 'Female';
      if (lowerQual.includes('male only') || lowerQual.includes('male guard')) reqGender = 'Male';

      const guardGen = selectedGuard.gender || 'Not Specified';
      if (reqGender && guardGen !== reqGender) {
        const confirmMsg = `Caution: This site requires a ${reqGender} guard, but the selected guard is registered as ${guardGen}. Do you want to proceed with this assignment?`;
        if (!window.confirm(confirmMsg)) {
          return;
        }
      }
    }

    // Check Shift Preference Mismatch
    if (selectedGuard && selectedGuard.shiftPreference && selectedGuard.shiftPreference !== 'Flexible') {
      const shiftStartHour = parseInt(isAssigning.startTime?.split(':')[0] || '8', 10);
      const targetShiftType: 'Day' | 'Night' = (shiftStartHour >= 6 && shiftStartHour < 18) ? 'Day' : 'Night';
      const prefLower = selectedGuard.shiftPreference.toLowerCase();

      let isMismatch = false;
      if (prefLower.includes('day') && targetShiftType === 'Night') isMismatch = true;
      if (prefLower.includes('night') && targetShiftType === 'Day') isMismatch = true;

      if (isMismatch) {
        setPreferenceMismatchConfirm({
          guard: selectedGuard,
          targetShiftType,
          shiftLabel: isAssigning.shiftLabel,
          siteName: formatSiteName(isAssigning.site),
          rosterId: isAssigning.id,
          guardId: formData.guardId
        });
        return;
      }
    }

    await executeAssignGuard(isAssigning.id, formData.guardId);
  };

  const [isExportingModalOpen, setIsExportingModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState({
    siteId: 'All Sites',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  });

  const getFilteredSchedulesForExport = () => {
    return schedules.filter(s => {
      const matchSite = exportScope.siteId === 'All Sites' || s.siteId === exportScope.siteId || s.site?.id === exportScope.siteId;
      if (!matchSite) return false;
      if (!s.date) return true;
      const sDate = s.date.split('T')[0];
      return sDate >= exportScope.startDate && sDate <= exportScope.endDate;
    });
  };

  const handleExportCSV = () => {
    const records = getFilteredSchedulesForExport();
    if (records.length === 0) {
      alert('No schedule records found for the selected export range.');
      return;
    }

    const headers = [
      'Date',
      'Day of Week',
      'Site Name',
      'Site Type',
      'Site Address',
      'Shift Label',
      'Start Time',
      'End Time',
      'Post / Slot',
      'Guard ID',
      'Guard Name',
      'Guard Preference',
      'Agency Vendor',
      'Operational Status'
    ];

    const rows = records.map(s => {
      const d = s.date ? new Date(s.date) : new Date();
      const dateStr = s.date ? s.date.split('T')[0] : 'N/A';
      const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' });
      const siteName = formatSiteName(s.site);
      const siteType = s.site?.siteType || 'N/A';
      const address = (s.site?.address || '').replace(/"/g, '""');
      const shiftLabel = (s.shiftLabel || '').replace(/"/g, '""');
      const startTime = s.startTime || '';
      const endTime = s.endTime || '';
      const postName = s.postName || 'Post 1';
      const guardId = s.guard?.guardId || 'UNASSIGNED';
      const guardName = role === 'CLIENT' ? 'RESTRICTED' : formatGuardName(s.guard);
      const guardPref = s.guard?.shiftPreference || 'Flexible';
      const agencyName = s.guard?.agency?.name || (s.guard ? 'In-House' : 'N/A');
      const status = s.status || 'Scheduled';

      return [
        `"${dateStr}"`,
        `"${dayOfWeek}"`,
        `"${siteName}"`,
        `"${siteType}"`,
        `"${address}"`,
        `"${shiftLabel}"`,
        `"${startTime}"`,
        `"${endTime}"`,
        `"${postName}"`,
        `"${guardId}"`,
        `"${guardName}"`,
        `"${guardPref}"`,
        `"${agencyName}"`,
        `"${status}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SPMS_Operational_Schedule_Report_${exportScope.startDate}_to_${exportScope.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportingModalOpen(false);
  };

  const handlePrintReport = () => {
    const records = getFilteredSchedulesForExport();
    if (records.length === 0) {
      alert('No schedule records found for the selected export range.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('Please allow popups to open print preview.');

    const totalShifts = records.length;
    const assignedShifts = records.filter(s => s.guardId && s.status !== 'Unassigned').length;
    const unassignedShifts = totalShifts - assignedShifts;
    const coveragePercent = Math.round((assignedShifts / (totalShifts || 1)) * 100);

    const siteSelectedName = exportScope.siteId === 'All Sites' 
      ? 'All Operational Sites' 
      : (uniqueSites.find((s: any) => s.id === exportScope.siteId)?.name || 'Selected Site');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SPMS Security Operations Report — ${siteSelectedName}</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 12mm; }
              body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0F172A; margin: 0; padding: 0; background: #fff; }
              .no-print { display: none !important; }
            }
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0F172A; padding: 24px; background: #f8fafc; }
            .report-card { background: white; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); max-width: 1100px; margin: 0 auto; }
            .header-flex { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1E3A5F; padding-bottom: 16px; margin-bottom: 20px; }
            .logo-title { font-size: 22px; font-weight: 800; color: #1E3A5F; letter-spacing: -0.5px; }
            .logo-subtitle { font-size: 13px; color: #64748B; margin-top: 4px; }
            .meta-block { text-align: right; font-size: 12px; color: #475569; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
            .stat-box { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
            .stat-label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; }
            .stat-value { font-size: 20px; font-weight: 800; color: #1E3A5F; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px; }
            th { background: #1E3A5F; color: white; padding: 8px 10px; text-align: left; font-weight: 600; text-transform: uppercase; font-size: 11px; }
            td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
            tr:nth-child(even) { background: #f8fafc; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; }
            .badge-assigned { background: #dcfce7; color: #166534; }
            .badge-unassigned { background: #fef3c7; color: #92400e; }
            .signature-flex { display: flex; justify-content: space-between; margin-top: 40px; pt-20px; border-top: 1px solid #e2e8f0; }
            .sig-box { width: 45%; text-align: center; font-size: 12px; color: #475569; }
            .sig-line { border-bottom: 1px solid #94a3b8; margin-top: 40px; margin-bottom: 8px; }
            .btn-print { background: #1E3A5F; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; margin-bottom: 16px; }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: right; max-width: 1100px; margin: 0 auto;">
            <button onclick="window.print()" class="btn-print">🖨️ Print / Save as PDF</button>
          </div>
          <div class="report-card">
            <div class="header-flex">
              <div>
                <div class="logo-title">SPMS Security Operations Command Center</div>
                <div class="logo-subtitle">Official Guard Duty Roster & Operational Schedule Report</div>
              </div>
              <div class="meta-block">
                <div><strong>Scope:</strong> ${siteSelectedName}</div>
                <div><strong>Period:</strong> ${exportScope.startDate} to ${exportScope.endDate}</div>
                <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
              </div>
            </div>

            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-label">Total Roster Slots</div>
                <div class="stat-value">${totalShifts}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Guards Assigned</div>
                <div class="stat-value" style="color: #166534">${assignedShifts}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Unassigned Shifts</div>
                <div class="stat-value" style="color: #92400e">${unassignedShifts}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Coverage Rate</div>
                <div class="stat-value" style="color: #2563eb">${coveragePercent}%</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Shift & Timing</th>
                  <th>Patrol Site</th>
                  <th>Assigned Guard</th>
                  <th>Guard ID</th>
                  <th>Vendor / Agency</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${records.map(s => `
                  <tr>
                    <td><strong>${s.date ? s.date.split('T')[0] : 'N/A'}</strong> (${s.date ? new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' }) : ''})</td>
                    <td>${s.shiftLabel || `${s.startTime || '08:00'} - ${s.endTime || '20:00'}`}</td>
                    <td>${formatSiteName(s.site)}</td>
                    <td>${role === 'CLIENT' ? 'Restricted' : formatGuardName(s.guard)}</td>
                    <td>${s.guard?.guardId || '—'}</td>
                    <td>${s.guard?.agency?.name || (s.guard ? 'In-House' : 'Unassigned')}</td>
                    <td>
                      <span class="badge ${s.guardId && s.status !== 'Unassigned' ? 'badge-assigned' : 'badge-unassigned'}">
                        ${s.status || 'Scheduled'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="signature-flex">
              <div class="sig-box">
                <div class="sig-line"></div>
                <div><strong>Prepared By:</strong> Operations Manager</div>
                <div>SPMS Security Operations Command</div>
              </div>
              <div class="sig-box">
                <div class="sig-line"></div>
                <div><strong>Approved By:</strong> Client Representative</div>
                <div>Facility Management & Security Audit</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    setIsExportingModalOpen(false);
  };

  const filteredSchedules = schedules.filter(s => {
    let matchesSite = siteFilter === 'All Sites' || s.site?.id === siteFilter;
    let guardName = formatGuardName(s.guard).toLowerCase();
    let contractN = (s.site?.contract?.clientCompanyName || '').toLowerCase();
    let agencyN = (s.guard?.agency?.name || '').toLowerCase();
    
    let matchQuery = true;
    if (searchQuery) {
      let q = searchQuery.toLowerCase();
      matchQuery = guardName.includes(q) || contractN.includes(q) || agencyN.includes(q) || formatSiteName(s.site).toLowerCase().includes(q);
    }
    
    let matchDate = true;
    if (dateFilter && s.date) {
      matchDate = s.date.startsWith(dateFilter);
    }
    
    return matchesSite && matchQuery && matchDate;
  });

  // Calculate Shift Coverage Summaries for Ops Managers
  const unassignedSummaries = (() => {
    const unassignedShifts = schedules.filter(s => s.guardId == null || s.status === 'Unassigned');
    if (unassignedShifts.length === 0) return [];

    const groups: { [key: string]: { siteId: string; siteName: string; timing: string; dates: Date[]; count: number } } = {};

    unassignedShifts.forEach(s => {
      const sId = s.siteId || s.site?.id || 'unknown';
      const siteName = formatSiteName(s.site);
      const timing = s.shiftLabel ? (s.shiftLabel.split(' (')[1]?.replace(')', '') || s.shiftLabel) : `${s.startTime || '08:00'} - ${s.endTime || '20:00'}`;
      const key = `${sId}_${timing}`;

      const d = s.date ? new Date(s.date) : new Date();

      if (!groups[key]) {
        groups[key] = { siteId: sId, siteName, timing, dates: [d], count: 1 };
      } else {
        groups[key].dates.push(d);
        groups[key].count++;
      }
    });

    return Object.values(groups).map(g => {
      g.dates.sort((a, b) => a.getTime() - b.getTime());
      const minD = g.dates[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const maxD = g.dates[g.dates.length - 1].toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const dateRangeStr = minD === maxD ? minD : `${minD} - ${maxD}`;
      return {
        siteId: g.siteId,
        siteName: g.siteName,
        timing: g.timing,
        dateRange: dateRangeStr,
        startDateIso: g.dates[0].toISOString().split('T')[0],
        endDateIso: g.dates[g.dates.length - 1].toISOString().split('T')[0],
        count: g.count
      };
    });
  })();

  // Calculate Slot Generation Coverage Summaries for Ops Managers (Sites with missing/ungenerated slots)
  const ungeneratedSlotSummaries = (() => {
    if (!uniqueSites || uniqueSites.length === 0) return [];
    
    // Check coverage for current month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Month start and end
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);

    const summaries: { siteId: string; siteName: string; missingStartDate: string; missingEndDate: string; dateRange: string }[] = [];

    uniqueSites.forEach((site: any) => {
      const siteSchedules = schedules.filter(s => s.siteId === site.id);
      
      // Determine existing date range generated
      if (siteSchedules.length === 0) {
        // No slots generated at all for this site
        const startStr = monthStart.toISOString().split('T')[0];
        const endStr = monthEnd.toISOString().split('T')[0];
        const minD = monthStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const maxD = monthEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        summaries.push({
          siteId: site.id,
          siteName: formatSiteName(site),
          missingStartDate: startStr,
          missingEndDate: endStr,
          dateRange: `${minD} - ${maxD}`
        });
      } else {
        // Find max generated date
        const generatedDates = siteSchedules.map(s => new Date(s.date).getTime());
        const maxGenTime = Math.max(...generatedDates);
        const maxGenDate = new Date(maxGenTime);

        // If max generated date is before month end, slots are missing for remaining days of month
        if (maxGenDate < monthEnd) {
          const nextDay = new Date(maxGenDate);
          nextDay.setDate(nextDay.getDate() + 1);
          
          if (nextDay <= monthEnd) {
            const startStr = nextDay.toISOString().split('T')[0];
            const endStr = monthEnd.toISOString().split('T')[0];
            const minD = nextDay.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const maxD = monthEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            summaries.push({
              siteId: site.id,
              siteName: formatSiteName(site),
              missingStartDate: startStr,
              missingEndDate: endStr,
              dateRange: `${minD} - ${maxD}`
            });
          }
        }
      }
    });

    return summaries;
  })();

  return (
    <div className="bg-white rounded border border-[#E2E8F0] shadow-sm">
      {/* Side-by-Side Operational Summary Banners with Pagination for Ops Managers */}
      {isOps && (ungeneratedSlotSummaries.length > 0 || unassignedSummaries.length > 0) && (
        <div className="bg-[#F1F5F9] border-b border-[#E2E8F0] px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* 1. Slot Generation Coverage Summary Panel (Left Column) */}
            {ungeneratedSlotSummaries.length > 0 ? (
              <div className="flex flex-col gap-2.5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#1E3A5F] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-700 inline-block"></span>
                    <span>Slot Generation Coverage ({ungeneratedSlotSummaries.length} {ungeneratedSlotSummaries.length === 1 ? 'Site Missing' : 'Sites Missing'})</span>
                  </span>
                  {ungeneratedSlotSummaries.length > 1 && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                      <button
                        onClick={() => setUngeneratedPageIndex(prev => Math.max(0, prev - 1))}
                        disabled={ungeneratedPageIndex === 0}
                        className="px-2 py-0.5 border rounded bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ‹
                      </button>
                      <span>{ungeneratedPageIndex + 1} / {ungeneratedSlotSummaries.length}</span>
                      <button
                        onClick={() => setUngeneratedPageIndex(prev => Math.min(ungeneratedSlotSummaries.length - 1, prev + 1))}
                        disabled={ungeneratedPageIndex >= ungeneratedSlotSummaries.length - 1}
                        className="px-2 py-0.5 border rounded bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>

                {(() => {
                  const safeIndex = Math.min(ungeneratedPageIndex, ungeneratedSlotSummaries.length - 1);
                  const item = ungeneratedSlotSummaries[safeIndex] || ungeneratedSlotSummaries[0];
                  if (!item) return null;
                  return (
                    <div 
                      onClick={() => {
                        setGenerateSlotData({
                          siteId: item.siteId,
                          startDate: item.missingStartDate,
                          endDate: item.missingEndDate
                        });
                        setIsGeneratingSlots(true);
                      }}
                      className="bg-slate-50 border border-slate-300 rounded-lg p-3 flex flex-col justify-between hover:border-[#1E3A5F] cursor-pointer transition-all hover:bg-white group shadow-2xs"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-[13px] text-[#0F172A] truncate group-hover:text-[#1E3A5F]">{item.siteName}</span>
                        <span className="bg-slate-200 text-slate-800 border border-slate-300 font-bold text-[11px] px-2 py-0.5 rounded-md whitespace-nowrap">
                          Slots Not Generated
                        </span>
                      </div>
                      <div className="text-[12px] text-slate-600 mt-2 flex justify-between items-center border-t border-slate-200 pt-2">
                        <span className="font-medium text-slate-700">Missing Period: {item.dateRange}</span>
                        <span className="text-[11px] font-bold text-[#1E3A5F] underline">Generate Slots →</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : <div />}

            {/* 2. Unassigned Shift Summary Panel (Right Column) */}
            {unassignedSummaries.length > 0 ? (
              <div className="flex flex-col gap-2.5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#1E3A5F] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-700 inline-block"></span>
                    <span>Unassigned Shift Summary ({unassignedSummaries.reduce((a, b) => a + b.count, 0)} Total Unassigned)</span>
                  </span>
                  {unassignedSummaries.length > 1 && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                      <button
                        onClick={() => setUnassignedPageIndex(prev => Math.max(0, prev - 1))}
                        disabled={unassignedPageIndex === 0}
                        className="px-2 py-0.5 border rounded bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ‹
                      </button>
                      <span>{unassignedPageIndex + 1} / {unassignedSummaries.length}</span>
                      <button
                        onClick={() => setUnassignedPageIndex(prev => Math.min(unassignedSummaries.length - 1, prev + 1))}
                        disabled={unassignedPageIndex >= unassignedSummaries.length - 1}
                        className="px-2 py-0.5 border rounded bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>

                {(() => {
                  const safeIndex = Math.min(unassignedPageIndex, unassignedSummaries.length - 1);
                  const item = unassignedSummaries[safeIndex] || unassignedSummaries[0];
                  if (!item) return null;
                  return (
                    <div 
                      onClick={() => {
                        setBatchFormData({
                          siteId: item.siteId || (uniqueSites[0]?.id || ''),
                          startDate: item.startDateIso || new Date().toISOString().split('T')[0],
                          endDate: item.endDateIso || new Date().toISOString().split('T')[0],
                          guardId: '',
                          startTime: item.timing.split(' - ')[0] || '08:00',
                          endTime: item.timing.split(' - ')[1] || '20:00'
                        });
                        setIsBatchAssigning(true);
                      }}
                      className="bg-slate-50 border border-slate-300 rounded-lg p-3 flex flex-col justify-between hover:border-[#1E3A5F] cursor-pointer transition-all hover:bg-white group shadow-2xs"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-[13px] text-[#0F172A] truncate group-hover:text-[#1E3A5F]">{item.siteName}</span>
                        <span className="bg-slate-200 text-slate-800 border border-slate-300 font-bold text-[11px] px-2 py-0.5 rounded-md whitespace-nowrap">
                          {item.count} {item.count === 1 ? 'Shift Unassigned' : 'Shifts Unassigned'}
                        </span>
                      </div>
                      <div className="text-[12px] text-slate-600 mt-2 flex justify-between items-center border-t border-slate-200 pt-2">
                        <span className="font-medium text-slate-700">Time: {item.timing}</span>
                        <span className="font-medium text-slate-500">Period: {item.dateRange}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : <div />}

          </div>
        </div>
      )}

      <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#F8FAFC]">
        <div>
          <h2 className="text-[18px] font-semibold font-serif text-[#1E3A5F]">Shift Schedules</h2>
          <p className="text-[13px] text-gray-500">Assign and monitor daily patrol rotations.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search guard, agency, client..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] text-[#0F172A] outline-none flex-1 min-w-[300px] sm:min-w-[400px]"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] text-[#0F172A] outline-none"
          />
          <select
            value={siteFilter}
            onChange={e => setSiteFilter(e.target.value)}
            className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] text-gray-600 outline-none focus:border-[#1E3A5F]"
          >
            <option value="All Sites">All Sites</option>
            {uniqueSites.map((s: any) => <option key={s.id} value={s.id}>{formatSiteName(s)}</option>)}
          </select>
          <div className="flex bg-gray-200 p-1 rounded">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 text-[13px] font-medium rounded ${viewMode === 'monthly' ? 'bg-white shadow-sm text-[#1E3A5F]' : 'text-gray-500'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 text-[13px] font-medium rounded ${viewMode === 'calendar' ? 'bg-white shadow-sm text-[#1E3A5F]' : 'text-gray-500'}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-[13px] font-medium rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-[#1E3A5F]' : 'text-gray-500'}`}
            >
              List
            </button>
          </div>
          {isOps && (
            <>
              <button 
                onClick={() => {
                  const today = new Date();
                  const startStr = today.toISOString().split('T')[0];
                  const endStr = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];
                  const defaultFilter = {
                    siteId: siteFilter !== 'All Sites' ? siteFilter : '',
                    startDate: startStr,
                    endDate: endStr
                  };
                  setAutoScheduleFilter(defaultFilter);
                  setIsAutoScheduling(true);
                  handleCalculateAutoSchedule(defaultFilter);
                }}
                className="bg-[#1E3A5F] text-white px-4 py-1.5 rounded-lg text-[13px] font-bold hover:bg-[#162D4A] shadow-sm transition-all border border-[#1E3A5F]"
              >
                Auto-Schedule Suggestions
              </button>
              <button 
                onClick={() => setIsGeneratingSlots(true)} 
                className="bg-white text-[#1E3A5F] border border-slate-300 px-3.5 py-1.5 rounded-lg text-[13px] font-semibold hover:bg-slate-50 hover:border-slate-400 shadow-2xs transition-all"
              >
                + Generate Shift Slots
              </button>
              <button 
                onClick={() => {
                  setBatchFormData({
                    siteId: siteFilter !== 'All Sites' ? siteFilter : (uniqueSites[0]?.id || ''),
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
                    guardId: '',
                    startTime: '08:00',
                    endTime: '20:00'
                  });
                  setIsBatchAssigning(true);
                }}
                className="bg-white text-[#1E3A5F] border border-slate-300 px-3.5 py-1.5 rounded-lg text-[13px] font-semibold hover:bg-slate-50 hover:border-slate-400 shadow-2xs transition-all"
              >
                + Batch Assign (Date Range)
              </button>
            </>
          )}
        </div>
      </div>

      {viewMode === 'list' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#E2E8F0]">
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Date &amp; Time</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Contract Site</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Assigned Guard</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                {isOps && <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={isOps ? 5 : 4} className="px-6 py-8 text-center text-[13px] text-gray-500">No shift schedules found.</td>
                </tr>
              ) : (
                filteredSchedules.map(sched => (
                  <tr key={sched.id} className="hover:bg-[#F8FAFC] border-b border-gray-100">
                    <td className="px-6 py-4">
                      <p className="text-[14px] font-medium text-[#0F172A]">{sched.shiftLabel}</p>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#475569]">{formatSiteName(sched.site)}</td>
                    <td className="px-6 py-4 text-[14px] text-[#475569]">{role === 'CLIENT' ? 'ID HIDDEN' : sched.guard?.guardId} ({formatGuardName(sched.guard)})</td>
                    <td className="px-6 py-4">
                      {sched.status === 'NEEDS REPLACEMENT' || sched.status?.includes('SHORTAGE') ? (
                        <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-1 rounded text-[12px]">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                          {sched.status === 'NEEDS REPLACEMENT' ? 'Needs Replacement' : 'Staff Shortage'}
                        </span>
                      ) : (
                        <span className={`text-[14px] font-medium ${sched.status === 'Pending Reassignment' ? 'text-amber-700 font-semibold' : 'text-emerald-700'}`}>
                          {sched.status || 'Scheduled'}
                        </span>
                      )}
                    </td>
                    {isOps && (
                      <td className="px-6 py-4 flex gap-2 border-b-0 items-center h-[52px]">
                        {sched.status === 'Unassigned' || sched.status?.includes('SHORTAGE') ? (
                          <>
                            <button onClick={() => { setFormData({...defaultFormData}); setIsAssigning(sched); }} className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[12px] font-semibold hover:bg-emerald-100">Assign Guard</button>
                            <button onClick={() => handleDeleteRoster(sched.id)} className="text-[13px] text-red-600 hover:underline">Delete</button>
                          </>
                        ) : sched.status === 'NEEDS REPLACEMENT' ? (
                          <>
                            <button onClick={() => handleOpenReplacementModal(sched)} className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded text-[12px] font-bold hover:bg-amber-100 flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                              Find Replacement
                            </button>
                            <button onClick={() => handleDeleteRoster(sched.id)} className="text-[13px] text-red-600 hover:underline">Delete</button>
                          </>
                        ) : (
                          <>
                            {sched.status?.includes('Permanent') && (
                              <button onClick={() => handleDeleteRoster(sched.rosterId)} className="text-[13px] text-red-600 hover:underline">Delete Post</button>
                            )}
                            <button onClick={() => setIsLoggingAbsence(sched)} className="text-[13px] text-amber-800 hover:underline font-medium">Log Absence</button>
                            <button onClick={() => openCreateException(sched)} className="text-[13px] text-blue-600 hover:underline">Override</button>
                            <button onClick={() => { setFormData({...defaultFormData}); setIsAssigning(sched); }} className="text-[13px] text-slate-700 hover:underline">Reassign</button>
                            <button onClick={() => handleDeleteRoster(sched.id)} className="text-[13px] text-red-600 hover:underline">Delete</button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="p-6 bg-[#F8FAFC] overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] font-bold text-[#1E3A5F]">
              Week of {currentWeekStart.toLocaleDateString()} - {new Date(currentWeekStart.getTime() + 6 * 86400000).toLocaleDateString()}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const prev = new Date(currentWeekStart);
                  prev.setDate(prev.getDate() - 7);
                  setCurrentWeekStart(prev);
                }}
                className="px-3 py-1 bg-white border rounded text-[12px] font-medium text-gray-700 hover:bg-gray-50"
              >
                ← Prev Week
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  today.setDate(today.getDate() - today.getDay());
                  setCurrentWeekStart(today);
                }}
                className="px-3 py-1 bg-white border rounded text-[12px] font-medium text-gray-700 hover:bg-gray-50"
              >
                This Week
              </button>
              <button
                onClick={() => {
                  const next = new Date(currentWeekStart);
                  next.setDate(next.getDate() + 7);
                  setCurrentWeekStart(next);
                }}
                className="px-3 py-1 bg-white border rounded text-[12px] font-medium text-gray-700 hover:bg-gray-50"
              >
                Next Week →
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-4 min-w-[1000px]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="font-bold text-center text-[#1E3A5F] border-b pb-2">{d}</div>
            ))}
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date(currentWeekStart);
              d.setDate(d.getDate() + i);
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              const dStr = `${year}-${month}-${day}`;
              
              const dayS = filteredSchedules.filter(s => {
                if (!s.date) return false;
                const sDate = new Date(s.date);
                const sY = sDate.getFullYear();
                const sM = String(sDate.getMonth() + 1).padStart(2, '0');
                const sD = String(sDate.getDate()).padStart(2, '0');
                return `${sY}-${sM}-${sD}` === dStr;
              });
              
              return (
                <div key={i} className="min-h-[160px] border rounded bg-white p-2 flex flex-col">
                  <div className="text-[12px] font-semibold text-gray-600 mb-2 border-b pb-1 flex justify-between">
                    <span>{d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    {dayS.some(s => s.guardId == null || s.status === 'Unassigned') && (
                      <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">Needs Guard</span>
                    )}
                  </div>
                  <div className="space-y-2 flex flex-col flex-1">
                    {dayS.length === 0 ? (
                      <span className="text-[11px] text-gray-300 text-center my-auto">No Shifts</span>
                    ) : (
                      dayS.map(sched => {
                        const isUnassigned = sched.guardId == null || sched.status === 'Unassigned';
                        return (
                          <div key={sched.id} className={`text-[11px] p-2 rounded border flex flex-col gap-1 ${isUnassigned ? 'bg-amber-50/60 border-amber-200' : 'bg-blue-50 border-blue-100'}`}>
                            <span className="font-bold text-[#1E3A5F]">{sched.shiftLabel}</span>
                            <span className="text-gray-600 truncate">{formatSiteName(sched.site)}</span>
                            {isUnassigned ? (
                              <button
                                onClick={() => { setFormData({ ...defaultFormData }); setIsAssigning(sched); }}
                                className="mt-1 bg-emerald-600 text-white text-[11px] font-bold py-1 px-2 rounded hover:bg-emerald-700 transition-colors shadow-sm"
                              >
                                + Assign Guard
                              </button>
                            ) : (
                              <span className="font-medium text-emerald-800 flex items-center gap-1">
                                ✓ {formatGuardName(sched.guard)}
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'monthly' && (
        <div className="p-6 bg-[#F8FAFC]">
          {/* Month Header Navigation Bar */}
          <div className="flex justify-between items-center mb-4 bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center gap-3">
              <h3 className="text-[16px] font-bold text-[#1E3A5F]">
                {currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <span className="text-[12px] text-gray-500 font-medium">
                ({new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate()} Days)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-[13px] font-bold text-[#1E3A5F] hover:bg-gray-50 shadow-2xs transition-colors"
              >
                ← Prev Month
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonthDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[12px] font-bold hover:bg-blue-100 transition-colors shadow-2xs"
              >
                Current Month
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-[13px] font-bold text-[#1E3A5F] hover:bg-gray-50 shadow-2xs transition-colors"
              >
                Next Month →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3 min-w-[1000px]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="font-bold text-center text-[#1E3A5F] text-[13px] py-1">{d}</div>
            ))}
            {(() => {
              const targetYear = currentMonthDate.getFullYear();
              const targetMonth = currentMonthDate.getMonth();
              const firstDay = new Date(targetYear, targetMonth, 1);
              const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
              const startDayOfWeek = firstDay.getDay(); // 0 = Sun
              const totalCells = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7;
              const gridStartDate = new Date(targetYear, targetMonth, 1 - startDayOfWeek);

              return Array.from({ length: totalCells }).map((_, i) => {
                const d = new Date(gridStartDate.getFullYear(), gridStartDate.getMonth(), gridStartDate.getDate() + i);
                const isCurrentMonthCell = d.getMonth() === targetMonth;
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const dStr = `${year}-${month}-${day}`;
                
                const dayS = filteredSchedules.filter(s => {
                  if (!s.date) return false;
                  const sDate = new Date(s.date);
                  const sY = sDate.getFullYear();
                  const sM = String(sDate.getMonth() + 1).padStart(2, '0');
                  const sD = String(sDate.getDate()).padStart(2, '0');
                  return `${sY}-${sM}-${sD}` === dStr;
                });

                const todayStr = (() => {
                  const t = new Date();
                  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
                })();
                const isToday = dStr === todayStr;
                const unassigned = dayS.filter(s => s.guardId == null || s.status === 'Unassigned').length;
                const totalSites = Array.from(new Set(dayS.map(s => s.siteId || s.site?.id).filter(Boolean))).length;
                
                const handleDayClick = () => {
                  if (!isCurrentMonthCell) return;
                  const weekStart = new Date(d);
                  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                  setCurrentWeekStart(weekStart);
                  setViewMode('calendar');
                };

                return (
                  <div
                    key={i}
                    onClick={handleDayClick}
                    className={`border rounded-xl h-[105px] flex flex-col p-2.5 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all relative overflow-hidden group ${
                      !isCurrentMonthCell ? 'bg-gray-50/70 border-gray-100 opacity-50' : isToday ? 'ring-2 ring-blue-500 bg-blue-50/10 border-blue-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[13px] font-bold ${!isCurrentMonthCell ? 'text-gray-400' : isToday ? 'text-blue-600 bg-blue-100 px-1.5 rounded' : 'text-gray-700'}`}>
                        {d.getDate()}
                      </span>
                      {isCurrentMonthCell && dayS.length > 0 && (
                        <span className={`w-2 h-2 rounded-full ${unassigned > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                      )}
                    </div>

                    {isCurrentMonthCell && dayS.length > 0 ? (
                      <div className="flex flex-col gap-1 mt-auto">
                        <div className="text-[11px] text-gray-500 font-medium truncate">
                          {totalSites} {totalSites === 1 ? 'Site' : 'Sites'} • {dayS.length} {dayS.length === 1 ? 'Shift' : 'Shifts'}
                        </div>
                        {unassigned > 0 ? (
                          <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex justify-between items-center shadow-2xs group-hover:bg-red-100 transition-colors">
                            <span>Missing: {unassigned}</span>
                            <span className="text-[10px]">Assign →</span>
                          </div>
                        ) : (
                          <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            ✓ Fully Covered
                          </div>
                        )}
                      </div>
                    ) : isCurrentMonthCell ? (
                      <span className="text-[11px] text-gray-300 mt-auto text-center font-normal">No Activity</span>
                    ) : null}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {isCreatingRoster && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRosterSubmit} className="bg-white rounded-lg shadow-xl w-[500px] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b bg-[#F8FAFC]">
              <h3 className="text-lg font-semibold text-[#1E3A5F]">Assign Permanent Post</h3>
              <p className="text-[13px] text-gray-500 mt-1">This guard will be permanently assigned to this schedule until deleted.</p>
            </div>
            <div className="p-6 space-y-4">
              {errorMsg && <div className="text-red-600 text-sm font-medium">{errorMsg}</div>}

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Site</label>
                <select value={formData.siteId} onChange={e => {
                  const site = allGlobalSites.find(s => s.id === e.target.value);
                  const firstShift = site?.shiftTimings?.[0];
                  setFormData({
                    ...formData,
                    siteId: e.target.value,
                    startTime: firstShift ? firstShift.split(' - ')[0] : '08:00',
                    endTime: firstShift ? firstShift.split(' - ')[1] : '20:00'
                  });
                }} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none" required>
                  <option value="">Select a Site</option>
                  {allGlobalSites.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.clientName} - {s.name}</option>
                  ))}
                </select>
              </div>

              {formData.siteId && (
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Select Shift Cycle</label>
                  <select
                    value={`${formData.startTime} - ${formData.endTime}`}
                    onChange={e => {
                      const [start, end] = e.target.value.split(' - ');
                      setFormData({ ...formData, startTime: start, endTime: end });
                    }}
                    className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none bg-blue-50/50"
                    required
                  >
                    {allGlobalSites.find((s: any) => s.id === formData.siteId)?.shiftTimings?.map((timing: string, idx: number) => (
                      <option key={idx} value={timing}>Shift {idx + 1} ({timing})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Guard</label>
                <select value={formData.guardId} onChange={e => setFormData({ ...formData, guardId: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none" required>
                  <option value="">Select a Guard</option>
                  {guards.map((g: any) => (
                    <option key={g.id} value={g.id}>{g.firstName} {g.lastName} ({g.guardId}) - {g.shiftPreference}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
              <button type="button" onClick={() => setIsCreatingRoster(false)} className="px-4 py-2 border rounded text-[13px] font-medium text-gray-600 bg-white hover:bg-gray-100">Cancel</button>
              <button type="submit" className="bg-[#1E3A5F] px-4 py-2 text-white text-[13px] font-medium rounded hover:bg-[#162D4A]">Create Permanent Post</button>
            </div>
          </form>
        </div>
      )}

      {isCreatingException && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleExceptionSubmit} className="bg-white rounded-lg shadow-xl w-[500px] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b bg-orange-50">
              <h3 className="text-lg font-semibold text-orange-900">Log Emergency Override</h3>
              <p className="text-[13px] text-orange-700 mt-1">Override the permanent schedule for {formData.date}</p>
            </div>
            <div className="p-6 space-y-4">
              {errorMsg && <div className="text-red-600 text-sm font-medium">{errorMsg}</div>}

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Exception Type</label>
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none">
                  <option value="Absent">Mark Guard as Absent (Uncovered)</option>
                  <option value="Swap">Temporary Guard Swap</option>
                </select>
              </div>

              {formData.type === 'Swap' && (
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Select Replacement Guard</label>
                  <select value={formData.replacementGuardId} onChange={e => setFormData({ ...formData, replacementGuardId: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none" required={formData.type === 'Swap'}>
                    <option value="">Select a Replacement Guard</option>
                    {guards.map((g: any) => (
                      <option key={g.id} value={g.id}>{g.firstName} {g.lastName} ({g.guardId})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
              <button type="button" onClick={() => setIsCreatingException(false)} className="px-4 py-2 border rounded text-[13px] font-medium text-gray-600 bg-white hover:bg-gray-100">Cancel</button>
              <button type="submit" className="bg-orange-600 px-4 py-2 text-white text-[13px] font-medium rounded hover:bg-orange-700">Confirm Override</button>
            </div>
          </form>
        </div>
      )}

      {isAutoScheduling && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#1E3A5F] text-white p-5 flex justify-between items-start">
              <div>
                <h3 className="text-[18px] font-bold">Auto-Scheduler Recommendations</h3>
                <p className="text-[12px] text-slate-200 mt-1">
                  System-calculated shift assignment suggestions based on guard shift preferences, workload balance, and rest intervals.
                  <span className="font-semibold text-slate-300 ml-1">(Optional - Review & Apply)</span>
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAutoScheduling(false)} 
                className="text-white opacity-70 hover:opacity-100 text-xl font-bold px-2"
              >
                ✕
              </button>
            </div>

            {/* Filter & Controls Bar */}
            <div className="p-4 bg-slate-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">Site Filter</label>
                  <select
                    value={autoScheduleFilter.siteId}
                    onChange={e => setAutoScheduleFilter({ ...autoScheduleFilter, siteId: e.target.value })}
                    className="border rounded px-2.5 py-1 text-[13px] bg-white border-gray-300 focus:outline-none"
                  >
                    <option value="">All Contract Sites</option>
                    {uniqueSites.map((s: any) => (
                      <option key={s.id} value={s.id}>{formatSiteName(s)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">Start Date</label>
                  <input
                    type="date"
                    value={autoScheduleFilter.startDate}
                    onChange={e => setAutoScheduleFilter({ ...autoScheduleFilter, startDate: e.target.value })}
                    className="border rounded px-2.5 py-1 text-[13px] bg-white border-gray-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">End Date</label>
                  <input
                    type="date"
                    value={autoScheduleFilter.endDate}
                    onChange={e => setAutoScheduleFilter({ ...autoScheduleFilter, endDate: e.target.value })}
                    className="border rounded px-2.5 py-1 text-[13px] bg-white border-gray-300 focus:outline-none"
                  />
                </div>
                <div className="self-end">
                  <button
                    type="button"
                    onClick={() => handleCalculateAutoSchedule()}
                    disabled={isCalculatingAutoSchedule}
                    className="bg-[#1E3A5F] text-white px-3 py-1.5 rounded text-[13px] font-medium hover:bg-[#162D4A] disabled:opacity-50 transition-colors"
                  >
                    {isCalculatingAutoSchedule ? 'Calculating...' : 'Recalculate'}
                  </button>
                </div>
              </div>

              {autoRecommendations.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allOn = Object.keys(acceptedRosterMap).length !== autoRecommendations.length || Object.values(acceptedRosterMap).some(v => !v);
                      const newMap: any = {};
                      autoRecommendations.forEach((rec: any) => {
                        newMap[rec.rosterId] = allOn;
                      });
                      setAcceptedRosterMap(newMap);
                    }}
                    className="text-[12px] font-semibold text-[#1E3A5F] underline hover:text-blue-800"
                  >
                    Toggle Select All ({autoRecommendations.length})
                  </button>
                </div>
              )}
            </div>

            {/* Error Banner if any */}
            {errorMsg && (
              <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-lg">
                {errorMsg}
              </div>
            )}

            {/* Recommendations Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#F8FAFC]">
              {isCalculatingAutoSchedule ? (
                <div className="py-12 text-center text-slate-500 text-[14px]">
                  <p className="font-semibold text-[#1E3A5F]">Calculating Optimal Guard Pairings...</p>
                  <p className="text-[12px] text-gray-400 mt-1">Analyzing guard shift preferences, workload balances, and rest constraints.</p>
                </div>
              ) : autoRecommendations.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-[14px] bg-white rounded-lg border border-dashed border-gray-300">
                  <p className="font-semibold text-gray-700">No Unassigned Shifts Found</p>
                  <p className="text-[12px] text-gray-400 mt-1">All shift slots for the selected filter are already assigned or no slots have been generated yet.</p>
                </div>
              ) : (
                autoRecommendations.map((rec: any) => {
                  const isAccepted = acceptedRosterMap[rec.rosterId] ?? true;
                  const chosenGuardId = selectedGuardMap[rec.rosterId] || rec.recommendedGuard?.guardId || '';
                  const topGuard = rec.recommendedGuard;

                  // Find full guard details for chosen selection
                  const selectedScoredGuard = rec.allScoredGuards?.find((sg: any) => sg.guardId === chosenGuardId) || 
                    (topGuard?.guardId === chosenGuardId ? topGuard : null);
                  const activeGuard = selectedScoredGuard || topGuard;

                  return (
                    <div 
                      key={rec.rosterId}
                      className={`bg-white rounded-lg border p-4 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${isAccepted ? 'border-slate-300 ring-1 ring-slate-200' : 'border-gray-200 opacity-60'}`}
                    >
                      {/* Left: Checkbox & Shift Details */}
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isAccepted}
                          onChange={e => setAcceptedRosterMap({ ...acceptedRosterMap, [rec.rosterId]: e.target.checked })}
                          className="mt-1 w-4 h-4 text-[#1E3A5F] rounded border-gray-300 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-bold text-[#1E3A5F]">{rec.siteName}</span>
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">{rec.date}</span>
                            <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded text-[11px] font-medium border border-blue-100">{rec.timing}</span>
                          </div>

                          {/* Recommended Guard Info & Rationale */}
                          {activeGuard ? (
                            <div className="mt-2.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[13px] font-semibold text-slate-800">
                                  {chosenGuardId && chosenGuardId !== topGuard?.guardId ? 'Manual Override: ' : 'System Recommendation: '}
                                  <span className="text-[#1E3A5F] font-bold">{activeGuard.guardName}</span>
                                </span>
                                <span className="bg-slate-100 text-[#1E3A5F] text-[11px] font-bold px-2 py-0.5 rounded border border-slate-300">
                                  {activeGuard.matchScore}% Match Score
                                </span>
                              </div>

                              {/* Warning Badge if unsuggested / preference mismatch */}
                              {(activeGuard.hasWarning || activeGuard.isPreferenceMismatch) && (
                                <div className="mt-2 text-[12px] bg-amber-50 text-amber-800 border border-amber-200 rounded px-2.5 py-1.5 font-medium flex items-center gap-1.5">
                                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span>
                                    <strong>Override Warning:</strong> {activeGuard.warningReason || `Guard prefers ${activeGuard.shiftPreference} shifts`}
                                  </span>
                                </div>
                              )}

                              {/* Rationale Badges */}
                              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                                {activeGuard.rationale?.map((rat: string, idx: number) => (
                                  <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium border border-slate-200">
                                    [ {rat} ]
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 text-[12px] bg-amber-50 text-amber-800 border border-amber-200 rounded px-2.5 py-1.5 font-medium flex items-center gap-1.5">
                              <span>Staff Shortage: No eligible guard available matching legal 1 shift/day limit & preference rules for this date.</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Guard Override Selector */}
                      <div className="w-full md:w-72 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 md:pl-4 pt-2 md:pt-0">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Assigned Guard (Override)</label>
                        <select
                          value={chosenGuardId}
                          onChange={e => handleAutoScheduleGuardChange(rec, e.target.value, chosenGuardId)}
                          className="w-full border rounded px-2.5 py-1.5 text-[12px] bg-white border-gray-300 focus:outline-none focus:border-[#1E3A5F] font-medium"
                        >
                          <option value="">{topGuard ? 'Select Guard...' : 'No Eligible Guard Available'}</option>
                          {rec.allScoredGuards && rec.allScoredGuards.length > 0 ? (
                            (() => {
                              const recommended = rec.allScoredGuards.filter((sg: any) => !sg.isHardBlocked && sg.isEligible && !sg.hasWarning);
                              const warnings = rec.allScoredGuards.filter((sg: any) => !sg.isHardBlocked && (sg.hasWarning || !sg.isEligible));
                              const locked = rec.allScoredGuards.filter((sg: any) => sg.isHardBlocked);

                              return (
                                <>
                                  {recommended.length > 0 && (
                                    <optgroup label="Recommended Candidates">
                                      {recommended.map((sg: any, index: number) => {
                                        const isRecommended = topGuard && sg.guardId === topGuard.guardId;
                                        const pref = sg.shiftPreference || 'Flexible';
                                        return (
                                          <option key={sg.guardId} value={sg.guardId} className="text-slate-900">
                                            #{index + 1} • {sg.guardName} ({pref}) [{sg.matchScore}% Match]{isRecommended ? ' (Recommended)' : ''}
                                          </option>
                                        );
                                      })}
                                    </optgroup>
                                  )}

                                  {warnings.length > 0 && (
                                    <optgroup label="Other Candidates (Shift Preference Mismatch / Warning)">
                                      {warnings.map((sg: any) => {
                                        const pref = sg.shiftPreference || 'Flexible';
                                        const reason = sg.warningReason || sg.disqualificationReason || 'Shift Mismatch';
                                        return (
                                          <option key={sg.guardId} value={sg.guardId} className="text-amber-800 bg-amber-50/50">
                                            ⚠️ {sg.guardName} ({pref}) - {reason}
                                          </option>
                                        );
                                      })}
                                    </optgroup>
                                  )}

                                  {locked.length > 0 && (
                                    <optgroup label="Legally Restricted (Max 1 Shift/Day)">
                                      {locked.map((sg: any) => (
                                        <option key={sg.guardId} value={sg.guardId} disabled className="text-gray-400 bg-gray-100">
                                          🔒 {sg.guardName} - Already working another shift on this date
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}
                                </>
                              );
                            })()
                          ) : (
                            (() => {
                              const startHour = parseInt((rec.startTime || '08:00').split(':')[0], 10);
                              const targetShiftType: 'Day' | 'Night' = (startHour >= 6 && startHour < 18) ? 'Day' : 'Night';
                              const matching = guards.filter((g: any) => !g.shiftPreference || g.shiftPreference === 'Flexible' || g.shiftPreference === targetShiftType);
                              const nonMatching = guards.filter((g: any) => g.shiftPreference && g.shiftPreference !== 'Flexible' && g.shiftPreference !== targetShiftType);
                              return (
                                <>
                                  <optgroup label={`Recommended (${targetShiftType} / Flexible)`}>
                                    {matching.map((g: any) => {
                                      const isRecommended = topGuard && g.id === topGuard.guardId;
                                      return (
                                        <option key={g.id} value={g.id}>
                                          {g.firstName} {g.lastName} ({g.shiftPreference || 'Flexible'}){isRecommended ? ' (Recommended)' : ''}
                                        </option>
                                      );
                                    })}
                                  </optgroup>
                                  {nonMatching.length > 0 && (
                                    <optgroup label="Other Guards (Shift Preference Mismatch)">
                                      {nonMatching.map((g: any) => (
                                        <option key={g.id} value={g.id} className="text-amber-800">
                                          ⚠️ {g.firstName} {g.lastName} • Prefers {g.shiftPreference}
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}
                                </>
                              );
                            })()
                          )}
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between rounded-b-xl">
              <p className="text-[12px] text-slate-500">
                Suggestions are non-binding until explicitly applied.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAutoScheduling(false)}
                  className="px-4 py-2 border rounded-lg text-[13px] font-medium text-gray-600 bg-white hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyAutoScheduleSubmit}
                  disabled={autoRecommendations.length === 0 || isCalculatingAutoSchedule}
                  className="bg-[#1E3A5F] text-white px-5 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#162D4A] disabled:opacity-50 transition-colors shadow-sm"
                >
                  Apply Selected Assignments ({Object.keys(acceptedRosterMap).filter(k => acceptedRosterMap[k] && selectedGuardMap[k]).length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isGeneratingSlots && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-50 flex items-start justify-center pt-16 p-4">
          <form onSubmit={handleGenerateSlotsSubmit} className="bg-white rounded-lg shadow-2xl w-[480px] overflow-visible flex flex-col border border-gray-200">
            <div className="px-6 py-4 border-b bg-slate-100">
              <h3 className="text-lg font-semibold text-[#1E3A5F]">Generate Shift Slots (Date Range)</h3>
              <p className="text-[13px] text-slate-600 mt-1">Generate unassigned shift slots for contract sites across your specified period.</p>
            </div>
            <div className="p-6 space-y-4">
              {errorMsg && <div className="text-red-600 text-sm font-medium">{errorMsg}</div>}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Target Contract Site (Optional)</label>
                <select
                  value={generateSlotData.siteId}
                  onChange={e => setGenerateSlotData({ ...generateSlotData, siteId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                >
                  <option value="">All Contract Sites</option>
                  {uniqueSites.map((s: any) => (
                    <option key={s.id} value={s.id}>{formatSiteName(s)}</option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500 mt-1">Leave as "All Contract Sites" to generate slots for all active locations.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={generateSlotData.startDate}
                    onChange={e => setGenerateSlotData({ ...generateSlotData, startDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-[14px] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={generateSlotData.endDate}
                    onChange={e => setGenerateSlotData({ ...generateSlotData, endDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-[14px] focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2 rounded-b-lg">
              <button type="button" onClick={() => setIsGeneratingSlots(false)} className="px-4 py-2 border rounded-lg text-[13px] font-medium text-gray-600 bg-white hover:bg-gray-100">Cancel</button>
              <button
                type="submit"
                disabled={isSubmittingSlotGen}
                className="bg-[#1E3A5F] px-5 py-2 text-white text-[13px] font-semibold rounded-lg hover:bg-[#162D4A] shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmittingSlotGen ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Generating...</span>
                  </>
                ) : (
                  'Generate Shift Slots'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {isBatchAssigning && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-50 flex items-start justify-center pt-16 p-4">
          <form onSubmit={handleBatchAssignSubmit} className="bg-white rounded-lg shadow-2xl w-[480px] overflow-visible flex flex-col border border-gray-200">
            <div className="px-6 py-4 border-b bg-slate-100">
              <h3 className="text-lg font-semibold text-[#1E3A5F]">Batch Assign Guard (Date Range)</h3>
              <p className="text-[13px] text-slate-600 mt-1">Assign a guard across multiple dates in a single action.</p>
            </div>
            <div className="p-6 space-y-4">
              {errorMsg && <div className="text-red-600 text-sm font-medium">{errorMsg}</div>}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Contract Site</label>
                <select
                  value={batchFormData.siteId}
                  onChange={e => {
                    const newSiteId = e.target.value;
                    const site = uniqueSites.find((s: any) => s.id === newSiteId);

                    const defaultStart = site?.shiftTimings?.[0]?.start || '08:00';
                    const defaultEnd = site?.shiftTimings?.[0]?.end || '20:00';
                    setBatchFormData({
                      ...batchFormData,
                      siteId: newSiteId,
                      startTime: defaultStart,
                      endTime: defaultEnd
                    });
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                  required
                >
                  <option value="">Select a Site</option>
                  {uniqueSites.map((s: any) => (
                    <option key={s.id} value={s.id}>{formatSiteName(s)}</option>
                  ))}
                </select>
              </div>

              {batchFormData.siteId && (() => {
                const site = uniqueSites.find((s: any) => s.id === batchFormData.siteId);
                const timings = site?.shiftTimings || [];
                return (
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Select Shift Time</label>
                    <select
                      value={`${batchFormData.startTime} - ${batchFormData.endTime}`}
                      onChange={e => {
                        const val = e.target.value;
                        if (!val) {
                          setBatchFormData({ ...batchFormData, startTime: '', endTime: '' });
                        } else {
                          const [sTime, eTime] = val.split(' - ');
                          setBatchFormData({ ...batchFormData, startTime: sTime, endTime: eTime });
                        }
                      }}
                      className="w-full border rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                    >
                      <option value="">All Shifts / Any Shift Time</option>
                      {timings.map((t: any, i: number) => (
                        <option key={i} value={`${t.start} - ${t.end}`}>
                          {t.label ? `${t.label} (${t.start} - ${t.end})` : `${t.start} - ${t.end}`}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={batchFormData.startDate}
                    onChange={e => setBatchFormData({ ...batchFormData, startDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-[14px] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={batchFormData.endDate}
                    onChange={e => setBatchFormData({ ...batchFormData, endDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-[14px] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Guard to Assign</label>
                <select
                  value={batchFormData.guardId}
                  onChange={e => setBatchFormData({ ...batchFormData, guardId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                  required
                >
                  <option value="">Select a Guard</option>
                  {guards.map((g: any) => (
                    <option key={g.id} value={g.id}>
                      {g.firstName} {g.lastName} ({g.guardId}) {g.agency?.name ? `— ${g.agency.name}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2 rounded-b-lg">
              <button type="button" onClick={() => setIsBatchAssigning(false)} className="px-4 py-2 border rounded-lg text-[13px] font-medium text-gray-600 bg-white hover:bg-gray-100">Cancel</button>
              <button
                type="submit"
                disabled={isSubmittingBatchAssign}
                className="bg-[#1E3A5F] px-5 py-2 text-white text-[13px] font-semibold rounded-lg hover:bg-[#162D4A] shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmittingBatchAssign ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Confirming...</span>
                  </>
                ) : (
                  'Confirm Batch Assignment'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {isAssigning && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-50 flex items-start justify-center pt-24 p-4">
          <form onSubmit={handleAssignGuardSubmit} className="bg-white rounded-lg shadow-2xl w-[420px] overflow-visible flex flex-col border border-gray-200">
            <div className="px-6 py-4 border-b bg-emerald-50/80">
              <h3 className="text-lg font-semibold text-emerald-900">Assign Guard to Shift</h3>
              <p className="text-[13px] text-emerald-700 mt-1">{isAssigning.shiftLabel} • {formatSiteName(isAssigning.site)}</p>
            </div>
            <div className="p-6 space-y-4 min-h-[160px]">
              {errorMsg && <div className="text-red-600 text-sm font-medium">{errorMsg}</div>}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Select Guard</label>
                <select
                  value={formData.guardId}
                  onChange={e => setFormData({ ...formData, guardId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm"
                  required
                >
                  <option value="">Choose a guard...</option>
                  {(() => {
                    const shiftStartHour = parseInt(isAssigning.startTime?.split(':')[0] || '8', 10);
                    const targetShiftType = (shiftStartHour >= 6 && shiftStartHour < 18) ? 'Day' : 'Night';

                    const matching = guards.filter((g: any) => !g.shiftPreference || g.shiftPreference === 'Flexible' || g.shiftPreference === targetShiftType);
                    const nonMatching = guards.filter((g: any) => g.shiftPreference && g.shiftPreference !== 'Flexible' && g.shiftPreference !== targetShiftType);

                    return (
                      <>
                        <optgroup label={`Recommended (${targetShiftType} / Flexible)`}>
                          {matching.map((g: any) => (
                            <option key={g.id} value={g.id}>
                              {g.firstName} {g.lastName} ({g.guardId}) • {g.shiftPreference || 'Flexible'}
                            </option>
                          ))}
                        </optgroup>
                        {nonMatching.length > 0 && (
                          <optgroup label="Other Guards (Shift Preference Mismatch)">
                            {nonMatching.map((g: any) => (
                              <option key={g.id} value={g.id}>
                                {g.firstName} {g.lastName} ({g.guardId}) • Prefers {g.shiftPreference}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </>
                    );
                  })()}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2 rounded-b-lg">
              <button type="button" onClick={() => { setIsAssigning(null); setPreferenceMismatchConfirm(null); }} className="px-4 py-2 border rounded-lg text-[13px] font-medium text-gray-600 bg-white hover:bg-gray-100">Cancel</button>
              <button
                type="submit"
                disabled={isSubmittingAssignGuard}
                className="bg-emerald-600 px-5 py-2 text-white text-[13px] font-semibold rounded-lg hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmittingAssignGuard ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Assigning...</span>
                  </>
                ) : (
                  'Assign Guard'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shift Preference Mismatch Confirmation Modal Box */}
      {preferenceMismatchConfirm && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-amber-200">
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-950">
                  {preferenceMismatchConfirm.warningTitle || 'Shift Preference Mismatch'}
                </h3>
                <p className="text-[12px] text-amber-800">
                  {preferenceMismatchConfirm.warningSubtitle || 'Operations Manager Override Confirmation'}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3.5 space-y-2">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-gray-600 font-medium">Selected Guard:</span>
                  <span className="font-semibold text-gray-900">
                    {preferenceMismatchConfirm.guard.firstName} {preferenceMismatchConfirm.guard.lastName} ({preferenceMismatchConfirm.guard.guardId})
                  </span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-gray-600 font-medium">Guard Preference:</span>
                  <span className="font-semibold text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded text-[12px]">
                    Prefers {preferenceMismatchConfirm.guard.shiftPreference || 'Flexible'} Shifts
                  </span>
                </div>
                {preferenceMismatchConfirm.warningReason && (
                  <div className="flex justify-between items-start text-[13px] gap-2">
                    <span className="text-gray-600 font-medium shrink-0">Warning Details:</span>
                    <span className="text-amber-800 font-medium text-[12px] text-right">
                      {preferenceMismatchConfirm.warningReason}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-gray-600 font-medium">Shift Assignment:</span>
                  <span className="font-semibold text-slate-800">
                    {preferenceMismatchConfirm.targetShiftType} Shift ({preferenceMismatchConfirm.shiftLabel})
                  </span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-gray-600 font-medium">Contract Site:</span>
                  <span className="text-gray-800 font-medium text-right max-w-[200px] truncate">
                    {preferenceMismatchConfirm.siteName}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPreferenceMismatchConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingAssignGuard}
                onClick={() => {
                  if (preferenceMismatchConfirm.source === 'autoSchedule') {
                    setSelectedGuardMap(prev => ({
                      ...prev,
                      [preferenceMismatchConfirm.rosterId]: preferenceMismatchConfirm.guardId
                    }));
                    setAcceptedRosterMap(prev => ({
                      ...prev,
                      [preferenceMismatchConfirm.rosterId]: true
                    }));
                    setPreferenceMismatchConfirm(null);
                  } else {
                    executeAssignGuard(preferenceMismatchConfirm.rosterId, preferenceMismatchConfirm.guardId);
                  }
                }}
                className="bg-amber-600 px-5 py-2 text-white text-[13px] font-semibold rounded-lg hover:bg-amber-700 shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmittingAssignGuard ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Confirming...</span>
                  </>
                ) : (
                  'Confirm Assignment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Absence Modal */}
      {isLoggingAbsence && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleConfirmAbsence} className="bg-white rounded-xl shadow-2xl w-[450px] overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b bg-amber-50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-amber-900 flex items-center gap-2">
                  <UserX className="w-5 h-5 text-amber-700" />
                  Log Guard Absence
                </h3>
                <p className="text-[12px] text-amber-800 mt-0.5">{isLoggingAbsence.shiftLabel} • {formatSiteName(isLoggingAbsence.site)}</p>
              </div>
              <button type="button" onClick={() => setIsLoggingAbsence(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-100/70 border border-amber-300 rounded-lg p-3 text-[13px] text-amber-900">
                Logging an absence will change shift status to <strong className="font-bold">NEEDS REPLACEMENT</strong> and automatically open 1-click backup guard suggestions.
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1">Absence Reason / Notes</label>
                <textarea
                  value={absenceReason}
                  onChange={e => setAbsenceReason(e.target.value)}
                  placeholder="e.g. Guard called in sick / Client requested replacement"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white min-h-[80px]"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
              <button type="button" onClick={() => setIsLoggingAbsence(null)} className="px-4 py-2 border rounded-lg text-[13px] font-medium text-gray-600 bg-white hover:bg-gray-100">Cancel</button>
              <button type="submit" className="bg-amber-600 text-white font-semibold text-[13px] px-5 py-2 rounded-lg hover:bg-amber-700 transition-colors shadow-sm">Confirm Absence & Find Replacement</button>
            </div>
          </form>
        </div>
      )}

      {/* 1-Click Replacement Suggestions Modal */}
      {(replacementData || isLoadingReplacement) && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-[540px] overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b bg-[#1E3A5F] text-white flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  1-Click Replacement Guard Finder
                </h3>
                <p className="text-[12px] text-slate-200 mt-0.5">
                  {replacementData ? `${replacementData.siteName} (${replacementData.date}, ${replacementData.shiftTiming})` : 'Calculating optimal backup guards...'}
                </p>
              </div>
              <button type="button" onClick={() => setReplacementData(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[420px] overflow-y-auto space-y-3">
              {isLoadingReplacement ? (
                <div className="py-12 text-center text-slate-500 font-medium text-[14px]">
                  Analyzing guard schedules, rest intervals, and shift preferences...
                </div>
              ) : replacementData?.suggestions?.length === 0 ? (
                <div className="py-8 text-center text-amber-800 bg-amber-50 rounded-lg p-4 text-[13px] font-medium border border-amber-200">
                  No active backup guards available for this time slot.
                </div>
              ) : (
                replacementData?.suggestions?.map((cand: any, idx: number) => (
                  <div key={cand.guardId} className="border border-slate-200 rounded-lg p-3.5 hover:border-[#1E3A5F] hover:bg-slate-50/60 transition-all flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[14px] text-slate-900">{cand.guardName}</span>
                        <span className="text-[12px] font-semibold text-slate-500">({cand.guardCode})</span>
                        {cand.isPreferenceMismatch ? (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-2 py-0.5 rounded text-[11px]">
                            Caution: {cand.shiftPreference} Guard
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold px-2 py-0.5 rounded text-[11px]">
                            Matches {cand.shiftPreference} Pref
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-slate-500 mt-1">
                        Agency: <strong className="text-slate-700">{cand.agencyName}</strong> • Match Score: <strong className="text-emerald-700">{cand.matchScore}%</strong>
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {cand.rationale?.map((r: string, rIdx: number) => (
                          <span key={rIdx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await assignGuard(replacementData.targetRoster.id, cand.guardId);
                          setReplacementData(null);
                          loadSchedules();
                        } catch (err: any) {
                          alert(err.message || 'Failed to assign replacement guard');
                        }
                      }}
                      className="bg-emerald-600 text-white text-[12px] font-bold px-3.5 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs flex-shrink-0"
                    >
                      {idx === 0 ? 'Assign Top Backup' : 'Assign'}
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="px-6 py-3.5 border-t bg-slate-50 flex justify-end">
              <button type="button" onClick={() => setReplacementData(null)} className="px-4 py-2 border rounded-lg text-[13px] font-semibold text-slate-700 bg-white hover:bg-slate-100">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
