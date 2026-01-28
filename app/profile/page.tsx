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
  ArrowLeft,
  Award,
  CheckCircle2,
  XCircle,
  Calendar,
  FileText,
  GraduationCap,
  ClipboardPenLine,
  History,
  User,
  MapPin,
  Building,
  BookOpen,
  FileCheck,
} from "lucide-react";
import Image from "next/image";
import logo from "../../assets/ICTPL_image.png";
import { supabase } from "@/lib/Supabase";

// Static JSON imports
import memberMapData from "@/public/member.json";     // membershipId → email
import namesMapData from "@/public/names.json";       // email → full name

interface MemberMap {
  [membershipId: string]: string;
}

interface NamesMap {
  [email: string]: string;
}

interface CandidateProfile {
  membership_id: number;
  name: string | null;
  place: string | null;
  state: string | null;
  can_id: string | null;
  batch_id: string | null;
  batch_name: string | null;
  mepsc_assesment: string | null;
  next_step: string | null;
  qualification_status: string | null;
  self_test_practice: string | null;
  mock_exam: string | null;
  final_ctpr_exam: string | null;
  fellowship_link: string | null;
  exam_date: string | null;
  new_member_link: string | null;
  mepsc_certificate_url: string | null;
  mock_certificate_url: string | null;
  final_ctpr_certificate_url: string | null;
  self_test_certificate_url: string | null;
  date_of_birth: string | null;
  it_pan: string | null;
  aadhar: string | null;
  voter: string | null;
  father_name: string | null;
  mother_name: string | null;
  address: string | null;
  district: string | null;
  pincode: string | null;
  joined: string | null;
  completed: string | null;
  ncvet: string | null;
  gstp: string | null;
  itp: string | null;
  sidh: string | null;
  stp: string | null;
  cb: string | null;
}

