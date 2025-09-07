import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const { token } = await login({ email, password });
      if (!token) throw new Error("Sunucudan token alınamadı.");
      localStorage.setItem("token", token);
      nav("/events"); // login sonrası listeye yönlendir
    } catch (e: any) {
      const msg =
        e?.response?.data ||
        e?.message ||
        "Giriş yapılamadı. Lütfen bilgileri kontrol edin.";
      setErr(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-sm animate-slide-up">
      <div style={{
        background: "white",
        borderRadius: "1.5rem",
        boxShadow: "var(--shadow-xl)",
        padding: "3rem",
        border: "1px solid var(--gray-200)",
        marginTop: "3rem",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "4rem",
            height: "4rem",
            background: "linear-gradient(135deg, var(--primary-600), var(--primary-700))",
            borderRadius: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.75rem",
            margin: "0 auto 1rem",
            boxShadow: "var(--shadow-lg)",
          }}>
            🔑
          </div>
          <h1 style={{
            fontSize: "2rem",
            fontWeight: "700",
            color: "var(--gray-900)",
            marginBottom: "0.5rem",
          }}>
            Hoş Geldin!
          </h1>
          <p style={{
            color: "var(--gray-600)",
            fontSize: "1rem",
          }}>
            Hesabına giriş yaparak etkinliklere katılmaya başla
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid" style={{ gap: "1.5rem" }}>
          <div className="form-group">
            <label htmlFor="email">
              📧 E-posta Adresin
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              required
              autoFocus
              style={{
                fontSize: "1rem",
                padding: "0.875rem 1rem",
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              🔒 Şifren
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                fontSize: "1rem",
                padding: "0.875rem 1rem",
              }}
            />
          </div>

          {err && (
            <div className="alert alert-error animate-fade-in">
              ⚠️ {String(err)}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading 
                ? "var(--gray-400)" 
                : "linear-gradient(135deg, var(--primary-600), var(--primary-700))",
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
            {loading ? (
              <>
                <div className="loading"></div>
                Giriş yapılıyor...
              </>
            ) : (
              <>
                🚀 Giriş Yap
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: "2rem",
          padding: "1.5rem 0",
          borderTop: "1px solid var(--gray-200)",
          textAlign: "center",
        }}>
          <p style={{
            color: "var(--gray-600)",
            fontSize: "0.875rem",
            margin: 0,
          }}>
            Henüz hesabın yok mu?{" "}
            <Link
              to="/register"
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
              Hemen kayıt ol! ✨
            </Link>
          </p>
        </div>

        {/* Benefits */}
        <div style={{
          marginTop: "2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "1rem",
        }}>
          {[
            { icon: "⚡", text: "Hızlı Erişim" },
            { icon: "🔒", text: "Güvenli Giriş" },
            { icon: "📱", text: "Mobil Uyumlu" },
          ].map((item, i) => (
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