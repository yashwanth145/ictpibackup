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
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  MapPin,
  BadgeCheck,
} from "lucide-react";
import Image from "next/image";
import logo from "../../assets/ICTPL_image.png";
import { supabase } from "@/lib/Supabase";

// Import member mapping and names mapping
import memberMapData from "@/public/member.json"; // membershipId -> email
import namesMapData from "@/public/names.json";     // email -> name

interface MemberMap {
  [membershipId: string]: string; // membershipId -> email
}

interface NamesMap {
  [email: string]: string; // email -> full name
}

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

export default function MyExamSchedulePage() {
  const auth = useAuth();
  const router = useRouter();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [memberMap] = useState<MemberMap>(memberMapData);
  const [namesMap] = useState<NamesMap>(namesMapData);

  // Redirect if not authenticated
  useEffect(() => {
    if (auth && !auth.loading && !auth.user) {
      router.push("/");
    }
  }, [auth, router]);

  // Fetch logged-in user's own exam schedule
  useEffect(() => {
    if (!auth?.user?.email || Object.keys(memberMap).length === 0) return;

    async function fetchMySchedule() {
      setLoading(true);
      setError(null);

      const userEmail = auth.user?.email?.toLowerCase().trim();

      // Find membership ID from email
      const membershipIdStr = Object.keys(memberMap).find(
        (id) => memberMap[id].toLowerCase().trim() === userEmail
      );

      if (!membershipIdStr) {
        setError("No membership record found for your account.");
        setLoading(false);
        return;
      }

      const membershipId = Number(membershipIdStr);

      try {
        const { data, error: supabaseError } = await supabase
          .from("candidate_exam_schedule")
          .select(`
            membership_id,
            name,
            place,
            state,
            can_id,
            batch_id,
            batch_name,
            exam_date,
            mepsc_assesment,
            self_test_practice,
            mock_exam,
            final_ctpr_exam,
            
            fellowship_link,
            new_member_link
          `)
          .eq("membership_id", membershipId)
          .maybeSingle();

        if (supabaseError) {
          console.error("Supabase error:", supabaseError);
          setError("Failed to load your exam schedule. Please try again later.");
        } else if (data) {
          setCandidate(data);
        } else {
          setError("No exam schedule found for your membership ID.");
        }
      } catch (err) {
        console.error("Network error:", err);
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }

    fetchMySchedule();
  }, [auth?.user?.email, memberMap]);

  const handleSignOut = async () => {
    try {
      if (auth?.signOut) await auth.signOut();
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getUserDisplayName = () => {
    const userEmail = auth?.user?.email?.toLowerCase().trim();
    if (userEmail && namesMap[userEmail]) {
      return namesMap[userEmail];
    }
    return auth?.user?.email?.split("@")[0] || "User";
  };

  const isNewMemberPending = candidate?.new_member_link ? true : false;

  if (auth?.loading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-xl text-gray-600">Loading your exam schedule...</p>
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
          <Link href="/results" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <ClipboardList className="w-5 h-5 mr-3" /> Result
          </Link>
          <Link href="/schedule" className="flex items-center px-5 py-2 bg-blue-700 font-semibold">
            <GraduationCap className="w-5 h-5 mr-3" /> Exam Schedule
          </Link>
          <Link href="/sessions" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <ClipboardList className="w-5 h-5 mr-3" /> Sessions
          </Link>
          <Link href="/previous" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <History className="w-5 h-5 mr-3" /> Previous sessions
          </Link>
          <Link href="/modelpaper" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <ClipboardPenLine className="w-5 h-5 mr-3" /> Model papers
          </Link>
          <Link href="/vlogs" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <ClipboardList className="w-5 h-5 mr-3" /> B/Vlogs
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
        <Link href="/schedule" className="flex flex-col items-center py-1"><GraduationCap className="w-5 h-5 mb-1" /> Schedule</Link>
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
            <h1 className="text-4xl md:text-5xl font-bold text-white bg-blue-600 py-6 rounded-t-2xl shadow-lg text-center mb-10">
              EXAM SCHEDULE
            </h1>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-8 rounded-xl text-red-700 text-center mb-12">
                <p className="text-2xl font-bold">Error</p>
                <p className="mt-4 text-lg">{error}</p>
              </div>
            )}

            {/* Candidate Schedule Display */}
            {candidate && (
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold">Examination </h2>
                  <p className="mt-1 text-blue-100 text-lg">Consultant Chartered Tax Practitioner (CTPR)</p>
                </div>

                <div className="p-6 md:p-10 space-y-8">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Full Name</p>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-3">{candidate.name}</h1>
                  </div>

                  {/* IDs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 text-center">
                      <p className="text-sm text-gray-600">Membership ID</p>
                      <p className="text-2xl font-bold text-blue-800 mt-2">
                        {String(candidate.membership_id).padStart(5, "0")}
                      </p>
                    </div>

                    {!isNewMemberPending && (
                      <>
                        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 text-center">
                          <p className="text-sm text-gray-600">Candidate ID</p>
                          <p className="text-2xl font-bold text-blue-800 mt-2">{candidate.can_id}</p>
                        </div>

                        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 text-center">
                          <p className="text-sm text-gray-600">Batch</p>
                          <p className="text-2xl font-bold text-blue-800 mt-2">
                            {candidate.batch_name || candidate.batch_id || "—"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Exam Details */}
                  {!isNewMemberPending && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
                      <div className="flex flex-col items-center">
                        <Calendar className="w-8 h-8 text-blue-600 mb-2" />
                        <p className="text-sm text-gray-600">MEPSC Exam Date</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          {candidate.exam_date
                            ? new Date(candidate.exam_date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })
                            : "Not Scheduled"}
                        </p>
                      </div>

                      <div className="flex flex-col items-center">
                        <MapPin className="w-8 h-8 text-blue-600 mb-2" />
                        <p className="text-sm text-gray-600">Place</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1 uppercase">
                          {candidate.place || "—"}
                        </p>
                      </div>

                      <div className="flex flex-col items-center">
                        <BadgeCheck className="w-8 h-8 text-blue-600 mb-2" />
                        <p className="text-sm text-gray-600">State</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1 uppercase">
                          {candidate.state || "—"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Special Cases */}
                  {candidate.new_member_link && (
                    <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-6 text-center">
                      <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                      <p className="text-xl font-bold text-orange-800">Membership Registration Pending</p>
                      <p className="mt-2 text-gray-700">Please complete your membership registration to proceed with exams.</p>
                    </div>
                  )}

                  {candidate.retest_link && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 text-center">
                      <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                      <p className="text-xl font-bold text-red-800">MEPSC Retest Required</p>
                      <p className="mt-2 text-gray-700">You need to retake the MEPSC Assessment.</p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-8 py-4 text-center text-sm text-gray-600 border-t">
                  Data updated as of January 06, 2026
                </div>
              </div>
            )}

            {/* No Data */}
            {!candidate && !error && !loading && (
              <div className="text-center py-20">
                <p className="text-2xl text-gray-600">No exam schedule available yet.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}