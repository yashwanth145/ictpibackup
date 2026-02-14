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
import logo from "../../assets/ICTPL_image.png"; // adjust path if needed

// JSON fallback names
import namesData from "../../public/names.json";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CertificateItem {
  label: string;
  status: string | null;
  url: string | null;
}

export default function Certificates() {
  const auth = useAuth() as any;
  const router = useRouter();

  const [documents, setDocuments] = useState<CertificateItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [membershipId, setMembershipId] = useState<number | null>(null);
  const [fetchingMember, setFetchingMember] = useState(true);

  // Optional: session badge features
  const [sessions, setSessions] = useState<any[]>([]);
  const [liveNow, setLiveNow] = useState(false);
  const [nearestFutureSession, setNearestFutureSession] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  // Fallback name map
  const emailToName = new Map<string, string>(
    Object.entries(namesData as Record<string, string>)
  );

  const getDisplayName = (email: string) => {
    const lowerEmail = email.toLowerCase().trim();
    return emailToName.get(lowerEmail) || lowerEmail.split("@")[0] || "User";
  };

  useEffect(() => {
    if (!auth?.user) return;

    const userEmail = auth.user.email?.toLowerCase()?.trim() || "";

    const fetchMemberAndDocuments = async () => {
      setFetchingMember(true);
      setLoadingDocs(true);

      try {
        // 1. Fetch membership info
        const { data: memberData, error: memberError } = await supabase
          .from("memberinformation")
          .select("membership_id, email, name")
          .eq("email", userEmail)
          .maybeSingle();

        if (memberError) {
          console.error("Error fetching memberinformation:", memberError);
        }

        let mid: number | null = null;

        if (memberData && memberData.membership_id) {
          mid = Number(memberData.membership_id);
          setMembershipId(mid);
        } else {
          console.warn(`No membership record found for email: ${userEmail}`);
        }

        // 2. Fetch documents if we have membership_id
        if (mid) {
          const { data: candidateData } = await supabase
            .from("candidate_exam_schedule")
            .select("final_ctpr_exam")
            .eq("membership_id", mid)
            .maybeSingle();

          const qualified = candidateData?.final_ctpr_exam?.toUpperCase() === "QUALIFIED";

          const docs: CertificateItem[] = [];
          const membershipStr = mid.toString();

          // CTPR Certificate
          if (qualified) {
            const ctprPath = `${membershipStr}.pdf`;
            const { data: urlData } = supabase.storage
              .from("certificates")
              .getPublicUrl(ctprPath);

            if (urlData?.publicUrl) {
              docs.push({
                label: "Final CTPR Certificate",
                status: "Qualified",
                url: urlData.publicUrl,
              });
            }
          }

          // MEPSC Marksheet
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
          }

          setDocuments(docs);
        }
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setFetchingMember(false);
        setLoadingDocs(false);
      }
    };

    fetchMemberAndDocuments();

    // Optional: Fetch sessions for live/upcoming badge
    const fetchSessions = async () => {
      const { data } = await supabase
        .from("sessions")
        .select("*")
        .order("sessiondate", { ascending: true });

      if (!data?.length) return;

      setSessions(data);

      const now = new Date();
      const anyLive = data.some((s: any) => {
        const sesTime = new Date(`${s.sessiondate}T${s.sessiontime}`);
        return (
          now >= new Date(sesTime.getTime() - 5 * 60 * 1000) &&
          now <= new Date(sesTime.getTime() + 60 * 60 * 1000)
        );
      });
      setLiveNow(anyLive);

      const future = data.find(
        (s: any) => new Date(`${s.sessiondate}T${s.sessiontime}`) > now
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

  const fullName = getDisplayName(auth.user?.email || "");
  const email = auth.user?.email?.toLowerCase() || "No email";
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");
  const hasSpace = nameParts.length > 1;

  const badgeSession = liveNow
    ? sessions.find((s: any) => {
        const now = new Date();
        const ses = new Date(`${s.sessiondate}T${s.sessiontime}`);
        return (
          now >= new Date(ses.getTime() - 5 * 60 * 1000) &&
          now <= new Date(ses.getTime() + 60 * 60 * 1000)
        );
      }) ?? null
    : nearestFutureSession;

  const isLoading = fetchingMember || loadingDocs;

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
            <Link
              href="/certificates"
              className="flex items-center px-5 py-2 hover:bg-blue-500 transition bg-blue-700"
            >
              <FileCheck className="w-5 h-5 mr-3" /> Certificates
            </Link>
          </nav>
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc]/95 backdrop-blur-sm text-white flex justify-around items-center py-2 shadow-lg z-50 overflow-x-auto gap-1 px-2">
          <Link href="/dashboard" className="flex flex-col items-center text-xs min-w-[52px]">
            <LayoutDashboard className="w-5 h-5 mb-1" /> Dash
          </Link>
          <Link href="/results" className="flex flex-col items-center text-xs min-w-[52px]">
            <ClipboardList className="w-5 h-5 mb-1" /> Result
          </Link>
          <Link href="/sessions" className="flex flex-col items-center text-xs min-w-[52px]">
            <ClipboardList className="w-5 h-5 mb-1" /> Live
          </Link>
          <Link href="/previous" className="flex flex-col items-center text-xs min-w-[52px]">
            <History className="w-5 h-5 mb-1" /> Prev
          </Link>
          <Link href="/vlogs" className="flex flex-col items-center text-xs min-w-[52px]">
            <ClipboardList className="w-5 h-5 mb-1" /> Vlogs
          </Link>
          <Link href="/schedule" className="flex flex-col items-center text-xs min-w-[52px]">
            <GraduationCap className="w-5 h-5 mb-1" /> Exam
          </Link>
          <Link href="/modelpaper" className="flex flex-col items-center text-xs min-w-[52px]">
            <ClipboardPenLine className="w-5 h-5 mb-1" /> Papers
          </Link>
          <Link href="/tests" className="flex flex-col items-center text-xs min-w-[52px]">
            <ClipboardPenLine className="w-5 h-5 mb-1" /> Tests
          </Link>
          <Link
            href="/certificates"
            className="flex flex-col items-center text-xs min-w-[52px] bg-blue-700/50 rounded"
          >
            <FileCheck className="w-5 h-5 mb-1" /> Certs
          </Link>
          <button onClick={handleSignOut} className="flex flex-col items-center text-xs min-w-[52px]">
            <LogOut className="w-5 h-5 mb-1" /> Out
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

          {/* Live / Upcoming Session Badge */}
          {badgeSession && (
            <div className="px-4 md:px-8 pt-4">
              <button
                onClick={() => {
                  setShowModal(true);
                  setSelectedSession(badgeSession);
                }}
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

          {/* Certificates Section */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto pb-24 md:pb-8 bg-gray-100">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Certificates & Marksheets</h1>
            <p className="text-gray-600 mb-8">
              View and download your issued certificates and marksheets.
            </p>

            {isLoading ? (
              <div className="text-center text-gray-600 py-20">
                <p className="text-lg">Loading your documents...</p>
              </div>
            ) : !membershipId ? (
              <div className="text-center text-gray-600 py-16 bg-yellow-50 border border-yellow-200 rounded-xl p-10 max-w-3xl mx-auto">
                <p className="text-2xl font-medium text-yellow-800 mb-4">
                  Membership record not found
                </p>
                <p className="text-lg text-gray-700">
                  We couldn’t find your membership details for email: <strong>{email}</strong>.
                  <br />
                  Please contact support or check your profile.
                </p>
              </div>
            ) : documents.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-10 text-center max-w-3xl mx-auto">
                <p className="text-2xl font-medium text-yellow-800 mb-4">
                  No documents available yet
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  • Final CTPR Certificate will appear here after you qualify.
                  <br />
                  • MEPSC Marksheet 2025 will be available once uploaded by the admin.
                  <br />
                  <br />
                  Check back later or contact support for status.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="w-full h-56 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl mb-6 flex items-center justify-center">
                      <Award className="w-28 h-28 text-blue-600 opacity-70" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
                      {doc.label}
                    </h3>
                    <p className="text-center text-sm text-gray-600 mb-6">
                      Status: <span className="font-medium text-green-700">{doc.status}</span>
                    </p>

                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block bg-[#0062cc] hover:bg-blue-700 text-white font-semibold py-4 rounded-xl text-center transition flex items-center justify-center gap-3 shadow-md"
                      >
                        <FileText className="w-6 h-6" />
                        View / Download PDF
                      </a>
                    ) : (
                      <p className="text-center text-red-600 font-medium py-4">
                        Document currently unavailable
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Session Modal */}
        {showModal && selectedSession && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
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
                <p><strong>Date:</strong> {selectedSession.sessiondate}</p>
                <p><strong>Time:</strong> {selectedSession.sessiontime} IST</p>
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