"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard, History, ClipboardList, GraduationCap,
  ClipboardPenLine, User2, LogOut, Eye, Download, X, Radio, Circle,
  FileCheck
} from "lucide-react";
import logo from "../../assets/ICTPL_image.png";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Session {
  sessionid: number;
  sessiontitle: string;
  sessiondate: string;
  sessiontime: string;
  sessionlink: string;
}

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

  // User data from DB
  const [fullName, setFullName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("No email");
  const [loadingUser, setLoadingUser] = useState(true);

  const fullscreenRef = useRef<HTMLDivElement>(null);

  const modelPapers: ModelPaper[] = [
    { title: "MEPSC Model Question Paper 2025 - 01", src: "/pdf/modelpaper.pdf", downloadName: "MEPSC_Model_Paper_2025.pdf" },
    { title: "MEPSC Model Question Paper 2025 - 02", src: "/pdf/modelpaper2.pdf", downloadName: "MEPSC_Model_Paper_2025_2.pdf" },
    { title: "MCQ's of all subjects", src: "/pdf/MCQ.pdf", downloadName: "MCQ_all_subjects.pdf" },
  ];

  const isSessionLiveNow = (s: Session): boolean => {
    const now = toZonedTime(new Date(), "Asia/Kolkata");
    const sessionDT = toZonedTime(
      new Date(`${s.sessiondate}T${s.sessiontime}`),
      "Asia/Kolkata"
    );
    const start = toZonedTime(new Date(sessionDT.getTime() - 5 * 60 * 1000), "Asia/Kolkata");
    const end = toZonedTime(new Date(sessionDT.getTime() + 60 * 60 * 1000), "Asia/Kolkata");
    return now >= start && now <= end;
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!auth?.user) return;

    const currentEmail = auth.user.email?.toLowerCase()?.trim() || "";

    const fetchUserAndSessions = async () => {
      setLoadingUser(true);

      try {
        // 1. Fetch user info
        const { data: member, error: memberError } = await supabase
          .from("memberinformation")
          .select("name, email")
          .eq("email", currentEmail)
          .maybeSingle();

        if (memberError) {
          console.error("Error fetching memberinformation:", memberError);
        }

        if (member) {
          const nameFromDb = member.name?.trim();
          setFullName(
            nameFromDb && nameFromDb.length > 0
              ? nameFromDb
              : currentEmail.split("@")[0] || "User"
          );
          setUserEmail(member.email?.toLowerCase() || currentEmail);
        } else {
          setFullName(currentEmail.split("@")[0] || "User");
          setUserEmail(currentEmail);
        }

        // 2. Fetch sessions
        const { data, error } = await supabase.from("sessions").select("*");
        if (error) throw error;

        if (data) {
          const sorted = (data as Session[]).sort((a, b) =>
            new Date(`${a.sessiondate}T${a.sessiontime}`).getTime() -
            new Date(`${b.sessiondate}T${b.sessiontime}`).getTime()
          );
          setSessions(sorted);
          setLiveNow(sorted.some(isSessionLiveNow));

          const nowInIST = toZonedTime(new Date(), "Asia/Kolkata");
          const future = sorted.find(
            (s) => toZonedTime(new Date(`${s.sessiondate}T${s.sessiontime}`), "Asia/Kolkata") > nowInIST
          );
          setNearestFutureSession(future ?? null);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserAndSessions();

    const interval = setInterval(() => {
      // Refetch sessions only (user info doesn't change often)
      supabase
        .from("sessions")
        .select("*")
        .then(({ data, error }) => {
          if (!error && data) {
            const sorted = (data as Session[]).sort((a, b) =>
              new Date(`${a.sessiondate}T${a.sessiontime}`).getTime() -
              new Date(`${b.sessiondate}T${b.sessiontime}`).getTime()
            );
            setSessions(sorted);
            setLiveNow(sorted.some(isSessionLiveNow));

            const nowInIST = toZonedTime(new Date(), "Asia/Kolkata");
            const future = sorted.find(
              (s) => toZonedTime(new Date(`${s.sessiondate}T${s.sessiontime}`), "Asia/Kolkata") > nowInIST
            );
            setNearestFutureSession(future ?? null);
          }
        });
    }, 30000);

    return () => clearInterval(interval);
  }, [auth?.user]);

  useEffect(() => {
    if (!auth?.loading && !auth?.user && mounted) {
      router.push("/");
    }
  }, [auth, router, mounted]);

  const handleSignOut = async () => {
    try {
      await auth.signOut?.();
      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  const badgeSession = liveNow
    ? sessions.find(isSessionLiveNow) ?? null
    : nearestFutureSession;

  if (!mounted || !auth || auth.loading || loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!auth.user) return null;

  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return (
    <>
      <style jsx>{`
        @layer utilities {
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to   { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        }
      `}</style>

      <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
        {/* Sidebar */}
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
              <GraduationCap className="w-5 h-5 mr-3" /> Exam Information
            </Link>
            <Link href="/modelpaper" className={`flex items-center px-4 py-3 rounded-lg transition ${pathname === "/modelpaper" ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"}`}>
              <ClipboardPenLine className="w-5 h-5 mr-3" /> Model papers
            </Link>
            <Link href="/tests" className={`flex items-center px-4 py-3 rounded-lg transition ${pathname === "/tests" ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"}`}>
              <ClipboardPenLine className="w-5 h-5 mr-3" /> Practice Tests
            </Link>
            <Link href="/certificates" className={`flex items-center px-4 py-3 rounded-lg transition ${pathname === "/certificates" ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"}`}>
              <FileCheck className="w-5 h-5 mr-3" /> Certificates
            </Link>
          </nav>
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc]/95 backdrop-blur-sm text-white flex justify-around items-center py-2 shadow-lg z-50 text-xs">
          <Link href="/dashboard" className="flex flex-col items-center"><LayoutDashboard className="w-5 h-5 mb-1" /> Dash</Link>
          <Link href="/results" className="flex flex-col items-center"><ClipboardList className="w-5 h-5 mb-1" /> Results</Link>
          <Link href="/sessions" className="flex flex-col items-center"><ClipboardList className="w-5 h-5 mb-1" /> Sessions</Link>
          <Link href="/previous" className="flex flex-col items-center"><History className="w-5 h-5 mb-1" /> Prev</Link>
          <Link href="/modelpaper" className="flex flex-col items-center"><ClipboardPenLine className="w-5 h-5 mb-1" /> Papers</Link>
          <Link href="/tests" className="flex flex-col items-center"><ClipboardPenLine className="w-5 h-5 mb-1" /> Tests</Link>
          <Link href="/certificates" className="flex flex-col items-center"><FileCheck className="w-5 h-5 mb-1" /> Certs</Link>
          <button onClick={handleSignOut} className="flex flex-col items-center"><LogOut className="w-5 h-5 mb-1" /> Out</button>
        </nav>

        <div className="flex-1 flex flex-col">
          <header className="flex justify-between items-center bg-white shadow px-4 md:px-6 py-3 sticky top-0 z-40">
            <Image src={logo} alt="Logo" className="h-[60px] w-[60px] md:h-[100px] md:w-[100px]" />
            <div className="flex items-center gap-3 md:gap-5">
              {badgeSession && (
                <button
                  onClick={() => setSelectedSession(badgeSession)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-sm font-medium transition ${
                    liveNow ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  {liveNow ? (
                    <>
                      <Radio className="w-4 h-4" />
                      <span className="hidden sm:inline">LIVE NOW</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 fill-current" />
                      <span className="hidden sm:inline">UPCOMING</span>
                    </>
                  )}
                </button>
              )}

              <div className="flex items-center gap-2">
                <div className="bg-blue-50 p-2 rounded-full">
                  <User2 className="w-5 h-5 text-blue-700" />
                </div>
                <div className="text-sm text-right">
                  <div className="font-semibold text-gray-800 truncate max-w-[160px] md:max-w-none">
                    {fullName}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-[160px] md:max-w-none">
                    {userEmail}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
              >
                <LogOut className="w-4 h-4" /> Sign Out
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
                <div className="p-6 md:p-8 space-y-6">
                  {modelPapers.map((paper, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">{paper.title}</h3>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={() => { setSelectedPaper(paper); setShowModal(true); }}
                          className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md"
                        >
                          <Eye className="w-5 h-5" /> View Full
                        </button>
                        <a
                          href={paper.src}
                          download={paper.downloadName}
                          className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition shadow-md"
                        >
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
          <div ref={fullscreenRef} className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
            <div className="bg-gray-900 p-4 flex justify-between items-center text-white shadow-2xl">
              <h3 className="text-lg font-semibold truncate max-w-[55%]">{selectedPaper.title}</h3>
              <div className="flex items-center gap-4">
                <a
                  href={selectedPaper.src}
                  download={selectedPaper.downloadName}
                  className="bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
                >
                  <Download className="w-5 h-5" /> Download
                </a>
                <button
                  onClick={() => { setShowModal(false); setSelectedPaper(null); }}
                  className="bg-gray-700 hover:bg-gray-800 px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
                >
                  <X className="w-5 h-5" /> Close
                </button>
              </div>
            </div>
            <iframe
              src={selectedPaper.src}
              className="flex-1 w-full border-0 bg-white"
              title={selectedPaper.title}
              allowFullScreen
            />
          </div>
        )}

        {/* Live Session Modal */}
        {selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
              <button
                onClick={() => setSelectedSession(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                {liveNow ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Radio className="w-5 h-5 animate-pulse" />
                    <span className="font-bold text-xl">LIVE NOW</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-orange-600">
                    <Circle className="w-5 h-5 fill-current" />
                    <span className="font-bold text-xl">Upcoming Session</span>
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedSession.sessiontitle}
              </h3>

              <div className="space-y-2 text-gray-700 mb-6">
                <p><strong>Date:</strong> {format(new Date(selectedSession.sessiondate), "dd MMM yyyy")}</p>
                <p><strong>Time:</strong> {format(new Date(`1970-01-01T${selectedSession.sessiontime}`), "hh:mm a")} IST</p>
              </div>

              <a
                href={selectedSession.sessionlink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#0062cc] text-white font-medium py-3.5 rounded-xl hover:bg-blue-700 transition text-center block text-lg shadow-md"
              >
                Join Google Meet
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}