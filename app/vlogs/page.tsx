"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  ClipboardList,
  History,
  GraduationCap,
  ClipboardPenLine,
  User2,
  LogOut,
  Eye,
  Download,
  X,
  ChevronDown,
  ChevronRight,
  BookOpen,
  FileCheck,
  Upload,
} from "lucide-react";
import { logoSrc as logo } from "@/lib/logo";
import { supabase } from "@/lib/Supabase"; // assuming this is your supabase client

// ── Types ─────────────────────────────────────────────────────────────────────
interface PdfItem {
  title: string;
  src: string | null;        // null = not uploaded yet
  download?: string;         // optional filename for download
}

// ── Materials Data ────────────────────────────────────────────────────────────
const ictpiMaterials: PdfItem[] = [
  {
    title: "Applied Financial Accounting and Ethics",
    src: "/pdf/Applied Financial Accounting and Ethics.pdf",
    download: "Applied Financial Accounting and Ethics.pdf",
  },
  {
    title: "Business Regulatory Laws and Compliances",
    src: "/pdf/Business Regulatory Laws and compliances.pdf",
    download: "Business Regulatory Laws and Compliances.pdf",
  },
  {
    title: "Direct Tax Law Compliances",
    src: "/pdf/Direct Tax Law Compliances.pdf",
    download: "Direct Tax Law Compliances.pdf",
  },
  {
    title: "Indirect Tax Law Compliances",
    src: "/pdf/Indirect Tax Law Compliances.pdf",
    download: "Indirect Tax Law Compliances.pdf",
  },
];

const sreedharaMaterials: PdfItem[] = [
  // Add your items here when ready
];

const subramanianMaterials: PdfItem[] = [
  // Add your items here when ready
];

const baskaranMaterials: PdfItem[] = [
  // Add your items here when ready
];