export default function ProfilePage() {
  const auth = useAuth() as any;
  const router = useRouter();

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState<string>("User");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [hasSpace, setHasSpace] = useState<boolean>(false);

  const memberMap: MemberMap = memberMapData;
  const namesMap: NamesMap = namesMapData;

  useEffect(() => {
    if (!auth?.user?.email) {
      router.push("/");
      return;
    }

    const userEmail = auth.user.email.toLowerCase().trim();

    const nameFromMap = namesMap[userEmail];
    const rawName = nameFromMap || userEmail.split("@")[0] || "User";
    setDisplayName(rawName.trim());

    const nameParts = rawName.trim().split(/\s+/);
    setFirstName(nameParts[0] || "");
    setLastName(nameParts.slice(1).join(" "));
    setHasSpace(nameParts.length > 1);

    const membershipIdStr = Object.keys(memberMap).find(
      (id) => memberMap[id].toLowerCase().trim() === userEmail
    );

    if (!membershipIdStr) {
      setError("No membership record found for your account.");
      setLoading(false);
      return;
    }

    const membershipId = Number(membershipIdStr);

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: supabaseError } = await supabase
          .from("candidate_exam_schedule")
          .select("*")
          .eq("membership_id", membershipId)
          .maybeSingle();

        if (supabaseError) {
          console.error("Supabase error:", supabaseError);
          setError("Failed to load profile data.");
        } else if (data) {
          setProfile(data as CandidateProfile);
        } else {
          setError("No record found for this Membership ID.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [auth, router, memberMap, namesMap]);

  const handleSignOut = async () => {
    try {
      if (auth?.signOut) await auth.signOut();
      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  if (auth?.loading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-black animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!auth.user) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:sticky md:top-0 md:flex md:flex-col md:w-60 md:h-screen md:bg-[#0062cc] md:text-white md:overflow-y-auto">
        <nav className="flex-1 mt-6 space-y-1 px-3">
          <Link href="/dashboard" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700/80 transition-colors">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link href="/results" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700/80 transition-colors">
            <ClipboardList className="w-5 h-5 mr-3" /> Result
          </Link>
          <Link href="/sessions" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700/80 transition-colors">
            <ClipboardList className="w-5 h-5 mr-3" /> Sessions
          </Link>
          <Link href="/previous" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700/80 transition-colors">
            <History className="w-5 h-5 mr-3" /> Previous Sessions
          </Link>
          <Link href="/vlogs" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700/80 transition-colors">
            <ClipboardList className="w-5 h-5 mr-3" /> B/Vlogs
          </Link>
          <Link href="/schedule" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700/80 transition-colors">
            <GraduationCap className="w-5 h-5 mr-3" /> Exam Information
          </Link>
          <Link href="/modelpaper" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700/80 transition-colors">
            <ClipboardPenLine className="w-5 h-5 mr-3" /> Model papers
          </Link>
          <Link href="/tests" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700/80 transition-colors">
            <ClipboardPenLine className="w-5 h-5 mr-3" /> Practice Tests
          </Link>
          <Link href="/certifictes" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
              <FileCheck className="w-5 h-5 mr-3" /> Certificates
            </Link>
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc]/95 backdrop-blur-sm text-white flex justify-around items-center py-2 shadow-lg z-50 text-xs">
        <Link href="/dashboard" className="flex flex-col items-center py-1"><LayoutDashboard className="w-5 h-5 mb-1" /> Dashboard</Link>
        <Link href="/results" className="flex flex-col items-center py-1"><ClipboardList className="w-5 h-5 mb-1" /> Results</Link>
        <Link href="/sessions" className="flex flex-col items-center py-1"><ClipboardList className="w-5 h-5 mb-1" /> Sessions</Link>
        <Link href="/previous" className="flex flex-col items-center py-1"><History className="w-5 h-5 mb-1" /> Previous</Link>
        <Link href="/vlogs" className="flex flex-col items-center py-1"><ClipboardList className="w-5 h-5 mb-1" /> B/Vlogs</Link>
        <Link href="/schedule" className="flex flex-col items-center py-1"><GraduationCap className="w-5 h-5 mb-1" /> Exam info</Link>
        <Link href="/modelpaper" className="flex flex-col items-center py-1"><ClipboardPenLine className="w-5 h-5 mb-1" /> Papers</Link>
        <Link href="/tests" className="flex flex-col items-center py-1"><ClipboardPenLine className="w-5 h-5 mb-1" /> Tests</Link>
        <Link href="/certificates" className="flex flex-col items-center text-xs">
            <FileCheck className="w-5 h-5 mb-1" />Certificates
          </Link>
        <button onClick={handleSignOut} className="flex flex-col items-center py-1"><LogOut className="w-5 h-5 mb-1" /> Logout</button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow px-4 md:px-6 py-4 sticky top-0 z-40 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-black" />
            </button>
            <Image src={logo} alt="Logo" className="h-[60px] w-[60px] md:h-[80px] md:w-[80px]" />
            <h1 className="text-xl md:text-2xl font-bold text-black">Profile</h1>
          </div>

          <div className="flex items-center gap-5 md:gap-6 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-50 text-blue-700 rounded-full p-2">
                <User2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                {hasSpace ? (
                  <>
                    <div className="text-sm font-semibold text-black leading-tight">{firstName}</div>
                    {lastName && <div className="text-xs text-black opacity-90">{lastName}</div>}
                  </>
                ) : (
                  <div className="text-sm font-semibold text-black truncate max-w-[160px]" title={displayName}>
                    {displayName}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium shadow-sm whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-700 text-lg">
                {error}
              </div>
            ) : profile ? (
              <>
                {/* Personal Information */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-black">
                  <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                    <User className="w-6 h-6 text-blue-600" />
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div><p className="text-sm text-black">Full Name</p><p className="font-medium text-lg">{profile.name || "—"}</p></div>
                    <div><p className="text-sm text-black">Display Name</p><p className="font-medium text-lg">{displayName}</p></div>
                    <div><p className="text-sm text-black">Date of Birth</p><p className="font-medium text-lg">{profile.date_of_birth || "—"}</p></div>
                    <div><p className="text-sm text-black">Father's Name</p><p className="font-medium text-lg">{profile.father_name || "—"}</p></div>
                    <div><p className="text-sm text-black">Mother's Name</p><p className="font-medium text-lg">{profile.mother_name || "—"}</p></div>
                    <div><p className="text-sm text-black">IT PAN</p><p className="font-medium text-lg font-mono">{profile.it_pan || "—"}</p></div>
                    <div><p className="text-sm text-black">Aadhaar Number</p><p className="font-medium text-lg font-mono">{profile.aadhar || "—"}</p></div>
                    <div><p className="text-sm text-black">Voter ID</p><p className="font-medium text-lg font-mono">{profile.voter || "—"}</p></div>
                  </div>
                </section>

                {/* Address Information */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-black">
                  <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-blue-600" />
                    Address & Location
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="md:col-span-2"><p className="text-sm text-black">Full Address</p><p className="font-medium text-lg">{profile.address || "—"}</p></div>
                    <div><p className="text-sm text-black">District</p><p className="font-medium text-lg">{profile.district || "—"}</p></div>
                    <div><p className="text-sm text-black">State</p><p className="font-medium text-lg">{profile.state || "—"}</p></div>
                    <div><p className="text-sm text-black">Place</p><p className="font-medium text-lg">{profile.place || "—"}</p></div>
                    <div><p className="text-sm text-black">Pincode</p><p className="font-medium text-lg">{profile.pincode || "—"}</p></div>
                  </div>
                </section>

                {/* Batch & Qualification */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-black">
                  <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                    <Building className="w-6 h-6 text-blue-600" />
                    Batch & Qualification Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div><p className="text-sm text-black">Membership ID</p><p className="font-medium text-lg font-mono">{String(profile.membership_id).padStart(5, "0")}</p></div>
                    <div><p className="text-sm text-black">Candidate ID</p><p className="font-medium text-lg font-mono">{profile.can_id || "—"}</p></div>
                    <div><p className="text-sm text-black">Batch ID</p><p className="font-medium text-lg font-mono">{profile.batch_id || "—"}</p></div>
                    <div><p className="text-sm text-black">Batch Name</p><p className="font-medium text-lg">{profile.batch_name || "—"}</p></div>
                    <div><p className="text-sm text-black">Qualification Status</p><p className="font-medium text-lg font-semibold text-green-700">{profile.qualification_status || "—"}</p></div>
                    <div><p className="text-sm text-black">Joined</p><p className="font-medium text-lg">{profile.joined || "—"}</p></div>
                    <div><p className="text-sm text-black">Completed</p><p className="font-medium text-lg">{profile.completed || "—"}</p></div>
                  </div>
                </section>

                {/* Exam Status & Certificates – FIXED PART */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-black">
                  <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                    <Award className="w-6 h-6 text-blue-600" />
                    Exam Status & Certificates
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { key: "mepsc_assesment", label: "MEPSC Assessment", urlKey: "mepsc_certificate_url" },
                      { key: "self_test_practice", label: "Self Test / Practice", urlKey: "self_test_certificate_url" },
                      { key: "mock_exam", label: "Mock Exam", urlKey: "mock_certificate_url" },
                      { key: "final_ctpr_exam", label: "Final CTPR Exam", urlKey: "final_ctpr_certificate_url" },
                    ].map((item) => {
                      // ── Type-safe access ───────────────────────────────────────────────
                      const status = profile[item.key as 
                        "mepsc_assesment" | "self_test_practice" | "mock_exam" | "final_ctpr_exam"
                      ] as string | null;

                      const url = profile[item.urlKey as 
                        "mepsc_certificate_url" | "self_test_certificate_url" | 
                        "mock_certificate_url" | "final_ctpr_certificate_url"
                      ] as string | null;

                      const isPass = status && /pass|complete|completed/i.test(status);
                      const isFail = status && /fail/i.test(status);
                      // ──────────────────────────────────────────────────────────────────

                      return (
                        <div
                          key={item.key}
                          className="border rounded-xl p-6 hover:shadow-md transition-all bg-gray-50/60"
                        >
                          <h3 className="font-semibold text-black mb-4 text-lg">{item.label}</h3>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-black">Status:</span>
                              {status ? (
                                <div className="flex items-center gap-2">
                                  {isPass ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                  ) : isFail ? (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                  ) : (
                                    <Calendar className="w-5 h-5 text-amber-600" />
                                  )}
                                  <span
                                    className={`font-medium ${
                                      isPass ? "text-green-700" : isFail ? "text-red-700" : "text-black"
                                    }`}
                                  >
                                    {status}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-black">Not attempted</span>
                              )}
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-sm text-black">Certificate:</span>
                              {url ? (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                                >
                                  <FileText className="w-4 h-4" />
                                  View / Download
                                </a>
                              ) : (
                                <span className="text-black">Not available</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Additional Links & Info */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-black">
                  <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    Additional Information & Links
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div><p className="text-sm text-black">Exam Date</p><p className="font-medium text-lg">{profile.exam_date || "—"}</p></div>
                    <div>
                      <p className="text-sm text-black">Fellowship Link</p>
                      <p className="font-medium text-lg">
                        {profile.fellowship_link ? (
                          <a href={profile.fellowship_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View Fellowship
                          </a>
                        ) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-black">New Member Link</p>
                      <p className="font-medium text-lg">
                        {profile.new_member_link ? (
                          <a href={profile.new_member_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View New Member Link
                          </a>
                        ) : "—"}
                      </p>
                    </div>
                    <div><p className="text-sm text-black">NCVET</p><p className="font-medium text-lg">{profile.ncvet || "—"}</p></div>
                    <div><p className="text-sm text-black">GSTP</p><p className="font-medium text-lg">{profile.gstp || "—"}</p></div>
                    <div><p className="text-sm text-black">ITP</p><p className="font-medium text-lg">{profile.itp || "—"}</p></div>
                    <div><p className="text-sm text-black">SIDH</p><p className="font-medium text-lg">{profile.sidh || "—"}</p></div>
                    <div><p className="text-sm text-black">STP</p><p className="font-medium text-lg">{profile.stp || "—"}</p></div>
                    <div><p className="text-sm text-black">CB</p><p className="font-medium text-lg">{profile.cb || "—"}</p></div>
                  </div>
                </section>
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center text-yellow-800 text-lg">
                No candidate record found for your account.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}