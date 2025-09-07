import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import Nav from "./components/Nav";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import CalendarPage from "./pages/CalendarPage";

// kullanıcı sayfaları
import MyEventsList from "./pages/my/MyEventsList";
import MyEventForm from "./pages/my/MyEventForm";
import ProfilePage from "./pages/ProfilePage";

function Home() {
  return (
    <div className="container animate-fade-in">
      <div style={{
        textAlign: "center",
        padding: "4rem 0",
        background: "white",
        borderRadius: "1.5rem",
        boxShadow: "var(--shadow-lg)",
        margin: "2rem 0",
      }}>
        <div style={{
          fontSize: "4rem",
          marginBottom: "1.5rem",
          filter: "drop-shadow(0 4px 8px rgba(59, 130, 246, 0.2))",
        }}>
          🎉
        </div>
        <h1 style={{
          background: "linear-gradient(135deg, var(--primary-600), var(--primary-800))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: "1rem",
          fontSize: "3rem",
        }}>
          EventHub'a Hoş Geldin!
        </h1>
        <p style={{
          fontSize: "1.25rem",
          color: "var(--gray-600)",
          maxWidth: "600px",
          margin: "0 auto 2rem",
          lineHeight: "1.6",
        }}>
          Etkinliklerini keşfet, organize et ve takip et. Modern ve kullanıcı dostu arayüzümüzle etkinlik yönetimi artık çok daha kolay.
        </p>
        <div style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: "2rem",
        }}>
          <button
            onClick={() => window.location.href = "/events"}
            style={{
              background: "linear-gradient(135deg, var(--primary-600), var(--primary-700))",
              color: "white",
              padding: "1rem 2rem",
              fontSize: "1.125rem",
              fontWeight: "600",
              borderRadius: "0.75rem",
              border: "none",
              boxShadow: "var(--shadow-lg)",
              cursor: "pointer",
              transition: "all 200ms ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            🎭 Etkinlikleri Keşfet
          </button>
          <button
            onClick={() => window.location.href = "/me/events/new"}
            style={{
              background: "white",
              color: "var(--primary-600)",
              border: "2px solid var(--primary-600)",
              padding: "1rem 2rem",
              fontSize: "1.125rem",
              fontWeight: "600",
              borderRadius: "0.75rem",
              cursor: "pointer",
              transition: "all 200ms ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "var(--shadow)",
            }}
          >
            ➕ Etkinlik Oluştur
          </button>
        </div>
        
        {/* Feature highlights */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "2rem",
          marginTop: "4rem",
          padding: "0 1rem",
        }}>
          {[
            { icon: "📅", title: "Takvim Görünümü", desc: "Etkinliklerini takvim formatında görüntüle" },
            { icon: "🎯", title: "Kolay Yönetim", desc: "Etkinliklerini kolayca oluştur ve düzenle" },
            { icon: "🔔", title: "Anlık Bildirim", desc: "Yaklaşan etkinliklerden haberdar ol" },
          ].map((feature, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                padding: "1.5rem",
                background: "rgba(255, 255, 255, 0.8)",
                borderRadius: "1rem",
                border: "1px solid var(--gray-200)",
                backdropFilter: "blur(10px)",
                transition: "transform 200ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{feature.icon}</div>
              <h3 style={{ marginBottom: "0.5rem", color: "var(--gray-800)" }}>{feature.title}</h3>
              <p style={{ color: "var(--gray-600)", fontSize: "0.875rem" }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div id="root">
      <Nav />
      <main className="main-content">
        <Routes>
          {/* halka açık */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* kullanıcı ara yüzü */}
          <Route
            path="/events"
            element={
              <PrivateRoute>
                <Events />
              </PrivateRoute>
            }
          />
          <Route path="/events/:id" element={<PrivateRoute><EventDetail /></PrivateRoute>} />
          <Route path="/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />

          {/* kullanıcı kendi etkinlikleri */}
          <Route path="/me/events" element={<PrivateRoute><MyEventsList /></PrivateRoute>} />
          <Route path="/me/events/new" element={<PrivateRoute><MyEventForm /></PrivateRoute>} />
          <Route path="/me/events/:id" element={<PrivateRoute><MyEventForm /></PrivateRoute>} />

          {/* profil */}
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          {/* default */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}