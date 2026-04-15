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
  History,
  GraduationCap,
  ClipboardPenLine,
  FileCheck,
} from "lucide-react";
import Image from "next/image";
import { logoSrc as logo } from "@/lib/logo";
import { supabase } from "@/lib/Supabase";

interface Candidate {
  membership_id: number;
  name: string;
  can_id: string;
  mepsc_assesment?: string;
  self_test_practice?: string;
  mock_exam?: string;
  final_ctpr_exam?: string;
  mepsc_certificate_url?: string;
  self_test_certificate_url?: string;
  mock_certificate_url?: string;
  final_ctpr_certificate_url?: string;
}

const MOCK_EXAM_LINK = "https://test.tallyeducation.com/links/a4ffec55-f3a8-11f0-8447-0ac472d4f9eb/";
const FINAL_CTPR_LINK = "https://test.tallyeducation.com/links/96dcca2f-f68e-11f0-bcaf-06ac946976b1/";

const ResultPage = () => {
  const auth = useAuth();
  const router = useRouter();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [fullName, setFullName] = useState<string>("User");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth && !auth.loading && !auth.user) {
      router.push("/");
    }
  }, [auth, router]);

  useEffect(() => {
    if (!auth?.user?.email) return;

    const currentEmail = auth.user.email.toLowerCase().trim();

    const fetchUserAndResults = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch membership_id and name from memberinformation
        const { data: member, error: memberError } = await supabase
          .from("memberinformation")
          .select("membership_id, name")
          .eq("email", currentEmail)
          .maybeSingle();

        if (memberError) {
          console.error("Error fetching memberinformation:", memberError);
          setError("Failed to load user record.");
          return;
        }

        if (!member || !member.membership_id) {
          setError("No membership record found for your account.");
          return;
        }

        const mid = Number(member.membership_id);

        // Set name (prefer DB → fallback to email prefix)
        const nameFromDb = member.name?.trim();
        setFullName(
          nameFromDb && nameFromDb.length > 0
            ? nameFromDb
            : currentEmail.split("@")[0] || "User"
        );

        // 2. Fetch candidate exam results
        const { data, error: supabaseError } = await supabase
          .from("candidate_exam_schedule")
          .select(`
            membership_id,
            name,
            can_id,
            mepsc_assesment,
            self_test_practice,
            mock_exam,
            final_ctpr_exam,
            mepsc_certificate_url,
            self_test_certificate_url,
            mock_certificate_url,
            final_ctpr_certificate_url
          `)
          .eq("membership_id", mid)
          .maybeSingle();

        if (supabaseError) {
          console.error("Supabase error:", supabaseError);
          setError("Failed to load results. Please try again later.");
        } else if (data) {
          setCandidate(data as Candidate);
        } else {
          setError("No exam results found for your Membership ID.");
        }
      } catch (err) {
        console.error("Network error:", err);
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndResults();
  }, [auth?.user?.email]);

  const handleSignOut = async () => {
    try {
      if (auth?.signOut) await auth.signOut();
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getLevelStatus = (field?: string) => {
    const value = field?.trim().toUpperCase();
    if (value === "COMPLETED") return { text: "COMPLETED ✅", color: "bg-gradient-to-br from-emerald-500 to-teal-600", glow: "shadow-emerald-500/60" };
    if (value === "SCHEDULED")  return { text: "SCHEDULED ⏰",  color: "bg-gradient-to-br from-amber-500 to-orange-500",  glow: "shadow-amber-500/60" };
    if (value === "PENDING")    return { text: "PENDING ⚠️",   color: "bg-gradient-to-br from-orange-500 to-red-500",   glow: "shadow-orange-500/60" };
    if (value === "FAILED")     return { text: "FAILED ⚠️",    color: "bg-gradient-to-br from-red-500 to-red-900",     glow: "shadow-red-500/60" };
    return { text: "COMMENCING SOON 📚", color: "bg-gradient-to-br from-purple-600 to-indigo-600", glow: "shadow-purple-500/50" };
  };

  const getMockExamDisplay = (status?: string) => {
    if (!status || status.trim() === "") {
      return { text: "COMMENCING SOON 📚", color: "bg-gradient-to-br from-purple-600 to-indigo-600", glow: "shadow-purple-500/50" };
    }
    const value = status.trim().toUpperCase();
    if (value === "COMPLETED") return { text: "COMPLETED ✅", color: "bg-gradient-to-br from-emerald-500 to-teal-600", glow: "shadow-emerald-500/60" };
    if (value === "FAILED")    return { text: "FAILED ⚠️",    color: "bg-gradient-to-br from-red-500 to-red-900",     glow: "shadow-red-500/60" };
    return { text: "MOCK EXAM IN PROGRESS ⏳", color: "bg-gradient-to-br from-blue-500 to-cyan-600", glow: "shadow-blue-500/60" };
  };

  const shouldShowAttendLink = (status?: string) =>
    !status || status.trim().toUpperCase() !== "COMPLETED";

  const completedLevels = candidate
    ? [
        candidate.mepsc_assesment,
        candidate.self_test_practice,
        candidate.mock_exam,
        candidate.final_ctpr_exam,
      ].filter((s) => s?.trim().toUpperCase() === "COMPLETED").length
    : 0;

  const totalLevels = 4;
  const progressPercentage = (completedLevels / totalLevels) * 100;
  const isFullyQualified = completedLevels === totalLevels;

  if (auth?.loading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-xl text-gray-600">Loading your results...</p>
      </div>
    );
  }

  if (!auth?.user) return null;

  return (
    <div className="flex h-screen bg-gray-100 relative overflow-hidden flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 bg-[#0062cc] text-white flex-col">
        <nav className="flex-1 mt-4 space-y-3">
          <Link href="/dashboard" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link href="/results" className="flex items-center px-5 py-2 bg-blue-700 font-semibold">
            <ClipboardList className="w-5 h-5 mr-3" /> Result
          </Link>
          <Link href="/sessions" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <ClipboardList className="w-5 h-5 mr-3" /> Sessions
          </Link>
          <Link href="/previous" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <History className="w-5 h-5 mr-3" /> Previous sessions
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc]/95 backdrop-blur-sm text-white flex justify-around items-center py-2 shadow-lg z-50 text-xs">
        <Link href="/dashboard" className="flex flex-col items-center py-1">
          <LayoutDashboard className="w-5 h-5 mb-1" /> Dashboard
        </Link>
        <Link href="/results" className="flex flex-col items-center py-1">
          <ClipboardList className="w-5 h-5 mb-1" /> Results
        </Link>
        <Link href="/sessions" className="flex flex-col items-center py-1">
          <ClipboardList className="w-5 h-5 mb-1" /> Sessions
        </Link>
        <Link href="/previous" className="flex flex-col items-center py-1">
          <History className="w-5 h-5 mb-1" /> Previous
        </Link>
        <Link href="/modelpaper" className="flex flex-col items-center py-1">
          <ClipboardPenLine className="w-5 h-5 mb-1" /> Model
        </Link>
        <Link href="/tests" className="flex flex-col items-center py-1">
          <ClipboardPenLine className="w-5 h-5 mb-1" /> Tests
        </Link>
        <Link href="/certificates" className="flex flex-col items-center text-xs">
          <FileCheck className="w-5 h-5 mb-1" /> Certs
        </Link>
        <button onClick={handleSignOut} className="flex flex-col items-center py-1">
          <LogOut className="w-5 h-5 mb-1" /> Logout
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto pb-20 md:pb-0">
        <header className="flex justify-between items-center bg-white shadow px-4 md:px-6 py-3 sticky top-0 z-40">
          <Image src={logo} alt="Logo" width={100} height={100} className="h-[60px] w-[60px] md:h-[100px] md:w-[100px]" />
          <div className="flex items-center gap-3 md:gap-5">
            <div className="flex items-center gap-2">
              <User2 className="w-5 h-5 text-gray-700" />
              <div className="text-sm text-gray-800 text-right">
                <div className="font-semibold">{fullName}</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </header>

        <main className="flex-1 bg-gray-100 px-4 py-8 md:p-10">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white bg-blue-600 py-6 rounded-t-2xl shadow-lg text-center mb-8">
              RESULTS
            </h1>

            {error && (
              <div className="bg-red-50 border border-red-200 p-8 rounded-xl text-red-700 text-center mb-12">
                <p className="text-2xl font-bold">Error</p>
                <p className="mt-4 text-lg">{error}</p>
              </div>
            )}

            {candidate && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-blue-600 text-white text-center py-4 rounded-lg shadow">
                    <p className="text-sm font-semibold">NAME</p>
                    <p className="text-sm font-bold mt-2">{candidate.name || fullName}</p>
                  </div>
                  <div className="bg-blue-600 text-white text-center py-4 rounded-lg shadow">
                    <p className="text-sm font-semibold">MEMBERSHIP ID</p>
                    <p className="text-sm font-bold mt-2">
                      {String(candidate.membership_id).padStart(5, "0")}
                    </p>
                  </div>
                  <div className="bg-blue-600 text-white text-center py-4 rounded-lg shadow">
                    <p className="text-sm font-semibold">CANDIDATE ID</p>
                    <p className="text-sm font-bold mt-2">{candidate.can_id || "—"}</p>
                  </div>
                </div>

                <div className="mb-12 bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Qualification Progress
                  </h3>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-8 mb-4 text-xs flex rounded-full bg-gray-200 shadow-inner">
                      <div
                        style={{ width: `${progressPercentage}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 font-medium ${
                          isFullyQualified
                            ? "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600"
                            : "bg-gradient-to-r from-blue-500 to-indigo-600"
                        }`}
                      >
                        <span>{completedLevels} / {totalLevels} Levels Completed</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    {isFullyQualified ? (
                      <div className="inline-block px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xl rounded-full shadow-xl">
                        🎉 FULLY QUALIFIED – All Levels Completed!
                      </div>
                    ) : (
                      <p className="text-xl font-semibold text-gray-900">
                        Current Status: {completedLevels} of {totalLevels} levels passed
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold text-white bg-blue-600 inline-block px-12 py-4 rounded-full shadow-lg">
                    PRESENT STATUS
                  </h2>
                </div>

                {/* Optional banner – keep or remove */}
                <div className="text-center mb-10">
                  <h2 className="italic text-xl md:text-2xl font-bold text-white bg-purple-700 inline-block px-6 py-2 rounded-full shadow-lg">
                    MOCK EXAM IN PROGRESS
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                  {[
                    { level: 1, name: "MEPSC ASSESSMENT",     status: candidate.mepsc_assesment,     link: null },
                    { level: 2, name: "SELF TEST PRACTICE",   status: candidate.self_test_practice, link: "/tests" as const },
                    { level: 3, name: "MOCK EXAM",            status: candidate.mock_exam,           link: MOCK_EXAM_LINK },
                    { level: 4, name: "FINAL CTPR EXAM",      status: candidate.final_ctpr_exam,     link: FINAL_CTPR_LINK },
                  ].map((item, idx) => {
                    const isMock = item.level === 3;
                    const isPractice = item.level === 2;
                    const statusInfo = isMock
                      ? getMockExamDisplay(item.status)
                      : getLevelStatus(item.status);

                    const showAttendLink =
                      item.link &&
                      typeof item.link === "string" &&
                      shouldShowAttendLink(item.status);

                    const cardClasses =
                      item.level === 2
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/60"
                        : `${statusInfo.color} ${statusInfo.glow}`;

                    return (
                      <div
                        key={idx}
                        className={`group relative text-white text-center py-12 px-6 md:px-8 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/30 overflow-hidden transition-all duration-700 hover:shadow-3xl hover:-translate-y-8 hover:scale-105 cursor-pointer ${cardClasses}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
                        <div className="absolute top-4 right-4 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>

                        <div className="relative z-10">
                          <p className="text-lg font-semibold mb-6 tracking-wide">{item.name}</p>

                          {isPractice ? (
                            <Link
                              href="/tests"
                              className="block mt-4 px-6 py-3 bg-white text-indigo-700 font-bold rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-105 text-base"
                            >
                              Go to Practice Tests
                            </Link>
                          ) : showAttendLink ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block mt-2 px-3 py-3 bg-white text-red-700 font-bold rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-105 text-base"
                            >
                              Attend, if schedule
                            </a>
                          ) : (
                            <p className="text-xl font-black drop-shadow-2xl group-hover:scale-125 transition-all duration-500 uppercase mb-6">
                              {statusInfo.text}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-center text-gray-600 mt-10 text-sm">
                  Data updated as of January 19, 2026
                </p>
              </>
            )}

            {!candidate && !error && !loading && (
              <div className="text-center py-20">
                <p className="text-2xl text-gray-600">No results available yet.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResultPage;