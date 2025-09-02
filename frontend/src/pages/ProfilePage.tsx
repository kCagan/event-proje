import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { getById, getUserIdFromToken, update } from "../api/users";

export default function ProfilePage() {
  const userId = getUserIdFromToken();
  const [nameSurname, setNameSurname] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");  // boş bırakılırsa değişmez

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setMsg("Oturum bulunamadı."); return; }
    (async () => {
      try {
        const u = await getById(userId);
        setNameSurname(u.nameSurname ?? "");
        setEmail(u.email ?? "");
        // u.birthDate ISO ise:
        if (u.birthDate) setBirthDate(String(u.birthDate).slice(0,10));
      } catch (e: any) {
        setMsg(e?.response?.data ?? e.message ?? "Profil getirilemedi.");
      }
    })();
  }, [userId]);

  function validate(): string | null {
    if (!nameSurname.trim() || !email.trim() || !birthDate) return "Tüm zorunlu alanları doldurun.";
    // şifre girilmişse dokümandaki kurallar: 8+ uzunluk, büyük-küçük harf ve rakam içerme
    if (password) {
      if (password.length < 8) return "Parola en az 8 karakter olmalı.";
      if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password))
        return "Parola büyük-küçük harf ve rakam içermeli.";
    }
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) return setMsg(v);
    if (!userId) return setMsg("Oturum bulunamadı.");

    try {
      setBusy(true); setMsg(null);
      await update(userId, {
        nameSurname: nameSurname.trim(),
        email: email.trim(),
        birthDate: new Date(birthDate).toISOString(),
        password: password || undefined
      });
      setMsg("Profil güncellendi.");
      setPassword("");
    } catch (e: any) {
      setMsg(e?.response?.data ?? e.message ?? "Güncellenemedi.");
    } finally { setBusy(false); }
  }

  return (
    <div style={{ padding: 16, maxWidth: 520 }}>
      <h2>Profil</h2>
      <form onSubmit={onSubmit} style={{ display:"grid", gap: 12 }}>
        <label>Ad Soyad
          <input value={nameSurname} onChange={e=>setNameSurname(e.target.value)} required/>
        </label>
        <label>E-posta
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        </label>
        <label>Doğum Tarihi
          <input type="date" value={birthDate} onChange={e=>setBirthDate(e.target.value)} required/>
        </label>
        <label>Yeni Parola (opsiyonel)
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Değiştirmek istemezsen boş bırak"/>
        </label>
        {msg && <div style={{ color: /güncellendi/i.test(msg) ? "seagreen" : "crimson" }}>{msg}</div>}
        <button disabled={busy}>{busy ? "Kaydediliyor..." : "Kaydet"}</button>
      </form>
    </div>
  );
}
