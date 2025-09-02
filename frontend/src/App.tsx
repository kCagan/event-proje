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
  return <div style={{ padding: 16 }}>Hoş geldin! Soldaki menüden devam et.</div>;
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Nav />
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
    </>
  );
}
