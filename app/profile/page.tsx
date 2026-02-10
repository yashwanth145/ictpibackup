"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
  Camera,
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

  // Profile picture states
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Certificate edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [certForm, setCertForm] = useState({
    ncvet: "",
    gstp: "",
    itp: "",
    sidh: "",
    stp: "",
    cb: "",
  });
  const [saving, setSaving] = useState(false);

  const memberMap: MemberMap = memberMapData;
  const namesMap: NamesMap = namesMapData;

  // Can only edit if ALL certificate fields are still empty
  const canEditCertificates =
    profile &&
    !profile.ncvet &&
    !profile.gstp &&
    !profile.itp &&
    !profile.sidh &&
    !profile.stp &&
    !profile.cb;

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

    const loadProfileAndImage = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch candidate profile
        const { data, error: supabaseError } = await supabase
          .from("candidate_exam_schedule")
          .select("*")
          .eq("membership_id", membershipId)
          .maybeSingle();

        if (supabaseError) {
          console.error("Supabase error loading profile:", supabaseError);
          setError("Failed to load profile data.");
          return;
        }

        if (data) {
          setProfile(data as CandidateProfile);
        } else {
          setError("No record found for this Membership ID.");
        }

        // Load profile picture
        const fileName = `${membershipId}.jpg`;

        const { data: urlData } = supabase.storage
          .from("profileimages")
          .getPublicUrl(fileName);

        if (urlData.publicUrl) {
          setProfileImageUrl(`${urlData.publicUrl}?t=${Date.now()}`);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    loadProfileAndImage();
  }, [auth?.user?.email, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const userEmail = auth?.user?.email?.toLowerCase()?.trim();

    if (!userEmail) return;

    const membershipIdStr = Object.keys(memberMap).find(
      (id) => memberMap[id].toLowerCase().trim() === userEmail
    );

    if (!membershipIdStr) {
      alert("Cannot upload: membership ID not found.");
      return;
    }

    const membershipId = Number(membershipIdStr);

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (jpg, png, webp)");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert("Image size should be less than 4MB.");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${membershipId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profileimages")
        .upload(fileName, file, {
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("profileimages")
        .getPublicUrl(fileName);

      if (urlData.publicUrl) {
        setProfileImageUrl(`${urlData.publicUrl}?t=${Date.now()}`);
        alert("Profile picture updated!");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Failed to upload image: " + (err.message || "Unknown error"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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

          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-end">
            {/* Edit Certificates Button – shown only if allowed */}
            {canEditCertificates && (
              <button
                onClick={() => {
                  setCertForm({
                    ncvet: profile?.ncvet || "",
                    gstp: profile?.gstp || "",
                    itp: profile?.itp || "",
                    sidh: profile?.sidh || "",
                    stp: profile?.stp || "",
                    cb: profile?.cb || "",
                  });
                  setIsEditModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium shadow-sm whitespace-nowrap"
              >
                <ClipboardPenLine className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile information</span>
              </button>
            )}

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
            {/* Profile Picture Section */}
            <div className="text-center">
              <div className="relative inline-block group mx-auto">
                <div
                  className={`
                    w-32 h-32 md:w-40 md:h-40
                    rounded-full overflow-hidden
                    border-4 border-blue-100 bg-gray-100
                    flex items-center justify-center shadow-md
                    mx-auto
                  `}
                >
                  {profileImageUrl ? (
                    <Image
                      src={profileImageUrl}
                      alt="Profile picture"
                      width={160}
                      height={160}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <User className="w-20 h-20 md:w-24 md:h-24 text-gray-400" />
                  )}
                </div>

                <label
                  htmlFor="profile-upload-big"
                  className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <div className="flex flex-col items-center text-white text-xs">
                    <Camera className="w-8 h-8 mb-1" />
                    <span>Change photo</span>
                  </div>
                </label>

                <input
                  id="profile-upload-big"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </div>

              <h2 className="mt-4 text-xl md:text-2xl font-bold text-black">
                {displayName}
              </h2>

              <p className="text-sm text-gray-600 mt-1">
                Membership ID: {profile ? String(profile.membership_id).padStart(5, "0") : "—"}
              </p>

              {uploading && (
                <p className="mt-2 text-sm text-blue-600 animate-pulse">
                  Uploading...
                </p>
              )}
            </div>

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

                {/* Exam Status & Certificates */}
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
                      const status = profile[item.key as keyof CandidateProfile] as string | null;
                      const url = profile[item.urlKey as keyof CandidateProfile] as string | null;

                      const isPass = status && /pass|complete|completed/i.test(status);
                      const isFail = status && /fail/i.test(status);

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
                                  {isPass ? <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                                   isFail ? <XCircle className="w-5 h-5 text-red-600" /> :
                                   <Calendar className="w-5 h-5 text-amber-600" />}
                                  <span className={`font-medium ${isPass ? "text-green-700" : isFail ? "text-red-700" : "text-black"}`}>
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

                {/* Additional Information & Links */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-black">
                  <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    Additional Information & Links
                  </h2>

                  {!canEditCertificates && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center text-green-800 text-sm">
                      Certificate and license numbers have already been submitted and cannot be changed.
                    </div>
                  )}

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

        {/* ────────────────────────────────────────────────
            CERTIFICATE EDIT MODAL (one-time use)
        ──────────────────────────────────────────────── */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-7 md:p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Update Certificate / License Numbers</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <XCircle className="w-7 h-7 text-gray-600" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                These details can be filled <strong>only once</strong>.<br />
                Please enter the numbers carefully.
              </p>

              <div className="space-y-5 text-black">
                {[
                  { label: "NCVET Certificate No", key: "ncvet" },
                  { label: "GSTP Certificate No", key: "gstp" },
                  { label: "ITP Certificate No", key: "itp" },
                  { label: "SIDH Certificate No", key: "sidh" },
                  { label: "STP / VAT Certificate No", key: "stp" },
                  { label: "CB Licence No", key: "cb" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={certForm[key as keyof typeof certForm]}
                      onChange={(e) =>
                        setCertForm({ ...certForm, [key]: e.target.value.trim() })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-black"
                      placeholder="Enter certificate / license number"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={saving}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-60 text-black"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (saving) return;
                    setSaving(true);

                    try {
                      const membershipId = profile?.membership_id;
                      if (!membershipId) throw new Error("No membership ID");

                      const { error } = await supabase
                        .from("candidate_exam_schedule")
                        .update({
                          ncvet: certForm.ncvet.trim() || null,
                          gstp: certForm.gstp.trim() || null,
                          itp: certForm.itp.trim() || null,
                          sidh: certForm.sidh.trim() || null,
                          stp: certForm.stp.trim() || null,
                          cb: certForm.cb.trim() || null,
                        })
                        .eq("membership_id", membershipId);

                      if (error) throw error;

                      // Update local state
                      setProfile((prev) =>
                        prev
                          ? {
                              ...prev,
                              ncvet: certForm.ncvet.trim() || null,
                              gstp: certForm.gstp.trim() || null,
                              itp: certForm.itp.trim() || null,
                              sidh: certForm.sidh.trim() || null,
                              stp: certForm.stp.trim() || null,
                              cb: certForm.cb.trim() || null,
                            }
                          : null
                      );

                      alert("Certificate details saved successfully!");
                      setIsEditModalOpen(false);
                    } catch (err: any) {
                      console.error("Save error:", err);
                      alert("Failed to save: " + (err.message || "Unknown error"));
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-60 font-medium"
                >
                  {saving ? "Saving..." : "Save Details"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}