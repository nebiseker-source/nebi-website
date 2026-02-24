const editor = document.getElementById("contentEditor");
const saveBtn = document.getElementById("saveLocalBtn");
const clearBtn = document.getElementById("clearLocalBtn");
const dlBtn = document.getElementById("downloadJsonBtn");
const msg = document.getElementById("adminMsg");

const KEY = "nebi_content_override";

const setMsg = (text) => {
  if (msg) msg.textContent = text;
};

const loadInitial = async () => {
  const local = localStorage.getItem(KEY);
  if (local) {
    editor.value = local;
    setMsg("Local override yüklendi.");
    return;
  }

  try {
    const res = await fetch("../assets/data/site-content.json", { cache: "no-store" });
    const json = await res.json();
    editor.value = JSON.stringify(json, null, 2);
    setMsg("Repo JSON yüklendi.");
  } catch {
    editor.value = '{\n  "hero_subtitle": ""\n}';
    setMsg("JSON yüklenemedi.");
  }
};

saveBtn?.addEventListener("click", () => {
  try {
    JSON.parse(editor.value);
    localStorage.setItem(KEY, editor.value);
    setMsg("Local override kaydedildi. Ana sayfayı yenileyerek kontrol et.");
  } catch {
    setMsg("Geçersiz JSON. Kaydedilemedi.");
  }
});

clearBtn?.addEventListener("click", () => {
  localStorage.removeItem(KEY);
  setMsg("Local override silindi.");
});

dlBtn?.addEventListener("click", () => {
  try {
    const parsed = JSON.parse(editor.value);
    const blob = new Blob([JSON.stringify(parsed, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "site-content.json";
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg("JSON indirildi.");
  } catch {
    setMsg("Geçersiz JSON. İndirme yapılamadı.");
  }
});

loadInitial();
