// src/pages/CalendarPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import api from "../api/axios";
import { getUserIdFromToken } from "../api/users";
import { listPublic, listMine } from "../api/events";

type EventDto = {
  eventId: number;
  title: string;
  startDate: string;
  endDate: string;
};

type UserDetailDto = {
   userId: number;
   nameSurname: string;
   email: string;
   birthDate?: string;
   createdAt?: string;
   events?: EventDto[];
 };


export default function CalendarPage() {
  const [items, setItems] = useState<EventDto[]>([]);
  const [myIds, setMyIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();
  const toDate = (s?: string) =>
  !s ? (undefined as unknown as Date)
     : new Date(/^\d{4}-\d{2}-\d{2}\s/.test(s) ? s.replace(" ","T") : s);

const fmtTime = (d: Date) =>
  d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", hour12: false });

// takvime gidecek eventler (sadece BAŞLANGIÇ ve BİTİŞ kutuları)
const calendarEvents = items.flatMap(e => {
  const s  = toDate(e.startDate);
  const en = toDate(e.endDate);
  const arr: any[] = [];

  if (s) {
    arr.push({
      id: `${e.eventId}-s`,
      title: `${fmtTime(s)} ${e.title} (Başlangıç)`,
      start: s,
      end: new Date(s.getTime() + 60 * 1000), // 1 dk: tek kutu görünür
      extendedProps: { originalId: e.eventId },
    });
  }
  if (en) {
    arr.push({
      id: `${e.eventId}-e`,
      title: `${fmtTime(en)} ${e.title} (Bitiş)`,
      start: en,
      end: new Date(en.getTime() + 60 * 1000),
      extendedProps: { originalId: e.eventId },
    });
  }
  return arr;
});

  useEffect(() => {
  (async () => {
    try {
      setLoading(true);
      setError(null);

      // public + benim etkinliklerim (auth yoksa mine boş dönsün)
      const [pub, mine] = await Promise.all([
        listPublic(),                   // /event/public
        listMine().catch(() => [])      // /event?mine=true
      ]);

      // Tekilleştir
      const map = new Map<number, EventDto>();
      for (const e of [...pub, ...mine]) {
        if (!e) continue;
        map.set(e.eventId, e);
      }
      setItems(Array.from(map.values()));
      setMyIds(new Set(mine.map(e => e.eventId)));
    } catch (e: any) {
      setError(e?.response?.data ?? e.message ?? "Etkinlikler yüklenemedi");
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
          <p style={{ color: "var(--gray-600)" }}>Takvim yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">
          ⚠️ {error}
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
            📅 Etkinlik Takvimi
          </h1>
          <p style={{
            color: "var(--gray-600)",
            fontSize: "1.125rem",
            margin: 0,
          }}>
            {items.length} etkinlik takvim görünümünde
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "0.75rem" }}>
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
              fontSize: "0.875rem",
              fontWeight: "600",
            }}
          >
            📋 Liste Görünümü
          </Link>
          
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
              fontSize: "0.875rem",
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
            ➕ Yeni Etkinlik
          </Link>
        </div>
      </div>

      {/* Calendar Container */}
      <div style={{
        background: "white",
        borderRadius: "1.5rem",
        boxShadow: "var(--shadow-xl)",
        border: "1px solid var(--gray-200)",
        padding: "2rem",
        overflow: "hidden",
      }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="tr"
        height="auto"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        buttonText={{ today: 'Bugün', month: 'Ay', week: 'Hafta' }}

        /* ⬇️ sadece başlangıç & bitiş kutuları */
        events={calendarEvents}

        /* ⬇️ FullCalendar'ın kendi saatini gizle (başlıkta biz gösteriyoruz) */
        displayEventTime={false}

        /* ⬇️ Benim etkinliklerime sınıf ekle (arka planı yeşile boyayacağız) */
        eventClassNames={(arg) =>
          myIds.has(Number(arg.event.extendedProps?.originalId)) ? ['mine'] : []
        }

        eventClick={(info) => {
          const originalId = info.event.extendedProps?.originalId ?? info.event.id;
          nav(`/events/${originalId}`);
        }}

        dayCellDidMount={(info) => {
          if (info.isToday) {
            info.el.style.backgroundColor = 'var(--primary-50)';
            info.el.style.borderRadius = '0.5rem';
          }
        }}

        eventDidMount={(info) => {
        const isMine = myIds.has(Number(info.event.extendedProps?.originalId));
        const anchor = (info.el.querySelector('a') as HTMLElement) ?? (info.el as HTMLElement);

        // ortak stil
        info.el.style.cursor = 'pointer';
        info.el.style.transition = 'all 150ms ease';
        info.el.style.borderRadius = '0.375rem';
        info.el.style.fontSize = '0.875rem';
        info.el.style.fontWeight = '600';

        // renkler
        const baseBg     = isMine ? 'var(--success-600)' : 'var(--primary-600)';
        const hoverBg    = isMine ? 'var(--success-700)' : 'var(--primary-700)';
        const baseBorder = isMine ? '#08f45fff'            : 'var(--primary-700)';

        // arka plan + yazı + BORDER
        anchor.style.backgroundColor = baseBg;
        anchor.style.color = '#ffffffff';
        anchor.style.border = `1px solid ${baseBorder}`;
        anchor.style.borderRadius = '0.375rem';

        // hover
        anchor.addEventListener('mouseenter', () => {
          anchor.style.transform = 'translateY(-1px)';
          anchor.style.boxShadow = 'var(--shadow-md)';
          anchor.style.backgroundColor = hoverBg;
          anchor.style.borderColor = isMine ? '#00f314ff' : 'var(--primary-800)';
          anchor.style.zIndex = '10';
        });
        anchor.addEventListener('mouseleave', () => {
          anchor.style.transform = 'none';
          anchor.style.boxShadow = 'none';
          anchor.style.backgroundColor = baseBg;
          anchor.style.borderColor = baseBorder;
          anchor.style.zIndex = 'auto';
        });
      }}
      />
      </div>

      {/* Calendar Legend */}
      <div style={{
        marginTop: "2rem",
        padding: "1.5rem",
        background: "white",
        borderRadius: "1rem",
        boxShadow: "var(--shadow)",
        border: "1px solid var(--gray-200)",
      }}>
        <h3 style={{
          fontSize: "1.125rem",
          fontWeight: "600",
          color: "var(--gray-800)",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}>
          💡 Kullanım İpuçları
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          fontSize: "0.875rem",
          color: "var(--gray-600)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1rem" }}>🖱️</span>
            Etkinliğe tıklayarak detayları görüntüle
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1rem" }}>📱</span>
            Mobil cihazlarda kaydırarak gezin
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1rem" }}>🔄</span>
            Görünüm değiştirmek için üst menüyü kullanın
          </div>
        </div>
      </div>

      {/* Statistics */}
      {items.length > 0 && (
        <div style={{
          marginTop: "2rem",
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
              icon: "📅",
              label: "Bu Ay",
              value: items.filter(e => {
                const eventDate = new Date(e.startDate);
                const now = new Date();
                return eventDate.getMonth() === now.getMonth() && 
                       eventDate.getFullYear() === now.getFullYear();
              }).length,
              color: "var(--success-500)"
            },
            {
              icon: "⏰",
              label: "Bu Hafta",
              value: items.filter(e => {
                const d = new Date(e.startDate);
                const now = new Date();
                const start = new Date(now);
                start.setHours(0,0,0,0);
                // Haftayı Pazartesi başlangıçlı alalım:
                const day = (start.getDay() + 6) % 7; // 0=Mon
                start.setDate(start.getDate() - day);
                const end = new Date(start);
                end.setDate(end.getDate() + 6);
                end.setHours(23,59,59,999);
                return d >= start && d <= end;
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

      {/* Empty State */}
      {items.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "4rem 2rem",
          background: "white",
          borderRadius: "1.5rem",
          boxShadow: "var(--shadow)",
          border: "1px solid var(--gray-200)",
          marginTop: "2rem",
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.5 }}>📅</div>
          <h3 style={{ marginBottom: "0.5rem", color: "var(--gray-700)" }}>
            Takvimde gösterilecek etkinlik yok
          </h3>
          <p style={{ color: "var(--gray-500)", marginBottom: "2rem" }}>
            Yeni etkinlikler eklendikçe burada görüntülenecek
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
              boxShadow: "var(--shadow-md)",
            }}
          >
            ➕ İlk Etkinliği Oluştur
          </Link>
        </div>
      )}

      {/* Custom CSS for FullCalendar */}
      <style>{`
        .fc {
          font-family: var(--font-sans);
        }
        
        .fc-theme-standard .fc-scrollgrid {
          border: 1px solid var(--gray-200);
          border-radius: 0.75rem;
          overflow: hidden;
        }
        
        .fc-theme-standard th {
          background: var(--gray-50);
          border-color: var(--gray-200);
          color: var(--gray-700);
          font-weight: 600;
          font-size: 0.875rem;
          padding: 1rem 0.5rem;
        }
        
        .fc-theme-standard td {
          border-color: var(--gray-200);
          padding: 0.5rem;
        }
        
        .fc-daygrid-day-number {
          color: var(--gray-700);
          font-weight: 600;
          font-size: 0.875rem;
          padding: 0.5rem;
        }
        
        .fc-day-today .fc-daygrid-day-number {
          background: var(--primary-600);
          color: white;
          border-radius: 0.375rem;
          width: 1.75rem;
          height: 1.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .fc-button {
          background: white !important;
          border: 1px solid var(--gray-300) !important;
          color: var(--gray-700) !important;
          font-weight: 600 !important;
          border-radius: 0.5rem !important;
          padding: 0.5rem 1rem !important;
          transition: all 150ms ease !important;
        }
        
        .fc-button:hover {
          background: var(--gray-50) !important;
          border-color: var(--gray-400) !important;
          transform: translateY(-1px) !important;
          box-shadow: var(--shadow-sm) !important;
        }
        
        .fc-button-primary:not(:disabled).fc-button-active {
          background: var(--primary-600) !important;
          border-color: var(--primary-600) !important;
          color: white !important;
        }
        
        .fc-toolbar-title {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          color: var(--gray-900) !important;
        }
        
        .fc-event {
          border-radius: 0.375rem !important;
          border: none !important;
          font-size: 0.875rem !important;
          font-weight: 600 !important;
          padding: 0.125rem 0.5rem !important;
        }
        
        .fc-daygrid-event {
          margin-bottom: 0.25rem !important;
        }
        
        @media (max-width: 768px) {
          .fc-toolbar {
            flex-direction: column !important;
            gap: 1rem !important;
          }
          
          .fc-toolbar-chunk {
            display: flex !important;
            justify-content: center !important;
            flex-wrap: wrap !important;
            gap: 0.5rem !important;
          }
          
          .fc-button {
            font-size: 0.75rem !important;
            padding: 0.375rem 0.75rem !important;
          }
          
          .fc-toolbar-title {
            font-size: 1.25rem !important;
            text-align: center !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}