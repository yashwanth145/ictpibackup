"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard, ClipboardList, History, GraduationCap,
  ClipboardPenLine, User2, LogOut, Eye, Download, X
} from "lucide-react";

import logo from "../../assets/ICTPL_image.png";
import emailNamePairs from "../../public/names.json";

// Email to Name Mapping
const emailToName = new Map<string, string>();
Object.entries(emailNamePairs as Record<string, string>).forEach(([email, name]) => {
  emailToName.set(email.toLowerCase(), name);
});

// Your Model Papers (Add more as needed)
const modelPapers = [
  { title: "Applied Financial accounting and ethics", src: "/pdf/Indirect Tax Law Compliances.pdf", download: "Applied Financial accounting and ethics" },
  { title: "Business Regulatory Laws and compliances", src: "/pdf/Business Regulatory Laws and compliances.pdf", download: "Business Regulatory Laws and compliances" },
  { title: "Direct Tax Law Compliances", src: "/pdf/Direct Tax Law Compliances.pdf", download: "Direct Tax Law Compliances" },
  { title: "Indirect Tax Law Compliances", src: "/pdf/Indirect Tax Law Compliances.pdf", download: "Indirect Tax Law Compliances" },
];

export default function ModelPaperPage() {
  const auth = useAuth() as any;
  const router = useRouter();
  const pathname = usePathname();
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  useEffect(() => {
    if (!auth || auth.loading) return;
    if (!auth.user) router.push("/");
  }, [auth, router]);

  const handleSignOut = async () => {
    await auth.signOut?.();
    router.push("/");
  };

  const getUserName = () => {
    const email = auth?.user?.email?.toLowerCase();
    return email && emailToName.has(email) ? emailToName.get(email)! : email?.split("@")[0] || "Student";
  };

  if (!auth || auth.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!auth.user) return null;

  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">

        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 bg-[#0062cc] text-white h-screen sticky top-0">
          
          <nav className="p-4 space-y-2">
            {[
              { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { href: "/results", icon: ClipboardList, label: "Results" },
              { href: "/sessions", icon: ClipboardList, label: "Sessions" },
              { href: "/previous", icon: History, label: "Previous" },
              { href: "/schedule", icon: GraduationCap, label: "Schedule" },
              { href: "/modelpaper", icon: ClipboardPenLine, label: "Model Papers" },
              { href: "/tests", icon: ClipboardPenLine, label: "Practice Tests" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                  pathname === item.href ? "bg-blue-800 shadow-lg" : "hover:bg-blue-700"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
            <Image src={logo} alt="Logo" className="h-16 w-16 md:h-20 md:w-20" />
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-gray-800">{getUserName()}</p>
              </div>
              <User2 className="w-10 h-10 text-gray-700" />
              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </header>

          {/* Model Papers Section */}
          <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10">
            <div className="max-w-4xl mx-auto">
              

              <div className="grid gap-6">
                {modelPapers.map((paper, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-200"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{paper.title}</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => setSelectedPdf(paper.src)}
                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                      >
                        <Eye className="w-5 h-5" />
                        View PDF
                      </button>
                      <a
                        href={paper.src}
                        download={paper.download}
                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition text-center"
                      >
                        <Download className="w-5 h-5" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* Mobile Bottom Navigation */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc] text-white z-50 shadow-2xl">
            <div className="flex overflow-x-auto scrollbar-hide py-3 px-2 text-xs">
              {[
                { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
                { href: "/results", icon: ClipboardList, label: "Results" },
                { href: "/sessions", icon: ClipboardList, label: "Sessions" },
                { href: "/previous", icon: History, label: "Prev" },
                { href: "/modelpaper", icon: ClipboardPenLine, label: "Papers" },
                { href: "/tests", icon: ClipboardPenLine, label: "Tests" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center min-w-[70px] px-3 py-2 font-medium"
                >
                  <item.icon className="w-6 h-6 mb-1" />
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="flex flex-col items-center min-w-[70px] px-3 py-2 font-medium text-red-200"
              >
                <LogOut className="w-6 h-6 mb-1" />
                Logout
              </button>
            </div>
          </nav>
        </div>

        {/* Fullscreen PDF Viewer Modal */}
        {selectedPdf && (
          <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
            <div className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-xl">
              <h3 className="text-lg font-semibold truncate max-w-2xl">
                {modelPapers.find(p => p.src === selectedPdf)?.title}
              </h3>
              <div className="flex gap-3">
                <a
                  href={selectedPdf}
                  download
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center gap-2"
                >
                  <Download className="w-5 h-5" /> Download
                </a>
                <button
                  onClick={() => setSelectedPdf(null)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium flex items-center gap-2"
                >
                  <X className="w-5 h-5" /> Close
                </button>
              </div>
            </div>
            <iframe
              src={selectedPdf}
              className="flex-1 w-full bg-white"
              title="PDF Viewer"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Hide Scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}