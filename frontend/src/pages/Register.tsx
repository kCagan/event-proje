import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";

export default function Register() {
  const nav = useNavigate();
  const [nameSurname, setNameSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState(""); // yyyy-mm-dd
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    // Basit parola kuralı (belgedeki gereksinim)
    const passOk =
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password);

    if (!passOk) {
      setErr("Şifre en az 8 karakter, büyük-küçük harf ve rakam içermeli.");
      return;
    }

    setLoading(true);
    try {
      // Tarihi ISO'ya çevir
      const iso = new Date(birthDate).toISOString();
      await register({ nameSurname, email, password, birthDate: iso });
      setOk("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz…");
      setTimeout(() => nav("/login"), 800);
    } catch (e: any) {
      setErr(e?.response?.data ?? "Kayıt gerçekleştirilemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "48px auto" }}>
      <h1>Kayıt Ol</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Ad Soyad
          <input value={nameSurname} onChange={(e) => setNameSurname(e.target.value)} required />
        </label>
        <label>
          E-posta
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Şifre
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="En az 8 karakter, Aa1"
            required
          />
        </label>
        <label>
          Doğum Tarihi
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
        </label>

        {err && <div style={{ color: "crimson" }}>{String(err)}</div>}
        {ok && <div style={{ color: "green" }}>{ok}</div>}

        <button disabled={loading}>{loading ? "Gönderiliyor..." : "Kayıt Ol"}</button>
      </form>

      <p style={{ marginTop: 12 }}>
        Zaten hesabın var mı? <Link to="/login">Giriş yap</Link>
      </p>
    </div>
  );
}