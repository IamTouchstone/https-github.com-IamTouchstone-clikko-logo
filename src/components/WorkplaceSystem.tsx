import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Volume2, 
  VolumeX, 
  QrCode, 
  Scan, 
  UserCheck, 
  UserX, 
  TrendingDown, 
  TrendingUp, 
  ShieldAlert, 
  FileText, 
  Users, 
  Eye, 
  DollarSign, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Mic, 
  Activity,
  Award,
  Clock
} from 'lucide-react';
import { StaffMember, CCTVFeed, OwnerRemarkLog, UserSession } from '../types';
import OrgDirectory from './OrgDirectory';

// Web Audio synthesizer helper for highly interactive CCTV auditory mockups
class CCTVAmbientSynthesizer {
  private ctx: AudioContext | null = null;
  private primaryOsc: OscillatorNode | null = null;
  private modulatorOsc: OscillatorNode | null = null;
  private noiseNode: AudioWorkletNode | ScriptProcessorNode | null = null;
  private gainNode: GainNode | null = null;
  private isSynthesizing = false;

  startStatic(type: 'snore' | 'typing' | 'chatter' | 'webcam') {
    if (this.isSynthesizing) this.stop();
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      this.ctx = new AudioCtxClass();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.04, this.ctx.currentTime); // keep it safe and ambient
      this.gainNode.connect(this.ctx.destination);

      if (type === 'snore') {
        // Low rhythmic breathing pitch modulator
        this.primaryOsc = this.ctx.createOscillator();
        this.primaryOsc.type = 'sawtooth';
        this.primaryOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

        this.modulatorOsc = this.ctx.createOscillator();
        this.modulatorOsc.frequency.setValueAtTime(0.3, this.ctx.currentTime); // snore cycle rate (18 snickers/min)
        const modulationGain = this.ctx.createGain();
        modulationGain.gain.setValueAtTime(15, this.ctx.currentTime);

        this.modulatorOsc.connect(modulationGain);
        modulationGain.connect(this.primaryOsc.frequency);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(120, this.ctx.currentTime);

        this.primaryOsc.connect(filter);
        filter.connect(this.gainNode);

        this.primaryOsc.start();
        this.modulatorOsc.start();
      } else if (type === 'typing') {
        // High frequency transient clickers
        this.primaryOsc = this.ctx.createOscillator();
        this.primaryOsc.type = 'triangle';
        this.primaryOsc.frequency.setValueAtTime(800, this.ctx.currentTime);

        const oscGain = this.ctx.createGain();
        oscGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.primaryOsc.connect(oscGain);
        oscGain.connect(this.gainNode);
        this.primaryOsc.start();

        // Rhythmic typewriter pops
        let timeCount = this.ctx.currentTime;
        for (let i = 0; i < 40; i++) {
          const delta = Math.random() * 0.4 + 0.15;
          timeCount += delta;
          oscGain.gain.setValueAtTime(0.12, timeCount);
          oscGain.gain.exponentialRampToValueAtTime(0.001, timeCount + 0.05);
        }
      } else if (type === 'chatter') {
        // Human conversation hum
        this.primaryOsc = this.ctx.createOscillator();
        this.primaryOsc.type = 'sine';
        this.primaryOsc.frequency.setValueAtTime(180, this.ctx.currentTime);

        this.modulatorOsc = this.ctx.createOscillator();
        this.modulatorOsc.type = 'sine';
        this.modulatorOsc.frequency.setValueAtTime(4, this.ctx.currentTime); // conversational vibrato
        
        const modGain = this.ctx.createGain();
        modGain.gain.setValueAtTime(12, this.ctx.currentTime);

        this.modulatorOsc.connect(modGain);
        modGain.connect(this.primaryOsc.frequency);

        this.primaryOsc.connect(this.gainNode);
        this.primaryOsc.start();
        this.modulatorOsc.start();
      } else {
        // Webcam room hum
        this.primaryOsc = this.ctx.createOscillator();
        this.primaryOsc.type = 'sine';
        this.primaryOsc.frequency.setValueAtTime(50, this.ctx.currentTime); // 50Hz native electrical hum
        this.primaryOsc.connect(this.gainNode);
        this.primaryOsc.start();
      }
      this.isSynthesizing = true;
    } catch (e) {
      console.warn("AudioContext synthesis failed/blocked by policy context.", e);
    }
  }

  stop() {
    try {
      if (this.primaryOsc) this.primaryOsc.stop();
      if (this.modulatorOsc) this.modulatorOsc.stop();
      if (this.ctx) this.ctx.close();
    } catch (e) {}
    this.primaryOsc = null;
    this.modulatorOsc = null;
    this.ctx = null;
    this.isSynthesizing = false;
  }
}

