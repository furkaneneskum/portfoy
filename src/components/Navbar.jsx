import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Hakkımda", href: "#hakkimda" },
  { label: "Yetenekler", href: "#yetenekler" },
  { label: "Projeler", href: "#projeler" },
  { label: "CV (TR)", action: "cv-tr" },
  { label: "CV (EN)", action: "cv-en" },
  { label: "İletişim", href: "#iletisim" },
];

function MobileDrawer({ open, onClose, profileName, onNav }) {
  if (!open) return null;

  return createPortal(
    <div className="mobile-nav-drawer fixed inset-0 z-[9999] lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Menüyü kapat"
      />
      <aside
        className="absolute inset-y-0 left-0 flex w-[min(88vw,300px)] flex-col border-r border-yellow-500/25 bg-slate-900 shadow-2xl"
        aria-label="Mobil menü"
      >
        <div className="flex items-center justify-between border-b border-yellow-500/10 px-5 py-4">
          <p className="text-xs font-semibold tracking-[0.18em] text-yellow-400 uppercase">Menü</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-yellow-500/30 p-2.5 text-yellow-400"
            aria-label="Menüyü kapat"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_LINKS.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <a
                    href={item.href}
                    onClick={() => onNav(item)}
                    className="block rounded-xl px-4 py-4 text-base font-medium text-gray-100 active:bg-yellow-500/15"
                  >
                    {item.label}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNav(item)}
                    className="block w-full rounded-xl px-4 py-4 text-left text-base font-medium text-gray-100 active:bg-yellow-500/15"
                  >
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <p className="border-t border-yellow-500/10 px-5 py-4 text-xs text-gray-500">{profileName}</p>
      </aside>
    </div>,
    document.body
  );
}

function MobileNavStrip({ onNav }) {
  return (
    <div className="mobile-nav-strip border-t border-yellow-500/10 bg-slate-900/95 lg:hidden">
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2.5 sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV_LINKS.map((item) =>
          item.href ? (
            <a
              key={item.label}
              href={item.href}
              className="shrink-0 rounded-full border border-yellow-500/25 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-gray-200 active:bg-yellow-500/20"
            >
              {item.label}
            </a>
          ) : (
            <button
              key={item.label}
              type="button"
              onClick={() => onNav(item)}
              className="shrink-0 rounded-full border border-yellow-500/25 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-gray-200 active:bg-yellow-500/20"
            >
              {item.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}

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
    <header className="site-header sticky top-0 z-50 border-b border-yellow-500/10 bg-slate-900/95 backdrop-blur-xl">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8"
        aria-label="Ana menü"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none">
          <button
            type="button"
            className="mobile-nav-btn inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-yellow-500/40 bg-slate-800/80 text-yellow-400 touch-manipulation lg:hidden"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-label="Menüyü aç"
          >
            <Menu size={24} />
          </button>

          <a
            href="#hero"
            className="min-w-0 truncate text-sm font-semibold tracking-[0.1em] text-luxury-gold uppercase"
          >
            {profileName}
          </a>
        </div>

        <ul className="desktop-nav hidden items-center gap-5 lg:flex lg:gap-6">
          {NAV_LINKS.map((item) => (
            <li key={item.label}>
              {item.href ? (
                <a
                  href={item.href}
                  className="text-sm text-gray-300 transition-colors duration-300 hover:text-yellow-400"
                >
                  {item.label}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNav(item)}
                  className="text-sm text-gray-300 transition-colors duration-300 hover:text-yellow-400"
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <MobileNavStrip onNav={handleNav} />

      <MobileDrawer
        open={open}
        onClose={() => setOpen(false)}
        profileName={profileName}
        onNav={handleNav}
      />
    </header>
  );
}
