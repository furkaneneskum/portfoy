import {
  Briefcase,
  Download,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Printer,
  X,
} from "lucide-react";
import { normalizeExternalUrl } from "../utils/url";

const CV_PROJECTS = [
  {
    title: "Otel Misafir Geri Bildirim Analizi",
    description:
      "Python tabanli analiz araci ile misafir yorumlarini siniflandiran, duygu analizi yapan ve yonetime karar destegi saglayan veri gorsellestirmeleri.",
    tech: ["Python", "Pandas", "Matplotlib"],
  },
  {
    title: "Premium Restoran Rezervasyon Arayuzu",
    description:
      "Luks hizmet anlayisina uygun, hizli ve kullanici dostu masa rezervasyon deneyimi sunan modern arayuz.",
    tech: ["JavaScript", "Tailwind CSS"],
  },
];

const CV_SKILLS = [
  { label: "Diller", items: ["Python", "JavaScript"] },
  { label: "Web", items: ["HTML5", "CSS3", "Tailwind CSS"] },
  { label: "Araclar", items: ["Git", "GitHub", "Veri Analizi (Pandas / Matplotlib)"] },
];

export default function DigitalCv({ isOpen, onClose, profile }) {
  if (!isOpen) return null;

  const email = profile.email || "furkan@example.com";
  const github = normalizeExternalUrl(profile.github);
  const linkedin = normalizeExternalUrl(profile.linkedin);

  const handlePrint = () => window.print();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-md print:hidden sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-title"
    >
      <div
        className="relative my-4 w-full max-w-4xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 no-print">
          <p className="text-sm tracking-[0.16em] text-yellow-400 uppercase">Dijital CV</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-2.5 text-sm font-semibold text-yellow-300 transition-all duration-300 hover:bg-yellow-500 hover:text-slate-900"
            >
              <Printer size={16} />
              PDF Olarak Yazdir / Indir
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/80 px-4 py-2.5 text-sm text-gray-200 transition-all duration-300 hover:border-yellow-500/30 hover:text-yellow-300"
            >
              <X size={16} />
              Kapat
            </button>
          </div>
        </div>

        <article
          id="cv-print-area"
          className="overflow-hidden rounded-2xl border border-yellow-500/25 bg-slate-900/90 shadow-2xl shadow-black/40 backdrop-blur-lg print:rounded-none print:border-0 print:bg-white print:shadow-none"
        >
          <header className="border-b border-yellow-500/20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-8 sm:px-10 print:border-b print:border-gray-300 print:bg-white print:from-white print:via-white print:to-white">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs tracking-[0.2em] text-yellow-400 uppercase print:text-gray-500">
                  Curriculum Vitae
                </p>
                <h2
                  id="cv-title"
                  className="mt-2 text-3xl font-bold text-slate-100 sm:text-4xl print:text-black"
                >
                  Furkan Enes Kum
                </h2>
                <p className="mt-2 text-lg text-yellow-300/90 print:text-gray-700">
                  Yazilim Muhendisligi Ogrencisi
                </p>
              </div>
              <div className="hidden sm:block print:block">
                <Download className="text-yellow-500/40 print:hidden" size={28} />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Mail, label: email, href: `mailto:${email}` },
                { icon: MapPin, label: "Lefkosa, KKTC", href: null },
                { icon: Github, label: "GitHub", href: github },
                { icon: Linkedin, label: "LinkedIn", href: linkedin },
              ].map(({ icon: Icon, label, href }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-yellow-500/15 bg-slate-950/40 px-4 py-3 print:border-gray-200 print:bg-white"
                >
                  <Icon className="shrink-0 text-yellow-400 print:text-gray-600" size={16} />
                  {href && href !== "#" ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-sm text-gray-300 transition-colors duration-300 hover:text-yellow-300 print:text-gray-800 print:no-underline"
                    >
                      {label}
                    </a>
                  ) : (
                    <span className="truncate text-sm text-gray-300 print:text-gray-800">
                      {label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </header>

          <div className="space-y-8 px-6 py-8 sm:px-10 print:space-y-6 print:px-8 print:py-6">
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold tracking-[0.18em] text-yellow-400 uppercase print:text-gray-800">
                <Briefcase size={15} />
                Ozet
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-300 sm:text-base print:text-[13px] print:leading-relaxed print:text-gray-800">
                Yakin Dogu Universitesi&apos;nde %100 Ingilizce Yazilim Muhendisligi egitiminde 2.
                sinifi basariyla tamamlamis bir yazilim muhendisligi ogrencisiyim. Python ve
                JavaScript dillerine odaklanarak algoritma ve modern arayuz gelistirme konularinda
                yetkinlik kazandim. Merit Royal bunyasinde staj yaparak operasyonel sureclerin
                optimizasyonu ve veri analitigi cozumlerine deger katmayi hedefliyorum.
              </p>
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold tracking-[0.18em] text-yellow-400 uppercase print:text-gray-800">
                <GraduationCap size={15} />
                Egitim
              </h3>
              <div className="mt-3 rounded-xl border border-yellow-500/15 bg-slate-950/30 p-4 print:border-gray-200 print:bg-white">
                <p className="font-semibold text-slate-100 print:text-black">
                  Yakin Dogu Universitesi (Near East University)
                </p>
                <p className="mt-1 text-sm text-gray-400 print:text-gray-600">
                  Yazilim Muhendisligi (Ingilizce) · 2024 - Devam
                </p>
                <p className="mt-2 text-sm text-gray-300 print:text-gray-700">
                  2. sinif basariyla tamamlandi.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold tracking-[0.18em] text-yellow-400 uppercase print:text-gray-800">
                Yetenekler
              </h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                {CV_SKILLS.map((group) => (
                  <div
                    key={group.label}
                    className="rounded-xl border border-yellow-500/15 bg-slate-950/30 p-4 print:border-gray-200 print:bg-white"
                  >
                    <p className="text-xs font-semibold tracking-wider text-yellow-400 uppercase print:text-gray-700">
                      {group.label}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {group.items.map((item) => (
                        <li
                          key={item}
                          className="text-sm text-gray-300 print:text-gray-800"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold tracking-[0.18em] text-yellow-400 uppercase print:text-gray-800">
                Projeler
              </h3>
              <div className="mt-3 space-y-4">
                {CV_PROJECTS.map((project) => (
                  <div
                    key={project.title}
                    className="rounded-xl border border-yellow-500/15 bg-slate-950/30 p-4 print:border-gray-200 print:bg-white print:break-inside-avoid"
                  >
                    <p className="font-semibold text-slate-100 print:text-black">
                      {project.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-300 print:text-gray-700">
                      {project.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-300 print:border-gray-300 print:bg-gray-100 print:text-gray-800"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
