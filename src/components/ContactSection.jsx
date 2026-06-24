import { ArrowRight, Github, Linkedin, Mail, MapPin, Send } from "lucide-react";
import { normalizeExternalUrl } from "../utils/url";

export default function ContactSection({
  profile,
  contactForm,
  setContactForm,
  onSubmit,
  contactSubmitting,
  contactStatus,
}) {
  const email = profile.email || "furkan@example.com";
  const github = normalizeExternalUrl(profile.github);
  const linkedin = normalizeExternalUrl(profile.linkedin);

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-base text-slate-100 outline-none backdrop-blur-md transition-all duration-300 placeholder:text-gray-500 focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-500/20";

  return (
    <section id="iletisim" className="py-20">
      <div className="mb-10 text-center sm:text-left">
        <p className="text-xs tracking-[0.2em] text-yellow-400 uppercase">Iletisim</p>
        <h3 className="mt-2 text-3xl font-semibold text-yellow-400 sm:text-4xl">
          Birlikte Calisalim
        </h3>
        <p className="mt-3 max-w-2xl text-gray-300">
          Staj, is birligi veya proje gorusmeleri icin asagidaki kanallardan bana
          ulasabilirsiniz.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {[
            {
              icon: Mail,
              title: "E-posta",
              value: email,
              href: `mailto:${email}`,
            },
            {
              icon: MapPin,
              title: "Konum",
              value: "Lefkosa, KKTC",
              href: null,
            },
            {
              icon: Linkedin,
              title: "LinkedIn",
              value: "Profilimi ziyaret edin",
              href: linkedin,
            },
            {
              icon: Github,
              title: "GitHub",
              value: "Projelerimi inceleyin",
              href: github,
            },
          ].map(({ icon: Icon, title, value, href }) => (
            <div
              key={title}
              className="group rounded-2xl border border-yellow-500/20 bg-slate-800/40 p-5 shadow-lg shadow-black/20 backdrop-blur-lg transition-all duration-300 hover:border-yellow-500/40 hover:bg-slate-800/60"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/10 p-3 text-yellow-400 transition-all duration-300 group-hover:bg-yellow-500 group-hover:text-slate-900">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-300/90">{title}</p>
                  {href && href !== "#" ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block text-sm text-gray-300 transition-colors duration-300 hover:text-yellow-400"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-gray-300">{value}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-slate-800/60 to-slate-900/80 p-6 backdrop-blur-lg">
            <p className="text-sm leading-relaxed text-gray-300">
              <span className="font-semibold text-yellow-400">Merit Royal</span> bunyesinde
              yazilim muhendisligi staji yaparak, konaklama sektorunun dijital donusumune katki
              sunmayi ve operasyonel sureclerin optimizasyonu icin veri odakli cozumler gelistirmeyi
              hedefliyorum. Kurumsal is birliginiz icin tesekkur ederim.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-800/35 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <h4 className="text-xl font-semibold text-slate-100">Mesaj Gonderin</h4>
          <p className="mt-2 text-sm text-gray-400">
            Formu doldurun, en kisa surede size donus yapayim.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm text-gray-300">Ad Soyad</span>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Adiniz Soyadiniz"
                  value={contactForm.name}
                  onChange={(event) =>
                    setContactForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-2 block text-sm text-gray-300">E-posta</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="ornek@mail.com"
                  value={contactForm.email}
                  onChange={(event) =>
                    setContactForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className={inputClass}
                />
              </label>
            </div>

            <label>
              <span className="mb-2 block text-sm text-gray-300">Konu</span>
              <input
                type="text"
                name="subject"
                placeholder="Ornek: Yazilim Muhendisligi Staj Basvurusu"
                value={contactForm.subject}
                onChange={(event) =>
                  setContactForm((prev) => ({ ...prev, subject: event.target.value }))
                }
                className={inputClass}
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-gray-300">Mesajiniz</span>
              <textarea
                rows={5}
                name="message"
                placeholder="Mesajinizi yazin..."
                value={contactForm.message}
                onChange={(event) =>
                  setContactForm((prev) => ({ ...prev, message: event.target.value }))
                }
                className={`resize-none ${inputClass}`}
              />
            </label>

            <button
              type="submit"
              disabled={contactSubmitting}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-400/40 bg-gradient-to-r from-yellow-500 to-amber-400 px-6 py-3.5 font-semibold text-slate-900 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(250,204,21,0.45)] disabled:opacity-60 sm:w-auto"
            >
              {contactSubmitting ? "Gonderiliyor..." : "Mesaj Gonder"}
              {contactSubmitting ? (
                <Send size={16} />
              ) : (
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              )}
            </button>

            {contactStatus.text && (
              <p
                className={`text-sm ${
                  contactStatus.type === "error" ? "text-red-300" : "text-green-300"
                }`}
              >
                {contactStatus.text}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