export default function StudyMaterialsPage() {
  const auth = useAuth() as any;
  const router = useRouter();
  const pathname = usePathname();

  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [fullName, setFullName] = useState<string>("Student");

  // Accordion states
  const [expandedICTPI, setExpandedICTPI] = useState(true);
  const [expandedSreedhara, setExpandedSreedhara] = useState(true);
  const [expandedSubramanian, setExpandedSubramanian] = useState(false);
  const [expandedBaskaran, setExpandedBaskaran] = useState(false);

  // ── Fetch user name from Supabase ───────────────────────────────────────────
  useEffect(() => {
    if (!auth?.user?.email) return;

    const currentEmail = auth.user.email.toLowerCase().trim();

    const fetchUserName = async () => {
      setLoadingUser(true);
      try {
        const { data, error } = await supabase
          .from("memberinformation")
          .select("name")
          .eq("email", currentEmail)
          .maybeSingle();

        if (error) {
          console.error("Error fetching name:", error);
        }

        const nameFromDb = data?.name?.trim();
        setFullName(
          nameFromDb && nameFromDb.length > 0
            ? nameFromDb
            : currentEmail.split("@")[0] || "Student"
        );
      } catch (err) {
        console.error("User fetch failed:", err);
        setFullName(currentEmail.split("@")[0] || "Student");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserName();
  }, [auth?.user?.email]);

  // ── Auth protection ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (auth?.loading) return;
    if (!auth?.user) {
      router.replace("/");
    }
  }, [auth?.loading, auth?.user, router]);

  const handleSignOut = async () => {
    if (auth?.signOut) await auth.signOut();
    router.replace("/");
  };

  if (auth?.loading || loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-600 animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!auth?.user) return null;

  const selectedTitle =
    [...ictpiMaterials, ...sreedharaMaterials, ...subramanianMaterials, ...baskaranMaterials]
      .find((item) => item.src === selectedPdf)?.title ?? "Document";

  // ── Reusable Material Card ─────────────────────────────────────────────────
  const MaterialCard = ({ item }: { item: PdfItem }) => {
    const isAvailable = item.src !== null;

    return (
      <div
        className={`bg-white rounded-lg shadow-sm p-6 transition-all border ${
          isAvailable
            ? "hover:shadow-md border-gray-200"
            : "opacity-75 border-gray-300 bg-gray-50"
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 leading-tight pr-8">
          {item.title}
        </h3>

        {isAvailable ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setSelectedPdf(item.src!)}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              <Eye className="w-5 h-5" />
              View
            </button>
            <a
              href={item.src!}
              download={item.download}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition text-center"
            >
              <Download className="w-5 h-5" />
              Download
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <Upload className="w-6 h-6 mr-2" />
            <span className="font-medium">To be uploaded soon</span>
          </div>
        )}
      </div>
    );
  };

  // ── Reusable Accordion Section ─────────────────────────────────────────────
  const AccordionSection = ({
    title,
    materials,
    expanded,
    setExpanded,
  }: {
    title: string;
    materials: PdfItem[];
    expanded: boolean;
    setExpanded: (v: boolean) => void;
  }) => (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:brightness-105 transition"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6" />
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        {expanded ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
      </button>

      {expanded && (
        <div className="p-6 space-y-6 bg-gray-50">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {materials.map((material, idx) => (
              <MaterialCard key={idx} item={material} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-[#0062cc] text-white h-screen sticky top-0 overflow-y-auto">
        <nav className="p-4 space-y-1.5">
          {[
            { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { href: "/results", icon: ClipboardList, label: "Results" },
            { href: "/sessions", icon: ClipboardList, label: "Sessions" },
            { href: "/previous", icon: History, label: "Previous" },
            { href: "/schedule", icon: GraduationCap, label: "Schedule" },
            { href: "/modelpaper", icon: ClipboardPenLine, label: "Model Papers" },
            { href: "/tests", icon: ClipboardPenLine, label: "Practice Tests" },
            { href: "/certificates", icon: FileCheck, label: "Certificates" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                pathname === item.href ? "bg-blue-800 shadow-md" : "hover:bg-blue-700/80"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40 px-5 py-3 flex items-center justify-between">
          <Image src={logo} alt="Logo" width={64} height={64} className="h-14 w-14 md:h-16 md:w-16 object-contain" priority />
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-gray-800">{fullName}</p>
            </div>
            <User2 className="w-9 h-9 text-gray-600" />
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 md:p-8 lg:p-10">
          <div className="max-w-5xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Faculty Study Materials</h1>

            <AccordionSection
              title="ICTPI Core Materials"
              materials={ictpiMaterials}
              expanded={expandedICTPI}
              setExpanded={setExpandedICTPI}
            />

            <AccordionSection
              title="CTPr Sreedhara Parthasarathy"
              materials={sreedharaMaterials}
              expanded={expandedSreedhara}
              setExpanded={setExpandedSreedhara}
            />

            <AccordionSection
              title="BR.N. Subramanian"
              materials={subramanianMaterials}
              expanded={expandedSubramanian}
              setExpanded={setExpandedSubramanian}
            />

            <AccordionSection
              title="CTPr Kalyanasundaram Baskaran"
              materials={baskaranMaterials}
              expanded={expandedBaskaran}
              setExpanded={setExpandedBaskaran}
            />
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc] text-white z-50 shadow-2xl border-t border-blue-700">
          <div className="flex justify-around py-2 px-1 text-xs">
            {[
              { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
              { href: "/results", icon: ClipboardList, label: "Results" },
              { href: "/sessions", icon: ClipboardList, label: "Sessions" },
              { href: "/previous", icon: History, label: "Prev" },
              { href: "/modelpaper", icon: ClipboardPenLine, label: "Papers" },
              { href: "/tests", icon: ClipboardPenLine, label: "Tests" },
              { href: "/certificates", icon: FileCheck, label: "Certs" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="flex flex-col items-center py-1 px-2 min-w-[60px]">
                <item.icon className="w-6 h-6 mb-0.5" />
                {item.label}
              </Link>
            ))}
            <button onClick={handleSignOut} className="flex flex-col items-center py-1 px-2 min-w-[60px] text-red-200">
              <LogOut className="w-6 h-6 mb-0.5" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
          <div className="bg-gray-900 text-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold truncate flex-1">{selectedTitle}</h3>
            <div className="flex gap-3 w-full sm:w-auto">
              <a
                href={selectedPdf}
                download
                className="flex-1 sm:flex-none px-5 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download
              </a>
              <button
                onClick={() => setSelectedPdf(null)}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Close
              </button>
            </div>
          </div>
          <iframe src={selectedPdf} className="flex-1 w-full bg-white" title="PDF Viewer" allowFullScreen />
        </div>
      )}
    </div>
  );
}