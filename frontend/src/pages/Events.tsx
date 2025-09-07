import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

type EventDto = {
  eventId: number;
  title: string;
  startDate: string;   // ISO
  endDate: string;     // ISO
  shortDescription?: string;
  isActive: boolean;
  createdByName?: string | null;
  createdAt?: string;
};

// Modern tarih formatı
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const fmtRange = (startIso: string, endIso: string) => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const isSameDay = start.toDateString() === end.toDateString();
  
  if (isSameDay) {
    return `${fmtDate(startIso)} • ${fmtTime(startIso)} - ${fmtTime(endIso)}`;
  }
  return `${fmtDate(startIso)} ${fmtTime(startIso)} - ${fmtDate(endIso)} ${fmtTime(endIso)}`;
};

export default function Events() {
  const [items, setItems] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Public uç: aktif + ileri tarihli, createdByName dahil
        const res = await api.get<EventDto[]>("/event/public");
        setItems(res.data);
      } catch (e: any) {
        setErr(e?.response?.data ?? e.message ?? "Bilinmeyen hata");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
          flexDirection: "column",
          gap: "1rem",
        }}>
          <div className="loading" style={{ width: "3rem", height: "3rem" }}></div>
          <p style={{ color: "var(--gray-600)" }}>Etkinlikler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="container">
        <div className="alert alert-error">
          ⚠️ Hata: {String(err)}
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "2rem",
        flexWrap: "wrap",
        gap: "1rem",
      }}>
        <div>
          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            color: "var(--gray-900)",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}>
            🎭 Etkinlikler
          </h1>
          <p style={{
            color: "var(--gray-600)",
            fontSize: "1.125rem",
            margin: 0,
          }}>
            {items.length} aktif etkinlik keşfet
          </p>
        </div>
        
        <Link
          to="/calendar"
          style={{
            background: "linear-gradient(135deg, var(--primary-600), var(--primary-700))",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.75rem",
            textDecoration: "none",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "var(--shadow-md)",
            transition: "all 200ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "var(--shadow-lg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
          }}
        >
          📅 Takvim Görünümü
        </Link>
      </div>

      {items.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "4rem 2rem",
          background: "white",
          borderRadius: "1.5rem",
          boxShadow: "var(--shadow)",
          border: "1px solid var(--gray-200)",
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.5 }}>🎪</div>
          <h3 style={{ marginBottom: "0.5rem", color: "var(--gray-700)" }}>
            Henüz yaklaşan etkinlik yok
          </h3>
          <p style={{ color: "var(--gray-500)", marginBottom: "2rem" }}>
            Yeni etkinlikler eklendiğinde burada görüntülenecek
          </p>
          <Link
            to="/me/events/new"
            style={{
              background: "linear-gradient(135deg, var(--success-500), #059669)",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              textDecoration: "none",
              fontWeight: "600",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            ➕ İlk Etkinliği Oluştur
          </Link>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gap: "1.5rem",
        }}>
          {items.map((ev) => (
                          <div
              key={ev.eventId}
              className="card hover-lift"
              style={{
                padding: "0",
                overflow: "hidden",
                transition: "all 300ms ease",
              }}
            >
              <div style={{
                padding: "1.5rem",
                background: "linear-gradient(135deg, var(--primary-50), white)",
                borderBottom: "1px solid var(--gray-200)",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}>
                  <Link
                    to={`/events/${ev.eventId}`}
                    style={{
                      fontSize: "1.375rem",
                      fontWeight: "700",
                      color: "var(--gray-900)",
                      textDecoration: "none",
                      lineHeight: "1.3",
                      flex: 1,
                      transition: "color 150ms ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--primary-700)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--gray-900)";
                    }}
                  >
                    {ev.title}
                  </Link>
                  
                  <div className="badge badge-info" style={{
                    fontSize: "0.75rem",
                    whiteSpace: "nowrap",
                  }}>
                    📅 {fmtRange(ev.startDate, ev.endDate)}
                  </div>
                </div>

                {ev.shortDescription && (
                  <p style={{
                    color: "var(--gray-600)",
                    fontSize: "1rem",
                    lineHeight: "1.6",
                    margin: "0 0 1rem 0",
                  }}>
                    {ev.shortDescription}
                  </p>
                )}

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}>
                  {ev.createdByName && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                      color: "var(--gray-500)",
                    }}>
                      <span>👤</span>
                      <em>{ev.createdByName}</em>
                    </div>
                  )}
                  
                  <Link
                    to={`/events/${ev.eventId}`}
                    style={{
                      background: "white",
                      color: "var(--primary-600)",
                      border: "1px solid var(--primary-600)",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.5rem",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      transition: "all 150ms ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      marginLeft: "auto",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--primary-600)";
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "var(--shadow-md)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.color = "var(--primary-600)";
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    Detayları Gör →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div style={{
        marginTop: "3rem",
        padding: "2rem",
        background: "white",
        borderRadius: "1.5rem",
        boxShadow: "var(--shadow)",
        border: "1px solid var(--gray-200)",
        textAlign: "center",
      }}>
        <h3 style={{
          fontSize: "1.25rem",
          fontWeight: "600",
          color: "var(--gray-800)",
          marginBottom: "1rem",
        }}>
          🚀 Hızlı İşlemler
        </h3>
        <div style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}>
          <Link
            to="/me/events/new"
            style={{
              background: "linear-gradient(135deg, var(--success-500), #059669)",
              color: "white",
              padding: "0.75rem 1.25rem",
              borderRadius: "0.75rem",
              textDecoration: "none",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "var(--shadow-sm)",
              transition: "all 200ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "var(--shadow-lg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            }}
          >
            ➕ Yeni Etkinlik Oluştur
          </Link>
          
          <Link
            to="/me/events"
            style={{
              background: "white",
              color: "var(--gray-700)",
              border: "1px solid var(--gray-300)",
              padding: "0.75rem 1.25rem",
              borderRadius: "0.75rem",
              textDecoration: "none",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "var(--shadow-sm)",
              transition: "all 200ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--gray-50)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            }}
          >
            ⭐ Etkinliklerim
          </Link>
        </div>
      </div>
    </div>
  );
}
              