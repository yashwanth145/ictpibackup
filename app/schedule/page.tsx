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
  Search,
  GraduationCap,
  X,
  ClipboardPenLine,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import logo from "../../assets/ICTPL_image.png";
import { supabase } from "@/lib/Supabase";
import emailNamePairs from "../../public/names.json";

interface UserType {
  uid: string;
  email: string;
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  signOut?: () => Promise<void>;
}

const emailToName = new Map<string, string>();
Object.entries(emailNamePairs as Record<string, string>).forEach(([email, name]) => {
  emailToName.set(email.toLowerCase(), name);
});

interface Candidate {
  membership_id: number;
  name: string;
  place: string | null;
  state: string | null;
  can_id: string;
  batch_id: string | null;
  batch_name: string | null;
  exam_date: string | null;

  mepsc_assesment?: string;
  next_step?: string;
  qualification_status?: string;
  self_test_practice?: string;
  mock_exam?: string;
  final_ctpr_exam?: string;

  retest_link?: string | null;
  fellowship_link?: string | null;
  new_member_link?: string | null;
}

export default function MemberSearchPage() {
  const auth = useAuth() as AuthContextType | null;
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!auth) return;
    if (!auth.loading && !auth.user) {
      router.push("/");
    }
  }, [auth, router]);

  const handleSignOut = async () => {
    try {
      await auth?.signOut?.();
      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const getUserDisplayName = () => {
    const userEmail = auth?.user?.email?.toLowerCase();
    if (userEmail && emailToName.has(userEmail)) {
      return emailToName.get(userEmail)!;
    }
    return auth?.user?.email?.split("@")[0] || "User";
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError("Please enter a Membership ID");
      return;
    }

    setLoading(true);
    setError(null);
    setCandidate(null);
    setHasSearched(true);

    try {
      const query = searchQuery.trim();

      const { data, error } = await supabase
        .from("candidate_exam_schedule")
        .select(`
          *,
          retest_link,
          new_member_link
        `)
        .or(`membership_id.eq.${query},can_id.ilike.${query}`)
        .single();

      if (error && error.code === "PGRST116") {
        setError("No candidate found with this ID. Please check and try again.");
      } else if (error) {
        setError("Failed to search. Please try again later.");
        console.error(error);
      } else {
        setCandidate(data);
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCandidate(null);
    setError(null);
    setHasSearched(false);
  };

  const hasPendingStep = (c: Candidate): boolean => {
    if (c.new_member_link) return true;
    if (c.retest_link) return true;
    if (!c.mepsc_assesment || c.mepsc_assesment !== "Completed") return true;
    return false;
  };

  const getMepscStatus = (c: Candidate): string => {
    if (c.retest_link) return "Retake Required";
    if (c.mepsc_assesment === "Completed") return "MEPSC Passed";
    return "Pending";
  };

  const getNextStepMessage = (c: Candidate): string => {
    if (c.new_member_link) return "Complete Your Membership Registration First";
    if (c.retest_link) return "Retake MEPSC Assessment";
    if (!c.mepsc_assesment || c.mepsc_assesment !== "Completed") return "Complete MEPSC Assessment";
    if (c.self_test_practice !== "Completed") return "Complete Self Test Practice";
    if (c.mock_exam !== "Completed") return "Complete Mock Exam";
    if (c.final_ctpr_exam !== "Completed") return "Appear for Final CTPR Exam";
    return "Apply for Fellowship";
  };

  const pending = candidate ? hasPendingStep(candidate) : false;
  const isNewMemberPending = candidate?.new_member_link ? true : false;

  if (!auth || auth.loading)
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;
  if (!auth.user) return null;

  return (
    <div className="flex h-screen bg-gray-100 relative overflow-hidden flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 bg-[#0062cc] text-white flex-col">
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
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc]/95 backdrop-blur-sm text-white flex justify-around items-center py-2 shadow-lg z-50 text-xs">
        <Link href="/dashboard" className="flex flex-col items-center"><LayoutDashboard className="w-5 h-5 mb-1" /> Dashboard</Link>
        <Link href="/results" className="flex flex-col items-center"><ClipboardList className="w-5 h-5 mb-1" /> Results</Link>
        <Link href="/sessions" className="flex flex-col items-center"><ClipboardList className="w-5 h-5 mb-1" /> Sessions</Link>
        <Link href="/previous" className="flex flex-col items-center"><History className="w-5 h-5 mb-1" /> Previous</Link>
        <Link href="/modelpaper" className="flex flex-col items-center"><ClipboardPenLine className="w-5 h-5 mb-1" /> Model</Link>
        <Link href="/tests" className="flex flex-col items-center"><ClipboardPenLine className="w-5 h-5 mb-1" /> Tests</Link>
        <button onClick={handleSignOut} className="flex flex-col items-center"><LogOut className="w-5 h-5 mb-1" /> Logout</button>
      </nav>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="flex justify-between items-center bg-white shadow px-4 md:px-6 py-3 sticky top-0 z-40">
          <Image src={logo} alt="Logo" className="h-[60px] w-[60px] md:h-[100px] md:w-[100px]" />
          <div className="flex items-center gap-3 md:gap-5">
            <div className="flex items-center gap-2">
              <User2 className="w-5 h-5 text-gray-700" />
              <div className="text-sm text-gray-800 text-right">
                <div className="font-semibold truncate max-w-[150px] md:max-w-none">
                  {getUserDisplayName()}
                </div>
              </div>
            </div>
            <button onClick={handleSignOut} className="hidden md:flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition">
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </header>

        <main className="flex-1 bg-gray-100 px-4 py-8 md:p-10">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8">
              Member Search
            </h1>

            <form onSubmit={handleSearch} className="mb-10">
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Membership ID or Candidate ID"
                  className="w-full px-5 py-4 pr-12 text-lg rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition text-black"
                />
                {searchQuery && (
                  <button type="button" onClick={clearSearch} className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition disabled:opacity-70"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Search className="w-5 h-5" />}
                </button>
              </div>
            </form>

            {loading && (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Searching member...</p>
              </div>
            )}

            {error && (
              <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center mb-8">
                {error}
              </div>
            )}

            {!hasSearched && !loading && !candidate && (
              <div className="text-center py-20 text-black">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Enter a Membership ID to search</p>
              </div>
            )}

            {candidate && (
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold">Candidate Profile</h2>
                  <p className="mt-1 text-blue-100 text-lg">Consultant Chartered Tax Practitioner Examination Journey</p>
                </div>

                <div className="p-6 md:p-10 space-y-8">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Full Name</p>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-3">{candidate.name}</h1>
                  </div>

                  {/* Membership ID + Candidate ID (Candidate ID hidden if new_member_link exists) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 text-center">
                      <p className="text-sm text-gray-600">Membership ID</p>
                      <p className="text-2xl font-bold text-blue-800 mt-2">
                        {String(candidate.membership_id).padStart(5, "0")}
                      </p>
                    </div>

                    {!isNewMemberPending && (
                      <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 text-center">
                        <p className="text-sm text-gray-600">Candidate ID</p>
                        <p className="text-2xl font-bold text-blue-800 mt-2">{candidate.can_id}</p>
                      </div>
                    )}
                  </div>

                  {/* Place, State, Exam Date */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
                    <div>
                      <p className="text-sm text-gray-600">MEPSC Exam Date</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {candidate.exam_date
                          ? new Date(candidate.exam_date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
                          : "--"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Place</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1 uppercase">{candidate.place || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">State</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1 uppercase">{candidate.state || "—"}</p>
                    </div>
                  </div>

                  {/* Present Status */}
                  <div className="text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-8">Present Status</h3>
                    <div className="flex justify-center my-8">
                      <span
                        className={`inline-block px-10 py-4 font-black text-2xl rounded-full shadow-2xl transition-all duration-500 ${
                          pending ? "bg-red-600 text-white shadow-red-300" : "bg-green-600 text-white shadow-green-300"
                        }`}
                      >
                        {pending
                          ? "PENDING"
                          : candidate.qualification_status === "Qualified"
                          ? "QUALIFIED"
                          : "MEPSC PASSED"}
                      </span>
                    </div>

                    {candidate.retest_link && !isNewMemberPending && (
                      <div className="mt-4 px-6 py-3 bg-orange-100 border border-orange-400 rounded-xl text-orange-800 font-semibold inline-flex items-center gap-2">
                        <AlertCircle className="w-6 h-6" />
                        MEPSC Retake Required
                      </div>
                    )}
                  </div>

                  {/* Only show progress boxes if membership is NOT pending */}
                  {!isNewMemberPending && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                      <ProgressBox
                        label="MEPSC Assessment"
                        status={getMepscStatus(candidate)}
                        completed={candidate.mepsc_assesment === "Completed"}
                        link={candidate.retest_link || undefined}
                      />
                      <ProgressBox
                        label="Self Test Practice"
                        status={candidate.self_test_practice === "Completed" ? "Completed" : "Start Practice"}
                        completed={candidate.self_test_practice === "Completed"}
                        link={candidate.self_test_practice !== "Completed" ? "/tests" : undefined}
                      />
                      <ProgressBox
                        label="Mock Exam"
                        status={candidate.mock_exam === "Completed" ? "Completed" : "Pending"}
                        completed={candidate.mock_exam === "Completed"}
                      />
                      <ProgressBox
                        label="Final CTPR Exam"
                        status={candidate.final_ctpr_exam === "Completed" ? "Completed" : "Scheduled"}
                        completed={candidate.final_ctpr_exam === "Completed"}
                      />
                    </div>
                  )}

                  {/* MAIN ACTION: Membership First or Normal Next Step */}
                  <div className="mt-12">
                    {isNewMemberPending ? (
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-center py-16 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300">
                        <p className="text-2xl font-bold mb-6">Important Action Required</p>
                        <p className="text-3xl font-extrabold mb-10 leading-tight">
                          Complete Your ICTPI EXAM FORM
                        </p>
                        <a
                          href={candidate.new_member_link!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-16 py-8 bg-white text-purple-700 font-bold text-2xl rounded-full hover:bg-gray-100 transition shadow-2xl"
                        >
                          Click here to complete your exam registration
                        </a>
                        <p className="mt-8 text-xl opacity-90">
You must complete your exam registration within 13th December 2025                        </p>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center py-8 rounded-2xl shadow-2xl">
                        <p className="text-lg font-medium opacity-90">Next Step</p>
                        <p className="text-3xl font-bold mt-3">
                          {getNextStepMessage(candidate)}
                        </p>

                        {candidate.retest_link && (
                          <a
                            href={candidate.retest_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-5 text-xl underline hover:text-green-100 transition"
                          >
                            Click here to Retake MEPSC Assessment
                          </a>
                        )}

                        {!pending && candidate.fellowship_link && (
                          <a
                            href={candidate.fellowship_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-5 text-xl underline hover:text-green-100 transition"
                          >
                            Click here to apply for Fellowship
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 px-8 py-4 text-center text-sm text-gray-600 border-t">
                  Data fetched securely • Last updated: December 2025
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function ProgressBox({
  label,
  status,
  completed,
  link,
}: {
  label: string;
  status: string;
  completed: boolean;
  link?: string;
}) {
  const showLink = link && link.trim() !== "";

  return (
    <div
      className={`
        rounded-xl p-6 text-center transition-all duration-300 shadow-md hover:shadow-xl
        ${completed
          ? "bg-green-50 border-2 border-green-500"
          : showLink
            ? "bg-blue-50 border-2 border-blue-500"
            : "bg-red-50 border-2 border-red-600 shadow-lg shadow-red-200 animate-pulse"
        }
      `}
    >
      <div className="flex justify-center mb-4">
        {completed ? (
          <CheckCircle2 className="w-14 h-14 text-green-600" />
        ) : showLink ? (
          <AlertCircle className="w-14 h-14 text-blue-600 animate-ping" />
        ) : (
          <Clock className="w-14 h-14 text-red-600" />
        )}
      </div>

      <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>

      {showLink ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          {status} →
        </a>
      ) : (
        <p className={`mt-4 text-2xl font-bold ${completed ? "text-green-700" : "text-red-700"}`}>
          {status}
        </p>
      )}
    </div>
  );
}