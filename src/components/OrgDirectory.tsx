import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Lock, 
  Building, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  Plus, 
  Inbox, 
  Copy, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';
import { StaffMember, SubAdmin, UserSession } from '../types';
import { playClick } from './SoundEngine';

interface OrgDirectoryProps {
  session: UserSession;
  soundEnabled: boolean;
  onStaffUpdated: (updatedStaff: StaffMember[]) => void;
}

export default function OrgDirectory({ session, soundEnabled, onStaffUpdated }: OrgDirectoryProps) {
  const [activeSubTab, setActiveSubTab] = useState<'staff' | 'subadmins'>('staff');
  
  // Lists
  const [subadmins, setSubadmins] = useState<SubAdmin[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  // Form states (Staff)
  const [staffName, setStaffName] = useState<string>('');
  const [staffEmail, setStaffEmail] = useState<string>('');
  const [staffDept, setStaffDept] = useState<string>('Front-end Engineering');
  const [staffSalary, setStaffSalary] = useState<number>(3000);

  // Form states (Subadmin)
  const [subName, setSubName] = useState<string>('');
  const [subEmail, setSubEmail] = useState<string>('');
  const [subDeptScope, setSubDeptScope] = useState<string>('All Departments');

  // Simulated Email Modal
  const [simulatedEmail, setSimulatedEmail] = useState<{
    to: string;
    targetName: string;
    tempPassword: string;
    role: 'Staff' | 'SubAdmin';
    department: string;
  } | null>(null);

  const [copied, setCopied] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  // Load current databases
  useEffect(() => {
    const loadedStaff = localStorage.getItem('clikko_workplace_staff');
    if (loadedStaff) {
      setStaff(JSON.parse(loadedStaff));
    }
    
    const loadedSubadmins = localStorage.getItem('clikko_subadmins');
    if (loadedSubadmins) {
      setSubadmins(JSON.parse(loadedSubadmins));
    }
  }, []);

  const handleCopy = (text: string) => {
    if (soundEnabled) playClick();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit Staff Creation
  const handleCreateStaff = (e: FormEvent) => {
    e.preventDefault();
    if (soundEnabled) playClick();
    setValidationError('');

    const targetName = staffName.trim();
    const targetEmail = staffEmail.trim().toLowerCase();

    if (!targetName || !targetEmail) {
      setValidationError('Please fill in Name and Email fields.');
      return;
    }

    // Check collision in staff or subadmins
    if (staff.some(s => s.email?.toLowerCase() === targetEmail)) {
      setValidationError('Account email is already registered on Clikko roster.');
      return;
    }

    // Generate neat password
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const tempPassword = `STF-${randCode}`;

    // Get initials for avatar text
    const initials = targetName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ST';

    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: targetName,
      department: staffDept,
      avatarText: initials,
      baseSalary: staffSalary,
      salaryMultiplier: 1.0,
      attitudeStatus: 'Working',
      attitudeMessage: 'Assigned and ready to begin tracking tasks.',
      clockInStatus: 'Clocked Out',
      lastClockTime: null,
      email: targetEmail,
      password: tempPassword,
      role: 'Staff'
    };

    const updated = [...staff, newStaff];
    setStaff(updated);
    localStorage.setItem('clikko_workplace_staff', JSON.stringify(updated));
    onStaffUpdated(updated);

    // Show instant SMTP welcome mock email representing the "Staff receives email details" Flow
    setSimulatedEmail({
      to: targetEmail,
      targetName: targetName,
      tempPassword,
      role: 'Staff',
      department: staffDept
    });

    // Clear Form inputs
    setStaffName('');
    setStaffEmail('');
    setStaffSalary(3000);
  };

  // Submit Subadmin Creation
  const handleCreateSubadmin = (e: FormEvent) => {
    e.preventDefault();
    if (soundEnabled) playClick();
    setValidationError('');

    const targetName = subName.trim();
    const targetEmail = subEmail.trim().toLowerCase();

    if (!targetName || !targetEmail) {
      setValidationError('Please fill in Subadmin Name and Email.');
      return;
    }

    if (subadmins.some(s => s.email.toLowerCase() === targetEmail)) {
      setValidationError('Email is already registered for another Sub-Admin.');
      return;
    }

    // Generate password
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const tempPassword = `SUB-${randCode}`;

    const newSub: SubAdmin = {
      id: `subadmin-${Date.now()}`,
      name: targetName,
      email: targetEmail,
      password: tempPassword,
      departmentScope: subDeptScope,
      role: 'SubAdmin',
      createdAt: new Date().toISOString()
    };

    const updated = [...subadmins, newSub];
    setSubadmins(updated);
    localStorage.setItem('clikko_subadmins', JSON.stringify(updated));

    // Show SMTP alert
    setSimulatedEmail({
      to: targetEmail,
      targetName,
      tempPassword,
      role: 'SubAdmin',
      department: subDeptScope
    });

    // Clear inputs
    setSubName('');
    setSubEmail('');
  };

  // Can only manage directories if SuperAdmin
  const isSuperAdmin = session.role === 'SuperAdmin';

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
      
      {/* Header element */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 font-display uppercase tracking-wider">
            <Building className="text-teal-600 font-bold" size={17} />
            <span>Organization Directory Control</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Authorized: <strong className="text-slate-700">{session.role === 'SuperAdmin' ? 'Super Admin' : 'Sub-Admin'}</strong> ({session.orgName})
          </p>
        </div>

        {/* Directory Toggles */}
        <div className="flex bg-slate-100 p-1.2 rounded-xl border border-slate-205 shadow-xs shrink-0 self-start sm:self-center">
          <button
            onClick={() => { if (soundEnabled) playClick(); setActiveSubTab('staff'); }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
              activeSubTab === 'staff'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Staff Directory
          </button>
          
          <button
            onClick={() => { if (soundEnabled) playClick(); setActiveSubTab('subadmins'); }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
              activeSubTab === 'subadmins'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sub-Admins Registry
          </button>
        </div>
      </div>

      {validationError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-2xl">
          {validationError}
        </div>
      )}

      {/* Roster & Creating forms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: REGISTRATION CREATION FORM (5 Columns) */}
        <div className="lg:col-span-5 space-y-5">
          
          {activeSubTab === 'staff' ? (
            /* Staff creation block */
            <form onSubmit={handleCreateStaff} className="bg-slate-50/50 p-5 border border-slate-200 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 border-b border-indigo-50 pb-2">
                <span className="p-1 px-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <UserPlus size={14} />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Add Staff Account</span>
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400">Employee Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Joy Egbo"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-teal-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none leading-normal"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400">Secure Email</label>
                <input
                  type="email"
                  placeholder="joy@company.com"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-teal-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none leading-normal"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400">Assigned Department</label>
                <select
                  value={staffDept}
                  onChange={(e) => setStaffDept(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-teal-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="Front-end Engineering">💻 Front-end Engineering</option>
                  <option value="UI/UX Design">🎨 UI/UX Design</option>
                  <option value="SRE & Writing">✍️ SRE & Compliance</option>
                  <option value="QA & Compliance">🛡️ QA & Compliance</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400">Base Salary Rate ($/mo)</label>
                <input
                  type="number"
                  min={100}
                  max={50000}
                  value={staffSalary}
                  onChange={(e) => setStaffSalary(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 focus:border-teal-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none leading-normal"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Create Staff Account</span>
              </button>
            </form>
          ) : (
            /* Subadmin creation block */
            <div className="space-y-4 border border-slate-200 bg-slate-50/50 p-5 rounded-3xl">
              {isSuperAdmin ? (
                <form onSubmit={handleCreateSubadmin} className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-amber-50 pb-2">
                    <span className="p-1 px-1.5 bg-amber-50 text-amber-600 rounded-lg">
                      <ShieldCheck size={14} />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Add Sub-Admin</span>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400">Subadmin Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Marcus Vance"
                      value={subName}
                      onChange={(e) => setSubName(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-teal-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none leading-normal"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                    <input
                      type="email"
                      placeholder="subadmin@company.com"
                      value={subEmail}
                      onChange={(e) => setSubEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-teal-500 rounded-xl px-3 py-3 text-xs font-bold text-slate-800 outline-none leading-normal"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400">Department Scope</label>
                    <select
                      value={subDeptScope}
                      onChange={(e) => setSubDeptScope(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-teal-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                    >
                      <option value="All Departments">🏢 All Departments</option>
                      <option value="Operations Sector">🛠️ Operations Sector</option>
                      <option value="Product & Design">🎨 Product & Design</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Generate Sub-Admin Account</span>
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-2 text-center text-amber-800">
                  <Lock size={20} className="mx-auto" />
                  <span className="block text-xs font-bold">Access Restrained</span>
                  <p className="text-[10px] leading-relaxed">
                    Only <strong className="font-extrabold uppercase text-slate-900">Super ADMINs</strong> hold credentials and authority to authorize and instantiate new Sub-Admin accounts on the Clikko network.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: REGISTERED ACCOUNTS VIEW LIST (7 Columns) */}
        <div className="lg:col-span-7">
          
          {activeSubTab === 'staff' ? (
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Registered Staff Directory ({staff.length})</span>
              
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {staff.map(s => (
                  <div key={s.id} className="p-3 border border-slate-100 bg-slate-50/20 rounded-2xl flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] border border-slate-200">
                        {s.avatarText}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{s.name}</span>
                        <span className="text-[9px] font-semibold text-slate-400 block">{s.email}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-extrabold text-teal-600 block">{s.department}</span>
                      <span className="text-[10px] font-mono text-slate-500">Pass: {s.password || '••••••••'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Sub-Admins Registry ({subadmins.length})</span>
              
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {subadmins.length === 0 ? (
                  <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                    No Subadmins registered yet.
                  </div>
                ) : (
                  subadmins.map(sub => (
                    <div key={sub.id} className="p-3 border border-slate-100 bg-slate-50/20 rounded-2xl flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-[10px] border border-indigo-100">
                          SA
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{sub.name}</span>
                          <span className="text-[9px] font-semibold text-slate-400 block">{sub.email}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-extrabold text-amber-500 block uppercase tracking-wider">{sub.departmentScope}</span>
                        <span className="text-[10px] font-mono text-slate-500">Pass: {sub.password || '••••••••'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ================= SIMULATED CREATION EMAIL MODAL ================= */}
      <AnimatePresence>
        {simulatedEmail && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              
              {/* Terminal Title */}
              <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between text-white font-mono text-[9px] uppercase tracking-widest font-bold">
                <div className="flex items-center gap-1.5 text-teal-400">
                  <Inbox size={12} className="animate-pulse" />
                  SMTP Mailer Service Triggered
                </div>
                <span>Secured Outbox</span>
              </div>

              {/* Email Envelope Info */}
              <div className="p-5 space-y-4 text-xs">
                <div className="space-y-1 border-b border-slate-800 pb-2.5">
                  <span className="block text-[9px] uppercase font-bold text-slate-500">To Address</span>
                  <span className="font-bold text-white block select-all">{simulatedEmail.to}</span>
                </div>

                <div className="space-y-1 border-b border-slate-800 pb-2.5">
                  <span className="block text-[9px] uppercase font-bold text-slate-500">Subject Field</span>
                  <span className="font-bold text-teal-400 flex items-center gap-1.5">
                    <Sparkles size={11} fill="currentColor" />
                    Welcome to CLIKKO! Your login details are ready.
                  </span>
                </div>

                {/* Email visual card */}
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl font-mono text-[10px] leading-relaxed text-slate-300 space-y-2.5">
                  <p>Welcome, {simulatedEmail.targetName}!</p>
                  <p>
                    An administrator of your company has initialized a secure account for you on the Clikko Tracking System. Here are your credentials:
                  </p>
                  
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-white space-y-1">
                    <div>Organization ID: <span className="font-extrabold text-teal-400">{session.orgId}</span></div>
                    <div>Account Email: <span className="font-bold text-slate-200">{simulatedEmail.to}</span></div>
                    <div>Temporary Password: <span className="font-bold text-amber-400">{simulatedEmail.tempPassword}</span></div>
                    <div>Assigned Scope: <span className="text-indigo-400">{simulatedEmail.department}</span></div>
                  </div>

                  <p className="text-[9px] text-slate-500">
                    *NOTE: Clock into shifts using these credentials. Ensure to protect this password.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-1.5">
                  <button
                    onClick={() => handleCopy(`${session.orgId} | ${simulatedEmail.to} | ${simulatedEmail.tempPassword}`)}
                    className="py-3 px-4 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copied ? <Check size={14} className="text-teal-400" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied Details!' : 'Copy Credentials'}</span>
                  </button>

                  <button
                    onClick={() => setSimulatedEmail(null)}
                    className="py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-450 text-slate-950 font-bold text-xs transition-all flex items-center justify-center cursor-pointer shadow-lg shadow-teal-500/10"
                  >
                    Close Secure Log
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
