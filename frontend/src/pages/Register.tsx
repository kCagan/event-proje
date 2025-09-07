import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";

export default function Register() {
  const nav = useNavigate();

  const [nameSurname, setNameSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState(""); // 🔹 şifre tekrarı
  const [birthDate, setBirthDate] = useState(""); // yyyy-mm-dd

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // bugün (yyyy-mm-dd) -> doğum tarihi için üst sınır
  const today = new Date().toISOString().slice(0, 10);

  // basit e-posta regex'i (type="email" var ama submit öncesi ekstra kontrol)
  const isEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  // şifre politikası (backend ile aynı mantık)
  const passOk = (p: string) =>
    p.length >= 8 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p);

  const getPasswordStrength = (pass: string) => {
    let s = 0;
    if (pass.length >= 8) s++;
    if (/[a-z]/.test(pass)) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/\d/.test(pass)) s++;
    if (/[!@#$%^&*]/.test(pass)) s++;
    return s;
  };
  const passwordStrength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    if (!nameSurname.trim() || !email.trim() || !birthDate) {
      setErr("Tüm alanları doldurun.");
      return;
    }
    if (!isEmail(email)) {
      setErr("E-posta formatı hatalı.");
      return;
    }
    if (!passOk(password)) {
      setErr("Şifre en az 8 karakter, büyük-küçük harf ve rakam içermeli.");
      return;
    }
    if (password !== password2) {
      setErr("Şifreler uyuşmuyor.");
      return;
    }
    if (birthDate > today) {
      setErr("Doğum tarihi bugünden ileri olamaz.");
      return;
    }

    setLoading(true);
    try {
      const iso = new Date(birthDate).toISOString();
      await register({ nameSurname, email: email.trim(), password, birthDate: iso });
      setOk("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz…");
      setTimeout(() => nav("/login"), 1000);
    } catch (e: any) {
      // Backend: e-posta çakışması, zayıf parola vb. mesajları burada gösterilecek
      const msg =
        e?.response?.data ||
        e?.message ||
        "Kayıt gerçekleştirilemedi.";
      setErr(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-sm animate-slide-up">
      <div
        style={{
          background: "white",
          borderRadius: "1.5rem",
          boxShadow: "var(--shadow-xl)",
          padding: "3rem",
          border: "1px solid var(--gray-200)",
          marginTop: "2rem",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "4rem",
              height: "4rem",
              background:
                "linear-gradient(135deg, var(--success-500), #059669)",
              borderRadius: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              margin: "0 auto 1rem",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            ✨
          </div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "var(--gray-900)",
              marginBottom: "0.5rem",
            }}
          >
            Aramıza Katıl!
          </h1>
          <p style={{ color: "var(--gray-600)", fontSize: "1rem" }}>
            Ücretsiz hesap oluştur ve etkinlik dünyasını keşfet
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid" style={{ gap: "1.5rem" }}>
          <div className="form-group">
            <label htmlFor="nameSurname">👤 Ad Soyad</label>
            <input
              id="nameSurname"
              value={nameSurname}
              onChange={(e) => setNameSurname(e.target.value)}
              placeholder="Adınız Soyadınız"
              required
              style={{ fontSize: "1rem", padding: "0.875rem 1rem" }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">📧 E-posta Adresi</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              required
              style={{ fontSize: "1rem", padding: "0.875rem 1rem" }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">🔒 Şifre</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 8 karakter (Aa1)"
              required
              style={{ fontSize: "1rem", padding: "0.875rem 1rem" }}
            />
            {password && (
              <div style={{ marginTop: "0.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "0.25rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: "0.25rem",
                        borderRadius: "0.125rem",
                        background:
                          i <= passwordStrength
                            ? passwordStrength <= 2
                              ? "#ef4444"
                              : passwordStrength <= 3
                              ? "#f59e0b"
                              : "#10b981"
                            : "var(--gray-200)",
                      }}
                    />
                  ))}
                </div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color:
                      passwordStrength <= 2
                        ? "#ef4444"
                        : passwordStrength <= 3
                        ? "#f59e0b"
                        : "#10b981",
                    margin: 0,
                  }}
                >
                  {passwordStrength <= 2
                    ? "Zayıf şifre"
                    : passwordStrength <= 3
                    ? "Orta şifre"
                    : "Güçlü şifre"}
                </p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password2">🔒 Şifre (tekrar)</label>
            <input
              id="password2"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Şifrenizi tekrar girin"
              required
              style={{ fontSize: "1rem", padding: "0.875rem 1rem" }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="birthDate">🎂 Doğum Tarihi</label>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={today} // 🔹 ileri tarih engeli
              required
              style={{ fontSize: "1rem", padding: "0.875rem 1rem" }}
            />
          </div>

          {err && <div className="alert alert-error animate-fade-in">⚠️ {err}</div>}
          {ok && <div className="alert alert-success animate-fade-in">✅ {ok}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading
                ? "var(--gray-400)"
                : "linear-gradient(135deg, var(--success-500), #059669)",
              color: "white",
              padding: "1rem 1.5rem",
              fontSize: "1rem",
              fontWeight: "600",
              borderRadius: "0.75rem",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 200ms ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow: loading ? "none" : "var(--shadow-md)",
            }}
          >
            {loading ? <>⏳ Kayıt oluşturuluyor…</> : <>🚀 Hesap Oluştur</>}
          </button>
        </form>

        {/* Footer */}
        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem 0",
            borderTop: "1px solid var(--gray-200)",
            textAlign: "center",
          }}
        >
          <p style={{ color: "var(--gray-600)", fontSize: "0.875rem", margin: 0 }}>
            Zaten hesabın var mı?{" "}
            <Link
              to="/login"
              style={{
                color: "var(--primary-600)",
                fontWeight: "600",
                textDecoration: "none",
                transition: "color 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--primary-700)";
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--primary-600)";
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              Giriş yap! 🔑
            </Link>
          </p>
        </div>

        {/* Küçük “özellikler” kutuları */}
        <div
          style={{
            marginTop: "2rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1rem",
          }}
        >
          {[{ icon: "🎉", text: "Ücretsiz Kayıt" }, { icon: "🔐", text: "Güvenli Platform" }, { icon: "⚡", text: "Hızlı Başlangıç" }].map((item, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                padding: "1rem 0.5rem",
                background: "var(--gray-50)",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
                color: "var(--gray-600)",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{item.icon}</div>
              {item.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
