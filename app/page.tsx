// app/page.tsx
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Member Login', href: '/login' },
    { label: 'Admin Login', href: 'https://results-n3l4.vercel.app/' },
    { label: 'Refer', href: '/refer' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
          <div className="shrink-0">
            <Image
              src="/images/ICTPL_image.jpg"
              alt="ICTPI Logo"
              width={120}
              height={132}
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold italic tracking-tight text-center md:text-left leading-tight">
            Institute of Chartered<br className="sm:hidden" /> Tax Practitioners India
          </h1>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 lg:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-gray-900 font-semibold text-sm sm:text-base rounded-lg shadow transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2"
                aria-label={`Go to ${item.label} page`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16 lg:space-y-20">
        {/* INSTITUTE NEWS */}
        <section>
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-950 text-center mb-8 tracking-tight">
            Institute News
          </h2>
          <div className="bg-white rounded-2xl shadow-xl border border-amber-200/60 overflow-hidden">
            <div className="p-6 md:p-10 space-y-5 text-gray-800 text-lg leading-relaxed">
              <p className="flex items-start gap-3">
                <span className="shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center">1</span>
                ICTPI RPL Batch convocation will happen shortly
              </p>
              <p className="flex items-start gap-3">
                <span className="shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center">2</span>
                <a
                  href="https://www.ictpi.in/ctpr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-700 hover:text-indigo-900 underline decoration-amber-400 decoration-2 hover:decoration-amber-600 transition"
                >
                  Chartered Tax Practitioner course registrations are open
                </a>
              </p>
              <p className="flex items-start gap-3">
                <span className="shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center">3</span>
                CTPRI Course study materials & exam portal is being updated and new academic materials will be released soon! Currently EBooks are available and are being distributed
              </p>
              <p className="flex items-start gap-3">
                <span className="shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center">4</span>
                Consultant (Chartered Tax Practitioners) Course is fully NSQF Aligned at Level 5
              </p>
            </div>
          </div>
        </section>

        {/* Vision + Mission + Description + Acknowledgement + Appeal */}
        <section className="bg-gradient-to-br bg-black text-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-6 py-12 md:px-12 md:py-16 lg:py-20 space-y-12 lg:space-y-16 text-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold underline underline-offset-8 decoration-amber-400 mb-4">Our Vision</h3>
              <p className="text-xl md:text-2xl font-semibold max-w-4xl mx-auto">
                Serving stakeholders is deemed service to government
              </p>
            </div>

            <div>
              <h3 className="text-2xl md:text-3xl font-bold underline underline-offset-8 decoration-amber-400 mb-4">Our Mission</h3>
              <p className="text-xl md:text-2xl font-semibold max-w-4xl mx-auto">
                To uplift anyone & everyone, assure their skills of functioning
              </p>
            </div>

            <div className="text-base md:text-lg leading-relaxed max-w-5xl mx-auto opacity-95 space-y-6">
              <p>
The diversified class of Enrolled Tax Practitioners, persevered everywhere as the fundamental & foundation stones of every business activity, exist from the ancient streams of Indian Taxation system. They are proposed and recognised as the non-litigant propagators of supportive compliance under the respective statutes. The Institute of Chartered Tax Practitioners India (ICTPI) is formed to unite & transform these unorganised and scattered Tax Practitioners, into a premier troupe of “Chartered Tax Practitioners.” ICTPI aims to confer a uniform qualification & membership to protect their interest as a fraternity and to become value added professionals in nation building. ICTPI has developed a qualification, which will be awarded by the Management & Entrepreneurship and Professionals Skill Council (MEPSC) duly approved by the National Council for Vocational Education and Training (NCVET) under the aegis of Ministry of Skill Development and Entrepreneurship (MSDE), Government of India.
              </p>
              
            </div>

            <div className="grid md:grid-cols-3 gap-10 pt-8 border-t border-white/20">
              {/* Acknowledgement */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold underline underline-offset-4 decoration-amber-300">Acknowledgement</h4>
                <p className="text-sm md:text-base opacity-90">
                  Institute of Chartered Tax Practitioners India has outlined specific requirements for membership eligibility.
                </p>
                <ol className="list-decimal list-inside space-y-3 text-left text-sm md:text-base">
                  <li>Complete the NCVET approved Skill Qualification...</li>
                  <li>Obtain a qualification certificate from MEPSC...</li>
                  <li>Secure an enrollment licence to practice...</li>
                </ol>
                <p className="text-sm md:text-base opacity-90">
By acknowledging these requirements, ICTPI ensures its members possess the necessary expertise and credentials to provide tax compliance services.
                </p>
              </div>

              {/* Disclaimer */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold underline underline-offset-4 decoration-amber-300">Disclaimer</h4>
                <ul className="list-disc list-inside space-y-3 text-left text-sm md:text-base opacity-90">
                  <li>ICTPI is not affiliated in any manner with ICAI...</li>
                  <li>ICTPI does not issue licenses to practice...</li>
                  <li>The courses offered by ICTPI are not an essential prerequisite...</li>
                  <li>The scope of ICTPI courses is to provide vocational training...</li>
                </ul>
              </div>

              {/* Appeal */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold underline underline-offset-4 decoration-amber-300">Appeal</h4>
                <p className="text-sm md:text-base leading-relaxed opacity-90">
                  The Institute has set up a 2000 sq.ft.  head office named "TPI BHAVAN" at Bengaluru. Apart from operative costs, rent ,salaries & office expenses, institute need corpus to fund its capital expenditure such as building, repairs, furniture - fixtures, equipment/'s, which requires additional support. To achieve above objectives the institute requires resources in terms of men and money. The Institute requests one and all to contribute generously for its endeavour and support for the cause of fraternity! (Donations to the Institute are eligible for deductions u/s 80 G(5) of IT Act 1961)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section>
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-950 text-center mb-10 tracking-tight">
            Institute&apos;s Gallery
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
            {['im1.png', 'im2.png', 'im3.png', 'im4.png', 'im5.png'].map((img, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <Image
                  src={`/images/${img}`}
                  alt={`Institute event or activity ${i + 1}`}
                  width={400}
                  height={400}
                  className="w-full aspect-square object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-white text-sm font-medium">Event / Activity {i + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Banner */}
        <section className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-950 mb-10 tracking-tight">
            Banners and Editorials
          </h2>
          <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/images/editorial.png"
              alt="Editorial Banner from ICTPI"
              width={1200}
              height={600}
              className="w-full h-auto"
              priority
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center space-y-6 text-sm md:text-base">
          <a
            href="https://ictpi.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-lg md:text-xl font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-4 transition"
          >
            Visit our official website: https://ictpi.in/
          </a>

          <p className="text-xl md:text-2xl font-bold text-white">
            INSTITUTE OF CHARTERED TAX PRACTITIONERS INDIA
          </p>
          <p className="opacity-80">(Registered Professional Body of Enrolled Tax Practitioners of the Nation)</p>

          <div className="pt-4 space-y-2">
            <p className="font-medium">Registered Address:</p>
            <p>TPI Bhavan 313, 9th Main, 26th Cross,</p>
            <p>Banashankari Stage II, Bangalore - 560070</p>
            <p>Karnataka-IN</p>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-center gap-6 md:gap-10">
            <a href="mailto:info@ictpi.in" className="hover:text-amber-300 transition">Email: info@ictpi.in</a>
            <a href="tel:7019063788" className="hover:text-amber-300 transition">Tel: 7019063788</a>
          </div>

          <div className="pt-8 flex flex-wrap justify-center gap-5 md:gap-8 text-sm">
            <a href="https://www.ictpi.in/_files/ugd/d635cc_0b0d617b3e954e2eace126725fc08616.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition underline">Disclaimer</a>
            <a href="https://www.ictpi.in/_files/ugd/d635cc_74bf07f910a6472aba6d3e849040c479.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition underline">Privacy policy</a>
            <a href="https://www.ictpi.in/_files/ugd/d635cc_c3e1dd367c96477cb51efc6e4a93816f.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition underline">Refund policy</a>
            <a href="https://www.ictpi.in/_files/ugd/d635cc_2672c689be5645599d2e44a39efa7075.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition underline">Terms and conditions</a>
          </div>

          <p className="pt-10 opacity-70 text-sm">© {new Date().getFullYear()} by ICTPI</p>
        </div>
      </footer>
    </div>
  );
}