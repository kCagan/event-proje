import { NavLink, useNavigate } from "react-router-dom";

export default function Nav() {
  const nav = useNavigate();
  const token = localStorage.getItem("token");

  function logout() {
    localStorage.removeItem("token");
    nav("/login");
  }

  const link = (to: string, text: string, icon?: string) => (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.75rem 1rem",
        borderRadius: "0.5rem",
        fontWeight: "500",
        fontSize: "0.875rem",
        textDecoration: "none",
        transition: "all 150ms ease",
        background: isActive 
          ? "linear-gradient(135deg, var(--primary-600), var(--primary-700))" 
          : "transparent",
        color: isActive ? "white" : "var(--gray-600)",
        boxShadow: isActive ? "var(--shadow-md)" : "none",
        transform: isActive ? "translateY(-1px)" : "none",
      })}
      onMouseEnter={(e) => {
        if (!e.currentTarget.matches('.active')) {
          e.currentTarget.style.background = "var(--gray-100)";
          e.currentTarget.style.color = "var(--gray-800)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!e.currentTarget.matches('.active')) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--gray-600)";
          e.currentTarget.style.transform = "none";
        }
      }}
    >
      {icon && <span style={{ fontSize: "1.125rem" }}>{icon}</span>}
      {text}
    </NavLink>
  );

  return (
    <nav
      style={{
        background: "white",
        borderBottom: "1px solid var(--gray-200)",
        boxShadow: "var(--shadow-sm)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0.75rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "2rem",
        }}
      >
        {/* Logo/Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              background: "linear-gradient(135deg, var(--primary-600), var(--primary-700))",
              borderRadius: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "1.25rem",
              fontWeight: "bold",
              boxShadow: "var(--shadow-md)",
            }}
          >
            📅
          </div>
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: "700",
              color: "var(--gray-800)",
              letterSpacing: "-0.025em",
            }}
          >
            EventHub
          </span>
        </div>

        {/* Navigation Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {link("/", "Ana Sayfa", "🏠")}
          {token && link("/events", "Etkinlikler", "🎉")}
          {token && link("/calendar", "Takvim", "📅")}
          {token && link("/me/events", "Etkinliklerim", "⭐")}
          {token && link("/me/events/new", "Oluştur", "➕")}
          {token && link("/profile", "Profil", "👤")}
        </div>

        {/* Auth Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {token ? (
            <button
              onClick={logout}
              style={{
                background: "transparent",
                border: "1px solid var(--gray-300)",
                color: "var(--gray-700)",
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                borderRadius: "0.5rem",
                cursor: "pointer",
                transition: "all 150ms ease",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--gray-100)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span>🚪</span>
              Çıkış
            </button>
          ) : (
            <NavLink
              to="/login"
              style={{
                background: "linear-gradient(135deg, var(--primary-600), var(--primary-700))",
                color: "white",
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                borderRadius: "0.5rem",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "var(--shadow-sm)",
                transition: "all 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, var(--primary-700), var(--primary-800))";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, var(--primary-600), var(--primary-700))";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
              }}
            >
              <span>🔑</span>
              Giriş
            </NavLink>
          )}
        </div>
      </div>

      {/* Mobile responsive indicator */}
      <style>{`
        @media (max-width: 768px) {
          nav > div {
            flex-direction: column;
            gap: 1rem !important;
            padding: 1rem !important;
          }
          
          nav > div > div:nth-child(2) {
            flex-direction: column;
            width: 100%;
            gap: 0.5rem;
          }
          
          nav > div > div:nth-child(2) a {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </nav>
  );
}