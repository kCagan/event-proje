import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { EventDto } from "../../api/events";
import { listMine } from "../../api/events";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });

const fmtRange = (startIso: string, endIso: string) =>
  `${fmt(startIso)} — ${fmt(endIso)}`;

export default function MyEventsList() {
  const [items, setItems] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

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

  if (loading) return <div style={{ padding: 16 }}>Yükleniyor…</div>;
  if (err) return <div style={{ padding: 16, color: "tomato" }}>{String(err)}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Etkinliklerim</h2>

      <ul style={{ lineHeight: 1.9, marginTop: 8 }}>
        {items.map(ev => (
          <li key={ev.eventId} style={{ marginBottom: 6 }}>
            <Link to={`/events/${ev.eventId}`} style={{ fontWeight: 600 }}>
              {ev.title}
            </Link>{" "}
            <span style={{ opacity: 0.85 }}>
              — {fmtRange(ev.startDate, ev.endDate)} • {ev.isActive ? "Aktif" : "Pasif"}
            </span>
            <Link
              to={`/me/events/${ev.eventId}`}     // 🔧 doğru rota
              style={{ marginLeft: 10, fontSize: 14, opacity: 0.9 }}
            >
              (düzenle)
            </Link>
          </li>
        ))}
      </ul>

      {items.length === 0 && <div>Kayıtlı etkinliğin yok.</div>}
    </div>
  );
}
