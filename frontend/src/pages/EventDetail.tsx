import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

type EventDto = {
  eventId: number;
  title: string;
  startDate: string;
  endDate: string;
  shortDescription?: string;
  longDescription?: string; // HTML
  imagePath?: string;
  createdAt?: string;
  isActive: boolean;
};

type LastDto = {
  eventId: number;
  title: string;
  createdAt?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdByName?: string | null;
};

type DetailResponse = EventDto & { 
  last5?: LastDto[]; 
  createdByUser?: { nameSurname: string } | null 
};

export default function EventDetail() {
  const { id } = useParams();
  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    (async () => {
      try {
        const response = await api.get<DetailResponse>(`/event/${id}/public`);
        setData(response.data);
      } catch (e: any) {
        setError(e?.response?.data ?? e.message ?? "Etkinlik yüklenemedi");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
          <p style={{ color: "var(--gray-600)" }}>Etkinlik detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container">
        <div className="alert alert-error">
          ⚠️ {error || "Etkinlik bulunamadı"}
        </div>
        <Link
          to="/events"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1rem",
            color: "var(--primary-600)",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          ← Etkinlik listesine dön
        </Link>
      </div>
    );
  }

  return (
    <div className="container animate-slide-up">
      {/* Breadcrumb */}
      <nav style={{
        marginBottom: "2rem",
        fontSize: "0.875rem",
        color: "var(--gray-600)",
      }}>
        <Link
          to="/events"
          style={{
            color: "var(--primary-600)",
            textDecoration: "none",
            fontWeight: "500",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "color 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--primary-700)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--primary-600)";
          }}
        >
          ← Etkinlik Listesi
        </Link>
      </nav>

      {/* Main Content */}
      <div style={{
        background: "white",
        borderRadius: "1.5rem",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden",
        border: "1px solid var(--gray-200)",
      }}>
        {/* Header Section */}
        <div style={{
          background: "linear-gradient(135deg, var(--primary-50) 0%, white 100%)",
          padding: "2.5rem",
          borderBottom: "1px solid var(--gray-200)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "1.5rem",
            marginBottom: "1.5rem",
          }}>
            <div style={{
              width: "4rem",
              height: "4rem",
              background: "linear-gradient(135deg, var(--primary-600), var(--primary-700))",
              borderRadius: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              boxShadow: "var(--shadow-lg)",
              flexShrink: 0,
            }}>
              🎭
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: "2.25rem",
                fontWeight: "700",
                color: "var(--gray-900)",
                lineHeight: "1.2",
                marginBottom: "1rem",
              }}>
                {data.title}
              </h1>
              
              {data.createdByUser?.nameSurname && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "var(--gray-600)",
                  fontSize: "1rem",
                  fontWeight: "500",
                }}>
                  <span>👤</span>
                  Organizatör: {data.createdByUser.nameSurname}
                </div>
              )}
            </div>
          </div>

          {/* Date/Time Info */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
          }}>
            <div style={{
              background: "white",
              padding: "1.25rem",
              borderRadius: "1rem",
              border: "1px solid var(--gray-200)",
              boxShadow: "var(--shadow-sm)",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.5rem",
              }}>
                <span style={{ fontSize: "1.25rem" }}>📅</span>
                <span style={{ fontWeight: "600", color: "var(--gray-700)" }}>Başlangıç</span>
              </div>
              <p style={{
                color: "var(--gray-900)",
                fontSize: "1rem",
                fontWeight: "500",
                margin: 0,
              }}>
                {formatDateTime(data.startDate)}
              </p>
            </div>

            <div style={{
              background: "white",
              padding: "1.25rem",
              borderRadius: "1rem",
              border: "1px solid var(--gray-200)",
              boxShadow: "var(--shadow-sm)",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.5rem",
              }}>
                <span style={{ fontSize: "1.25rem" }}>🏁</span>
                <span style={{ fontWeight: "600", color: "var(--gray-700)" }}>Bitiş</span>
              </div>
              <p style={{
                color: "var(--gray-900)",
                fontSize: "1rem",
                fontWeight: "500",
                margin: 0,
              }}>
                {formatDateTime(data.endDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Image Section */}
        {data.imagePath && (
          <div style={{
            padding: "2rem",
            borderBottom: "1px solid var(--gray-200)",
          }}>
            <img
              src={`http://localhost:5138/${data.imagePath}`}
              alt={data.title}
              style={{
                width: "100%",
                maxHeight: "400px",
                objectFit: "cover",
                borderRadius: "1rem",
                boxShadow: "var(--shadow-md)",
              }}
            />
          </div>
        )}

        {/* Content Section */}
        <div style={{ padding: "2.5rem" }}>
          {data.shortDescription && (
            <div style={{
              background: "var(--primary-50)",
              padding: "1.5rem",
              borderRadius: "1rem",
              border: "1px solid var(--primary-200)",
              marginBottom: "2rem",
            }}>
              <p style={{
                color: "var(--primary-800)",
                fontSize: "1.125rem",
                fontWeight: "500",
                margin: 0,
                lineHeight: "1.6",
              }}>
                💡 {data.shortDescription}
              </p>
            </div>
          )}

          {data.longDescription && (
            <div style={{
              fontSize: "1rem",
              lineHeight: "1.7",
              color: "var(--gray-700)",
            }}>
              <div dangerouslySetInnerHTML={{ __html: data.longDescription }} />
            </div>
          )}
        </div>

        {/* Related Events */}
        {data.last5 && data.last5.length > 0 && (
          <div style={{
            background: "var(--gray-50)",
            padding: "2.5rem",
            borderTop: "1px solid var(--gray-200)",
          }}>
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "var(--gray-900)",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}>
              🌟 İlginizi Çekebilecek Diğer Etkinlikler
            </h3>
            <div style={{
              display: "grid",
              gap: "1rem",
            }}>
              {data.last5.map(event => (
                <Link
                  key={event.eventId}
                  to={`/events/${event.eventId}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem 1.25rem",
                    background: "white",
                    borderRadius: "0.75rem",
                    textDecoration: "none",
                    boxShadow: "var(--shadow-sm)",
                    border: "1px solid var(--gray-200)",
                    transition: "all 200ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                  }}
                >
                  <div>
                    <h4 style={{
                      color: "var(--gray-900)",
                      fontWeight: "600",
                      fontSize: "1rem",
                      margin: "0 0 0.25rem 0",
                    }}>
                      {event.title}
                    </h4>
                    {event.startDate && (
                      <p style={{
                        color: "var(--gray-600)",
                        fontSize: "0.875rem",
                        margin: 0,
                      }}>
                        📅 {new Date(event.startDate).toLocaleDateString("tr-TR")}
                      </p>
                    )}
                  </div>
                  <span style={{
                    color: "var(--primary-600)",
                    fontSize: "1.125rem",
                  }}>
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        marginTop: "2rem",
        display: "flex",
        gap: "1rem",
        justifyContent: "center",
        flexWrap: "wrap",
      }}>
        <Link
          to="/events"
          className="btn-secondary"
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}
        >
          ← Diğer Etkinlikleri Keşfet
        </Link>
        
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
          📅 Takvimde Gör
        </Link>
      </div>
    </div>
  );
}