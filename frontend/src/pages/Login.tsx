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
    <div style={{ maxWidth: 420, margin: "48px auto" }}>
      <h1>Giriş Yap</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          E-posta
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </label>
        <label>
          Şifre
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {err && <div style={{ color: "crimson" }}>{String(err)}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Gönderiliyor..." : "Giriş"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Hesabın yok mu? <Link to="/register">Kayıt ol</Link>
      </p>
    </div>
  );
}
