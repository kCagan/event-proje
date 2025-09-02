import { NavLink, useNavigate } from "react-router-dom";

export default function Nav() {
  const nav = useNavigate();
  const token = localStorage.getItem("token");

  function logout() {
    localStorage.removeItem("token");
    nav("/login");
  }

  const link = (to: string, text: string) => (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        marginRight: 12,
        color: isActive ? "#7aa2ff" : "#ccc",
        textDecoration: "none",
      })}
    >
      {text}
    </NavLink>
  );

  return (
    <div
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid #444",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {link("/", "Ana Sayfa")}
      {token && link("/events", "Etkinlikler")}
      {token && link("/calendar", "Takvim")}
      {token && link("/me/events", "Etkinliklerim")}
      {token && link("/me/events/new", "Etkinlik Oluştur")}
      {token && link("/profile", "Profilim")}

      <div style={{ marginLeft: "auto" }}>
        {token ? (
          <button onClick={logout}>Çıkış</button>
        ) : (
          link("/login", "Giriş")
        )}
      </div>
    </div>
  );
}
