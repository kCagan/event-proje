import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { getUserIdFromToken, getById, update } from "../api/users";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const toYMD = (iso?: string) => (iso ? String(iso).slice(0, 10) : "");

export default function ProfilePage() {
  const userId = getUserIdFromToken();
  const [nameSurname, setNameSurname] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState(""); // yyyy-MM-dd
  const [pw1, setPw1] = useState("");             // opsiyonel
  const [pw2, setPw2] = useState("");             // tekrar

  const [showLogoutNotice, setShowLogoutNotice] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const isSuccessMsg = /güncellendi|başarıyla/i.test(msg ?? "");

  // Profil bilgilerini çek
  useEffect(() => {
    if (!userId) { 
      setMsg("Oturum bulunamadı."); 
      return; 
    }
    
    let alive = true;
    
    const fetchUserData = async () => {
      try {
        const u = await getById(userId);
        if (!alive) return;
        
        setNameSurname(u.nameSurname ?? "");
        setEmail(u.email ?? "");
        setBirthDate(toYMD(u.birthDate));
      } catch (e: any) {
        if (!alive) return;
        console.error("Error fetching user data:", e);
        setMsg(e?.response?.data ?? e.message ?? "Profil getirilemedi.");
      }
    };

    fetchUserData();
    
    return () => { 
      alive = false; 
    };
  }, [userId]);

  // Ön kontroller (dokümandaki kurallar)
  function validate(): string | null {
    if (!nameSurname.trim()) return "Ad Soyad zorunludur.";
    if (!emailRe.test(email)) return "Geçerli bir e-posta girin.";
    if (!birthDate) return "Doğum tarihi zorunludur.";

    if (pw1 || pw2) {
      if (pw1 !== pw2) return "Parola tekrar aynı olmalı.";
      if (pw1.length < 8) return "Parola en az 8 karakter olmalı.";
      if (!/[a-z]/.test(pw1) || !/[A-Z]/.test(pw1) || !/\d/.test(pw1))
        return "Parola büyük-küçük harf ve rakam içermeli.";
    }
    return null;
  }

  // Safe date conversion function
   // yyyy-MM-dd formatını korumak için
  function _toDateOnly(dateString: string): string {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      throw new Error("Geçersiz tarih formatı");
    }
    return dateString;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    
    try {
      const validationError = validate();
      if (validationError) {
        setMsg(validationError);
        return;
      }
      
      if (!userId) {
        setMsg("Oturum bulunamadı.");
        return;
      }

      setBusy(true);
      setMsg(null);

      // Prepare update data
           const updateData: any = {
            nameSurname: nameSurname.trim(),
            email: email.trim(),
            birthDate: birthDate, // "yyyy-MM-dd" kalsın
          };

      // Only include password if provided
      if (pw1) {
        updateData.password = pw1;
        updateData.currentPassword = currentPw;
      }

      console.log("Updating user with data:", updateData);

      await update(userId, updateData);

      if (pw1) {
        // 2 sn overlay göster → sonra çıkış
        setMsg("Şifreniz başarıyla değiştirildi. Çıkış yapılıyor...");
        setShowLogoutNotice(true);
        setTimeout(() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }, 1000);
      } else {
        setMsg("Profil güncellendi.");
      }

      setPw1(""); 
      setPw2("");
      
    } catch (e: any) {
      console.error("Update error:", e);
      
      // Better error handling
      let errorMessage = "Güncellenemedi.";
      
      if (e?.response?.data) {
        if (typeof e.response.data === 'string') {
          errorMessage = e.response.data;
        } else if (e.response.data.message) {
          errorMessage = e.response.data.message;
        } } else if (e.response.data.errors) {
         // ModelState hatası varsa ilk mesajı al
          const errs = Object.values(e.response.data.errors as Record<string, string[]>).flat();
          if (errs.length) errorMessage = errs[0];else if (e.response.data.error) {
          errorMessage = e.response.data.error;
        }
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      setMsg(errorMessage);
    } finally {
      setBusy(false);
    }
  }

  // Don't render if there's no user session
  if (!userId) {
    return (
      <div style={{ padding: 16, maxWidth: 560 }}>
        <h2>Profilim</h2>
        <div style={{ color: "#e66" }}>
          Oturum bulunamadı. Lütfen giriş yapın.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, maxWidth: 560 }}>
      <h2>Profilim</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>Ad Soyad
          <input
            value={nameSurname}
            onChange={e => setNameSurname(e.target.value)}
            required
            disabled={busy}
          />
        </label>

        <label>E-posta
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={busy}
          />
        </label>
        
        
        <label>Doğum Tarihi
          <input
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            required
            disabled={busy}
          />
        </label>

        <fieldset style={{ border: "1px dashed #444", padding: 12 }}>
          <legend>Şifre Değiştir (İsteğe bağlı)</legend>

          <label>Yeni Şifre
            <input
              type="password"
              value={pw1}
              onChange={e => setPw1(e.target.value)}
              placeholder="Boş bırakırsanız şifre değişmez"
              disabled={busy}
            />
          </label>

          <label>Yeni Şifre (Tekrar)
            <input
              type="password"
              value={pw2}
              onChange={e => setPw2(e.target.value)}
              disabled={busy}
            />
          </label>
          <label>Mevcut Şifre
            <input
              type="password"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              placeholder="Şifre değiştirmek için mevcut şifrenizi girin"
              disabled={busy}
            />
          </label>

          <small>
            Koşullar: min 8 karakter, en az 1 büyük + 1 küçük harf + 1 rakam.
          </small>
        </fieldset>

        {msg && (
          <div
            style={{
              // sol altta “toast” gibi dursun
              position: "fixed",
              left: 16,
              bottom: 16,
              zIndex: 999,

              // renkler: başarı -> yeşil, hata -> kırmızı
              color: isSuccessMsg ? "#22c55e" : "#e66",
              border: `1px solid ${isSuccessMsg ? "#22c55e" : "#e66"}`,
              backgroundColor: isSuccessMsg ? "rgba(34,197,94,0.12)" : "rgba(238,102,102,0.12)",

              padding: "8px 10px",
              borderRadius: 8,
              fontWeight: 500,
              backdropFilter: "blur(2px)",
            }}
            role="status"
            aria-live="polite"
          >
            {msg}
          </div>
        )}

        <button type="submit" disabled={busy}>
          {busy ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>
      {showLogoutNotice && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#0b1210",
              color: "seagreen",
              padding: "20px 24px",
              borderRadius: 12,
              textAlign: "center",
              width: "min(92vw, 360px)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              border: "1px solid seagreen",    // ince yeşil çerçeve
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>
              Şifre güncellendi
            </h3>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Çıkış yapılıyor…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}