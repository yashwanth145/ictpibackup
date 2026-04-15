"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
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
import { logoSrc as logo } from "@/lib/logo";
import { supabase } from "@/lib/Supabase";

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

  // User data from memberinformation
  const [fullName, setFullName] = useState<string>("User");
  const [membershipId, setMembershipId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  // Profile picture & upload states
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    date_of_birth: "",
    father_name: "",
    mother_name: "",
    it_pan: "",
    aadhar: "",
    voter: "",
    ncvet: "",
    gstp: "",
    itp: "",
    sidh: "",
    stp: "",
    cb: "",
  });
  const [saving, setSaving] = useState(false);

  const canEditDetails =
    profile &&
    !profile.date_of_birth &&
    !profile.father_name &&
    !profile.mother_name &&
    !profile.it_pan &&
    !profile.aadhar &&
    !profile.voter &&
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

    const currentEmail = auth.user.email.toLowerCase().trim();
    setUserEmail(currentEmail);

    const loadUserAndProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch membership_id and name from memberinformation
        const { data: memberData, error: memberError } = await supabase
          .from("memberinformation")
          .select("membership_id, name")
          .eq("email", currentEmail)
          .maybeSingle();

        if (memberError) {
          console.error("Error fetching memberinformation:", memberError);
          setError("Failed to load user record.");
          return;
        }

        if (!memberData || !memberData.membership_id) {
          setError("No membership record found for your account.");
          return;
        }

        const mid = Number(memberData.membership_id);
        setMembershipId(mid);

        // Set name (prefer DB value, fallback to email prefix)
        const nameFromDb = memberData.name?.trim();
        const display = nameFromDb && nameFromDb.length > 0
          ? nameFromDb
          : currentEmail.split("@")[0] || "User";

        setFullName(display);

        // 2. Fetch candidate profile using membership_id
        const { data: profileData, error: profileError } = await supabase
          .from("candidate_exam_schedule")
          .select("*")
          .eq("membership_id", mid)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          setError("Failed to load profile data.");
          return;
        }

        if (profileData) {
          setProfile(profileData as CandidateProfile);
        } else {
          setError("No candidate record found for this Membership ID.");
        }

        // 3. Load profile picture
        const fileName = `${mid}.jpg`;
        const { data: urlData } = supabase.storage
          .from("profileimages")
          .getPublicUrl(fileName);

        if (urlData.publicUrl) {
          setProfileImageUrl(`${urlData.publicUrl}?t=${Date.now()}`);
        }
      } catch (err) {
        console.error("Load error:", err);
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    loadUserAndProfile();
  }, [auth?.user?.email, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!membershipId) {
      alert("Membership ID not available.");
      return;
    }

    const file = e.target.files[0];

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
        .upload(fileName, file, { cacheControl: "3600" });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("profileimages")
        .getPublicUrl(fileName);

      if (urlData.publicUrl) {
        setProfileImageUrl(`${urlData.publicUrl}?t=${Date.now()}`);
        alert("Profile picture updated successfully!");
      }
    } catch (err: any) {
      console.error("Upload failed:", err);
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
          <Link href="/certificates" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700/80 transition-colors">
            <FileCheck className="w-5 h-5 mr-3" /> Certificates
          </Link>
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc]/95 backdrop-blur-sm text-white flex justify-around items-center py-2 shadow-lg z-50 text-xs">
        <Link href="/dashboard" className="flex flex-col items-center py-1"><LayoutDashboard className="w-5 h-5 mb-1" /> Dash</Link>
        <Link href="/results" className="flex flex-col items-center py-1"><ClipboardList className="w-5 h-5 mb-1" /> Results</Link>
        <Link href="/sessions" className="flex flex-col items-center py-1"><ClipboardList className="w-5 h-5 mb-1" /> Sessions</Link>
        <Link href="/previous" className="flex flex-col items-center py-1"><History className="w-5 h-5 mb-1" /> Prev</Link>
        <Link href="/modelpaper" className="flex flex-col items-center py-1"><ClipboardPenLine className="w-5 h-5 mb-1" /> Papers</Link>
        <Link href="/tests" className="flex flex-col items-center py-1"><ClipboardPenLine className="w-5 h-5 mb-1" /> Tests</Link>
        <Link href="/certificates" className="flex flex-col items-center py-1"><FileCheck className="w-5 h-5 mb-1" /> Certs</Link>
        <button onClick={handleSignOut} className="flex flex-col items-center py-1"><LogOut className="w-5 h-5 mb-1" /> Logout</button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow px-4 md:px-6 py-4 sticky top-0 z-40 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-800" />
            </button>
            <Image src={logo} alt="Logo" className="h-16 w-16 md:h-20 md:w-20" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Profile</h1>
          </div>

          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-end">
            {canEditDetails && (
              <button
                onClick={() => {
                  setProfileForm({
                    date_of_birth: profile?.date_of_birth || "",
                    father_name: profile?.father_name || "",
                    mother_name: profile?.mother_name || "",
                    it_pan: profile?.it_pan || "",
                    aadhar: profile?.aadhar || "",
                    voter: profile?.voter || "",
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
                <span className="hidden sm:inline">Edit Profile</span>
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
            {/* Profile Picture & Basic Info */}
            <div className="text-center">
              <div className="relative inline-block group mx-auto">
                <div
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-blue-100 bg-gray-100 flex items-center justify-center shadow-md mx-auto"
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
                  htmlFor="profile-upload"
                  className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <div className="flex flex-col items-center text-white text-xs">
                    <Camera className="w-8 h-8 mb-1" />
                    <span>Change</span>
                  </div>
                </label>

                <input
                  id="profile-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </div>

              <h2 className="mt-4 text-2xl md:text-3xl font-bold text-gray-900">
                {fullName}
              </h2>

              <p className="text-sm text-gray-600 mt-1">
                Membership ID: {membershipId ? String(membershipId).padStart(5, "0") : "—"}
              </p>

              {uploading && (
                <p className="mt-2 text-sm text-blue-600 animate-pulse">Uploading photo...</p>
              )}
            </div>

            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-700 text-lg">
                {error}
              </div>
            ) : profile ? (
              <>
                {/* Personal Information */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <User className="w-6 h-6 text-blue-600" />
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div><p className="text-sm text-gray-600">Full Name</p><p className="font-medium text-lg">{profile.name || "—"}</p></div>
                    <div><p className="text-sm text-gray-600">Display Name</p><p className="font-medium text-lg">{fullName}</p></div>
                    <div><p className="text-sm text-gray-600">Date of Birth</p><p className="font-medium text-lg">{profile.date_of_birth || "—"}</p></div>
                    <div><p className="text-sm text-gray-600">Father's Name</p><p className="font-medium text-lg">{profile.father_name || "—"}</p></div>
                    <div><p className="text-sm text-gray-600">Mother's Name</p><p className="font-medium text-lg">{profile.mother_name || "—"}</p></div>
                    <div><p className="text-sm text-gray-600">IT PAN</p><p className="font-medium text-lg font-mono">{profile.it_pan || "—"}</p></div>
                    <div><p className="text-sm text-gray-600">Aadhaar Number</p><p className="font-medium text-lg font-mono">{profile.aadhar || "—"}</p></div>
                    <div><p className="text-sm text-gray-600">Voter ID</p><p className="font-medium text-lg font-mono">{profile.voter || "—"}</p></div>
                  </div>
                </section>

                {/* Address Information */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-blue-600" />
                    Address & Location
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="md:col-span-2"><p className="text-sm text-gray-600">Full Address</p><p className="font-medium text-lg">{profile.address || "—"}</p></div>
                    <div><p className="text-sm text-gray-600">District</p><p className="font-medium text-lg">{profile.district || "—"}</p></div>
                    <div><p className="text-sm text-gray-600">State</p><p className="font-medium text-lg">{profile.state || "—"}</p></div>
                    <div><p className="text-sm text-gray-600">Place</p><p className="font-medium text-lg">{profile.place || "—"}</p></div>
                    <div><p className="text-sm text-gray-600">Pincode</p><p className="font-medium text-lg">{profile.pincode || "—"}</p></div>
                  </div>
                </section>

                {/* Batch & Qualification */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Building className="w-6 h-6 text-blue-600" />
                    Batch & Qualification Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div><p className="text-sm text-gray-600">Membership ID</p><p className="font-medium text-lg font-mono">{String(profile.membership_id).padStart(5, "0")}</p></div>
                    <div><p className="text-sm text-gray-600">Candidate ID</p><p className="font-medium text-lg font-mono">{profile.can_id || "—"}</p></div>
                    <div><p className="text-sm text-gray-600">Batch ID</p><p className="font-medium text-lg font-mono">{profile.batch_id || "—"}</p></div>
                    <div><p className="text-sm text-gray-600">Batch Name</p><p className="font-medium text-lg">{profile.batch_name || "—"}</p></div>
                    <div><p className="text-sm text-gray-600">Qualification Status</p><p className="font-medium text-lg font-semibold text-green-700">{profile.qualification_status || "—"}</p></div>
                    <div><p className="text-sm text-gray-600">Joined</p><p className="font-medium text-lg">{profile.joined || "—"}</p></div>
                    <div><p className="text-sm text-gray-600">Completed</p><p className="font-medium text-lg">{profile.completed || "—"}</p></div>
                  </div>
                </section>

                {/* Exam Status & Certificates */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
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
                          <h3 className="font-semibold mb-4 text-lg">{item.label}</h3>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Status:</span>
                              {status ? (
                                <div className="flex items-center gap-2">
                                  {isPass ? <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                                   isFail ? <XCircle className="w-5 h-5 text-red-600" /> :
                                   <Calendar className="w-5 h-5 text-amber-600" />}
                                  <span className={`font-medium ${isPass ? "text-green-700" : isFail ? "text-red-700" : "text-gray-800"}`}>
                                    {status}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-600">Not attempted</span>
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
                                <span className="text-gray-600">Not available</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Additional Information & Links */}
                <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    Additional Information & Links
                  </h2>

                  {!canEditDetails && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center text-green-800 text-sm">
                      Profile and certificate details have been submitted and cannot be changed.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div><p className="text-sm text-gray-600">Exam Date</p><p className="font-medium text-lg">{profile.exam_date || "—"}</p></div>
                    <div>
                      <p className="text-sm text-gray-600">Fellowship Link</p>
                      <p className="font-medium text-lg">
                        {profile.fellowship_link ? (
                          <a href={profile.fellowship_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View Fellowship
                          </a>
                        ) : "—"}
                      </p>
                    </div>
                    <div><p className="text-sm text-gray-600">NCVET CERTIFICATE NO.</p><p className="font-medium text-lg">{profile.ncvet || "—"}</p></div>
                    <div><p className="text-sm text-gray-600">GSTP ENROLLMENT NO.</p><p className="font-medium text-lg">{profile.gstp || "—"}</p></div>
                    <div><p className="text-sm text-gray-600">ITP ENROLLMENT NO.</p><p className="font-medium text-lg">{profile.itp || "—"}</p></div>
                    <div><p className="text-sm text-gray-600">SIDH CANDIDATE ID</p><p className="font-medium text-lg">{profile.sidh || "—"}</p></div>
                    
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

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Update Profile Details</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <XCircle className="w-7 h-7 text-gray-600" />
                </button>
              </div>

              <p className="text-xl text-red-600 mb-6 leading-relaxed">
                <strong>Important:</strong> These fields can be filled <strong><i>only once</i></strong>.<br />
                Please enter accurate information — especially IDs and certificate numbers.
              </p>

              <div className="space-y-6">
                {/* Personal Identity */}
                <div className="border-b pb-5">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Personal Identity</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1.5">
                        Date of Birth <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        value={profileForm.date_of_birth}
                        onChange={(e) => setProfileForm({ ...profileForm, date_of_birth: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1.5">Father's Name</label>
                      <input
                        type="text"
                        value={profileForm.father_name}
                        onChange={(e) => setProfileForm({ ...profileForm, father_name: e.target.value.trim() })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1.5">Mother's Name</label>
                      <input
                        type="text"
                        value={profileForm.mother_name}
                        onChange={(e) => setProfileForm({ ...profileForm, mother_name: e.target.value.trim() })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Government IDs */}
                <div className="border-b pb-5">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Government IDs</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1.5">IT PAN</label>
                      <input
                        type="text"
                        value={profileForm.it_pan}
                        onChange={(e) => setProfileForm({ ...profileForm, it_pan: e.target.value.trim().toUpperCase() })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                        placeholder="ABCDE1234F"
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1.5">Aadhaar Number</label>
                      <input
                        type="text"
                        value={profileForm.aadhar}
                        onChange={(e) => setProfileForm({ ...profileForm, aadhar: e.target.value.trim() })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        placeholder="XXXX XXXX XXXX"
                        maxLength={14}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1.5">Voter ID</label>
                      <input
                        type="text"
                        value={profileForm.voter}
                        onChange={(e) => setProfileForm({ ...profileForm, voter: e.target.value.trim().toUpperCase() })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                        placeholder="ABC1234567"
                      />
                    </div>
                  </div>
                </div>

                {/* Certificates & Licenses */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Certificates & Licenses</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { label: "GSTP Enrollment No.", key: "gstp" },
                      { label: "ITP Enrollment No", key: "itp" },
                      { label: "STP Enrollment No ", key: "stp" },
                      { label: "CB Licence No", key: "cb" },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-800 mb-1.5">{label}</label>
                        <input
                          type="text"
                          value={profileForm[key as keyof typeof profileForm] || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, [key]: e.target.value.trim() })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter number"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={saving}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (saving) return;
                    setSaving(true);

                    try {
                      if (!membershipId) throw new Error("No membership ID");

                      const updates = {
                        date_of_birth: profileForm.date_of_birth || null,
                        father_name: profileForm.father_name.trim() || null,
                        mother_name: profileForm.mother_name.trim() || null,
                        it_pan: profileForm.it_pan.trim().toUpperCase() || null,
                        aadhar: profileForm.aadhar.trim() || null,
                        voter: profileForm.voter.trim().toUpperCase() || null,
                        ncvet: profileForm.ncvet.trim() || null,
                        gstp: profileForm.gstp.trim() || null,
                        itp: profileForm.itp.trim() || null,
                        stp: profileForm.stp.trim() || null,
                        cb: profileForm.cb.trim() || null,
                      };

                      const { error } = await supabase
                        .from("candidate_exam_schedule")
                        .update(updates)
                        .eq("membership_id", membershipId);

                      if (error) throw error;

                      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
                      alert("Details saved successfully!");
                      setIsEditModalOpen(false);
                    } catch (err: any) {
                      console.error("Save failed:", err);
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