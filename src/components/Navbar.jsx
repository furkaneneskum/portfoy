import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Hakkımda", href: "#hakkimda" },
  { label: "Yetenekler", href: "#yetenekler" },
  { label: "Projeler", href: "#projeler" },
  { label: "CV (TR)", action: "cv-tr" },
  { label: "CV (EN)", action: "cv-en" },
  { label: "İletişim", href: "#iletisim" },
];

export default function Navbar({ profileName, onOpenCv }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleNav = (item) => {
    setOpen(false);
    if (item.action === "cv-tr") onOpenCv("tr");
    if (item.action === "cv-en") onOpenCv("en");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-yellow-500/10 bg-slate-900/80 backdrop-blur-xl">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
        aria-label="Ana menü"
      >
        {/* Mobil: sol hamburger */}
        <button
          type="button"
          className="rounded-lg border border-yellow-500/30 p-2 text-yellow-400 transition-all duration-300 hover:bg-yellow-500/10 md:hidden"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-label="Menüyü aç"
        >
          <Menu size={22} />
        </button>

        <a
          href="#hero"
          className="text-sm font-semibold tracking-[0.12em] text-luxury-gold uppercase transition-opacity duration-300 hover:opacity-90 md:mr-auto"
        >
          <span className="block max-w-[160px] truncate text-center sm:max-w-none md:text-left">
            {profileName}
          </span>
        </a>

        {/* Masaüstü menü */}
        <ul className="hidden items-center gap-5 lg:gap-6 md:flex">
          {NAV_LINKS.map((item) => (
            <li key={item.label}>
              {item.href ? (
                <a
                  href={item.href}
                  className="text-sm text-gray-300 transition-all duration-300 hover:text-yellow-400"
                >
                  {item.label}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNav(item)}
                  className="text-sm text-gray-300 transition-all duration-300 hover:text-yellow-400"
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>

        {/* Mobil layout dengeleyici */}
        <div className="w-10 md:hidden" aria-hidden="true" />
      </nav>

      {/* Mobil sol çekmece */}
      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Menüyü kapat"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(85vw,280px)] flex-col border-r border-yellow-500/20 bg-slate-900 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-yellow-500/10 px-5 py-4">
              <p className="text-xs font-semibold tracking-[0.18em] text-yellow-400 uppercase">Menü</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-yellow-500/30 p-2 text-yellow-400 transition-all duration-300 hover:bg-yellow-500/10"
                aria-label="Menüyü kapat"
              >
                <X size={20} />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto px-3 py-4">
              {NAV_LINKS.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <a
                      href={item.href}
                      onClick={() => handleNav(item)}
                      className="block rounded-lg px-3 py-3.5 text-base text-gray-200 transition-colors duration-300 hover:bg-yellow-500/10 hover:text-yellow-400"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleNav(item)}
                      className="block w-full rounded-lg px-3 py-3.5 text-left text-base text-gray-200 transition-colors duration-300 hover:bg-yellow-500/10 hover:text-yellow-400"
                    >
                      {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <p className="border-t border-yellow-500/10 px-5 py-4 text-xs text-gray-500">
              {profileName}
            </p>
          </aside>
        </div>
      )}
    </header>
  );
}