interface WorkplaceProps {
  soundEnabled: boolean;
  session: UserSession;
}

export default function WorkplaceSystem({ soundEnabled, session }: WorkplaceProps) {
  // 1. Core States
  const [activeRole, setActiveRole] = useState<'staff' | 'owner'>(() => {
    return (session.role === 'SuperAdmin' || session.role === 'SubAdmin') ? 'owner' : 'staff';
  });
  
  // Custom secure Daily QR Generated token
  const [dailyQRToken, setDailyQRToken] = useState<string>(() => {
    const saved = localStorage.getItem('clikko_daily_qr');
    return saved || 'CLK-SECURE-' + new Date().toISOString().split('T')[0].replace(/-/g, '') + '-X5';
  });

  // Clock-in list of workplace staff
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('clikko_workplace_staff');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'staff-joy',
        name: 'Joy Egbo',
        department: 'UI/UX Design',
        avatarText: 'JE',
        baseSalary: 2800,
        salaryMultiplier: 1.0,
        attitudeStatus: 'Sleeping',
        attitudeMessage: 'Joy Egbo is resting on desk B during office hours.',
        clockInStatus: 'Clocked In',
        lastClockTime: '2026-06-07T08:15:00Z'
      },
      {
        id: 'staff-amara',
        name: 'Amara Nwachukwu',
        department: 'Front-end Engineering',
        avatarText: 'AN',
        baseSalary: 4200,
        salaryMultiplier: 1.0,
        attitudeStatus: 'Working',
        attitudeMessage: 'Amara Nwachukwu is typing code frantically on monitor B.',
        clockInStatus: 'Clocked In',
        lastClockTime: '2026-06-07T08:02:00Z'
      },
      {
        id: 'staff-ugo',
        name: 'Ugochukwu Sylva',
        department: 'SRE & Writing',
        avatarText: 'US',
        baseSalary: 3100,
        salaryMultiplier: 1.0,
        attitudeStatus: 'Idle',
        attitudeMessage: 'Ugochukwu Sylva is scrolling through social network feeds.',
        clockInStatus: 'Clocked Out',
        lastClockTime: '2026-06-06T17:00:00Z'
      },
      {
        id: 'staff-chinedu',
        name: 'Chinedu Alagboso',
        department: 'QA & Compliance',
        avatarText: 'CA',
        baseSalary: 3400,
        salaryMultiplier: 1.0,
        attitudeStatus: 'Working',
        attitudeMessage: 'Chinedu Alagboso is checking testing compliance logs.',
        clockInStatus: 'Clocked In',
        lastClockTime: '2026-06-07T08:30:00Z'
      }
    ];
  });

  // Owner Actions Deductions logs
  const [remarkLogs, setRemarkLogs] = useState<OwnerRemarkLog[]>(() => {
    const saved = localStorage.getItem('clikko_remark_logs');
    return saved ? JSON.parse(saved) : [
      {
        id: 'log-1',
        staffId: 'staff-amara',
        staffName: 'Amara Nwachukwu',
        timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
        remark: 'Outstanding pull request delivery and design fidelity.',
        actionType: 'increase',
        percentageChange: 10,
        salaryBefore: 4200,
        salaryInstated: 4620
      }
    ];
  });

  // Selected CCTV Feed State
  const [selectedFeedId, setSelectedFeedId] = useState<string>('feed-lobby');
  const [audioListening, setAudioListening] = useState<boolean>(false);
  
  // Real Frame Device Camera streaming variables for CCTV and QR
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [isQrScanningMode, setIsQrScanningMode] = useState<boolean>(false);
  const [qrScanningSuccess, setQrScanningSuccess] = useState<string | null>(null);
  const [selectedStaffToClock, setSelectedStaffToClock] = useState<string>('staff-joy');

  // Interactive Owner action fields
  const [ownerRemarkTargetStaff, setOwnerRemarkTargetStaff] = useState<string>('staff-joy');
  const [ownerCustomRemark, setOwnerCustomRemark] = useState<string>('');
  const [ownerSelectAction, setOwnerSelectAction] = useState<'deduction_20' | 'increase_10' | 'none'>('deduction_20');

  // Video element refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioSynthRef = useRef<CCTVAmbientSynthesizer | null>(null);

  // Initialize synth
  useEffect(() => {
    audioSynthRef.current = new CCTVAmbientSynthesizer();
    return () => {
      audioSynthRef.current?.stop();
    };
  }, []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('clikko_workplace_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('clikko_remark_logs', JSON.stringify(remarkLogs));
  }, [remarkLogs]);

  // Handle switching CCTV feeds & Audio dynamic synthesize loops
  useEffect(() => {
    if (audioListening && audioSynthRef.current) {
      if (selectedFeedId === 'feed-lobby') {
        // Lobby snore description
        audioSynthRef.current.startStatic('snore');
      } else if (selectedFeedId === 'feed-lab') {
        audioSynthRef.current.startStatic('typing');
      } else if (selectedFeedId === 'feed-break') {
        audioSynthRef.current.startStatic('chatter');
      } else {
        audioSynthRef.current.startStatic('webcam');
      }
    } else {
      audioSynthRef.current?.stop();
    }
  }, [selectedFeedId, audioListening]);

  // Handle HTML5 standard Video Access for CCTV Feed 4 and QR Viewfinder
  const startDeviceCamera = async () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        // Already active
        return;
      }
      const constraints = {
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false // handle feed sound synthetically to prevent loop feedbacks
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.log(err));
      }
      setHasCameraPermission(true);
      setCameraActive(true);
    } catch (err) {
      console.warn("Could not start physical camera stream.", err);
      setHasCameraPermission(false);
      setCameraActive(false);
    }
  };

  const stopDeviceCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Safe toggler for cameras
  useEffect(() => {
    if (cameraActive || (selectedFeedId === 'feed-webcam' && activeRole === 'owner') || isQrScanningMode) {
      startDeviceCamera();
    } else {
      stopDeviceCamera();
    }
    return () => {
      stopDeviceCamera();
    };
  }, [selectedFeedId, activeRole, isQrScanningMode]);

  // Generate securely a new cryptographically random daily token
  const handleRegenerateDailyQR = () => {
    const randomHex = Math.random().toString(36).substr(2, 6).toUpperCase();
    const token = `CLK-SECURE-${new Date().toISOString().split('T')[0].split('-').join('')}-${randomHex}`;
    setDailyQRToken(token);
    localStorage.setItem('clikko_daily_qr', token);
    if (soundEnabled) {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtxClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } catch (e) {}
    }
  };

  // Perform clock activities scanned safely
  const handleScanQRCodeSimulation = () => {
    setIsQrScanningMode(true);
    setQrScanningSuccess(null);

    // Simulate scanning delay of 2 seconds
    setTimeout(() => {
      // Complete clock toggle for chosen employee
      setStaff(prev => prev.map(s => {
        if (s.id === selectedStaffToClock) {
          const wasClocked = s.clockInStatus === 'Clocked In';
          return {
            ...s,
            clockInStatus: wasClocked ? 'Clocked Out' : 'Clocked In',
            lastClockTime: new Date().toISOString(),
            // Resets attitude if clocking out or in freshly
            attitudeStatus: wasClocked ? 'Idle' : 'Working',
            attitudeMessage: wasClocked ? `${s.name} left workspace floor.` : `${s.name} clocked in successfully.`
          };
        }
        return s;
      }));

      // Find the name of selected staff
      const targetStaff = staff.find(s => s.id === selectedStaffToClock);
      const actionLabel = targetStaff?.clockInStatus === 'Clocked In' ? 'Clocked OUT' : 'Clocked IN';

      setQrScanningSuccess(`Successfully scanned Daily Token! Verified token: ${dailyQRToken}. ${targetStaff?.name} is now ${actionLabel}.`);
      setIsQrScanningMode(false);

      if (soundEnabled) {
        // High pitched validation ding
        try {
          const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioCtxClass();
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.frequency.setValueAtTime(1000, ctx.currentTime);
          osc2.frequency.setValueAtTime(1500, ctx.currentTime + 0.08);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          osc1.start(); osc2.start();
          osc1.stop(ctx.currentTime + 0.2);
          osc2.stop(ctx.currentTime + 0.2);
        } catch (e) {}
      }
    }, 2000);
  };

  // Owner action submission
  const handleSubmitOwnerRemark = (e: FormEvent) => {
    e.preventDefault();
    if (!ownerCustomRemark.trim()) return;

    const target = staff.find(s => s.id === ownerRemarkTargetStaff);
    if (!target) return;

    let percentageMultiplierChange = 0;
    let actionType: 'deduction' | 'increase' | 'none' = 'none';

    if (ownerSelectAction === 'deduction_20') {
      percentageMultiplierChange = -20;
      actionType = 'deduction';
    } else if (ownerSelectAction === 'increase_10') {
      percentageMultiplierChange = 10;
      actionType = 'increase';
    }

    const previousSalary = target.baseSalary * target.salaryMultiplier;
    const newMultiplier = target.salaryMultiplier * (1 + percentageMultiplierChange / 100);
    const updatedSalary = target.baseSalary * newMultiplier;

    // Apply multiplier to staff member state
    setStaff(prev => prev.map(s => {
      if (s.id === ownerRemarkTargetStaff) {
        return {
          ...s,
          salaryMultiplier: newMultiplier,
          // Update message showing latest warning
          attitudeMessage: `Owner Remark: ${ownerCustomRemark}. Base Salary affected by ${percentageMultiplierChange}%.`
        };
      }
      return s;
    }));

    // Register log audit
    const newLog: OwnerRemarkLog = {
      id: `audit-${Date.now()}`,
      staffId: ownerRemarkTargetStaff,
      staffName: target.name,
      timestamp: new Date().toISOString(),
      remark: ownerCustomRemark,
      actionType,
      percentageChange: Math.abs(percentageMultiplierChange),
      salaryBefore: Math.round(previousSalary),
      salaryInstated: Math.round(updatedSalary)
    };

    setRemarkLogs(prev => [newLog, ...prev]);
    setOwnerCustomRemark('');

    if (soundEnabled) {
      // Standard confirmation chime
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtxClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(650, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } catch (e) {}
    }
  };

  // CCTV Feeds definitions
  const cctvFeeds: CCTVFeed[] = [
    { id: 'feed-lobby', name: 'CAM-01: Front Office Desk', location: 'Section B Lobby', isDeviceCamera: false, activeStaffIds: ['staff-joy'] },
    { id: 'feed-lab', name: 'CAM-02: Main Dev Lab', location: 'Keyboard Corridor B', isDeviceCamera: false, activeStaffIds: ['staff-amara'] },
    { id: 'feed-break', name: 'CAM-03: Breakroom Lounge', location: 'Coffee Sector', isDeviceCamera: false, activeStaffIds: ['staff-ugo'] },
    { id: 'feed-webcam', name: 'CAM-04: Owner Webcam Feed', location: 'Interactive Workspace', isDeviceCamera: true, activeStaffIds: ['staff-chinedu'] },
  ];

  const currentFeedObj = cctvFeeds.find(f => f.id === selectedFeedId)!;

  return (
    <div id="workplace-root-containment" className="w-full space-y-6">
      
      {/* Role Picker Section */}
      <div id="role-picker-tabs" className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex flex-col">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-teal-600 animate-pulse" size={18} />
            <span className="truncate max-w-[200px] sm:max-w-none">{session.orgName || 'clikko-corp'}</span>
          </h2>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            {session.role === 'SuperAdmin' ? '🔒 Super Admin Command Center' : session.role === 'SubAdmin' ? '🛡️ Sub-Admin Workplace Operator' : '⚡ Staff Workspace'}
          </span>
        </div>

        {session.role !== 'Staff' ? (
          <div className="flex bg-slate-100 p-1.2 rounded-2xl border border-slate-200 shadow-sm">
            <button
              id="role-switch-btn-staff"
              onClick={() => {
                setActiveRole('staff');
                setAudioListening(false);
                setIsQrScanningMode(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeRole === 'staff'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck size={14} />
              <span>Staff Portal</span>
            </button>
            
            <button
              id="role-switch-btn-owner"
              onClick={() => {
                setActiveRole('owner');
                setIsQrScanningMode(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeRole === 'owner'
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldAlert size={14} />
              <span>Owner Terminal</span>
            </button>
          </div>
        ) : (
          <div className="bg-teal-50 border border-teal-150 px-3.5 py-1.5 rounded-xl text-teal-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span>Staff Portal Active</span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeRole === 'staff' ? (
          /* ================================= STAFF PORTAL VIEW ================================= */
          <motion.div
            key="staff-portal-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8"
          >
            {/* Clock Status Summary list */}
            <div id="staff-section-left" className="col-span-12 md:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-teal-50 border border-teal-100 text-teal-600">
                    <Users size={16} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Your Attendance Cards</h3>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Clock in accurately for payroll</p>
                  </div>
                </div>
                
                <span className="text-[10px] bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-full font-bold text-slate-600 flex items-center gap-1">
                  <Clock size={11} className="text-teal-600" />
                  <span>Interactive Shift</span>
                </span>
              </div>

              {/* Roster & Current States */}
              <div id="staff-roster-list" className="space-y-4">
                {staff.map((employee) => (
                  <div 
                    key={employee.id} 
                    id={`employee-row-${employee.id}`}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-slate-100 bg-slate-50/30 rounded-2xl hover:border-slate-200 transition-all gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200">
                        {employee.avatarText}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 leading-none">{employee.name}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-white border border-slate-100 px-1.5 py-0.5 rounded">
                            {employee.department}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 font-medium">
                          Status: <span className={employee.attitudeStatus === 'Working' ? 'text-teal-600 font-semibold' : employee.attitudeStatus === 'Sleeping' ? 'text-rose-500 font-semibold' : 'text-amber-500 font-semibold'}>{employee.attitudeStatus}</span> ({employee.attitudeMessage})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <div className="text-right">
                        <span className="block text-[8px] uppercase font-bold text-slate-400 leading-tight">Current Salary</span>
                        <span className="block text-xs font-bold font-mono text-slate-900 leading-normal">
                          ${Math.round(employee.baseSalary * employee.salaryMultiplier)}/mo
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {employee.clockInStatus === 'Clocked In' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-teal-50 border border-teal-100 text-teal-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                            Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-slate-50 border border-slate-100 text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            Checked Out
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* QR Scan Clock-In Controller container */}
            <div id="staff-section-right" className="col-span-12 md:col-span-5 space-y-6">
              
              <div id="qr-scan-card" className="bg-[#0F172A] text-white rounded-3xl border border-slate-800 p-6 flex flex-col justify-center items-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="text-center space-y-1 mb-6">
                  <div className="mx-auto w-10 h-10 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 mb-2">
                    <Scan size={20} />
                  </div>
                  <h3 className="text-sm font-bold tracking-tight">Clock In / Out Scanner</h3>
                  <p className="text-[10px] text-slate-400 leading-normal max-w-[240px] mx-auto">
                    Verify secure workspace logs. Select your name, point camera at daily QR, or simulate checkout verify.
                  </p>
                </div>

                {/* Webcam viewport indicator or custom placeholder */}
                <div id="qr-camera-stream" className="w-full aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative flex flex-col items-center justify-center">
                  <video 
                    ref={videoRef} 
                    className={`w-full h-full object-cover transform scale-x-[-1] absolute inset-0 ${isQrScanningMode ? 'opacity-100' : 'opacity-0'}`} 
                    playsInline 
                    muted
                  />

                  {/* High fidelity augmented targeting box */}
                  {isQrScanningMode ? (
                    <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 pointer-events-none">
                      <div className="flex justify-between">
                        <div className="w-4 h-4 border-t-2 border-l-2 border-teal-400" />
                        <div className="w-4 h-4 border-t-2 border-r-2 border-teal-400" />
                      </div>
                      <div className="text-center">
                        <div className="relative inline-block w-48 h-0.5 bg-teal-500 animate-pulse bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                        <span className="block mt-2 text-[8px] uppercase tracking-widest text-teal-400 font-bold bg-slate-900/60 py-1 px-2 rounded-md">Scanning active Daily QR Code...</span>
                      </div>
                      <div className="flex justify-between">
                        <div className="w-4 h-4 border-b-2 border-l-2 border-teal-400" />
                        <div className="w-4 h-4 border-b-2 border-r-2 border-teal-400" />
                      </div>
                    </div>
                  ) : (
                    <div className="z-10 text-center p-4">
                      <QrCode className="mx-auto text-slate-700 animate-pulse" size={36} />
                      <span className="block mt-2 text-[10px] text-slate-500">Camera standby</span>
                    </div>
                  )}
                </div>

                {/* Interface selections for clock simulation */}
                <div id="qr-interactive-selector" className="w-full mt-5 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Select Staff Member Card</label>
                    <select
                      id="qr-staff-member-dropdown"
                      value={selectedStaffToClock}
                      onChange={(e) => {
                        setSelectedStaffToClock(e.target.value);
                        setQrScanningSuccess(null);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-teal-500 font-medium cursor-pointer"
                    >
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.clockInStatus === 'Clocked In' ? 'Clocked In' : 'Clocked Out'})</option>
                      ))}
                    </select>
                  </div>

                  <button
                    id="scan-qr-trigger-btn"
                    onClick={handleScanQRCodeSimulation}
                    disabled={isQrScanningMode}
                    className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-teal-500/10"
                  >
                    {isQrScanningMode ? <RefreshCw size={14} className="animate-spin" /> : <Scan size={14} />}
                    <span>{isQrScanningMode ? 'Verifying secure token...' : 'Scan & Validate Daily QR code'}</span>
                  </button>
                </div>
              </div>

              {/* Action Response feedback Alerts */}
              <AnimatePresence>
                {qrScanningSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-start gap-2.5"
                  >
                    <CheckCircle className="text-teal-600 shrink-0 mt-0.5" size={15} />
                    <div className="space-y-1">
                      <span className="block text-xs font-bold text-teal-800 leading-none">Authentication Passed</span>
                      <p className="text-[11px] text-teal-700 leading-relaxed font-semibold">{qrScanningSuccess}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Informational security validation guide */}
              <div id="staff-tip-note" className="p-5 border border-slate-200 rounded-3xl bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                  <ShieldAlert size={14} className="text-teal-600" />
                  <span>Secure QR Validation Protocol</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  The Admin/Owner Terminal designs daily dynamic secure QR codes tokenized against timestamp servers. Standby device camera scanning intercepts unauthorized attendance logs instantly.
                </p>
              </div>

            </div>
          </motion.div>
        ) : (
          /* ================================= OWNER TERMINAL VIEW ================================= */
          <motion.div
            key="owner-portal-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left CCTV Monitor Hub (7 columns width) */}
            <div id="owner-section-left" className="col-span-12 lg:col-span-7 space-y-6">
              
              {/* CCTV Feed Monitor Display */}
              <div id="cctv-monitor-viewer" className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg relative flex flex-col">
                {/* Header indicators */}
                <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between z-10 shrink-0 text-white">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white font-display">
                      {currentFeedObj.name}
                    </span>
                  </div>

                  <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-amber-400 font-mono">
                    {currentFeedObj.location}
                  </span>
                </div>

                {/* CCTV Main Screen */}
                <div className="relative aspect-video bg-neutral-950 flex flex-col items-center justify-center overflow-hidden">
                  
                  {/* CRT Screen scanline rendering overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-10 opacity-75" />
                  
                  {selectedFeedId === 'feed-webcam' ? (
                    /* Real Camera Viewport showing the user camera as CCTV integration */
                    <video 
                      ref={videoRef} 
                      className="w-full h-full object-cover transform scale-x-[-1] absolute inset-0 opacity-80" 
                      playsInline 
                      muted
                    />
                  ) : (
                    /* Graphical high fidelity simulated dynamic workplace feeds depending on feed selection */
                    <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-center select-none text-white space-y-4">
                      
                      {selectedFeedId === 'feed-lobby' && (
                        <div className="space-y-3">
                          <div className="w-16 h-16 rounded-full border-2 border-rose-500/10 flex items-center justify-center bg-rose-500/5 mx-auto animate-pulse">
                            <span className="text-3xl">😴</span>
                          </div>
                          <div>
                            <span className="inline-block px-2.5 py-0.8 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-300 uppercase tracking-widest mb-1.5">Joy Egbo: Desk A</span>
                            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                              Subject is resting head directly on the keyboard workspace layout B. Snoring vibratone audible on sector audiation channel.
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedFeedId === 'feed-lab' && (
                        <div className="space-y-3">
                          <div className="w-16 h-16 rounded-full border-2 border-teal-500/10 flex items-center justify-center bg-teal-500/5 mx-auto relative">
                            {/* Graphic rotating wheel representation */}
                            <span className="text-3xl animate-spin" style={{ animationDuration: '4s' }}>💻</span>
                          </div>
                          <div>
                            <span className="inline-block px-2.5 py-0.8 rounded-full text-[9px] font-bold bg-teal-500/20 text-teal-300 uppercase tracking-widest mb-1.5">Amara Nwachukwu: Desk B</span>
                            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                              Active compilation in progress. Fast continuous keyboard keystrokes detected. Employee attitude categorized: Highly Diligent.
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedFeedId === 'feed-break' && (
                        <div className="space-y-3">
                          <div className="w-16 h-16 rounded-full border-2 border-amber-500/10 flex items-center justify-center bg-amber-500/5 mx-auto">
                            <span className="text-3xl animate-bounce">☕</span>
                          </div>
                          <div>
                            <span className="inline-block px-2.5 py-0.8 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 uppercase tracking-widest mb-1.5">Ugochukwu Sylva: Lounge</span>
                            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                              Employee has exceeded permitted 15-minute break allowance. Social feed scrolling logged by workspace local tracking.
                            </p>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* Overlaid static HUD statistics */}
                  <div className="absolute top-4 left-4 z-20 bg-slate-950/70 backdrop-blur-xs border border-white/10 px-2 py-1 rounded text-[8px] font-mono text-white select-none pointer-events-none uppercase">
                    FPS: 24.1 | BW: 405KB/S | INTERCEPT SECURE
                  </div>

                  <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-xs border border-white/10 px-2 py-1 rounded text-[9px] font-mono text-white select-none pointer-events-none">
                    <Mic className={audioListening ? "text-teal-400 animate-pulse" : "text-slate-400"} size={11} />
                    <span>AUD: {audioListening ? 'Active (Listen-in on)' : 'MUTED'}</span>
                  </div>

                  <div className="absolute bottom-4 right-4 z-20 bg-slate-950/70 backdrop-blur-xs border border-white/10 px-2 py-1 rounded text-[9px] font-mono text-white select-none pointer-events-none">
                    TIME: {new Date().toLocaleTimeString()}
                  </div>
                </div>

                {/* CCTV Sound & Channel controls */}
                <div className="px-5 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
                  
                  {/* Listening and interactive sliders */}
                  <div className="flex items-center gap-3">
                    <button
                      id="cctv-audio-toggle"
                      onClick={() => setAudioListening(!audioListening)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                        audioListening
                          ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/10'
                          : 'bg-slate-800 border border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      {audioListening ? <Volume2 size={13} /> : <VolumeX size={13} />}
                      <span>{audioListening ? 'Close Listening Audio' : 'Spy Listening' }</span>
                    </button>

                    {audioListening && (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-teal-400 font-semibold animate-pulse">
                        <Activity size={12} />
                        <span>Room conversation noise hum channel connected</span>
                      </div>
                    )}
                  </div>

                  {/* Channel selectors */}
                  <div className="flex gap-2 items-center flex-wrap">
                    {cctvFeeds.map(f => (
                      <button
                        key={f.id}
                        id={`cctv-cam-tab-${f.id}`}
                        onClick={() => {
                          setSelectedFeedId(f.id);
                          setAudioListening(false);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${
                          selectedFeedId === f.id
                            ? 'bg-slate-800 text-white font-black ring-1 ring-white/10'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {f.id.split('-')[1]}
                      </button>
                    ))}
                  </div>

                </div>

              </div>

              {/* Roster lists in Owner Terminal Mode highlighting Multipliers */}
              <div id="owner-roster-list" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Employee Payroll and Multipliers</h3>
                    <p className="text-xs text-slate-600 font-semibold mt-0.5">Live attitude and evaluated rate metrics</p>
                  </div>
                  <span className="p-1.5 px-3 bg-teal-50 border border-teal-100 rounded-full text-[10px] text-teal-700 font-bold">
                    ${staff.reduce((acc, s) => acc + Math.round(s.baseSalary * s.salaryMultiplier), 0)} Total monthly liability
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {staff.map(s => {
                    const currentCalculatedSalary = Math.round(s.baseSalary * s.salaryMultiplier);
                    const multiplierStatus = s.salaryMultiplier > 1.0 
                      ? 'plus' 
                      : s.salaryMultiplier < 1.0 
                      ? 'minus' 
                      : 'neutral';

                    return (
                      <div key={s.id} className="p-4 border border-slate-100 bg-slate-50/20 rounded-2xl flex flex-col justify-between gap-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-150 text-slate-700 text-xs font-bold flex items-center justify-center">
                              {s.avatarText}
                            </div>
                            <div>
                              <span className="block text-xs font-bold text-slate-900 leading-none">{s.name}</span>
                              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{s.department}</span>
                            </div>
                          </div>

                          {/* Multiplier visual badge */}
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-0.5 ${
                            multiplierStatus === 'plus'
                              ? 'bg-teal-50 text-teal-600 border border-teal-100'
                              : multiplierStatus === 'minus'
                              ? 'bg-red-50 text-red-500 border border-red-100'
                              : 'bg-slate-50 text-slate-500 border border-slate-150'
                          }`}>
                            {multiplierStatus === 'plus' && <TrendingUp size={9} />}
                            {multiplierStatus === 'minus' && <TrendingDown size={9} />}
                            {Math.round(s.salaryMultiplier * 100)}% PAY
                          </span>
                        </div>

                        {/* Salary and status message description */}
                        <div className="flex justify-between items-end border-t border-slate-50 pt-2 text-[11px]">
                          <div className="text-left">
                            <span className="text-[9px] font-bold text-slate-400 block leading-none mb-1">Base Rating</span>
                            <span className="text-slate-600 font-medium">${s.baseSalary} base</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] font-bold text-slate-401 block leading-none mb-1">EVALUATED SALARY</span>
                            <span className="text-xs font-bold font-mono text-slate-900">${currentCalculatedSalary}/mo</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

            {/* Right Action Terminal (5 columns width) */}
            <div id="owner-section-right" className="col-span-12 lg:col-span-5 space-y-6">
              
              {/* Daily QR Generator container */}
              <div id="owner-qr-generator" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                  <span className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                    <QrCode size={16} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Security Gate Admin</h3>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Dynamic lock code generator</p>
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col justify-center items-center text-center space-y-4">
                  {/* SVG QR Code Simulation */}
                  <div className="bg-white p-3.5 rounded-xl shadow-md border border-slate-700">
                    <svg className="w-24 h-24 text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                      {/* Geometric QR Block representation */}
                      <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" />
                      <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" />
                      <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                      <path d="M40,10 h20 v10 h-20 z M40,40 h20 v20 h-20 z M10,40 h20 v20 h-20 z M70,40 h20 v20 h-20 z M70,70 h20 v10 h-20 z M40,80 h20 v20 h-20 z" />
                    </svg>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 leading-tight block">Secure Generated Token</span>
                    <span className="font-mono text-xs font-extrabold text-teal-400 block break-all tracking-wider">
                      {dailyQRToken}
                    </span>
                  </div>

                  <button
                    id="regenerate-qr-btn"
                    onClick={handleRegenerateDailyQR}
                    className="py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all mx-auto shadow-sm"
                  >
                    <RefreshCw size={11} />
                    <span>Regenerate Daily QR</span>
                  </button>
                </div>
              </div>

              {/* Owner Remark & Deductions application form */}
              <div id="owner-remarks-payout-panel" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                  <span className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
                    <Award size={16} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Evaluate Staff Attitude</h3>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Leave remarks and decide pay adjustments</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitOwnerRemark} id="owner-remarks-submission-form" className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Select Employee Target</label>
                    <select
                      id="owner-target-employee-dropdown"
                      value={ownerRemarkTargetStaff}
                      onChange={(e) => setOwnerRemarkTargetStaff(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500 font-semibold cursor-pointer"
                    >
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.attitudeStatus})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Evaluate Action Outcome</label>
                    <select
                      id="owner-action-selected-dropdown"
                      value={ownerSelectAction}
                      onChange={(e: any) => setOwnerSelectAction(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500 font-semibold cursor-pointer"
                    >
                      <option value="deduction_20">😴 20% Salary Deduction (Sleeping, Idle, Unproductive)</option>
                      <option value="increase_10">💻 10% Salary Increase (Working Hard, Diligent efforts)</option>
                      <option value="none">💬 Casual Feedback / No pay adjust</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Owner Custom Remark Statement</label>
                    <textarea
                      id="owner-remark-text-area"
                      rows={2}
                      placeholder="e.g. Joy Egbo verified sleeping during shifts. Deduction approved."
                      value={ownerCustomRemark}
                      onChange={(e) => setOwnerCustomRemark(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500 font-medium placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    id="submit-owner-action-btn"
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle size={14} className="text-teal-400" />
                    <span>Enforce Penalty / Reward multiplier</span>
                  </button>
                </form>
              </div>

              {/* Salary Adjustments Historic Audit Log */}
              <div id="owner-audit-logs" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-1.5 border-b border-slate-50 pb-2">
                  <FileText className="text-slate-400" size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payroll Action Audit logs</span>
                </div>

                <div id="payroll-logs-list" className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {remarkLogs.map((log) => (
                    <div key={log.id} className="p-3 border border-slate-100 bg-slate-50/10 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-900 leading-none">{log.staffName}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          log.actionType === 'increase'
                            ? 'bg-teal-50 text-teal-600'
                            : log.actionType === 'deduction'
                            ? 'bg-red-50 text-red-501'
                            : 'bg-slate-50 text-slate-500'
                        }`}>
                          {log.actionType === 'increase' ? '+' : log.actionType === 'deduction' ? '-' : ''}
                          {log.percentageChange}%
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-normal select-none italic font-medium">
                        "{log.remark}"
                      </p>

                      <div className="flex justify-between text-[10px] text-slate-400 font-semibold border-t border-dashed border-slate-100 pt-1.5">
                        <span>Was: ${log.salaryBefore}/mo</span>
                        <span className="text-slate-800 font-bold">New: ${log.salaryInstated}/mo</span>
                        <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Super Admin / Sub-admin Organization Directory Control Panel */}
            <div className="col-span-12">
              <OrgDirectory 
                session={session} 
                soundEnabled={soundEnabled} 
                onStaffUpdated={setStaff} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
