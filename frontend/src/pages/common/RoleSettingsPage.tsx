import React, { useState } from 'react';

interface RoleSettingsProps {
  user?: any;
}

export default function RoleSettingsPage({ user }: RoleSettingsProps) {
  const role = user?.role || 'OPERATION_MANAGER';
  const [profile, setProfile] = useState(() => ({
    name: user?.name || (role === 'CLIENT' ? 'Client Org' : role === 'AGENCY' ? 'Agency Contact' : 'Ops Manager'),
    email: user?.email || 'manager@spms.com',
    phone: '+66 81 234 5678'
  }));

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [opsPrefs, setOpsPrefs] = useState(() => ({
    defaultShiftCycle: localStorage.getItem('ops_shift_cycle') || '2-shift',
    emailAlerts: JSON.parse(localStorage.getItem('ops_email_alerts') || 'true'),
    contractExpiryReminders: JSON.parse(localStorage.getItem('ops_expiry_reminders') || 'true')
  }));

  const [adminPrefs, setAdminPrefs] = useState(() => ({
    defaultUserRole: localStorage.getItem('admin_default_role') || 'GUARD',
    pageSize: parseInt(localStorage.getItem('admin_page_size') || '10', 10),
    dateFormat: localStorage.getItem('admin_date_format') || 'YYYY-MM-DD'
  }));

  const [agencyPrefs, setAgencyPrefs] = useState(() => ({
    agencyName: localStorage.getItem('agency_name') || 'Apex Security Agency',
    defaultShiftPref: localStorage.getItem('agency_default_shift') || 'Flexible',
    autoVisibility: JSON.parse(localStorage.getItem('agency_auto_vis') || 'true')
  }));

  const [clientPrefs, setClientPrefs] = useState(() => ({
    companyName: localStorage.getItem('client_company_name') || 'Siam Retail Group',
    incidentAlerts: JSON.parse(localStorage.getItem('client_incident_alerts') || 'true'),
    scheduleChangeAlerts: JSON.parse(localStorage.getItem('client_schedule_alerts') || 'true')
  }));

  const handleSaveOps = () => {
    localStorage.setItem('ops_shift_cycle', opsPrefs.defaultShiftCycle);
    localStorage.setItem('ops_email_alerts', JSON.stringify(opsPrefs.emailAlerts));
    localStorage.setItem('ops_expiry_reminders', JSON.stringify(opsPrefs.contractExpiryReminders));
    alert('Operations Settings saved.');
  };

  const handleSaveAdmin = () => {
    localStorage.setItem('admin_default_role', adminPrefs.defaultUserRole);
    localStorage.setItem('admin_page_size', adminPrefs.pageSize.toString());
    localStorage.setItem('admin_date_format', adminPrefs.dateFormat);
    alert('Admin System Preferences saved.');
  };

  const handleSaveAgency = () => {
    localStorage.setItem('agency_name', agencyPrefs.agencyName);
    localStorage.setItem('agency_default_shift', agencyPrefs.defaultShiftPref);
    localStorage.setItem('agency_auto_vis', JSON.stringify(agencyPrefs.autoVisibility));
    alert('Agency Profile & Preferences saved.');
  };

  const handleSaveClient = () => {
    localStorage.setItem('client_company_name', clientPrefs.companyName);
    localStorage.setItem('client_incident_alerts', JSON.stringify(clientPrefs.incidentAlerts));
    localStorage.setItem('client_schedule_alerts', JSON.stringify(clientPrefs.scheduleChangeAlerts));
    alert('Client Profile & Alert Settings saved.');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) {
      return alert('New passwords do not match.');
    }
    alert('Password updated successfully.');
    setPasswordForm({ current: '', next: '', confirm: '' });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        <h2 className="text-[20px] font-bold text-[#1E3A5F] mb-1">
          {role === 'ADMIN' ? 'System Administrator Settings' :
           role === 'CLIENT' ? 'Client Organization Settings' :
           role === 'AGENCY' ? 'Agency Manager Settings' : 'Operations Manager Settings'}
        </h2>
        <p className="text-[13px] text-gray-500">Manage profile data, notification policies, and account credentials.</p>
      </div>

      {/* Common Section: Profile Data */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
        <h3 className="text-[15px] font-bold text-[#0F172A] border-b pb-2">User Profile & Contact Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Full Name / Entity</label>
            <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Email Address</label>
            <input value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Contact Telephone</label>
            <input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]" />
          </div>
        </div>
      </div>

      {/* Role-Specific Panels */}
      {(role === 'OPERATION_MANAGER' || !role) && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <h3 className="text-[15px] font-bold text-[#0F172A] border-b pb-2">Operations Scheduling & Dispatch Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Default Contract Shift Cycle</label>
              <select value={opsPrefs.defaultShiftCycle} onChange={e => setOpsPrefs({ ...opsPrefs, defaultShiftCycle: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]">
                <option value="2-shift">2-Shift (12 Hours each)</option>
                <option value="3-shift">3-Shift (8 Hours each)</option>
              </select>
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
              <input type="checkbox" checked={opsPrefs.emailAlerts} onChange={e => setOpsPrefs({ ...opsPrefs, emailAlerts: e.target.checked })} className="rounded text-blue-600" />
              <span>Send immediate email alerts for Unresolved Critical Incidents</span>
            </label>
            <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
              <input type="checkbox" checked={opsPrefs.contractExpiryReminders} onChange={e => setOpsPrefs({ ...opsPrefs, contractExpiryReminders: e.target.checked })} className="rounded text-blue-600" />
              <span>Remind Operations 30 days prior to contract expiration</span>
            </label>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={handleSaveOps} className="bg-[#1E3A5F] text-white px-4 py-2 rounded text-[13px] font-semibold hover:bg-blue-900 transition-colors">Save Ops Preferences</button>
          </div>
        </div>
      )}

      {role === 'ADMIN' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <h3 className="text-[15px] font-bold text-[#0F172A] border-b pb-2">System Defaults & Backup</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Default Onboarding Role</label>
              <select value={adminPrefs.defaultUserRole} onChange={e => setAdminPrefs({ ...adminPrefs, defaultUserRole: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]">
                <option value="GUARD">Guard</option>
                <option value="CLIENT">Client</option>
                <option value="AGENCY">Agency</option>
                <option value="OPERATION_MANAGER">Operations Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Table Items Per Page</label>
              <input type="number" value={adminPrefs.pageSize} onChange={e => setAdminPrefs({ ...adminPrefs, pageSize: parseInt(e.target.value) || 10 })} className="w-full border rounded px-3 py-1.5 text-[13px]" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Display Date Format</label>
              <select value={adminPrefs.dateFormat} onChange={e => setAdminPrefs({ ...adminPrefs, dateFormat: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]">
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center pt-3 border-t">
            <button onClick={() => alert('Exporting full database JSON backup...')} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-[12px] font-semibold rounded hover:bg-gray-100">Export System Database Backup</button>
            <button onClick={handleSaveAdmin} className="bg-[#1E3A5F] text-white px-4 py-2 rounded text-[13px] font-semibold hover:bg-blue-900 transition-colors">Save Admin Preferences</button>
          </div>
        </div>
      )}

      {role === 'AGENCY' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <h3 className="text-[15px] font-bold text-[#0F172A] border-b pb-2">Agency Profile & Guard Onboarding Defaults</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Registered Agency Name</label>
              <input value={agencyPrefs.agencyName} onChange={e => setAgencyPrefs({ ...agencyPrefs, agencyName: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]">
              </input>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Default Guard Shift Preference</label>
              <select value={agencyPrefs.defaultShiftPref} onChange={e => setAgencyPrefs({ ...agencyPrefs, defaultShiftPref: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]">
                <option value="Flexible">Flexible</option>
                <option value="Day">Day</option>
                <option value="Night">Night</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer pt-2">
            <input type="checkbox" checked={agencyPrefs.autoVisibility} onChange={e => setAgencyPrefs({ ...agencyPrefs, autoVisibility: e.target.checked })} className="rounded text-blue-600" />
            <span>Automatically mark newly onboarded guards as Visible to Operations Managers</span>
          </label>
          <div className="flex justify-end pt-2">
            <button onClick={handleSaveAgency} className="bg-[#1E3A5F] text-white px-4 py-2 rounded text-[13px] font-semibold hover:bg-blue-900 transition-colors">Save Agency Settings</button>
          </div>
        </div>
      )}

      {role === 'CLIENT' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <h3 className="text-[15px] font-bold text-[#0F172A] border-b pb-2">Client Company Profile & Alert Subscriptions</h3>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Company Entity Name</label>
            <input value={clientPrefs.companyName} onChange={e => setClientPrefs({ ...clientPrefs, companyName: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]" />
          </div>
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
              <input type="checkbox" checked={clientPrefs.incidentAlerts} onChange={e => setClientPrefs({ ...clientPrefs, incidentAlerts: e.target.checked })} className="rounded text-blue-600" />
              <span>Receive real-time notifications for verified site security incidents</span>
            </label>
            <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
              <input type="checkbox" checked={clientPrefs.scheduleChangeAlerts} onChange={e => setClientPrefs({ ...clientPrefs, scheduleChangeAlerts: e.target.checked })} className="rounded text-blue-600" />
              <span>Receive weekly summary of guard shift allocations</span>
            </label>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={handleSaveClient} className="bg-[#1E3A5F] text-white px-4 py-2 rounded text-[13px] font-semibold hover:bg-blue-900 transition-colors">Save Client Settings</button>
          </div>
        </div>
      )}

      {/* Common Section: Password Change */}
      <form onSubmit={handlePasswordChange} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
        <h3 className="text-[15px] font-bold text-[#0F172A] border-b pb-2">Security & Password Credentials</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" required value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" required value={passwordForm.next} onChange={e => setPasswordForm({ ...passwordForm, next: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" required value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]" />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit" className="bg-[#1E3A5F] text-white px-4 py-2 rounded text-[13px] font-semibold hover:bg-black transition-colors">Update Password</button>
        </div>
      </form>
    </div>
  );
}
