import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

type EventDto = {
  eventId: number;
  title: string;
  startDate: string;
  endDate: string;
  shortDescription?: string;
  isActive: boolean;
  createdByName?: string;
  imagePath?: string;
  createdAt?: string;
};

const fmt = (d: string) => new Date(d).toLocaleString();

export default function Events() {
  const [items, setItems] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Tüm etkinlikleri çekiyoruz; istersen scope'u değiştirirsin.
        const res = await api.get<EventDto[]>("/event", { params: { scope: "public-upcoming" } });
        setItems(res.data);
      } catch (e: any) {
        setErr(e?.response?.data ?? e.message ?? "Bilinmeyen hata");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Yükleniyor…</div>;
  if (err) return <div style={{ padding: 16, color: "tomato" }}>Hata: {String(err)}</div>;

  return (
    <div style={{ padding: 16 }}>
      {items.length === 0 ? (
        <div>Gösterilecek etkinlik yok.</div>
      ) : (
        <ul style={{ lineHeight: 1.8 }}>
          {items.map((ev) => (
            <li key={ev.eventId} style={{ marginBottom: 8 }}>
              {/* 🔗 Detay sayfasına link */}
              <strong>
                <Link to={`/events/${ev.eventId}`}>{ev.title}</Link>
              </strong>{" "}
              — {fmt(ev.startDate)} – {fmt(ev.endDate)}
              {ev.createdByName ? <em> ({ev.createdByName})</em> : null}
              {ev.shortDescription ? (
                <div style={{ fontSize: 14, opacity: 0.8 }}>{ev.shortDescription}</div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {/* İsteğe bağlı: Takvim görünümü linki */}
      <div style={{ marginTop: 16 }}>
        <Link to="/calendar">Takvim görünümüne geç</Link>
      </div>
    </div>
  );
}
