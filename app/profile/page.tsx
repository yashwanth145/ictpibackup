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
} from "lucide-react";
import Image from "next/image";
import logo from "../../assets/ICTPL_image.png";

// Move these JSON files to src/data/ (or adjust path accordingly)
// Example structure: src/data/member.json and src/data/names.json
import memberMapData from "@/data/member.json";     // adjust alias/path if needed
import namesMapData from "@/data/names.json";       // adjust alias/path if needed

import { createClient } from "@supabase/supabase-js";

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

    // Name from map or fallback
    const nameFromMap = namesMap[userEmail];
    const rawName = nameFromMap || userEmail.split("@")[0] || "User";
    setDisplayName(rawName.trim());

    const nameParts = rawName.trim().split(/\s+/);
    setFirstName(nameParts[0] || "");
    setLastName(nameParts.slice(1).join(" "));
    setHasSpace(nameParts.length > 1);

    // Find membership ID
    const membershipIdStr = Object.keys(memberMap).find(
      (id) => memberMap[id].toLowerCase().trim() === userEmail
    );

    if (!membershipIdStr) {
      setError("No membership record found for your account.");
      setLoading(false);
      return;
    }

    const membershipId = Number(membershipIdStr);

    // Create Supabase client lazily (inside effect)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

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

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await supabase.auth.signOut();

      router.push("/");
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  if (auth?.loading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600 animate-pulse">Loading profile...</p>
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
        <button onClick={handleSignOut} className="flex flex-col items-center py-1"><LogOut className="w-5 h-5 mb-1" /> Logout</button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow px-4 md:px-6 py-4 sticky top-0 z-40 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <Image src={logo} alt="Logo" className="h-[60px] w-[60px] md:h-[80px] md:w-[80px]" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Profile</h1>
          </div>

          <div className="flex items-center gap-5 md:gap-6 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-50 text-blue-700 rounded-full p-2">
                <User2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                {hasSpace ? (
                  <>
                    <div className="text-sm font-semibold text-gray-800 leading-tight">{firstName}</div>
                    {lastName && <div className="text-xs text-gray-600 opacity-90">{lastName}</div>}
                  </>
                ) : (
                  <div className="text-sm font-semibold text-gray-800 truncate max-w-[160px]" title={displayName}>
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
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <User className="w-6 h-6 text-blue-600" />
                    Personal Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-lg">{profile.name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Display Name</p>
                      <p className="font-medium text-lg">{displayName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium text-lg">{profile.date_of_birth || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Father's Name</p>
                      <p className="font-medium text-lg">{profile.father_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mother's Name</p>
                      <p className="font-medium text-lg">{profile.mother_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">IT PAN</p>
                      <p className="font-medium text-lg font-mono">{profile.it_pan || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Aadhaar Number</p>
                      <p className="font-medium text-lg font-mono">{profile.aadhar || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Voter ID</p>
                      <p className="font-medium text-lg font-mono">{profile.voter || "—"}</p>
                    </div>
                  </div>
                </section>

                {/* Address Information */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-blue-600" />
                    Address & Location
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Full Address</p>
                      <p className="font-medium text-lg">{profile.address || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">District</p>
                      <p className="font-medium text-lg">{profile.district || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">State</p>
                      <p className="font-medium text-lg">{profile.state || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Place</p>
                      <p className="font-medium text-lg">{profile.place || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pincode</p>
                      <p className="font-medium text-lg">{profile.pincode || "—"}</p>
                    </div>
                  </div>
                </section>

                {/* Batch & Qualification */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <Building className="w-6 h-6 text-blue-600" />
                    Batch & Qualification Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Membership ID</p>
                      <p className="font-medium text-lg font-mono">
                        {String(profile.membership_id).padStart(5, "0")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Candidate ID</p>
                      <p className="font-medium text-lg font-mono">{profile.can_id || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Batch ID</p>
                      <p className="font-medium text-lg font-mono">{profile.batch_id || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Batch Name</p>
                      <p className="font-medium text-lg">{profile.batch_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Qualification Status</p>
                      <p className="font-medium text-lg font-semibold text-green-700">
                        {profile.qualification_status || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Joined</p>
                      <p className="font-medium text-lg">{profile.joined || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Completed</p>
                      <p className="font-medium text-lg">{profile.completed || "—"}</p>
                    </div>
                  </div>
                </section>

                {/* Exam Status & Certificates */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
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
                      // Type narrowing - these fields are string | null
                      const status = profile[
                        item.key as
                          | "mepsc_assesment"
                          | "self_test_practice"
                          | "mock_exam"
                          | "final_ctpr_exam"
                      ] as string | null;

                      const url = profile[
                        item.urlKey as
                          | "mepsc_certificate_url"
                          | "self_test_certificate_url"
                          | "mock_certificate_url"
                          | "final_ctpr_certificate_url"
                      ] as string | null;

                      const isPass = status && /pass|complete|completed/i.test(status);
                      const isFail = status && /fail/i.test(status);

                      return (
                        <div
                          key={item.key}
                          className="border rounded-xl p-6 hover:shadow-md transition-all bg-gray-50/60"
                        >
                          <h3 className="font-semibold text-gray-800 mb-4 text-lg">{item.label}</h3>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Status:</span>
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
                                      isPass
                                        ? "text-green-700"
                                        : isFail
                                        ? "text-red-700"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {status}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-500">Not attempted</span>
                              )}
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Certificate:</span>
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
                                <span className="text-gray-500">Not available</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Additional Links & Info */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    Additional Information & Links
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Exam Date</p>
                      <p className="font-medium text-lg">{profile.exam_date || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fellowship Link</p>
                      <p className="font-medium text-lg">
                        {profile.fellowship_link ? (
                          <a
                            href={profile.fellowship_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Fellowship
                          </a>
                        ) : (
                          "—"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">New Member Link</p>
                      <p className="font-medium text-lg">
                        {profile.new_member_link ? (
                          <a
                            href={profile.new_member_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View New Member Link
                          </a>
                        ) : (
                          "—"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">NCVET</p>
                      <p className="font-medium text-lg">{profile.ncvet || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">GSTP</p>
                      <p className="font-medium text-lg">{profile.gstp || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ITP</p>
                      <p className="font-medium text-lg">{profile.itp || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">SIDH</p>
                      <p className="font-medium text-lg">{profile.sidh || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">STP</p>
                      <p className="font-medium text-lg">{profile.stp || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">CB</p>
                      <p className="font-medium text-lg">{profile.cb || "—"}</p>
                    </div>
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