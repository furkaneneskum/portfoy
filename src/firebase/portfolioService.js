import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage, auth, resetFirestoreConnection, firebaseApiKey, firebaseProjectId } from "./config";
import { normalizeExternalUrl, normalizeImageUrl } from "../utils/url";

export const DEFAULT_PROFILE = {
  name: "Furkan Enes Kum",
  title: "Yakın Doğu Üniversitesi Yazılım Mühendisliği Öğrencisi",
  slogan:
    "Python ve JavaScript ile veri odaklı, kullanıcı dostu ve sürdürülebilir yazılım çözümleri geliştiriyorum.",
  about:
    "Yakın Doğu Üniversitesi'nde %100 İngilizce Yazılım Mühendisliği eğitiminde 2. sınıfı başarıyla tamamladım. Akademik birikimimi Python ve JavaScript ile birleştirerek gerçek dünya problemlerine pratik çözümler üretiyorum. Konaklama ve hizmet sektöründe dijital dönüşümün operasyonel verimlilik ve müşteri deneyimi üzerindeki etkisine inanıyorum. Yazılım mühendisliği stajı ile öğrendiklerimi kurumsal projelere taşımayı hedefliyorum.",
  profileImageUrl: "",
  aboutImageUrl: "",
  email: "kumfurkanenes1@gmail.com",
  phone: "05428528282",
  github: "https://github.com/furkaneneskum",
  linkedin: "",
};

export const DEFAULT_SKILLS = [
  { category: "Ana Diller", items: ["JavaScript", "Python"] },
  {
    category: "Frontend",
    items: ["HTML5", "CSS3", "Tailwind CSS", "Responsive Design"],
  },
  {
    category: "Temel Mühendislik",
    items: ["Git & GitHub", "Temel Algoritmalar", "Veri Yapıları", "Problem Çözme"],
  },
];

export const DEFAULT_PROJECTS = [
  {
    title: "Otel Misafir Geri Bildirim Analizi",
    description:
      "Python tabanli bir analiz araci ile misafir yorumlarini siniflandiran, duygu analizi yapan ve yonetime karar destegi saglayan veri gorsellestirmeleri ureten ornek proje.",
    tech: ["Python", "Pandas", "Matplotlib"],
    link: "#",
    imageUrl: "",
  },
  {
    title: "Premium Restoran Rezervasyon Arayuzu",
    description:
      "Luks hizmet anlayisina uygun, hizli ve kullanici dostu bir masa rezervasyon deneyimi sunan modern arayuz. Akici gecisler ve mobil oncelikli yapi icerir.",
    tech: ["JavaScript", "HTML", "Tailwind CSS"],
    link: "#",
    imageUrl: "",
  },
];

const profileRef = () => doc(requireDb(), "portfolio", "profile");
const skillsRef = () => doc(requireDb(), "portfolio", "skills");
const projectsCol = () => collection(requireDb(), "projects");
const messagesCol = () => collection(requireDb(), "messages");

function requireDb() {
  if (!db) {
    const error = new Error("Firebase yapilandirmasi eksik.");
    error.code = "firebase/not-configured";
    throw error;
  }
  return db;
}

const RETRYABLE_FIRESTORE_CODES = new Set([
  "unavailable",
  "deadline-exceeded",
  "aborted",
  "internal",
  "resource-exhausted",
]);

