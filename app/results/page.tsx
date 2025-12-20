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
  Search,
} from "lucide-react";
import Image from "next/image";
import logo from "../../assets/ICTPL_image.png";
import { supabase } from "@/lib/Supabase";

interface Candidate {
  membership_id: number;
  name: string;
  can_id: string;
  mepsc_assesment?: string;
  self_test_practice?: string;
  mock_exam?: string;
  final_ctpr_exam?: string;
}

const ResultPage = () => {
  const auth = useAuth();
  const router = useRouter();

  const [membershipIdInput, setMembershipIdInput] = useState("");
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (auth && !auth.loading && !auth.user) {
      router.push("/");
    }
  }, [auth, router]);

  const handleSignOut = async () => {
    try {
      if (auth?.signOut) await auth.signOut();
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const searchByMembershipId = async () => {
    const trimmedInput = membershipIdInput.trim();
    if (!trimmedInput) {
      setError("Please enter a Membership ID.");
      return;
    }

    const membershipId = Number(trimmedInput);
    if (isNaN(membershipId)) {
      setError("Membership ID must be a number.");
      return;
    }

    setSearchLoading(true);
    setError(null);
    setCandidate(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from("candidate_exam_schedule")
        .select(`
          membership_id,
          name,
          can_id,
          mepsc_assesment,
          self_test_practice,
          mock_exam,
          final_ctpr_exam
        `)
        .eq("membership_id", membershipId)
        .single();

      if (supabaseError) {
        if (supabaseError.code === "PGRST116") {
          setError(`No record found for Membership ID: ${trimmedInput}`);
        } else {
          setError("Failed to fetch results. Please try again.");
          console.error("Supabase error:", supabaseError);
        }
      } else if (data) {
        setCandidate(data);
      } else {
        setError("No data returned.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error("Fetch error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const getLevelStatus = (field?: string) => {
    const value = field?.trim();
    if (value === "Completed") {
      return { text: "COMPLETED", color: "bg-green-500" };
    }
    if (value === "Yet to Start" || !value) {
      return { text: "NOT YET STARTED", color: "bg-purple-700" };
    }
    if (value === "Scheduled") {
      return { text: "SCHEDULED", color: "bg-orange-500" };
    }
    if(value ==="Pending"){
      return { text :"PENDING" , color :"bg-orange-500"}
    }
    return { text: "NOT COMPLETED", color: "bg-red-600" };
  };

  const getUserDisplayName = () => {
    return auth?.user?.email?.split("@")[0] || "User";
  };

  // Loading state
  if (auth?.loading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-xl text-gray-600">Loading...</p>
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
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc]/95 backdrop-blur-sm text-white flex justify-around items-center py-2 shadow-lg z-50 text-xs">
        <Link href="/dashboard" className="flex flex-col items-center py-1"><LayoutDashboard className="w-5 h-5 mb-1" /> Dashboard</Link>
        <Link href="/results" className="flex flex-col items-center py-1"><ClipboardList className="w-5 h-5 mb-1" /> Results</Link>
        <Link href="/sessions" className="flex flex-col items-center py-1"><ClipboardList className="w-5 h-5 mb-1" /> Sessions</Link>
        <Link href="/previous" className="flex flex-col items-center py-1"><History className="w-5 h-5 mb-1" /> Previous</Link>
        <Link href="/modelpaper" className="flex flex-col items-center py-1"><ClipboardPenLine className="w-5 h-5 mb-1" /> Model</Link>
        <Link href="/tests" className="flex flex-col items-center py-1"><ClipboardPenLine className="w-5 h-5 mb-1" /> Tests</Link>
        <button onClick={handleSignOut} className="flex flex-col items-center py-1"><LogOut className="w-5 h-5 mb-1" /> Logout</button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto pb-20 md:pb-0">
        <header className="flex justify-between items-center bg-white shadow px-4 md:px-6 py-3 sticky top-0 z-40">
          <Image src={logo} alt="Logo" className="h-[60px] w-[60px] md:h-[100px] md:w-[100px]" />
          <div className="flex items-center gap-3 md:gap-5">
            <div className="flex items-center gap-2">
              <User2 className="w-5 h-5 text-gray-700" />
              <div className="text-sm text-gray-800 text-right">
                <div className="font-semibold">{getUserDisplayName()}</div>
                <div className="text-xs text-gray-600">Results Search</div>
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
            {/* Search Bar */}
            <div className="mb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-white bg-blue-600 py-6 rounded-t-2xl shadow-lg text-center">
                RESULT DASHBOARD
              </h1>

              <div className="bg-white rounded-b-2xl shadow-lg p-6 -mt-1">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Enter Membership ID"
                      value={membershipIdInput}
                      onChange={(e) => setMembershipIdInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && searchByMembershipId()}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                    <Search className="absolute right-3 top-3.5 w-6 h-6 text-gray-400" />
                  </div>
                  <button
                    onClick={searchByMembershipId}
                    disabled={searchLoading}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    {searchLoading ? "Searching..." : "Search"}
                    {searchLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-red-700 text-center mb-8">
                <p className="text-xl font-bold">Error</p>
                <p className="mt-2">{error}</p>
              </div>
            )}

            {/* Results Display */}
            {candidate && (
              <>
                {/* Candidate Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-blue-600 text-white text-center py-4 rounded-lg shadow">
                    <p className="text-lg font-semibold">NAME</p>
                    <p className="text-2xl font-bold mt-2">{candidate.name}</p>
                  </div>
                  <div className="bg-blue-600 text-white text-center py-4 rounded-lg shadow">
                    <p className="text-lg font-semibold">MEMBERSHIP ID</p>
                    <p className="text-2xl font-bold mt-2">
                      {String(candidate.membership_id).padStart(5, "0")}
                    </p>
                  </div>
                  <div className="bg-blue-600 text-white text-center py-4 rounded-lg shadow">
                    <p className="text-lg font-semibold">CANDIDATE ID</p>
                    <p className="text-2xl font-bold mt-2">{candidate.can_id}</p>
                  </div>
                </div>

                {/* Present Status */}
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold text-white bg-blue-600 inline-block px-12 py-4 rounded-full shadow-lg">
                    PRESENT STATUS
                  </h2>
                </div>

                {/* Level Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                  <div className={`text-white text-center py-8 rounded-xl shadow-lg ${getLevelStatus(candidate.mepsc_assesment).color}`}>
                    <p className="text-2xl font-bold">LEVEL - 1</p>
                    <p className="text-lg mt-2">MEPSC ASSESSMENT</p>
                    <p className="text-xl font-bold mt-4">{getLevelStatus(candidate.mepsc_assesment).text}</p>
                  </div>

                  <div className={`text-white text-center py-8 rounded-xl shadow-lg ${getLevelStatus(candidate.self_test_practice).color}`}>
                    <p className="text-2xl font-bold">LEVEL - 2</p>
                    <p className="text-lg mt-2">Self Test Practice</p>
                    <p className="text-xl font-bold mt-4">{getLevelStatus(candidate.self_test_practice).text}</p>
                  </div>

                  <div className={`text-white text-center py-8 rounded-xl shadow-lg ${getLevelStatus(candidate.mock_exam).color}`}>
                    <p className="text-2xl font-bold">LEVEL - 3</p>
                    <p className="text-lg mt-2">Mock Exam</p>
                    <p className="text-xl font-bold mt-4">{getLevelStatus(candidate.mock_exam).text}</p>
                  </div>

                  <div className={`text-white text-center py-8 rounded-xl shadow-lg ${getLevelStatus(candidate.final_ctpr_exam).color}`}>
                    <p className="text-2xl font-bold">LEVEL - 4</p>
                    <p className="text-lg mt-2">Final CTPR Exam</p>
                    <p className="text-xl font-bold mt-4">{getLevelStatus(candidate.final_ctpr_exam).text}</p>
                  </div>
                </div>

                <p className="text-center text-gray-600 mt-10 text-sm">
                  Data updated as of December 20, 2025
                </p>
              </>
            )}

            {/* Initial State */}
            {!candidate && !error && !searchLoading && (
              <div className="text-center py-20">
                <p className="text-2xl text-gray-600">Enter your Membership ID above to view results</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResultPage;