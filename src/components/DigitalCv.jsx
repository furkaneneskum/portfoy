import {
  Code2,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  Mail,
  Phone,
  Printer,
  Star,
  User,
  Wrench,
  X,
} from "lucide-react";
import { normalizeExternalUrl, resolveImageUrl } from "../utils/url";

const DEFAULT_PHONE = "05428528282";

const PROGRAMMING_SKILLS = [
  { name: "Python", level: "İleri", percent: 85 },
  { name: "JavaScript", level: "Orta-İleri", percent: 75 },
  { name: "HTML / CSS", level: "Orta", percent: 70 },
];

const LANGUAGE_SKILLS = [
  { name: "Türkçe", level: "Ana Dil", percent: 100 },
  { name: "İngilizce", level: "İleri", percent: 85 },
];

const TOOLS = [
  "React",
  "Vite",
  "Tailwind CSS",
  "Firebase",
  "Git",
  "GitHub",
  "Pandas",
  "Matplotlib",
];

function SidebarHeading({ icon: Icon, title }) {
  return (
    <h3 className="flex items-center gap-2 border-b border-yellow-500/20 pb-2 text-xs font-semibold tracking-[0.2em] text-yellow-400 uppercase">
      <Icon size={14} />
      {title}
    </h3>
  );
}

