"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  User2,
  LogOut,
  Radio,
  Circle,
  History,
  GraduationCap,
  ClipboardPenLine,
  FileCheck,
  Award,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";

// Assets
import logo from "../../assets/ICTPL_image.png";

// JSON files
import namesData from "../../public/names.json";     // email → full name
import memberData from "../../public/member.json";   // membershipId (string) → email

// Date utilities for live sessions
import { format, addMinutes, isWithinInterval } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Session {
  sessionid: number;
  sessiontitle: string;
  sessiondate: string;
  sessiontime: string;
  sessionlink: string;
}

interface CertificateItem {
  label: string;
  status: string | null;
  url: string | null;
}

export default function Dashboard() {
  const auth = useAuth() as any;
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [liveNow, setLiveNow] = useState(false);
  const [nearestFutureSession, setNearestFutureSession] = useState<Session | null>(null);

  // Certificate / Marksheet states
  const [documents, setDocuments] = useState<CertificateItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [isQualifiedForCTPR, setIsQualifiedForCTPR] = useState(false);
  const [membershipId, setMembershipId] = useState<number | null>(null);

  const emailToName = new Map<string, string>(
    Object.entries(namesData as Record<string, string>)
  );

  const memberMap = memberData as Record<string, string>;

  const getDisplayName = () => {
    const email = auth.user?.email?.toLowerCase()?.trim() || "";
    const name = emailToName.get(email) || email.split("@")[0] || "User";
    return name.trim();
  };

  useEffect(() => {
    if (!auth?.user) return;

    const userEmail = auth.user.email.toLowerCase().trim();

    // Find membership_id from member.json
    const entry = Object.entries(memberMap).find(
      ([, mappedEmail]) => mappedEmail.toLowerCase().trim() === userEmail
    );

    if (!entry) {
      console.warn(`No membership ID found for email: ${userEmail}`);
      setLoadingDocs(false);
      return;
    }

    const mid = Number(entry[0]);
    setMembershipId(mid);

    // Fetch qualification & document URLs
    const fetchQualificationAndDocuments = async () => {
      setLoadingDocs(true);

      // 1. Check CTPR qualification
      const { data: candidateData, error: candError } = await supabase
        .from("candidate_exam_schedule")
        .select("final_ctpr_exam")
        .eq("membership_id", mid)
        .maybeSingle();

      if (candError) {
        console.error("Error fetching candidate data:", candError);
      }

      const qualified = candidateData?.final_ctpr_exam?.toUpperCase() === "QUALIFIED";
      setIsQualifiedForCTPR(qualified);

      // 2. Collect documents
      const docs: CertificateItem[] = [];
      const membershipStr = mid.toString();

      // ── Final CTPR Certificate ──
      if (qualified) {
        const ctprPath = `${membershipStr}.pdf`;

        const { data: ctprUrlData } = supabase.storage
          .from("certificates")
          .getPublicUrl(ctprPath);

        if (ctprUrlData?.publicUrl) {
          docs.push({
            label: "Final CTPR Certificate",
            status: candidateData?.final_ctpr_exam || "Qualified",
            url: ctprUrlData.publicUrl,
          });
        } else {
          console.warn(`CTPR certificate not found: ${ctprPath}`);
        }
      }

      // ── MEPSC Marksheet 2025 ──
      const marksheetPath = `Markscard2025/${membershipStr}.PDF`;

      const { data: marksUrlData } = supabase.storage
        .from("Marksheet")
        .getPublicUrl(marksheetPath);

      if (marksUrlData?.publicUrl) {
        docs.push({
          label: "MEPSC Marksheet 2025",
          status: "Issued",
          url: marksUrlData.publicUrl,
        });
      } else {
        console.warn(`MEPSC marksheet not found: ${marksheetPath}`);
      }

      setDocuments(docs);
      setLoadingDocs(false);
    };

    fetchQualificationAndDocuments();

    // ── Sessions logic (unchanged) ──
    const fetchSessions = async () => {
      const { data, error } = await supabase.from("sessions").select("*");
      if (error || !data?.length) return;

      const sorted = data.sort((a, b) => {
        const da = new Date(`${a.sessiondate}T${a.sessiontime}`).getTime();
        const db = new Date(`${b.sessiondate}T${b.sessiontime}`).getTime();
        return da - db;
      });

      setSessions(sorted as Session[]);

      const now = toZonedTime(new Date(), "Asia/Kolkata");
      const anyLive = sorted.some((s) => {
        const sessionTime = toZonedTime(
          new Date(`${s.sessiondate}T${s.sessiontime}`),
          "Asia/Kolkata"
        );
        const start = addMinutes(sessionTime, -5);
        const end = addMinutes(sessionTime, 60);
        return isWithinInterval(now, { start, end });
      });
      setLiveNow(anyLive);

      const future = sorted.find(
        (s) => new Date(`${s.sessiondate}T${s.sessiontime}`) > new Date()
      );
      setNearestFutureSession(future ?? null);
    };

    fetchSessions();
    const interval = setInterval(fetchSessions, 30000);

    return () => clearInterval(interval);
  }, [auth?.user]);

  useEffect(() => {
    if (!auth?.loading && !auth?.user) {
      router.push("/");
    }
  }, [auth, router]);

  if (!auth || auth.loading) {
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;
  }
  if (!auth.user) return null;

  const handleSignOut = async () => {
    try {
      await auth.signOut?.();
      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  const openModal = (session: Session) => {
    setSelectedSession(session);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSession(null);
  };

  const fullName = getDisplayName();
  const email = auth.user?.email?.toLowerCase() || "No email";
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");
  const hasSpace = nameParts.length > 1;

  const badgeSession = liveNow
    ? sessions.find((s) => {
        const now = toZonedTime(new Date(), "Asia/Kolkata");
        const ses = toZonedTime(
          new Date(`${s.sessiondate}T${s.sessiontime}`),
          "Asia/Kolkata"
        );
        return isWithinInterval(now, {
          start: addMinutes(ses, -5),
          end: addMinutes(ses, 60),
        });
      }) ?? null
    : nearestFutureSession;

  return (
    <>
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
        {/* Desktop Sidebar */}
        <aside className="hidden md:sticky md:top-0 md:flex md:flex-col md:w-60 md:h-screen md:bg-[#0062cc] md:text-white md:overflow-y-auto scrollbar-hide">
          <nav className="flex-1 mt-4 space-y-3">
            <Link href="/dashboard" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
            </Link>
            <Link href="/results" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <ClipboardList className="w-5 h-5 mr-3" /> Result
            </Link>
            <Link href="/sessions" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <ClipboardList className="w-5 h-5 mr-3" /> Sessions
            </Link>
            <Link href="/previous" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <History className="w-5 h-5 mr-3" /> Previous Sessions
            </Link>
            <Link href="/vlogs" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <ClipboardList className="w-5 h-5 mr-3" /> B/Vlogs
            </Link>
            <Link href="/schedule" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <GraduationCap className="w-5 h-5 mr-3" /> Exam Information
            </Link>
            <Link href="/modelpaper" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <ClipboardPenLine className="w-5 h-5 mr-3" /> Model papers
            </Link>
            <Link href="/tests" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <ClipboardPenLine className="w-5 h-5 mr-3" /> Practice Tests
            </Link>
            <Link href="/certificates" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <FileCheck className="w-5 h-5 mr-3" /> Certificates
            </Link>
          </nav>
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc]/95 backdrop-blur-sm text-white flex justify-around items-center py-2 shadow-lg z-50">
          <Link href="/dashboard" className="flex flex-col items-center text-xs">
            <LayoutDashboard className="w-5 h-5 mb-1" /> Dashboard
          </Link>
          <Link href="/results" className="flex flex-col items-center text-xs">
            <ClipboardList className="w-5 h-5 mb-1" /> Results
          </Link>
          <Link href="/sessions" className="flex flex-col items-center text-xs">
            <ClipboardList className="w-5 h-5 mb-1" /> Sessions
          </Link>
          <Link href="/previous" className="flex flex-col items-center text-xs">
            <History className="w-5 h-5 mb-1" /> Previous
          </Link>
          <Link href="/vlogs" className="flex flex-col items-center text-xs">
            <ClipboardList className="w-5 h-5 mb-1" /> B/Vlogs
          </Link>
          <Link href="/schedule" className="flex flex-col items-center text-xs">
            <GraduationCap className="w-5 h-5 mb-1" /> Exam
          </Link>
          <Link href="/modelpaper" className="flex flex-col items-center text-xs">
            <ClipboardPenLine className="w-5 h-5 mb-1" /> Papers
          </Link>
          <Link href="/tests" className="flex flex-col items-center text-xs">
            <ClipboardPenLine className="w-5 h-5 mb-1" /> Tests
          </Link>
          <Link href="/certificates" className="flex flex-col items-center text-xs">
            <FileCheck className="w-5 h-5 mb-1" /> Certs
          </Link>
          <button onClick={handleSignOut} className="flex flex-col items-center text-xs">
            <LogOut className="w-5 h-5 mb-1" /> Logout
          </button>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow px-4 md:px-6 py-4 sticky top-0 z-40 gap-4">
            <div className="flex items-center gap-4">
              <Image src={logo} alt="Logo" className="h-16 w-16 md:h-24 md:w-24" />
            </div>

            <div className="flex items-center gap-5 md:gap-8">
              <button
                onClick={() => router.push("/profile")}
                className="flex items-center gap-3 hover:opacity-90 transition-all group"
                title="View profile"
              >
                <div className="bg-blue-50 text-blue-700 rounded-full p-2.5 group-hover:bg-blue-100 transition-colors">
                  <User2 className="w-6 h-6" />
                </div>

                <div className="text-left min-w-0">
                  {hasSpace ? (
                    <>
                      <div className="text-base font-semibold text-gray-800 leading-tight">
                        {firstName}
                      </div>
                      {lastName && <div className="text-sm text-gray-600">{lastName}</div>}
                    </>
                  ) : (
                    <div
                      className="text-base font-semibold text-gray-800 truncate max-w-[180px]"
                      title={fullName}
                    >
                      {fullName}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[220px]" title={email}>
                    {email}
                  </div>
                </div>
              </button>

              <button
                onClick={handleSignOut}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium shadow-sm"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </header>

          {/* Live / Upcoming Badge */}
          {badgeSession && (
            <div className="px-4 md:px-8 pt-4">
              <button
                onClick={() => openModal(badgeSession)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium transition ${
                  liveNow ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {liveNow ? (
                  <>
                    <Radio className="w-5 h-5" />
                    LIVE NOW – {badgeSession.sessiontitle}
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4 fill-current" />
                    Upcoming: {badgeSession.sessiontitle}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Documents Section – CTPR Certificate + MEPSC Marksheet */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto pb-24 md:pb-8 bg-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Certificates & Marksheets</h2>

            {loadingDocs ? (
              <p className="text-center text-gray-600 py-10">Loading your documents...</p>
            ) : !membershipId ? (
              <div className="text-center text-gray-600 py-10">
                Unable to identify your membership record.
              </div>
            ) : documents.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
                <p className="text-lg font-medium text-yellow-800">
                  No documents available yet
                </p>
                <p className="mt-3 text-gray-700">
                  • Final CTPR Certificate will appear after you qualify.<br />
                  • MEPSC Marksheet will appear once it is uploaded.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl transition-all duration-200"
                  >
                    <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg mb-5 flex items-center justify-center">
                      <Award className="w-20 h-20 text-blue-600 opacity-80" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 text-center mb-4">
                      {doc.label}
                    </h3>

                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block bg-[#0062cc] hover:bg-blue-700 text-white font-medium py-3.5 rounded-lg text-center transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        <FileText className="w-5 h-5" />
                        View / Download
                      </a>
                    ) : (
                      <p className="text-center text-red-600 font-medium">
                        Document not available
                      </p>
                    )}

                    
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Session Join Modal */}
        {showModal && selectedSession && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-3 mb-4">
                {liveNow ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Radio className="w-6 h-6" />
                    <span className="font-bold text-xl">LIVE NOW</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-orange-600">
                    <Circle className="w-6 h-6 fill-current" />
                    <span className="font-bold text-xl">Upcoming Session</span>
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedSession.sessiontitle}
              </h3>

              <div className="space-y-3 text-gray-700 mb-6">
                <p>
                  <strong>Date:</strong>{" "}
                  {format(new Date(selectedSession.sessiondate), "dd MMM yyyy")}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {format(new Date(`1970-01-01T${selectedSession.sessiontime}`), "hh:mm a")} IST
                </p>
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