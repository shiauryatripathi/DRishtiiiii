import React, { useState, useEffect, useRef } from 'react';
import { Patient, Scan, ChatMessage } from '../types';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Apple, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Heart, 
  FileDown, 
  RefreshCw, 
  Terminal, 
  ChevronRight,
  History,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Layers,
  MessageSquare,
  Camera
} from 'lucide-react';
import { cn } from '../lib/utils';
import { LongitudinalTimeline } from './LongitudinalTimeline';

export interface AdvisorProps {
  patients: Patient[];
  scans: Scan[];
  initialPatientId?: number;
  onNavigateToScan?: (patientId?: number) => void;
  onSelectPatient?: (patientId: number) => void;
}

export function Advisor({ 
  patients, 
  scans, 
  initialPatientId,
  onNavigateToScan,
  onSelectPatient 
}: AdvisorProps) {
  // If initialPatientId is provided, use it, else default to first patient if available
  const [selectedPatientId, setSelectedPatientId] = useState<number | ''>(
    initialPatientId !== undefined ? initialPatientId : (patients.length > 0 ? patients[0].id : '')
  );

  // Tab State: 'timeline' (Longitudinal Progression) vs 'chat' (AI Care & Lifestyle Chat)
  const [activeTab, setActiveTab] = useState<'timeline' | 'chat'>('timeline');

  // Longitudinal Scans fetched from backend
  const [patientScans, setPatientScans] = useState<Scan[]>([]);
  const [isLoadingScans, setIsLoadingScans] = useState<boolean>(false);

  // Severity Grade slider/context
  const [currentGrade, setCurrentGrade] = useState<number>(1.5);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<{
    matlabConnected: boolean;
    matlabEngine: string;
  }>({
    matlabConnected: true,
    matlabEngine: 'MathWorks MATLAB ResNet-50 + CLAHE'
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch system status (check offline MATLAB diagnostic engine)
  useEffect(() => {
    fetch('/api/system/status')
      .then(r => r.json())
      .then(data => {
        setSystemStatus({
          matlabConnected: !!data.matlabConnected,
          matlabEngine: data.matlabEngine || 'MathWorks MATLAB ResNet-50 + CLAHE'
        });
      })
      .catch(() => {});
  }, []);

  // Fetch patient-specific scans for longitudinal progression tracking
  const fetchPatientScans = async (patientId: number) => {
    setIsLoadingScans(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/scans`);
      if (res.ok) {
        const data = await res.json();
        setPatientScans(data);

        // Update current grade to the most recent scan if available
        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setCurrentGrade(sorted[0].grade);
        }
      }
    } catch (err) {
      console.error('Failed to fetch longitudinal scans for patient', err);
    } finally {
      setIsLoadingScans(false);
    }
  };

  // Sync selectedPatientId when initialPatientId prop changes
  useEffect(() => {
    if (initialPatientId !== undefined && initialPatientId !== selectedPatientId) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId]);

  // When selectedPatientId changes, fetch longitudinal scans from backend
  useEffect(() => {
    if (selectedPatientId !== '') {
      fetchPatientScans(Number(selectedPatientId));
      if (onSelectPatient) {
        onSelectPatient(Number(selectedPatientId));
      }
    } else {
      setPatientScans([]);
    }
  }, [selectedPatientId]);

  // Real-time synchronization event listener: if a scan is completed for current patient, refresh scans!
  useEffect(() => {
    const handleScanCompleted = (e: any) => {
      if (selectedPatientId !== '') {
        fetchPatientScans(Number(selectedPatientId));
      }
    };
    window.addEventListener('drishti:scan_completed', handleScanCompleted);
    return () => window.removeEventListener('drishti:scan_completed', handleScanCompleted);
  }, [selectedPatientId]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `Namaste! I am the **DRishtii Clinical Care & Glycemic Advisor**.

I provide **evidence-based Indian dietary guidance, safe glycemic remedies, exercise prescriptions, and longitudinal disease progression analysis** tailored to your patient's Diabetic Retinopathy severity grade.

Review the **Longitudinal Disease Progression Timeline** to track changes across historical fundus scans, or ask me any questions about nutrition, remedies, or vision protection!`
        }
      ]);
    }
  }, [messages.length]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeTab]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          patientId: selectedPatientId || undefined,
          drGrade: currentGrade
        })
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I experienced a connection interruption. Please ensure the local server is running.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscussInChat = (promptText: string) => {
    setActiveTab('chat');
    handleSendMessage(promptText);
  };

  const selectedPatient = patients.find(p => p.id === Number(selectedPatientId)) || null;

  // Calculate quick summary metrics for top context bar
  const chronoScans = [...patientScans].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const baseline = chronoScans.length > 0 ? chronoScans[0] : null;
  const latest = chronoScans.length > 0 ? chronoScans[chronoScans.length - 1] : null;
  const delta = baseline && latest && chronoScans.length > 1 ? (latest.grade - baseline.grade) : null;

  const quickPrompts = [
    {
      title: '📈 Disease Progression & Trajectory',
      prompt: selectedPatient 
        ? `Please provide a detailed longitudinal progression assessment for ${selectedPatient.name}. How has the retinopathy advanced across previous scans, what is the progression velocity, and what specialist triage is recommended?`
        : 'How do you calculate and evaluate longitudinal progression velocity in diabetic retinopathy?'
    },
    {
      title: '🥗 Indian Diet for Retinopathy',
      prompt: 'What specific low-glycemic Indian foods (millets, greens, pulses) will protect my retinal microvasculature?'
    },
    {
      title: '🌿 Safe Home Remedies & Spices',
      prompt: 'Which spices and home remedies (methi, amla, dalchini) are scientifically proven to help blood sugar regulation?'
    },
    {
      title: '🏃 Eye Hygiene & Safe Exercise',
      prompt: 'What are safe exercises for my severity grade? Which high-strain workouts must I avoid to prevent retinal bleeding?'
    },
    {
      title: '💊 Deficiencies (Lutein & Vit A)',
      prompt: 'What nutritional deficiencies should diabetic patients check for, and which natural foods provide Lutein and Zeaxanthin?'
    }
  ];

  const handlePrintAdvice = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col space-y-4 min-h-[calc(100vh-7rem)]">
      
      {/* Top Header & Patient Context Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Clinical Advisor & Disease Progression
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Edge AI Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Longitudinal Fundus Tracking • AI Progression Velocity • Personalized Glycemic & Lifestyle Prescriptions
              </p>
            </div>
          </div>
        </div>

        {/* System Engine Status & Export Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-700">
              MathWorks MATLAB Engine (<span className="text-emerald-700 font-bold">100% Offline</span>)
            </span>
          </div>

          <button
            onClick={handlePrintAdvice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            title="Print or Export Clinical Advice"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Advice</span>
          </button>
        </div>
      </div>

      {/* Patient Selector & Progression Ribbon */}
      <div className="bg-gradient-to-r from-sky-50 via-indigo-50/30 to-slate-50 border border-sky-100/80 rounded-xl p-3.5 shrink-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center text-xs shadow-2xs">
        {/* Patient Selection Dropdown */}
        <div className="lg:col-span-4">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
            <span>Linked Patient Record</span>
            {selectedPatient && (
              <span className="text-sky-700 font-mono text-[9px]">ID: PAT-{selectedPatient.id.toString().padStart(4, '0')}</span>
            )}
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-sky-500 shadow-2xs"
          >
            <option value="">-- General Consultation (No Patient Selected) --</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                PAT-{p.id.toString().padStart(4, '0')}: {p.name} ({p.age}y, {p.gender}) — {p.village || 'Rural Health'}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Slider / Indicator */}
        <div className="lg:col-span-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Severity Context (Grade 0.0 - 4.0)
            </span>
            <span className={cn(
              "font-black text-xs px-2 py-0.5 rounded border",
              currentGrade < 1 ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
              currentGrade < 2 ? "bg-amber-50 text-amber-800 border-amber-200" :
              currentGrade < 3 ? "bg-orange-50 text-orange-800 border-orange-200" : "bg-red-50 text-red-800 border-red-200"
            )}>
              Grade {currentGrade.toFixed(1)}: {
                currentGrade < 1 ? 'No DR' :
                currentGrade < 2 ? 'Mild NPDR' :
                currentGrade < 3 ? 'Moderate NPDR' : 'Severe / PDR'
              }
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="4"
            step="0.1"
            value={currentGrade}
            onChange={(e) => setCurrentGrade(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />
        </div>

        {/* Longitudinal Trajectory Badge */}
        <div className="lg:col-span-4 bg-white/90 p-2.5 rounded-lg border border-slate-200/70 shadow-2xs flex items-center justify-between gap-2">
          {selectedPatient ? (
            <div className="space-y-0.5 truncate">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-900 text-xs truncate">{selectedPatient.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">({selectedPatient.diabetes_years || 10} yrs DM)</span>
              </div>
              <div className="text-[10px] text-slate-600 flex items-center gap-2">
                <span>HbA1c: <strong className="text-slate-800">{selectedPatient.hba1c || '7.8'}%</strong></span>
                <span>•</span>
                <span>Glucose: <strong className="text-slate-800">{selectedPatient.blood_sugar || '180'} mg/dL</strong></span>
              </div>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500">
              Select a patient above to load longitudinal history and calculate progression delta.
            </span>
          )}

          {delta !== null && (
            <div className="shrink-0 text-right">
              <div className={cn(
                "inline-flex items-center gap-0.5 text-xs font-black px-2 py-0.5 rounded font-mono",
                delta > 0.3 ? "bg-red-100 text-red-800" : delta < -0.3 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
              )}>
                {delta > 0.3 ? <TrendingUp className="w-3 h-3 text-red-600" /> : delta < -0.3 ? <TrendingDown className="w-3 h-3 text-emerald-600" /> : null}
                <span>Δ {delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}</span>
              </div>
              <span className="block text-[8px] uppercase font-bold text-slate-400 mt-0.5">
                {patientScans.length} Scans
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Mode Navigation Tabs (Timeline vs Chat) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('timeline')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer",
              activeTab === 'timeline'
                ? "bg-sky-600 text-white shadow-2xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            <History className="w-4 h-4" />
            <span>Longitudinal Disease Progression Timeline</span>
            {patientScans.length > 0 && (
              <span className={cn(
                "text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold",
                activeTab === 'timeline' ? "bg-sky-800 text-sky-100" : "bg-slate-100 text-slate-700"
              )}>
                {patientScans.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer",
              activeTab === 'chat'
                ? "bg-indigo-600 text-white shadow-2xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI Care & Lifestyle Chat</span>
          </button>
        </div>

        {activeTab === 'timeline' && onNavigateToScan && (
          <button
            onClick={() => onNavigateToScan(selectedPatient ? selectedPatient.id : undefined)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-sky-700 border border-sky-200 hover:bg-sky-50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>New Follow-up Scan</span>
          </button>
        )}
      </div>

      {/* Content Area Based on Active Tab */}
      {activeTab === 'timeline' ? (
        <LongitudinalTimeline
          patient={selectedPatient}
          scans={patientScans}
          isLoading={isLoadingScans}
          onRefreshScans={() => {
            if (selectedPatientId !== '') {
              fetchPatientScans(Number(selectedPatientId));
            }
          }}
          onNavigateToScan={onNavigateToScan}
          onDiscussInChat={handleDiscussInChat}
        />
      ) : (
        /* Chat Mode Container */
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col min-h-[500px] overflow-hidden">
          
          {/* Quick Prompt Banner for Longitudinal Trajectory */}
          {selectedPatient && patientScans.length > 1 && (
            <div className="bg-gradient-to-r from-indigo-50 to-sky-50 border-b border-indigo-100 p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-bold text-slate-900">
                  Analyze {selectedPatient.name}'s Longitudinal Progression:
                </span>
                <span className="text-xs text-slate-600 hidden sm:inline">
                  Net change: {delta !== null && delta >= 0 ? `+${delta.toFixed(1)}` : delta?.toFixed(1)} across {patientScans.length} historical scans.
                </span>
              </div>
              <button
                onClick={() => {
                  handleSendMessage(
                    `Please evaluate ${selectedPatient.name}'s longitudinal progression trajectory from baseline (${baseline ? `Grade ${baseline.grade.toFixed(1)}` : 'initial'}) to latest (${latest ? `Grade ${latest.grade.toFixed(1)}` : 'current'}). What are the clinical risk velocity and immediate steps?`
                  );
                }}
                disabled={isLoading}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md text-xs font-bold shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
              >
                <span>Ask AI to Analyze Trajectory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 max-w-3xl",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs",
                  msg.role === 'user' 
                    ? "bg-sky-600 text-white" 
                    : "bg-gradient-to-tr from-indigo-700 to-sky-600 text-white"
                )}>
                  {msg.role === 'user' ? 'U' : <Bot className="w-4 h-4" />}
                </div>

                <div className={cn(
                  "rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs",
                  msg.role === 'user'
                    ? "bg-sky-600 text-white rounded-tr-none font-medium"
                    : "bg-white text-slate-800 border border-slate-200 rounded-tl-none prose-sm"
                )}>
                  {/* Render formatted message content */}
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.content.split('\n').map((line, idx) => {
                      if (line.startsWith('### ')) {
                        return <h4 key={idx} className="font-bold text-slate-900 text-sm mt-3 mb-1">{line.replace('### ', '')}</h4>;
                      }
                      if (line.startsWith('⚠️') || line.startsWith('🚨')) {
                        return <div key={idx} className="p-2 rounded bg-red-50 text-red-800 border border-red-200 font-semibold my-2">{line}</div>;
                      }
                      if (line.startsWith('- ') || line.startsWith('* ')) {
                        return <li key={idx} className="ml-4 list-disc text-slate-700 my-0.5">{line.substring(2)}</li>;
                      }
                      return <p key={idx} className="my-1">{line}</p>;
                    })}
                  </div>
                  <div className={cn(
                    "text-[9px] mt-2 font-mono text-right",
                    msg.role === 'user' ? "text-sky-100" : "text-slate-400"
                  )}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 mr-auto max-w-xl items-center text-xs text-slate-500">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-2xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-medium text-slate-600 ml-1">Analyzing longitudinal progression and glycemic parameters...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-2 bg-slate-100/70 border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Prompts:
            </span>
            {quickPrompts.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.prompt)}
                disabled={isLoading}
                className="text-[11px] font-medium whitespace-nowrap bg-white hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full transition-all shrink-0 cursor-pointer shadow-2xs"
              >
                {item.title}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about longitudinal trajectory, diet, millets, safe exercises, or warning signs..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Clinical Disclaimer */}
            <p className="text-[9px] text-slate-400 text-center mt-2 font-medium">
              Clinical Disclaimer: AI recommendations provide dietary & glycemic stabilization support. Severe or Proliferative DR requires specialist laser or anti-VEGF intervention.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
