"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard, History, ClipboardList, GraduationCap,
  ClipboardPenLine, User2, LogOut, Eye, Download, X, Radio, Circle
} from "lucide-react";
import logo from "../../assets/ICTPL_image.png";
import emailNamePairs from "../../public/names.json";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const emailToName = new Map<string, string>();
Object.entries(emailNamePairs as Record<string, string>).forEach(
  ([email, name]) => emailToName.set(email.toLowerCase(), name)
);

interface Session { sessionid: number; sessiontitle: string; sessiondate: string; sessiontime: string; sessionlink: string; }

interface ModelPaper {
  title: string;
  src: string;
  downloadName: string;
}

export default function ModelPaperPage() {
  const auth = useAuth() as any;
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<ModelPaper | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [liveNow, setLiveNow] = useState(false);
  const [nearestFutureSession, setNearestFutureSession] = useState<Session | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const fullscreenRef = useRef<HTMLDivElement>(null);

  const modelPapers: ModelPaper[] = [
    { title: "MEPSC Model Question Paper 2025 - 01", src: "/pdf/modelpaper.pdf", downloadName: "MEPSC_Model_Paper_2025.pdf" },
    { title: "MEPSC Model Question Paper 2025 - 02", src: "/pdf/modelpaper2.pdf", downloadName: "MEPSC_Model_Paper_2025_2.pdf" },
  ];

  const isSessionLiveNow = (s: Session): boolean => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const nowInIST = new Date(now.getTime() + istOffset);
    const sessionDateTime = new Date(`${s.sessiondate}T${s.sessiontime}`);
    const start = new Date(sessionDateTime.getTime() - 5 * 60 * 1000);
    const end = new Date(sessionDateTime.getTime() + 60 * 60 * 1000);
    return nowInIST >= start && nowInIST <= end;
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const fetchSessions = async () => {
      const { data } = await supabase.from("sessions").select("*");
      if (data) {
        const sorted = (data as Session[]).sort((a, b) =>
          new Date(`${a.sessiondate}T${a.sessiontime}`).getTime() -
          new Date(`${b.sessiondate}T${b.sessiontime}`).getTime()
        );
        setSessions(sorted);
        setLiveNow(sorted.some(isSessionLiveNow));
        const nowInIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
        const future = sorted.find(s => new Date(`${s.sessiondate}T${s.sessiontime}`) > nowInIST);
        setNearestFutureSession(future ?? null);
      }
    };
    if (auth?.user) {
      fetchSessions();
      const id = setInterval(fetchSessions, 30_000);
      return () => clearInterval(id);
    }
  }, [auth?.user]);

  useEffect(() => {
    if (!auth || auth.loading || !mounted) return;
    if (!auth.user) router.push("/");
  }, [auth, router, mounted]);

  const handleSignOut = async () => {
    await auth.signOut?.();
    router.push("/");
  };

  const getUserDisplayName = () => {
    const email = auth.user?.email?.toLowerCase();
    return email && emailToName.has(email)
      ? emailToName.get(email)!
      : auth.user?.email?.split("@")[0] || "User";
  };

  const badgeSession = liveNow ? sessions.find(isSessionLiveNow) ?? null : nearestFutureSession;

  if (!mounted || !auth || auth.loading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;
  }
  if (!auth.user) return null;

  return (
    <>
      <style jsx>{`
        @layer utilities {
          @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        }
      `}</style>

      <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
        {/* Sidebar & Mobile Nav - Same as original */}
        <aside className="hidden md:flex w-60 bg-[#0062cc] text-white flex-col h-screen sticky top-0 overflow-y-auto">
          <nav className="flex-1 px-4 py-4 space-y-1">
            <Link href="/dashboard" className={`flex items-center px-4 py-3 rounded-lg transition ${pathname === "/dashboard" ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"}`}>
              <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
            </Link>
            <Link href="/results" className={`flex items-center px-4 py-3 rounded-lg transition ${pathname === "/results" ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"}`}>
              <ClipboardList className="w-5 h-5 mr-3" /> Result
            </Link>
            <Link href="/sessions" className={`flex items-center px-4 py-3 rounded-lg transition ${pathname === "/sessions" ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"}`}>
              <ClipboardList className="w-5 h-5 mr-3" /> Sessions
            </Link>
            <Link href="/previous" className={`flex items-center px-4 py-3 rounded-lg transition ${pathname === "/previous" ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"}`}>
              <History className="w-5 h-5 mr-3" /> Previous Sessions
            </Link>
            <Link href="/vlogs" className={`flex items-center px-4 py-3 rounded-lg transition ${pathname === "/vlogs" ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"}`}>
              <ClipboardList className="w-5 h-5 mr-3" /> B/Vlogs
            </Link>
            <Link href="/schedule" className={`flex items-center px-4 py-3 rounded-lg transition ${pathname === "/schedule" ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"}`}>
              <GraduationCap className="w-5 h-5 mr-3" /> Exam schedule
            </Link>
            <Link href="/modelpaper" className={`flex items-center px-4 py-3 rounded-lg transition ${pathname === "/modelpaper" ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"}`}>
              <ClipboardPenLine className="w-5 h-5 mr-3" /> Model papers
            </Link>
            
                      <Link href="/tests" className={`flex items-center px-4 py-3 rounded-lg transition ${pathname === "/tests" ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"}`}>
              <ClipboardPenLine className="w-5 h-5 mr-3" /> Practice  Tests
            </Link>

          </nav>
        </aside>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc]/95 backdrop-blur-sm text-white flex justify-around items-center py-2 shadow-lg z-50 text-xs">
          <Link href="/dashboard" className="flex flex-col items-center"><LayoutDashboard className="w-5 h-5 mb-1" /> Dash</Link>
          <Link href="/results" className="flex flex-col items-center"><ClipboardList className="w-5 h-5 mb-1" /> Results</Link>
          <Link href="/sessions" className="flex flex-col items-center"><ClipboardList className="w-5 h-5 mb-1" /> Sessions</Link>
          <Link href="/previous" className="flex flex-col items-center"><History className="w-5 h-5 mb-1" /> Prev</Link>
          <Link href="/modelpaper" className="flex flex-col items-center"><ClipboardPenLine className="w-5 h-5 mb-1" /> Papers</Link>
          <Link href="/mocktests" className="flex flex-col items-center"><ClipboardPenLine className="w-5 h-5 mb-1" /> Tests</Link>
          <Link href="/tests" className="flex flex-col items-center"><ClipboardPenLine className="w-5 h-5" /> Practice test</Link>

          <button onClick={handleSignOut} className="flex flex-col items-center"><LogOut className="w-5 h-5 mb-1" /> Out</button>
        </nav>

        <div className="flex-1 flex flex-col">
          <header className="flex justify-between items-center bg-white shadow px-4 md:px-6 py-3 sticky top-0 z-40">
            <Image src={logo} alt="Logo" className="h-[60px] w-[60px] md:h-[100px] md:w-[100px]" />
            <div className="flex items-center gap-3 md:gap-5">
              {badgeSession && (
                <button onClick={() => setSelectedSession(badgeSession)} className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-medium transition ${liveNow ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
                  {liveNow ? (
                    <>
                      <Radio className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">LIVE NOW</span>
                      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="absolute inline-flex h-6 w-6 rounded-full bg-green-400 opacity-75 animate-ping"></span>
                      </span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5 fill-current text-white" />
                      <span className="hidden sm:inline">UPCOMING</span>
                    </>
                  )}
                </button>
              )}
              <div className="flex items-center gap-2">
                <User2 className="w-5 h-5 text-gray-700" />
                <div className="text-sm text-gray-800 text-right">
                  <div className="font-semibold truncate max-w-[150px] md:max-w-none">{getUserDisplayName()}</div>
                </div>
              </div>
              <button onClick={handleSignOut} className="hidden md:flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition">
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8 bg-gray-100 mb-[80px] md:mb-0">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                  <h2 className="text-2xl md:text-3xl font-bold">Model Question Papers</h2>
                  <p className="text-blue-100 mt-1">Download or view in fullscreen</p>
                </div>
                <div className="p-8 space-y-6">
                  {modelPapers.map((paper, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">{paper.title}</h3>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={() => { setSelectedPaper(paper); setShowModal(true); }} className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md">
                          <Eye className="w-5 h-5" /> View Fullgall
                        </button>
                        <a href={paper.src} download={paper.downloadName} className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition shadow-md">
                          <Download className="w-5 h-5" /> Download PDF
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* PDF Fullscreen Modal */}
        {showModal && selectedPaper && (
          <div ref={fullscreenRef} className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
            <div className="bg-gray-900 p-4 flex justify-between items-center text-white shadow-2xl">
              <h3 className="text-lg font-semibold truncate max-w-[60%]">{selectedPaper.title}</h3>
              <div className="flex items-center gap-4">
                <a href={selectedPaper.src} download={selectedPaper.downloadName} className="bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2">
                  <Download className="w-5 h-5" /> Download
                </a>
                <button onClick={() => { document.exitFullscreen?.(); setShowModal(false); setSelectedPaper(null); }} className="bg-gray-600 hover:bg-gray-700 px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2">
                  <X className="w-5 h-5" /> Close
                </button>
              </div>
            </div>
            <iframe src={selectedPaper.src} className="flex-1 w-full border-0 bg-white" title={selectedPaper.title} allowFullScreen />
          </div>
        )}

        {/* Live Session Modal */}
        {selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
              <button onClick={() => setSelectedSession(null)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
              <div className="flex items-center gap-2 mb-3">
                {liveNow ? (
                  <div className="flex items-center gap-2 text-green-600"><Radio className="w-5 h-5 animate-pulse" /><span className="font-bold text-lg">LIVE NOW</span></div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600"><Circle className="w-5 h-5 fill-current" /><span className="font-bold text-lg">Upcoming Session</span></div>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{selectedSession.sessiontitle}</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-5">
                <p><strong>Date:</strong> {format(new Date(selectedSession.sessiondate), "dd MMM yyyy")}</p>
                <p><strong>Time:</strong> {format(new Date(`1970-01-01T${selectedSession.sessiontime}`), "hh:mm a")}</p>
              </div>
              <a href={selectedSession.sessionlink} target="_blank" rel="noopener noreferrer" className="w-full bg-[#0062cc] text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition text-center block">
                Join Google Meet
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}