function SkillBar({ name, level, percent }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-gray-200">{name}</span>
        <span className="text-xs text-yellow-400/90">{level}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function MainHeading({ icon: Icon, title }) {
  return (
    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-[0.15em] text-yellow-600 uppercase print:text-yellow-700">
      <Icon size={16} />
      {title}
    </h3>
  );
}

export default function DigitalCv({ isOpen, onClose, profile }) {
  if (!isOpen) return null;

  const displayName = profile.name || "Furkan Enes Kum";
  const displayTitle = "Yazılım Mühendisi (Öğrenci)";
  const email = profile.email?.trim() || "";
  const phone = profile.phone?.trim() || DEFAULT_PHONE;
  const github = normalizeExternalUrl(profile.github);
  const linkedin = normalizeExternalUrl(profile.linkedin);
  const profileImage = profile.profileImageUrl
    ? resolveImageUrl(profile.profileImageUrl)
    : null;

  const handlePrint = () => window.print();

  const contactItems = [
    {
      icon: Mail,
      label: email || "E-posta eklenmedi",
      href: email ? `mailto:${email}` : null,
    },
    {
      icon: Phone,
      label: phone,
      href: `tel:${phone.replace(/\s/g, "")}`,
    },
    {
      icon: Linkedin,
      label: "LinkedIn Profili",
      href: linkedin && linkedin !== "#" ? linkedin : null,
    },
    {
      icon: Github,
      label: "GitHub Profili",
      href: github && github !== "#" ? github : null,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-md print:hidden sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-title"
    >
      <div
        className="relative my-4 w-full max-w-5xl"
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
              PDF Olarak Yazdır / İndir
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
          className="cv-layout overflow-hidden rounded-2xl border border-yellow-500/25 shadow-2xl shadow-black/40 print:rounded-none print:border-0 print:shadow-none"
        >
          <div className="flex flex-col md:flex-row">
            {/* Sol sidebar */}
            <aside className="cv-sidebar w-full bg-slate-950 p-6 md:w-[34%] md:p-8 print:bg-slate-900">
              <div className="flex justify-center">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="h-36 w-36 rounded-full border-4 border-yellow-500/40 object-cover shadow-lg shadow-yellow-500/10"
                  />
                ) : (
                  <div className="flex h-36 w-36 items-center justify-center rounded-full border-4 border-yellow-500/40 bg-slate-900 text-3xl font-bold text-yellow-400">
                    FEK
                  </div>
                )}
              </div>

              <section className="mt-8">
                <SidebarHeading icon={Mail} title="İletişim" />
                <ul className="mt-4 space-y-3">
                  {contactItems.map(({ icon: Icon, label, href }) => (
                    <li key={label} className="flex items-start gap-3 text-sm">
                      <Icon className="mt-0.5 shrink-0 text-yellow-400" size={15} />
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith("http") ? "_blank" : undefined}
                          rel={href.startsWith("http") ? "noreferrer" : undefined}
                          className="break-all text-gray-300 transition-colors hover:text-yellow-300 print:text-gray-200 print:no-underline"
                        >
                          {label}
                        </a>
                      ) : (
                        <span className="break-all text-gray-300">{label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-8">
                <SidebarHeading icon={Code2} title="Programlama Dilleri" />
                <div className="mt-4 space-y-4">
                  {PROGRAMMING_SKILLS.map((skill) => (
                    <SkillBar key={skill.name} {...skill} />
                  ))}
                </div>
              </section>

              <section className="mt-8">
                <SidebarHeading icon={Wrench} title="Araçlar & Teknolojiler" />
                <div className="mt-4 flex flex-wrap gap-2">
                  {TOOLS.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-gray-200"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </section>

              <section className="mt-8">
                <SidebarHeading icon={Globe} title="Diller" />
                <div className="mt-4 space-y-4">
                  {LANGUAGE_SKILLS.map((skill) => (
                    <SkillBar key={skill.name} {...skill} />
                  ))}
                </div>
              </section>
            </aside>

            {/* Sağ ana içerik */}
            <main className="cv-main flex-1 bg-slate-100 p-6 text-slate-800 md:p-10 print:bg-white print:text-gray-900">
              <header className="mb-8 border-b border-yellow-500/30 pb-6">
                <h2
                  id="cv-title"
                  className="font-display text-3xl font-bold text-slate-900 sm:text-4xl print:text-black"
                >
                  {displayName}
                </h2>
                <p className="mt-2 text-lg font-medium text-yellow-700 print:text-yellow-800">
                  {displayTitle}
                </p>
                <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400" />
              </header>

              <section className="mb-8">
                <MainHeading icon={User} title="Hakkımda" />
                <p className="text-sm leading-relaxed text-slate-700 sm:text-base print:text-[13px] print:leading-relaxed">
                  Yakın Doğu Üniversitesi&apos;nde %100 İngilizce Yazılım Mühendisliği eğitiminde
                  2. sınıfı başarıyla tamamlamış bir öğrenciyim. Python ve JavaScript ile algoritma,
                  veri analizi ve modern web arayüzleri geliştirme alanlarında proje deneyimim
                  bulunmaktadır. Öğrenmeye açık, takım çalışmasına yatkın ve problem çözme odaklı
                  bir geliştirici olmayı hedefliyorum.
                </p>
              </section>

              <section className="mb-8">
                <MainHeading icon={GraduationCap} title="Eğitim" />
                <div className="relative pl-5">
                  <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-yellow-500" />
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        Yakın Doğu Üniversitesi (Near East University)
                      </p>
                      <p className="text-sm text-slate-600">
                        Yazılım Mühendisliği (İngilizce)
                      </p>
                    </div>
                    <p className="text-sm font-medium text-slate-500">2024 — Devam</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">2. sınıf başarıyla tamamlandı.</p>
                </div>
              </section>

              <section>
                <MainHeading icon={Star} title="Hedef" />
                <p className="text-sm leading-relaxed text-slate-700 sm:text-base print:text-[13px] print:leading-relaxed">
                  Yazılım mühendisliği alanında staj ve proje deneyimi kazanarak teorik bilgimi
                  pratiğe dönüştürmeyi amaçlıyorum. Kurumsal veya girişim ortamında modern
                  teknolojilerle sürdürülebilir, kullanıcı odaklı yazılım çözümleri geliştirmek
                  istiyorum.
                </p>
              </section>
            </main>
          </div>
        </article>
      </div>
    </div>
  );
}
