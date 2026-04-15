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
  FileCheck,
  GraduationCap,
  ClipboardPenLine,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";

import { supabase } from "@/lib/Supabase";
import { logoSrc } from "@/lib/logo";

export default function Certificates() {
  const auth = useAuth() as any;
  const router = useRouter();

  const [fullName, setFullName] = useState<string>("User");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.user) return;

    const userEmail = auth.user.email?.toLowerCase()?.trim() || "";

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: memberData, error: fetchError } = await supabase
          .from("memberinformation")
          .select("name")
          .eq("email", userEmail)
          .maybeSingle();

        if (fetchError) throw fetchError;

        let resolvedName = "";

        if (memberData?.name?.trim()) {
          resolvedName = memberData.name.trim();
        }

        if (resolvedName) {
          setFullName(resolvedName);
        } else {
          const fallbackName = userEmail.split("@")[0]?.replace(/[._]/g, " ") || "User";
          setFullName(fallbackName);
        }
      } catch (err: any) {
        console.error("Failed to load user data:", err);
        setError("Could not load profile. Using fallback name.");
        setFullName(userEmail.split("@")[0] || "User");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    if (!auth.loading && !auth.user) {
      router.replace("/");
    }
  }, [auth?.user, auth?.loading, router]);

  const handleSignOut = async () => {
    try {
      await auth.signOut?.();
      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  if (auth?.loading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600 animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!auth.user) return null;

  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "User";
  const lastName = nameParts.slice(1).join(" ");
  const showTwoLines = nameParts.length > 1;
  const userEmail = auth.user?.email?.toLowerCase() || "—";

  // Temporary static certificates – using public/ paths
  const tempCertificates = [
    {
      label: "Skill India Marksheet",
      status: "Preparing",
      accent: "from-orange-50 to-amber-100",
      note: "Will be available after result processing",
      image: "/images/skill-india.jpg",
    },
    {
      label: "NCVET Qualification Certificate",
      status: "Preparing",
      accent: "from-blue-50 to-indigo-100",
      note: "Awaiting official issuance",
      image: "/images/nvcet.jpg",
    },
    {
      label: "CTPr (ICTPI) Membership Certificate",
      status: "Active Member",
      accent: "from-blue-50 to-blue-200",
      note: "Available soon – contact support if urgent",
      image: logoSrc,
    },
  ];

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

      <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
        {/* Desktop Sidebar */}
        <aside className="hidden md:sticky md:top-0 md:flex md:flex-col md:w-64 md:h-screen md:bg-[#0062cc] md:text-white md:overflow-y-auto scrollbar-hide">
          <div className="p-6 border-b border-blue-600">
            <Image
              src={logoSrc}
              alt="ICTPL Logo"
              width={140}
              height={56}
              priority
            />
          </div>
          <nav className="flex-1 px-3 py-6 space-y-1.5">
            <Link href="/dashboard" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-600/80 transition">
              <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
            </Link>
            <Link href="/results" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-600/80 transition">
              <ClipboardList className="w-5 h-5 mr-3" /> Results
            </Link>
            <Link href="/sessions" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-600/80 transition">
              <ClipboardList className="w-5 h-5 mr-3" /> Sessions
            </Link>
            <Link href="/previous" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-600/80 transition">
              <Clock className="w-5 h-5 mr-3" /> Previous Sessions
            </Link>
            <Link href="/vlogs" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-600/80 transition">
              <ClipboardList className="w-5 h-5 mr-3" /> B/Vlogs
            </Link>
            <Link href="/schedule" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-600/80 transition">
              <GraduationCap className="w-5 h-5 mr-3" /> Exam Information
            </Link>
            <Link href="/modelpaper" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-600/80 transition">
              <ClipboardPenLine className="w-5 h-5 mr-3" /> Model Papers
            </Link>
            <Link href="/tests" className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-600/80 transition">
              <ClipboardPenLine className="w-5 h-5 mr-3" /> Practice Tests
            </Link>
            <Link
              href="/certificates"
              className="flex items-center px-4 py-3 rounded-lg bg-blue-700 font-medium"
            >
              <FileCheck className="w-5 h-5 mr-3" /> Certificates
            </Link>
          </nav>
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#0062cc]/95 backdrop-blur-md text-white flex justify-around items-center py-2 shadow-2xl z-50">
          <Link href="/dashboard" className="flex flex-col items-center text-[10px]">
            <LayoutDashboard className="w-5 h-5 mb-0.5" /> Dashboard
          </Link>
          <Link href="/results" className="flex flex-col items-center text-[10px]">
            <ClipboardList className="w-5 h-5 mb-0.5" /> Results
          </Link>
          <Link href="/sessions" className="flex flex-col items-center text-[10px]">
            <ClipboardList className="w-5 h-5 mb-0.5" /> Sessions
          </Link>
          <Link href="/previous" className="flex flex-col items-center text-[10px]">
            <Clock className="w-5 h-5 mb-0.5" /> Prev
          </Link>
          <Link href="/vlogs" className="flex flex-col items-center text-[10px]">
            <ClipboardList className="w-5 h-5 mb-0.5" /> Vlogs
          </Link>
          <Link href="/schedule" className="flex flex-col items-center text-[10px]">
            <GraduationCap className="w-5 h-5 mb-0.5" /> Exam
          </Link>
          <Link href="/modelpaper" className="flex flex-col items-center text-[10px]">
            <ClipboardPenLine className="w-5 h-5 mb-0.5" /> Papers
          </Link>
          <Link href="/tests" className="flex flex-col items-center text-[10px]">
            <ClipboardPenLine className="w-5 h-5 mb-0.5" /> Tests
          </Link>
          <Link href="/certificates" className="flex flex-col items-center text-[10px] text-blue-200">
            <FileCheck className="w-5 h-5 mb-0.5" /> Certs
          </Link>
          <button onClick={handleSignOut} className="flex flex-col items-center text-[10px]">
            <LogOut className="w-5 h-5 mb-0.5" /> Logout
          </button>
        </nav>

        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow-sm px-4 sm:px-6 py-4 sticky top-0 z-40">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 max-w-7xl mx-auto">
              <div className="flex items-center gap-4">
                <Image
                  src={logoSrc}
                  alt="ICTPL Logo"
                  className="h-14 w-auto sm:h-16"
                  width={160}
                  height={64}
                  priority
                />
              </div>

              <div className="flex items-center gap-4 sm:gap-6">
                <button
                  onClick={() => router.push("/profile")}
                  className="flex items-center gap-3 hover:opacity-90 transition group"
                  title="Profile"
                >
                  <div className="bg-blue-100 text-blue-700 p-2.5 rounded-full group-hover:bg-blue-200 transition">
                    <User2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    {showTwoLines ? (
                      <>
                        <div className="font-semibold text-gray-800">{firstName}</div>
                        {lastName && <div className="text-sm text-gray-600">{lastName}</div>}
                      </>
                    ) : (
                      <div className="font-semibold text-gray-800 truncate max-w-[200px]">{fullName}</div>
                    )}
                    <div className="text-xs text-gray-500 truncate max-w-[220px]">{userEmail}</div>
                  </div>
                </button>

                <button
                  onClick={handleSignOut}
                  className="hidden sm:flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow transition"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Certificates & Marksheets
              </h1>

              <div className="mb-8 flex items-start gap-3 text-amber-800 bg-amber-50 p-4 rounded-xl border border-amber-200">
                <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Certificates are not yet uploaded</p>
                  <p className="text-sm mt-1">
                    Your official documents will appear here once processed and uploaded. Thank you for your patience.
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {tempCertificates.map((cert, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col h-full"
                  >
                    <div className={`h-48 bg-gradient-to-br ${cert.accent} flex items-center justify-center p-8`}>
                      <Image
                        src={cert.image}
                        alt={`${cert.label} preview`}
                        width={140}
                        height={140}
                        className="object-contain drop-shadow-md opacity-90"
                      />
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
                        {cert.label}
                      </h3>

                      <p className="text-center text-sm mb-4">
                        Status: <span className="font-semibold text-amber-700">{cert.status}</span>
                      </p>

                      <p className="text-center text-sm text-gray-500 mb-6 flex-1">
                        {cert.note}
                      </p>

                      <button
                        disabled
                        className="mt-auto bg-gray-400 text-white font-medium py-3.5 rounded-xl text-center cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                      >
                        <FileText className="w-5 h-5" />
                        Not Available Yet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}