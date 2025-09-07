import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { EventDto } from "../../api/events";
import { listMine } from "../../api/events";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", { 
    day: "2-digit",
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
    return `${fmt(startIso)} • ${fmtTime(startIso)} - ${fmtTime(endIso)}`;
  }
  return `${fmt(startIso)} ${fmtTime(startIso)} - ${fmt(endIso)} ${fmtTime(endIso)}`;
};

const getEventStatus = (event: EventDto) => {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  
  if (!event.isActive) {
    return { label: "Pasif", color: "var(--gray-500)", bg: "var(--gray-100)" };
  }
  
  if (now > endDate) {
    return { label: "Tamamlandı", color: "var(--gray-600)", bg: "var(--gray-100)" };
  }
  
  if (now >= startDate && now <= endDate) {
    return { label: "Devam Ediyor", color: "#059669", bg: "#f0fdf4" };
  }
  
  return { label: "Yaklaşan", color: "var(--primary-600)", bg: "var(--primary-50)" };
};

export default function MyEventsList() {
  const [items, setItems] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "upcoming" | "past">("all");

  useEffect(() => {
    (async () => {
      try {
        const data = await listMine();
        data.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
        setItems(data);
      } catch (e: any) {
        setErr(e?.response?.data ?? e.message ?? "Hata");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredItems = items.filter(event => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    switch (filter) {
      case "active":
        return event.isActive;
      case "upcoming":
        return event.isActive && startDate > now;
      case "past":
        return endDate < now;
      default:
        return true;
    }
  });

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
          <p style={{ color: "var(--gray-600)" }}>Etkinlikleriniz yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="container">
        <div className="alert alert-error">
          ⚠️ {String(err)}
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
            ⭐ Etkinliklerim
          </h1>
          <p style={{
            color: "var(--gray-600)",
            fontSize: "1.125rem",
            margin: 0,
          }}>
            {filteredItems.length} etkinlik {filter !== "all" ? "(" + filter + ")" : ""}
          </p>
        </div>
        
        <Link
          to="/me/events/new"
          style={{
            background: "linear-gradient(135deg, var(--success-500), #059669)",
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
          ➕ Yeni Etkinlik Oluştur
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: "flex",
        gap: "0.5rem",
        marginBottom: "2rem",
        flexWrap: "wrap",
        background: "white",
        padding: "0.5rem",
        borderRadius: "0.75rem",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid var(--gray-200)",
      }}>
        {[
          { key: "all", label: "Tümü", count: items.length },
          { key: "active", label: "Aktif", count: items.filter(e => e.isActive).length },
          { key: "upcoming", label: "Yaklaşan", count: items.filter(e => {
            const now = new Date();
            return e.isActive && new Date(e.startDate) > now;
          }).length },
          { key: "past", label: "Geçmiş", count: items.filter(e => new Date(e.endDate) < new Date()).length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            style={{
              background: filter === tab.key 
                ? "var(--primary-600)" 
                : "transparent",
              color: filter === tab.key 
                ? "white" 
                : "var(--gray-600)",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 150ms ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {tab.label}
            <span style={{
              background: filter === tab.key 
                ? "rgba(255, 255, 255, 0.2)" 
                : "var(--gray-200)",
              color: filter === tab.key 
                ? "white" 
                : "var(--gray-600)",
              padding: "0.125rem 0.375rem",
              borderRadius: "0.375rem",
              fontSize: "0.75rem",
              fontWeight: "700",
              minWidth: "1.25rem",
              textAlign: "center",
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Events List */}
      {filteredItems.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "4rem 2rem",
          background: "white",
          borderRadius: "1.5rem",
          boxShadow: "var(--shadow)",
          border: "1px solid var(--gray-200)",
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.5 }}>
            {filter === "all" ? "📝" : filter === "upcoming" ? "⏰" : filter === "past" ? "✅" : "🎭"}
          </div>
          <h3 style={{ marginBottom: "0.5rem", color: "var(--gray-700)" }}>
            {filter === "all" ? "Henüz etkinlik oluşturmadın" :
             filter === "upcoming" ? "Yaklaşan etkinlik yok" :
             filter === "past" ? "Geçmiş etkinlik yok" :
             "Bu kategoride etkinlik yok"}
          </h3>
          <p style={{ color: "var(--gray-500)", marginBottom: "2rem" }}>
            {filter === "all" ? "İlk etkinliğini oluşturarak başla" :
             "Diğer kategorilere bakabilir veya yeni etkinlik oluşturabilirsin"}
          </p>
          {filter === "all" && (
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
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {filteredItems.map(ev => {
            const status = getEventStatus(ev);
            
            return (
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
                  background: "linear-gradient(135deg, var(--gray-50), white)",
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
                    
                    <div style={{
                      background: status.bg,
                      color: status.color,
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      border: `1px solid ${status.color}20`,
                      whiteSpace: "nowrap",
                    }}>
                      {status.label}
                    </div>
                  </div>

                  <div className="badge badge-info" style={{
                    fontSize: "0.875rem",
                    marginBottom: "1rem",
                  }}>
                    📅 {fmtRange(ev.startDate, ev.endDate)}
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
                    gap: "0.75rem",
                    flexWrap: "wrap",
                  }}>
                    <Link
                      to={`/me/events/${ev.eventId}`}
                      style={{
                        background: "var(--primary-600)",
                        color: "white",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.5rem",
                        textDecoration: "none",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        transition: "all 150ms ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--primary-700)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "var(--shadow-md)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--primary-600)";
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      ✏️ Düzenle
                    </Link>
                    
                    <Link
                      to={`/events/${ev.eventId}`}
                      style={{
                        background: "white",
                        color: "var(--gray-700)",
                        border: "1px solid var(--gray-300)",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.5rem",
                        textDecoration: "none",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        transition: "all 150ms ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--gray-50)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "white";
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      👁️ Görüntüle
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Statistics */}
      {items.length > 0 && (
        <div style={{
          marginTop: "3rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}>
          {[
            {
              icon: "📊",
              label: "Toplam Etkinlik",
              value: items.length,
              color: "var(--primary-600)"
            },
            {
              icon: "✅",
              label: "Aktif Etkinlik",
              value: items.filter(e => e.isActive).length,
              color: "var(--success-500)"
            },
            {
              icon: "⏰",
              label: "Yaklaşan",
              value: items.filter(e => {
                const now = new Date();
                return e.isActive && new Date(e.startDate) > now;
              }).length,
              color: "var(--warning-500)"
            }
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "1rem",
                boxShadow: "var(--shadow)",
                border: "1px solid var(--gray-200)",
                textAlign: "center",
                transition: "transform 200ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{
                fontSize: "2rem",
                marginBottom: "0.5rem",
              }}>
                {stat.icon}
              </div>
              <div style={{
                fontSize: "2rem",
                fontWeight: "700",
                color: stat.color,
                marginBottom: "0.25rem",
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: "0.875rem",
                color: "var(--gray-600)",
                fontWeight: "500",
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}