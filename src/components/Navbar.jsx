import { useState } from "react";
import { Menu, Sparkles, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Hakkımda", href: "#hakkimda" },
  { label: "Yetenekler", href: "#yetenekler" },
  { label: "Projeler", href: "#projeler" },
  { label: "CV", action: "cv" },
  { label: "İletişim", href: "#iletisim" },
];

export default function Navbar({ profileName, onOpenCv }) {
  const [open, setOpen] = useState(false);

  const handleNav = (item) => {
    setOpen(false);
    if (item.action === "cv") onOpenCv();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-yellow-500/10 bg-slate-900/80 backdrop-blur-xl">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
        aria-label="Ana menü"
      >
        <a
          href="#hero"
          className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.15em] text-luxury-gold uppercase"
        >
          <Sparkles size={16} />
          <span className="max-w-[140px] truncate sm:max-w-none">{profileName}</span>
        </a>

        <ul className="hidden items-center gap-6 md:flex">
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
                  onClick={() => onOpenCv()}
                  className="text-sm text-gray-300 transition-all duration-300 hover:text-yellow-400"
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="rounded-lg border border-yellow-500/30 p-2 text-yellow-400 transition-all duration-300 hover:bg-yellow-500/10 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <ul className="border-t border-yellow-500/10 bg-slate-900/95 px-4 py-3 md:hidden">
          {NAV_LINKS.map((item) => (
            <li key={item.label}>
              {item.href ? (
                <a
                  href={item.href}
                  onClick={() => handleNav(item)}
                  className="block py-3 text-base text-gray-200 transition-colors duration-300 hover:text-yellow-400"
                >
                  {item.label}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNav(item)}
                  className="block w-full py-3 text-left text-base text-gray-200 transition-colors duration-300 hover:text-yellow-400"
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