async function withFirestoreRetry(operation, retries = 4) {
  let lastError;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (RETRYABLE_FIRESTORE_CODES.has(error.code) && attempt < retries - 1) {
        await resetFirestoreConnection();
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

function getTimestampMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (value.seconds) return value.seconds * 1000;
  if (value instanceof Date) return value.getTime();
  return 0;
}

function sortByNewest(items) {
  return [...items].sort(
    (a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt)
  );
}

function mapProjectDoc(item) {
  const data = item.data();
  return {
    id: item.id,
    ...data,
    tech: Array.isArray(data.tech)
      ? data.tech
      : typeof data.tech === "string"
        ? data.tech.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
  };
}

function mapMessageDoc(item) {
  const data = item.data();
  return {
    id: item.id,
    ...data,
    createdAt: data.createdAt?.toDate
      ? data.createdAt.toDate().toLocaleString("tr-TR")
      : data.createdAt || "",
  };
}

async function ensureDefaults() {
  const profileSnap = await withFirestoreRetry(() => getDoc(profileRef()));
  if (!profileSnap.exists()) {
    await withFirestoreRetry(() => setDoc(profileRef(), DEFAULT_PROFILE));
  }

  const skillsSnap = await withFirestoreRetry(() => getDoc(skillsRef()));
  if (!skillsSnap.exists()) {
    await withFirestoreRetry(() => setDoc(skillsRef(), { categories: DEFAULT_SKILLS }));
  }

  const existingProjects = await withFirestoreRetry(() => getDocs(projectsCol()));
  if (existingProjects.empty) {
    for (const project of DEFAULT_PROJECTS) {
      await withFirestoreRetry(() =>
        addDoc(projectsCol(), {
          ...project,
          createdAt: serverTimestamp(),
        })
      );
    }
    await withFirestoreRetry(() =>
      setDoc(doc(requireDb(), "portfolio", "seeded"), { done: true }, { merge: true })
    );
  }
}

export async function seedDefaultsIfNeeded() {
  if (!auth.currentUser) {
    const error = new Error("Admin girisi yapilmamis.");
    error.code = "auth/not-logged-in";
    throw error;
  }
  await ensureDefaults();
}

export function subscribePortfolioData(callbacks) {
  if (!db) {
    callbacks.onProfile?.(DEFAULT_PROFILE);
    callbacks.onSkills?.(DEFAULT_SKILLS);
    callbacks.onProjects?.([]);
    callbacks.onMessages?.([]);
    callbacks.onReady?.();
    return () => {};
  }

  let unsubProfile;
  let unsubSkills;
  let unsubProjects;
  let unsubMessages;
  let readyCalled = false;

  const markReady = () => {
    if (readyCalled) return;
    readyCalled = true;
    callbacks.onReady?.();
  };

  const handleSnapshotError = (error, source) => {
    console.error(`Firebase dinleme hatasi (${source}):`, error);
    callbacks.onError?.(error, source);
    markReady();
  };

  unsubProfile = onSnapshot(
    profileRef(),
    (snap) => {
      callbacks.onProfile(snap.exists() ? snap.data() : DEFAULT_PROFILE);
      markReady();
    },
    (error) => handleSnapshotError(error, "profile")
  );

  unsubSkills = onSnapshot(
    skillsRef(),
    (snap) => {
      callbacks.onSkills(snap.exists() ? snap.data().categories : DEFAULT_SKILLS);
      markReady();
    },
    (error) => handleSnapshotError(error, "skills")
  );

  unsubProjects = onSnapshot(
    projectsCol(),
    (snap) => {
      const projects = sortByNewest(snap.docs.map(mapProjectDoc));
      callbacks.onProjects(projects);
      markReady();
    },
    (error) => handleSnapshotError(error, "projects")
  );

  unsubMessages = onSnapshot(
    messagesCol(),
    (snap) => {
      const messages = sortByNewest(snap.docs.map(mapMessageDoc));
      callbacks.onMessages(messages);
      markReady();
    },
    (error) => handleSnapshotError(error, "messages")
  );

  const fallbackTimer = setTimeout(markReady, 4000);

  return () => {
    clearTimeout(fallbackTimer);
    unsubProfile?.();
    unsubSkills?.();
    unsubProjects?.();
    unsubMessages?.();
  };
}

export async function updateProfile(data) {
  await setDoc(profileRef(), data, { merge: true });
}

export async function uploadProfileImage(file, type = "profile") {
  const path = `portfolio/${type}-${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  const field = type === "about" ? "aboutImageUrl" : "profileImageUrl";
  await setDoc(profileRef(), { [field]: url }, { merge: true });
  return url;
}

export async function fetchProjects() {
  const snap = await withFirestoreRetry(() => getDocs(projectsCol()));
  return sortByNewest(snap.docs.map(mapProjectDoc));
}

export async function testFirestoreWrite() {
  if (!auth.currentUser) {
    const error = new Error("Admin girisi yapilmamis.");
    error.code = "auth/not-logged-in";
    throw error;
  }

  const docRef = await withFirestoreRetry(() =>
    addDoc(projectsCol(), {
      title: "Firestore Baglanti Testi",
      description: "Bu kayit admin panelinden otomatik olusturuldu.",
      tech: ["Test"],
      link: "#",
      imageUrl: "",
      createdAt: serverTimestamp(),
    })
  );

  return docRef.id;
}

export async function addProject(project) {
  const docRef = await withFirestoreRetry(() =>
    addDoc(projectsCol(), {
      ...project,
      link: normalizeExternalUrl(project.link) || "#",
      imageUrl: normalizeImageUrl(project.imageUrl || ""),
      tech: Array.isArray(project.tech) ? project.tech : [],
      createdAt: serverTimestamp(),
    })
  );
  return docRef;
}

export async function deleteProject(id) {
  await deleteDoc(doc(requireDb(), "projects", id));
}

export async function uploadProjectImage(projectId, file) {
  const path = `projects/${projectId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await withFirestoreRetry(async () => {
    await uploadBytes(storageRef, file);
  });
  const imageUrl = await getDownloadURL(storageRef);
  await withFirestoreRetry(() =>
    updateDoc(doc(requireDb(), "projects", projectId), { imageUrl })
  );
  return imageUrl;
}

export async function updateProject(projectId, data) {
  const payload = { ...data };
  if (typeof payload.link === "string") {
    payload.link = normalizeExternalUrl(payload.link) || "#";
  }
  if (typeof payload.imageUrl === "string") {
    payload.imageUrl = normalizeImageUrl(payload.imageUrl);
  }
  await withFirestoreRetry(() => updateDoc(doc(requireDb(), "projects", projectId), payload));
}

export async function updateSkills(categories) {
  await setDoc(skillsRef(), { categories }, { merge: true });
}

async function addMessageViaRest(payload) {
  if (!firebaseApiKey || !firebaseProjectId) {
    const error = new Error("Firebase REST yapilandirmasi eksik.");
    error.code = "firebase/not-configured";
    throw error;
  }

  const url =
    `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}` +
    `/databases/(default)/documents/messages?key=${firebaseApiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: {
        name: { stringValue: payload.name },
        email: { stringValue: payload.email },
        ...(payload.subject
          ? { subject: { stringValue: payload.subject } }
          : {}),
        message: { stringValue: payload.message },
        read: { booleanValue: false },
        createdAt: { timestampValue: new Date().toISOString() },
      },
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body?.error?.message || "REST mesaj gonderilemedi.");
    error.code = response.status === 403 ? "permission-denied" : "rest-failed";
    throw error;
  }

  return body;
}

export async function addMessage(message) {
  const payload = {
    name: (message.name || "").trim(),
    email: (message.email || "").trim(),
    subject: (message.subject || "").trim(),
    message: (message.message || "").trim(),
  };

  if (!payload.name || !payload.email || !payload.message) {
    const error = new Error("Tum alanlar zorunludur.");
    error.code = "validation/empty-fields";
    throw error;
  }

  const docData = {
    name: payload.name,
    email: payload.email,
    message: payload.message,
    read: false,
    createdAt: serverTimestamp(),
  };

  if (payload.subject) {
    docData.subject = payload.subject;
  }

  try {
    return await withFirestoreRetry(() => addDoc(messagesCol(), docData));
  } catch (error) {
    if (error.code === "permission-denied" || error.code === "unauthenticated") {
      return addMessageViaRest(payload);
    }
    throw error;
  }
}

export async function markMessageAsRead(id) {
  await updateDoc(doc(requireDb(), "messages", id), { read: true });
}

export async function deleteMessage(id) {
  await deleteDoc(doc(requireDb(), "messages", id));
}
