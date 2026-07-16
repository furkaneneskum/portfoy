import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  ArrowRight,
  Mail,
  Github,
  Linkedin,
  Code2,
  Database,
  Layers3,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  Settings,
  LogOut,
  Save,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Loader2,
  FileText,
} from "lucide-react";
import DigitalCv from "./components/DigitalCv";
import ContactSection from "./components/ContactSection";
import Navbar from "./components/Navbar";
import { auth, isFirebaseConfigured, firebaseProjectId, checkFirestoreHealth } from "./firebase/config";
import {
  DEFAULT_PROFILE,
  DEFAULT_SKILLS,
  subscribePortfolioData,
  updateProfile,
  addProject,
  deleteProject,
  uploadProjectImage,
  updateSkills,
  addMessage,
  markMessageAsRead,
  deleteMessage,
  seedDefaultsIfNeeded,
  fetchProjects,
  testFirestoreWrite,
  updateProject,
} from "./firebase/portfolioService";
import { normalizeExternalUrl, normalizeImageUrl, resolveImageUrl, resolveProfileImageUrl } from "./utils/url";

const SECRET_ADMIN_CODE = "furkanadmin";

export default function App() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");

  const [isAdminRoute, setIsAdminRoute] = useState(window.location.hash === "#admin");
  const [adminUnlocked, setAdminUnlocked] = useState(
    sessionStorage.getItem("portfolio_admin_unlocked") === "true"
  );
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [adminTab, setAdminTab] = useState("overview");
  const [adminError, setAdminError] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    tech: "",
    link: "",
    imageUrl: "",
  });
  const [projectImageFile, setProjectImageFile] = useState(null);
  const [projectEdits, setProjectEdits] = useState({});
  const [skillForm, setSkillForm] = useState({
    category: "Ana Diller",
    value: "",
  });
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [contactStatus, setContactStatus] = useState({ type: "", text: "" });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [cvLocale, setCvLocale] = useState(null);
  const [adminNotice, setAdminNotice] = useState("");
  const [profileDraft, setProfileDraft] = useState(DEFAULT_PROFILE);
  const secretCodeBufferRef = useRef("");

  useEffect(() => {
    if (!cvLocale) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setCvLocale(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [cvLocale]);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setDataLoading(false);
      return undefined;
    }

    const unsubscribe = subscribePortfolioData({
      onProfile: (data) => {
        setProfile(data);
        setProfileDraft(data);
      },
      onSkills: setSkills,
      onProjects: setProjects,
      onMessages: setMessages,
      onReady: () => setDataLoading(false),
      onError: () =>
        setDataError(
          "Firebase baglantisi kurulamadi. Firestore kurallarini kontrol et veya sayfayi yenile."
        ),
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!auth) return undefined;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdminAuthed(Boolean(user));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === "#admin" && !adminUnlocked) {
        window.location.hash = "#hero";
        return;
      }
      setIsAdminRoute(window.location.hash === "#admin");
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [adminUnlocked]);

  useEffect(() => {
    if (!isAdminRoute && isFirebaseConfigured() && !dataLoading) {
      fetchProjects()
        .then(setProjects)
        .catch((error) => {
          console.error("Proje senkron hatasi:", error);
        });
    }
  }, [isAdminRoute, dataLoading]);

  useEffect(() => {
    setProjectEdits((prev) => {
      const next = { ...prev };
      let changed = false;

      projects.forEach((project) => {
        if (next[project.id]) return;

        next[project.id] = {
          imageUrl: project.imageUrl || "",
          link: project.link && project.link !== "#" ? project.link : "",
        };
        changed = true;
      });

      Object.keys(next).forEach((id) => {
        if (!projects.some((project) => project.id === id)) {
          delete next[id];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [projects]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const tagName = event.target?.tagName?.toLowerCase();
      const isTypingElement =
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        event.target?.isContentEditable;

      if (isTypingElement || event.key.length !== 1) return;

      secretCodeBufferRef.current = (
        secretCodeBufferRef.current + event.key.toLowerCase()
      ).slice(-SECRET_ADMIN_CODE.length);

      if (secretCodeBufferRef.current === SECRET_ADMIN_CODE) {
        setAdminUnlocked(true);
        sessionStorage.setItem("portfolio_admin_unlocked", "true");
        window.location.hash = "#admin";
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (isAdminRoute && !adminUnlocked) {
      setIsAdminRoute(false);
      window.location.hash = "#hero";
    }
  }, [isAdminRoute, adminUnlocked]);

  const unreadCount = useMemo(
    () => messages.filter((item) => !item.read).length,
    [messages]
  );

  const totalSkills = useMemo(
    () => skills.reduce((total, category) => total + category.items.length, 0),
    [skills]
  );

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setAdminError("");
    setActionLoading(true);
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      setAdminPassword("");
    } catch {
      setAdminError("E-posta veya sifre hatali.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    await signOut(auth);
  };

  const handleSaveProfile = async () => {
    setActionLoading(true);
    setAdminNotice("");
    try {
      await updateProfile({
        name: profileDraft.name,
        title: profileDraft.title,
        slogan: profileDraft.slogan,
        about: profileDraft.about,
        email: profileDraft.email,
        phone: profileDraft.phone,
        github: profileDraft.github,
        linkedin: profileDraft.linkedin,
        profileImageUrl: normalizeImageUrl(profileDraft.profileImageUrl),
        aboutImageUrl: normalizeImageUrl(profileDraft.aboutImageUrl),
      });
      setProfile(profileDraft);
      setAdminNotice("Profil Firebase'e kaydedildi.");
    } catch (error) {
      console.error(error);
      setAdminNotice("Profil kaydedilemedi.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddProject = async (event) => {
    event.preventDefault();
    setAdminNotice("");

    if (!auth.currentUser) {
      setAdminNotice("Admin oturumu yok. Lutfen tekrar giris yap.");
      return;
    }

    if (!projectForm.title.trim() || !projectForm.description.trim()) {
      setAdminNotice("Proje basligi ve aciklama zorunludur.");
      return;
    }

    const techList = projectForm.tech
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (techList.length === 0) {
      setAdminNotice("En az bir teknoloji yaz (ornek: React, Python).");
      return;
    }

    setActionLoading(true);
    try {
      const projectData = {
        title: projectForm.title.trim(),
        description: projectForm.description.trim(),
        tech: techList,
        link: normalizeExternalUrl(projectForm.link) || "#",
        imageUrl: normalizeImageUrl(projectForm.imageUrl),
      };

      const docRef = await addProject(projectData);
      let notice = "";

      if (projectImageFile && docRef.id && !projectData.imageUrl) {
        try {
          await uploadProjectImage(docRef.id, projectImageFile);
        } catch (uploadError) {
          console.error("Fotograf yukleme hatasi:", uploadError);
          notice =
            "Proje eklendi. Storage Blaze plan gerektirir; fotograf icin URL alanini kullan.";
        }
      }

      const latestProjects = await fetchProjects();
      setProjects(latestProjects);

      setProjectForm({ title: "", description: "", tech: "", link: "", imageUrl: "" });
      setProjectImageFile(null);
      setAdminNotice(
        notice || `Proje eklendi. Firestore'da ${latestProjects.length} proje var.`
      );
    } catch (error) {
      console.error("Proje ekleme hatasi:", error);
      setAdminNotice(
        `Proje eklenemedi: ${error.code || "bilinmeyen-hata"} - ${error.message}`
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveProjectImageUrl = async (projectId) => {
    const draft = projectEdits[projectId];
    if (!draft) return;

    const imageUrl = normalizeImageUrl(draft.imageUrl);
    setActionLoading(true);
    setAdminNotice("");
    try {
      await updateProject(projectId, { imageUrl });
      setProjectEdits((prev) => ({
        ...prev,
        [projectId]: { ...prev[projectId], imageUrl },
      }));
      setAdminNotice("Proje fotograf URL kaydedildi.");
    } catch (error) {
      setAdminNotice(
        `Fotograf URL kaydedilemedi: ${error.code || "hata"} - ${error.message}`
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveProjectLink = async (projectId) => {
    const draft = projectEdits[projectId];
    if (!draft) return;

    setActionLoading(true);
    setAdminNotice("");
    try {
      await updateProject(projectId, { link: draft.link });
      setProjectEdits((prev) => ({
        ...prev,
        [projectId]: { ...prev[projectId], link: draft.link },
      }));
      setAdminNotice("Proje linki kaydedildi.");
    } catch (error) {
      setAdminNotice(`Link kaydedilemedi: ${error.code || "hata"} - ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    setActionLoading(true);
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((item) => item.id !== id));
      setAdminNotice("Proje silindi.");
    } catch (error) {
      console.error(error);
      setAdminNotice("Proje silinemedi.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddSkill = async (event) => {
    event.preventDefault();
    if (!skillForm.value) return;

    const nextSkills = skills.map((item) =>
      item.category === skillForm.category
        ? { ...item, items: [...item.items, skillForm.value] }
        : item
    );

    setActionLoading(true);
    try {
      await updateSkills(nextSkills);
      setSkillForm((prev) => ({ ...prev, value: "" }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSkill = async (category, value) => {
    const nextSkills = skills.map((item) =>
      item.category === category
        ? { ...item, items: item.items.filter((skill) => skill !== value) }
        : item
    );

    setActionLoading(true);
    try {
      await updateSkills(nextSkills);
    } finally {
      setActionLoading(false);
    }
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();

    const name = contactForm.name.trim();
    const email = contactForm.email.trim();
    const subject = contactForm.subject.trim();
    const message = contactForm.message.trim();

    if (!name || !email || !message) {
      setContactStatus({ type: "error", text: "Lütfen tüm zorunlu alanları doldur." });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setContactStatus({ type: "error", text: "Geçerli bir e-posta adresi yaz." });
      return;
    }

    if (!isFirebaseConfigured()) {
      setContactStatus({
        type: "error",
        text: "Mesaj servisi yapılandırılmamış. Daha sonra tekrar dene.",
      });
      return;
    }

    setContactSubmitting(true);
    setContactStatus({ type: "", text: "" });

    const submitWithTimeout = Promise.race([
      addMessage({ name, email, subject, message }),
      new Promise((_, reject) => {
        setTimeout(() => {
          const error = new Error("Baglanti zaman asimina ugradi.");
          error.code = "timeout";
          reject(error);
        }, 20000);
      }),
    ]);

    try {
      await submitWithTimeout;
      setContactForm({ name: "", email: "", subject: "", message: "" });
      setContactStatus({ type: "success", text: "Mesajın başarıyla gönderildi." });
      setTimeout(() => setContactStatus({ type: "", text: "" }), 4000);
    } catch (error) {
      console.error("Iletisim formu hatasi:", error);

      let text = "Mesaj gönderilemedi. Lütfen tekrar dene.";
      if (error.code === "permission-denied") {
        text = "Yetki hatası. Firestore mesaj kuralları kontrol edilmeli.";
      } else if (error.code === "unavailable" || error.code === "timeout") {
        text = "Bağlantı sorunu. İnterneti kontrol edip tekrar dene.";
      } else if (error.code === "firebase/not-configured") {
        text = "Site yapilandirmasi eksik. Daha sonra tekrar dene.";
      }

      setContactStatus({ type: "error", text });
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleMarkMessageRead = async (id) => {
    await markMessageAsRead(id);
  };

  const handleDeleteMessage = async (id) => {
    await deleteMessage(id);
  };

  const inputClass =
    "w-full rounded-lg border border-yellow-500/30 bg-slate-900/70 px-4 py-3 text-sm text-gray-100 outline-none transition-all duration-300 focus:border-yellow-400";

  const renderLoading = () => (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-gray-100">
      <div className="flex items-center gap-3 text-yellow-400">
        <Loader2 className="animate-spin" size={22} />
        <span>Veriler yukleniyor...</span>
      </div>
    </div>
  );

  const renderFirebaseWarning = () => (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-lg rounded-2xl border border-red-500/30 bg-red-950/40 p-6 text-center">
        <p className="text-lg font-semibold text-red-200">Firebase yapilandirmasi eksik</p>
        <p className="mt-3 text-sm text-red-100/90">
          Lokal icin `.env` dosyasini doldur. GitHub Pages icin repo Settings → Secrets and
          variables → Actions bolumune 6 adet `VITE_FIREBASE_*` secret ekle, sonra deploy&apos;u
          yeniden calistir.
        </p>
      </div>
    </div>
  );

  const renderAdminPanel = () => (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-yellow-500/20 bg-slate-800/50 p-5 backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-yellow-400">Admin Panel</p>
          <h2 className="mt-2 text-2xl font-semibold text-gray-100">Firebase Yonetim Merkezi</h2>
        </div>
        <div className="flex gap-3">
          <a
            href="#hero"
            className="rounded-lg border border-yellow-500/30 px-4 py-2 text-sm text-yellow-300 transition-all duration-300 hover:bg-yellow-500 hover:text-slate-900"
          >
            Siteye Don
          </a>
          <button
            type="button"
            onClick={handleAdminLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-red-400/40 px-4 py-2 text-sm text-red-300 transition-all duration-300 hover:bg-red-500 hover:text-white"
          >
            <LogOut size={14} />
            Cikis
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-yellow-500/20 bg-slate-800/50 p-4 backdrop-blur-lg">
          {[
            { id: "overview", label: "Genel Bakis", icon: <LayoutDashboard size={16} /> },
            { id: "projects", label: "Proje Yonetimi", icon: <FolderKanban size={16} /> },
            { id: "skills", label: "Yetenek Yonetimi", icon: <Code2 size={16} /> },
            { id: "messages", label: "Mesaj Kutusu", icon: <MessageSquare size={16} /> },
            { id: "profile", label: "Profil & Fotograf", icon: <Settings size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAdminTab(tab.id)}
              className={`mb-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all duration-300 ${
                adminTab === tab.id
                  ? "bg-yellow-500 text-slate-900"
                  : "text-gray-300 hover:bg-slate-700/70 hover:text-yellow-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </aside>

        <section className="rounded-2xl border border-yellow-500/20 bg-slate-800/50 p-5 backdrop-blur-lg sm:p-6">
          {adminNotice && (
            <p className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
              {adminNotice}
            </p>
          )}
          {adminTab === "overview" && (
            <div>
              <h3 className="text-xl font-semibold text-yellow-400">Genel Bakis</h3>
              <div className="mt-4 rounded-xl border border-yellow-500/20 bg-slate-900/60 p-4 text-sm text-gray-300">
                <p>Firebase Proje: {firebaseProjectId || "Tanimli degil"}</p>
                <p className="mt-1">Admin: {auth.currentUser?.email || "Giris yapilmamis"}</p>
                <p className="mt-1">Koleksiyon: projects (kok dizin)</p>
              </div>
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/30 p-4 text-xs text-amber-100">
                <p className="font-semibold">Onemli: Iki ayri Rules editörü var</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>
                    <strong>Firestore Database -&gt; Rules</strong> = proje/veri baglantisi
                  </li>
                  <li>
                    <strong>Storage -&gt; Rules</strong> = fotograf yukleme/gosterme
                  </li>
                  <li>Bu ikisini birbirine karistirma (JSON Realtime Database rules kullanma)</li>
                </ul>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!auth.currentUser) {
                      setAdminNotice("Once admin girisi yap, sonra bu butona bas.");
                      return;
                    }
                    setActionLoading(true);
                    try {
                      await checkFirestoreHealth();
                      await seedDefaultsIfNeeded();
                      const latest = await fetchProjects();
                      setProjects(latest);
                      setAdminNotice(`Kurulum tamamlandi. ${latest.length} proje yuklendi.`);
                    } catch (error) {
                      setAdminNotice(
                        `Kurulum hatasi: ${error.code || "hata"} - ${error.message}`
                      );
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  disabled={actionLoading}
                  className="rounded-lg bg-yellow-500 px-4 py-2 text-xs font-semibold text-slate-900 transition-all duration-300 hover:bg-yellow-400 disabled:opacity-60"
                >
                  Ilk Kurulumu Tamamla (Projeleri Yukle)
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await checkFirestoreHealth();
                      const latest = await fetchProjects();
                      setProjects(latest);
                      if (latest.length === 0) {
                        setAdminNotice(
                          auth.currentUser
                            ? 'Baglanti OK. Veritabani bos. "Ilk Kurulumu Tamamla" butonuna bas.'
                            : "Baglanti OK. Veritabani bos. Once admin girisi yap."
                        );
                      } else {
                        setAdminNotice(
                          `Firebase baglantisi OK. Projeler: ${latest.length} adet.`
                        );
                      }
                    } catch (error) {
                      setAdminNotice(`Firebase kontrol hatasi: ${error.message}`);
                    }
                  }}
                  className="rounded-lg border border-yellow-500/30 px-3 py-2 text-xs text-yellow-300 transition-all duration-300 hover:bg-yellow-500 hover:text-slate-900"
                >
                  Firebase Baglantisini Kontrol Et
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const latest = await fetchProjects();
                      setProjects(latest);
                      setAdminNotice(`Projeler yenilendi (${latest.length} adet).`);
                    } catch (error) {
                      setAdminNotice(`Okuma hatasi: ${error.code} - ${error.message}`);
                    }
                  }}
                  className="rounded-lg border border-yellow-500/30 px-3 py-2 text-xs text-yellow-300 transition-all duration-300 hover:bg-yellow-500 hover:text-slate-900"
                >
                  Projeleri Oku
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const testId = await testFirestoreWrite();
                      const latest = await fetchProjects();
                      setProjects(latest);
                      setAdminNotice(
                        `Yazma testi basarili. Test ID: ${testId}. Toplam: ${latest.length} proje.`
                      );
                    } catch (error) {
                      setAdminNotice(
                        `Yazma testi basarisiz: ${error.code || "hata"} - ${error.message}`
                      );
                    }
                  }}
                  className="rounded-lg border border-yellow-500/30 px-3 py-2 text-xs text-yellow-300 transition-all duration-300 hover:bg-yellow-500 hover:text-slate-900"
                >
                  Firestore Yazma Testi
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!auth.currentUser) {
                      setAdminNotice("Baslangic verisi icin admin girisi yap.");
                      return;
                    }
                    try {
                      await seedDefaultsIfNeeded();
                      const latest = await fetchProjects();
                      setProjects(latest);
                      setAdminNotice(`Baslangic verileri yuklendi (${latest.length} proje).`);
                    } catch (error) {
                      setAdminNotice(
                        `Baslangic verisi hatasi: ${error.code} - ${error.message}`
                      );
                    }
                  }}
                  className="rounded-lg border border-yellow-500/30 px-3 py-2 text-xs text-yellow-300 transition-all duration-300 hover:bg-yellow-500 hover:text-slate-900"
                >
                  Baslangic Verilerini Yukle
                </button>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-yellow-500/20 bg-slate-900/60 p-4">
                  <p className="text-xs text-gray-400">Toplam Proje</p>
                  <p className="mt-2 text-2xl font-bold text-yellow-300">{projects.length}</p>
                </div>
                <div className="rounded-xl border border-yellow-500/20 bg-slate-900/60 p-4">
                  <p className="text-xs text-gray-400">Toplam Yetenek</p>
                  <p className="mt-2 text-2xl font-bold text-yellow-300">{totalSkills}</p>
                </div>
                <div className="rounded-xl border border-yellow-500/20 bg-slate-900/60 p-4">
                  <p className="text-xs text-gray-400">Toplam Mesaj</p>
                  <p className="mt-2 text-2xl font-bold text-yellow-300">{messages.length}</p>
                </div>
                <div className="rounded-xl border border-yellow-500/20 bg-slate-900/60 p-4">
                  <p className="text-xs text-gray-400">Okunmamis</p>
                  <p className="mt-2 text-2xl font-bold text-yellow-300">{unreadCount}</p>
                </div>
              </div>
            </div>
          )}

          {adminTab === "projects" && (
            <div>
              <h3 className="text-xl font-semibold text-yellow-400">Proje Yonetimi</h3>
              <p className="mt-2 text-xs text-amber-200">
                Firebase Storage Blaze plan istiyor. Fotograf icin asagidaki URL alanini kullan
                (ornek: /projects/kapak.jpg veya https://i.imgur.com/xxx.jpg).
              </p>
              <form onSubmit={handleAddProject} className="mt-6 grid gap-4 md:grid-cols-2">
                <input
                  value={projectForm.title}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Proje basligi"
                  className={inputClass}
                />
                <input
                  value={projectForm.link}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, link: event.target.value }))
                  }
                  placeholder="Proje linki (ornek: https://github.com/kullanici/proje)"
                  className={inputClass}
                />
                <textarea
                  value={projectForm.description}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Proje aciklamasi"
                  rows={3}
                  className={`md:col-span-2 ${inputClass}`}
                />
                <input
                  value={projectForm.tech}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, tech: event.target.value }))
                  }
                  placeholder="Teknolojiler (virgulle ayir)"
                  className={`md:col-span-2 ${inputClass}`}
                />
                <input
                  value={projectForm.imageUrl}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, imageUrl: event.target.value }))
                  }
                  placeholder="Fotograf URL (ornek: /projects/kapak.jpg)"
                  className={`md:col-span-2 ${inputClass}`}
                />
                <p className="md:col-span-2 text-xs text-gray-500">
                  Resmi once{" "}
                  <code className="text-yellow-400/80">portfoy/public/projects/</code> klasorune
                  kopyala, sonra URL olarak{" "}
                  <code className="text-yellow-400/80">/projects/dosyaadi.jpg</code> yaz.
                </p>
                <details className="md:col-span-2 rounded-lg border border-yellow-500/20 bg-slate-900/40 p-3 text-xs text-gray-400">
                  <summary className="cursor-pointer text-yellow-300">
                    Dosyadan yukle (Blaze plan gerekir)
                  </summary>
                  <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-yellow-500/40 bg-slate-900/50 px-4 py-4 text-sm text-gray-300">
                    <Upload size={18} className="mb-2 text-yellow-400" />
                    {projectImageFile ? projectImageFile.name : "Dosya sec"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => setProjectImageFile(event.target.files?.[0] || null)}
                    />
                  </label>
                </details>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-500 px-4 py-3 text-sm font-semibold text-slate-900 transition-all duration-300 hover:bg-yellow-400 disabled:opacity-60"
                >
                  <Plus size={16} />
                  Proje Ekle
                </button>
              </form>

              <div className="mt-6 space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex flex-col gap-3 rounded-xl border border-yellow-500/20 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex gap-4">
                      {projectEdits[project.id]?.imageUrl || project.imageUrl ? (
                        <img
                          src={resolveImageUrl(
                            projectEdits[project.id]?.imageUrl || project.imageUrl
                          )}
                          alt={project.title}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-yellow-500/20 bg-slate-800">
                          <ImageIcon size={20} className="text-yellow-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-100">{project.title}</p>
                        <p className="mt-1 text-sm text-gray-400">{project.description}</p>
                        {project.imageUrl ? (
                          <p className="mt-1 text-[10px] text-green-400">Fotograf URL kayitli</p>
                        ) : (
                          <p className="mt-1 text-[10px] text-red-300">
                            Fotograf URL yok - asagiya URL yapistir
                          </p>
                        )}
                        <div className="mt-2 flex gap-2">
                          <input
                            value={projectEdits[project.id]?.imageUrl ?? ""}
                            onChange={(event) =>
                              setProjectEdits((prev) => ({
                                ...prev,
                                [project.id]: {
                                  ...prev[project.id],
                                  imageUrl: event.target.value,
                                },
                              }))
                            }
                            placeholder="Fotograf URL (/projects/proje1.jpg)"
                            className={`flex-1 ${inputClass}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveProjectImageUrl(project.id)}
                            disabled={actionLoading}
                            className="shrink-0 rounded-lg border border-yellow-500/40 px-3 py-2 text-xs font-medium text-yellow-300 transition-all duration-300 hover:bg-yellow-500 hover:text-slate-900 disabled:opacity-60"
                          >
                            URL Kaydet
                          </button>
                        </div>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                          <input
                            value={projectEdits[project.id]?.link ?? ""}
                            onChange={(event) =>
                              setProjectEdits((prev) => ({
                                ...prev,
                                [project.id]: {
                                  ...prev[project.id],
                                  link: event.target.value,
                                },
                              }))
                            }
                            placeholder="https://github.com/kullanici/proje"
                            className={`flex-1 ${inputClass}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveProjectLink(project.id)}
                            disabled={actionLoading}
                            className="shrink-0 rounded-lg border border-yellow-500/40 px-3 py-2 text-xs font-medium text-yellow-300 transition-all duration-300 hover:bg-yellow-500 hover:text-slate-900 disabled:opacity-60"
                          >
                            Link Kaydet
                          </button>
                        </div>
                        <details className="mt-2 rounded-lg border border-yellow-500/20 bg-slate-900/40 p-2 text-xs text-gray-400">
                          <summary className="cursor-pointer text-yellow-300">
                            Dosyadan yukle (Blaze plan gerekir)
                          </summary>
                          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-yellow-300">
                            <Upload size={12} />
                            Dosya sec
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;
                                setActionLoading(true);
                                try {
                                  const imageUrl = await uploadProjectImage(project.id, file);
                                  setProjectEdits((prev) => ({
                                    ...prev,
                                    [project.id]: { ...prev[project.id], imageUrl },
                                  }));
                                  setAdminNotice("Proje fotografi Storage'a yuklendi.");
                                } catch (error) {
                                  setAdminNotice(
                                    `Fotograf yuklenemedi: ${error.code || "hata"} - ${error.message}. URL yontemini kullan.`
                                  );
                                } finally {
                                  setActionLoading(false);
                                  event.target.value = "";
                                }
                              }}
                            />
                          </label>
                        </details>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(project.id)}
                      className="inline-flex items-center gap-2 self-start rounded-md border border-red-400/40 px-3 py-2 text-xs text-red-300 transition-all duration-300 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={14} />
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {adminTab === "skills" && (
            <div>
              <h3 className="text-xl font-semibold text-yellow-400">Yetenek Yonetimi</h3>
              <form onSubmit={handleAddSkill} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <select
                  value={skillForm.category}
                  onChange={(event) =>
                    setSkillForm((prev) => ({ ...prev, category: event.target.value }))
                  }
                  className={inputClass}
                >
                  {skills.map((item) => (
                    <option key={item.category} value={item.category}>
                      {item.category}
                    </option>
                  ))}
                </select>
                <input
                  value={skillForm.value}
                  onChange={(event) =>
                    setSkillForm((prev) => ({ ...prev, value: event.target.value }))
                  }
                  placeholder="Yeni yetenek"
                  className={`flex-1 ${inputClass}`}
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-500 px-4 py-3 text-sm font-semibold text-slate-900 transition-all duration-300 hover:bg-yellow-400"
                >
                  <Plus size={16} />
                  Ekle
                </button>
              </form>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {skills.map((category) => (
                  <div
                    key={category.category}
                    className="rounded-xl border border-yellow-500/20 bg-slate-900/60 p-4"
                  >
                    <p className="mb-3 font-medium text-yellow-300">{category.category}</p>
                    <div className="space-y-2">
                      {category.items.map((skill) => (
                        <div key={skill} className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSkill(category.category, skill)}
                            className="rounded px-2 py-1 text-xs text-red-300 transition-all duration-300 hover:bg-red-500 hover:text-white"
                          >
                            Sil
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {adminTab === "messages" && (
            <div>
              <h3 className="text-xl font-semibold text-yellow-400">Mesaj Kutusu</h3>
              <div className="mt-6 space-y-3">
                {messages.length === 0 && (
                  <p className="text-sm text-gray-400">Henuz gelen mesaj bulunmuyor.</p>
                )}
                {messages.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-4 ${
                      item.read
                        ? "border-white/10 bg-slate-900/50"
                        : "border-yellow-500/35 bg-slate-900/70"
                    }`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-gray-100">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          {item.email} - {item.createdAt}
                        </p>
                        {item.subject && (
                          <p className="mt-1 text-xs font-medium text-yellow-300/90">
                            Konu: {item.subject}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!item.read && (
                          <button
                            type="button"
                            onClick={() => handleMarkMessageRead(item.id)}
                            className="rounded-md border border-yellow-500/40 px-3 py-1 text-xs text-yellow-300 transition-all duration-300 hover:bg-yellow-500 hover:text-slate-900"
                          >
                            Okundu
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(item.id)}
                          className="rounded-md border border-red-400/40 px-3 py-1 text-xs text-red-300 transition-all duration-300 hover:bg-red-500 hover:text-white"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-gray-300">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {adminTab === "profile" && (
            <div>
              <h3 className="text-xl font-semibold text-yellow-400">Profil & Fotograf</h3>
              <p className="mt-2 text-xs text-amber-200">
                Storage Blaze plan istemezsen fotograflari public klasorune koyup URL ile ekle.
              </p>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-yellow-500/20 bg-slate-900/60 p-4">
                  <p className="mb-3 text-sm text-gray-300">Profil Fotografi (Hero)</p>
                  {profileDraft.profileImageUrl ? (
                    <img
                      src={resolveImageUrl(profileDraft.profileImageUrl)}
                      alt="Profil"
                      className="mb-4 h-40 w-40 rounded-full object-cover"
                    />
                  ) : (
                    <div className="mb-4 flex h-40 w-40 items-center justify-center rounded-full border border-yellow-500/20 bg-slate-800">
                      <ImageIcon className="text-yellow-400" />
                    </div>
                  )}
                  <input
                    value={profileDraft.profileImageUrl || ""}
                    onChange={(event) =>
                      setProfileDraft((prev) => ({
                        ...prev,
                        profileImageUrl: event.target.value,
                      }))
                    }
                    placeholder="/projects/profil.jpg"
                    className={inputClass}
                  />
                </div>

                <div className="rounded-xl border border-yellow-500/20 bg-slate-900/60 p-4">
                  <p className="mb-3 text-sm text-gray-300">Hakkimda Fotografi</p>
                  {profileDraft.aboutImageUrl ? (
                    <img
                      src={resolveImageUrl(profileDraft.aboutImageUrl)}
                      alt="Hakkimda"
                      className="mb-4 h-40 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="mb-4 flex h-40 w-full items-center justify-center rounded-xl border border-yellow-500/20 bg-slate-800">
                      <ImageIcon className="text-yellow-400" />
                    </div>
                  )}
                  <input
                    value={profileDraft.aboutImageUrl || ""}
                    onChange={(event) =>
                      setProfileDraft((prev) => ({
                        ...prev,
                        aboutImageUrl: event.target.value,
                      }))
                    }
                    placeholder="/projects/hakkimda.jpg"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <label>
                  <span className="mb-2 block text-sm text-gray-300">Isim</span>
                  <input
                    value={profileDraft.name}
                    onChange={(event) =>
                      setProfileDraft((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className={inputClass}
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm text-gray-300">Unvan</span>
                  <input
                    value={profileDraft.title}
                    onChange={(event) =>
                      setProfileDraft((prev) => ({ ...prev, title: event.target.value }))
                    }
                    className={inputClass}
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm text-gray-300">Slogan</span>
                  <textarea
                    rows={3}
                    value={profileDraft.slogan}
                    onChange={(event) =>
                      setProfileDraft((prev) => ({ ...prev, slogan: event.target.value }))
                    }
                    className={inputClass}
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm text-gray-300">Hakkimda Metni</span>
                  <textarea
                    rows={6}
                    value={profileDraft.about}
                    onChange={(event) =>
                      setProfileDraft((prev) => ({ ...prev, about: event.target.value }))
                    }
                    className={inputClass}
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm text-gray-300">E-posta</span>
                  <input
                    value={profileDraft.email}
                    onChange={(event) =>
                      setProfileDraft((prev) => ({ ...prev, email: event.target.value }))
                    }
                    className={inputClass}
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm text-gray-300">Telefon</span>
                  <input
                    value={profileDraft.phone || ""}
                    onChange={(event) =>
                      setProfileDraft((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    placeholder="+90 5XX XXX XX XX"
                    className={inputClass}
                  />
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm text-gray-300">GitHub</span>
                    <input
                      value={profileDraft.github}
                      onChange={(event) =>
                        setProfileDraft((prev) => ({ ...prev, github: event.target.value }))
                      }
                      className={inputClass}
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm text-gray-300">LinkedIn</span>
                    <input
                      value={profileDraft.linkedin}
                      onChange={(event) =>
                        setProfileDraft((prev) => ({ ...prev, linkedin: event.target.value }))
                      }
                      className={inputClass}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 self-start rounded-lg bg-yellow-500 px-4 py-3 text-sm font-semibold text-slate-900 transition-all duration-300 hover:bg-yellow-400 disabled:opacity-60"
                >
                  <Save size={16} />
                  Firebase&apos;e Kaydet
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );

  if (!isFirebaseConfigured()) {
    return (
      <div className="min-h-screen bg-slate-900 text-gray-100">
        {renderFirebaseWarning()}
      </div>
    );
  }

  if (dataLoading) return renderLoading();

  if (isAdminRoute && !isAdminAuthed) {
    return (
      <div className="min-h-screen bg-slate-900 text-gray-100 antialiased">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(234,179,8,0.14),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.06),transparent_30%),linear-gradient(to_bottom_right,#0f172a,#111827,#020617)]" />
        <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
          <form
            onSubmit={handleAdminLogin}
            className="w-full rounded-2xl border border-yellow-500/20 bg-slate-800/55 p-6 shadow-2xl backdrop-blur-lg"
          >
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-yellow-400">
              <ShieldCheck size={14} />
              Firebase Admin Login
            </p>
            <h1 className="mt-3 text-2xl font-semibold">Yonetici Paneli</h1>
            <p className="mt-2 text-sm text-gray-400">
              Firebase Authentication ile guvenli giris yap.
            </p>
            <label className="mt-6 block">
              <span className="mb-2 block text-sm text-gray-300">E-posta</span>
              <input
                type="email"
                value={adminEmail}
                onChange={(event) => setAdminEmail(event.target.value)}
                placeholder="admin@mail.com"
                className={inputClass}
              />
            </label>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm text-gray-300">Sifre</span>
              <input
                type="password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                placeholder="Sifre giriniz"
                className={inputClass}
              />
            </label>
            {adminError && <p className="mt-3 text-sm text-red-300">{adminError}</p>}
            <button
              type="submit"
              disabled={actionLoading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-500 px-4 py-3 font-semibold text-slate-900 transition-all duration-300 hover:bg-yellow-400 disabled:opacity-60"
            >
              <ShieldCheck size={16} />
              Giris Yap
            </button>
            <a
              href="#hero"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-yellow-500/30 px-4 py-3 text-sm text-yellow-300 transition-all duration-300 hover:bg-slate-700/70"
            >
              <ArrowRight size={14} />
              Siteye Don
            </a>
          </form>
        </main>
      </div>
    );
  }

  if (isAdminRoute && isAdminAuthed) {
    return (
      <div className="min-h-screen bg-slate-900 text-gray-100 antialiased selection:bg-yellow-500/30">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(234,179,8,0.14),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.06),transparent_30%),linear-gradient(to_bottom_right,#0f172a,#111827,#020617)]" />
        {renderAdminPanel()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 antialiased selection:bg-yellow-500/30">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(234,179,8,0.14),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.06),transparent_30%),linear-gradient(to_bottom_right,#0f172a,#111827,#020617)]" />

      {dataError && (
        <div className="border-b border-amber-500/30 bg-amber-950/40 px-4 py-2 text-center text-sm text-amber-200">
          {dataError}
        </div>
      )}

      <Navbar profileName={profile.name} onOpenCv={setCvLocale} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section
          id="hero"
          className="flex min-h-[88vh] flex-col items-center justify-center text-center"
        >
          <img
            src={resolveProfileImageUrl(profile.profileImageUrl)}
            alt={profile.name}
            className="mb-8 h-44 w-44 rounded-full border-2 border-yellow-500/40 object-cover object-center shadow-lg shadow-yellow-500/20 sm:h-52 sm:w-52 md:h-60 md:w-60"
          />

          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1 text-xs tracking-[0.18em] text-yellow-400 uppercase">
            <Sparkles size={14} />
            Staj & Portföy
          </p>

          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            {profile.name}
          </h1>
          <p className="mt-4 text-lg text-gray-300 sm:text-2xl">{profile.title}</p>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-gray-300 sm:text-lg">
            {profile.slogan}
          </p>

          <p className="mt-6 max-w-2xl rounded-xl border border-yellow-500/20 bg-slate-800/40 px-5 py-3 text-sm text-gray-300">
            Yazılım mühendisliği stajı için başvuruda bulunuyorum. Projelerimi inceleyebilir,
            CV&apos;mi indirebilir veya doğrudan iletişime geçebilirsiniz.
          </p>

          <div className="mt-10 flex flex-col flex-wrap items-center justify-center gap-4 sm:flex-row">
            <a
              href="#projeler"
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-400/40 bg-gradient-to-r from-yellow-500 to-amber-400 px-6 py-3 font-semibold text-slate-900 shadow-[0_0_0px_rgba(250,204,21,0.0)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(250,204,21,0.35)]"
            >
              Projelerimi Gör
              <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <button
              type="button"
              onClick={() => setCvLocale("tr")}
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-500/50 bg-transparent px-6 py-3 font-semibold text-yellow-400 transition-all duration-300 hover:scale-[1.03] hover:border-yellow-400 hover:bg-yellow-500/10 hover:shadow-[0_0_24px_rgba(250,204,21,0.2)]"
            >
              <FileText size={17} />
              <span className="sm:hidden">CV (TR)</span>
              <span className="hidden sm:inline">CV Görüntüle (TR)</span>
            </button>
            <button
              type="button"
              onClick={() => setCvLocale("en")}
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-500/40 bg-slate-800/70 px-6 py-3 font-semibold text-yellow-400 backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:bg-slate-700/70 hover:shadow-[0_0_24px_rgba(250,204,21,0.25)]"
            >
              <FileText size={17} />
              <span className="sm:hidden">CV (EN)</span>
              <span className="hidden sm:inline">View CV (EN)</span>
            </button>
            <a
              href="#iletisim"
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-500/40 bg-slate-800/70 px-6 py-3 font-semibold text-yellow-400 backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:bg-slate-700/70 hover:shadow-[0_0_24px_rgba(250,204,21,0.25)]"
            >
              İletişime Geç
              <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </section>

        <section id="hakkimda" className="py-20" aria-labelledby="about-heading">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-slate-800/45 p-2 shadow-2xl backdrop-blur-lg">
              {profile.aboutImageUrl ? (
                <img
                  src={resolveImageUrl(profile.aboutImageUrl)}
                  alt="Hakkımda"
                  className="h-[280px] w-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex min-h-[280px] items-center justify-center">
                  <GraduationCap className="h-20 w-20 text-yellow-400" />
                </div>
              )}
            </div>

            <div>
              <h2 id="about-heading" className="mb-5 font-display text-3xl font-semibold text-yellow-400">
                Hakkımda
              </h2>
              <p className="leading-relaxed text-gray-300">{profile.about}</p>
            </div>
          </div>
        </section>

        <section id="yetenekler" className="py-20" aria-labelledby="skills-heading">
          <h2 id="skills-heading" className="mb-8 font-display text-3xl font-semibold text-yellow-400">
            Yetenekler
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {skills.map((skill) => (
              <article
                key={skill.category}
                className="rounded-2xl border border-yellow-500/30 bg-slate-800/45 p-6 shadow-lg shadow-black/20 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-yellow-400/60 hover:shadow-yellow-500/10"
              >
                <div className="mb-4 inline-flex items-center gap-2 text-yellow-400">
                  {skill.category === "Ana Diller" && <Code2 size={18} />}
                  {skill.category === "Frontend" && <Layers3 size={18} />}
                  {(skill.category === "Temel Mühendislik" ||
                    skill.category === "Temel Muhendislik") && <Database size={18} />}
                  <h3 className="text-lg font-semibold text-gray-100">{skill.category}</h3>
                </div>
                <ul className="space-y-2 text-gray-300">
                  {skill.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="projeler" className="py-20" aria-labelledby="projects-heading">
          <h2 id="projects-heading" className="mb-8 font-display text-3xl font-semibold text-yellow-400">
            Projeler
          </h2>
          {projects.length === 0 ? (
            <p className="text-gray-400">Henüz proje eklenmedi.</p>
          ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project) => {
              const projectLink = normalizeExternalUrl(project.link);
              return (
              <article
                key={project.id}
                className="relative overflow-hidden rounded-2xl border border-yellow-500/25 bg-slate-800/50 shadow-xl shadow-black/30 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/60 hover:shadow-yellow-500/10"
              >
                {project.imageUrl ? (
                  <img
                    src={resolveImageUrl(project.imageUrl)}
                    alt={project.title}
                    className="h-44 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center border-b border-yellow-500/10 bg-slate-900/50">
                    <ImageIcon className="text-yellow-500/60" size={28} />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-100">{project.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-300">
                    {project.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tech?.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-yellow-500/35 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  {projectLink && projectLink !== "#" ? (
                    <a
                      href={projectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center gap-2 rounded-lg border border-yellow-500/40 px-4 py-2 text-sm font-medium text-yellow-300 transition-all duration-300 hover:bg-yellow-500 hover:text-slate-900"
                    >
                      <Github size={16} />
                      Projeyi İncele
                    </a>
                  ) : (
                    <span className="mt-6 inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 px-4 py-2 text-sm text-gray-500">
                      Link eklenmedi
                    </span>
                  )}
                </div>
              </article>
            );
            })}
          </div>
          )}
        </section>

        <ContactSection
          profile={profile}
          contactForm={contactForm}
          setContactForm={setContactForm}
          onSubmit={handleContactSubmit}
          contactSubmitting={contactSubmitting}
          contactStatus={contactStatus}
        />
      </main>

      <DigitalCv
        isOpen={Boolean(cvLocale)}
        locale={cvLocale || "tr"}
        onClose={() => setCvLocale(null)}
        profile={profile}
      />

      <footer
        id="footer"
        className="mt-10 border-t border-yellow-500/10 bg-slate-950/50 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:px-6 lg:px-8 sm:text-left">
          <div>
            <p className="text-sm text-gray-300">
              Yakın Doğu Üniversitesi — Yazılım Mühendisliği (İngilizce) · 2. sınıf tamamlandı
            </p>
            <p className="mt-1 text-xs text-gray-500">
              © {new Date().getFullYear()} {profile.name}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setCvLocale("tr")}
              className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 px-4 py-2 text-sm text-yellow-400 transition-all duration-300 hover:bg-yellow-500 hover:text-slate-900"
            >
              <FileText size={16} />
              CV (TR)
            </button>
            <button
              type="button"
              onClick={() => setCvLocale("en")}
              className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 px-4 py-2 text-sm text-yellow-400 transition-all duration-300 hover:bg-yellow-500 hover:text-slate-900"
            >
              <FileText size={16} />
              CV (EN)
            </button>
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                aria-label="E-posta"
                className="rounded-full border border-yellow-500/30 p-2 text-yellow-400 transition-all duration-300 hover:scale-105 hover:bg-yellow-500 hover:text-slate-900"
              >
                <Mail size={18} />
              </a>
            )}
            {normalizeExternalUrl(profile.github) &&
              normalizeExternalUrl(profile.github) !== "#" && (
                <a
                  href={normalizeExternalUrl(profile.github)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="rounded-full border border-yellow-500/30 p-2 text-yellow-400 transition-all duration-300 hover:scale-105 hover:bg-yellow-500 hover:text-slate-900"
                >
                  <Github size={18} />
                </a>
              )}
            {normalizeExternalUrl(profile.linkedin) &&
              normalizeExternalUrl(profile.linkedin) !== "#" && (
                <a
                  href={normalizeExternalUrl(profile.linkedin)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="rounded-full border border-yellow-500/30 p-2 text-yellow-400 transition-all duration-300 hover:scale-105 hover:bg-yellow-500 hover:text-slate-900"
                >
                  <Linkedin size={18} />
                </a>
              )}
          </div>
        </div>
      </footer>
    </div>
  );
}
