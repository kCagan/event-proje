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
type DetailResponse = EventDto & { last5?: LastDto[]; createdByUser?: { nameSurname: string } | null };

export default function EventDetail() {
  const { id } = useParams();
  const [data, setData] = useState<DetailResponse | null>(null);

  useEffect(() => {
    if (!id) return;
    // Backend’de public detay endpoint’in (ör: /api/event/{id}/public) olduğunu biliyoruz
    api.get<DetailResponse>(`/event/${id}/public`).then(r => setData(r.data));
  }, [id]);

  if (!data) return <div style={{ padding: 16 }}>Yükleniyor…</div>;

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <Link to="/events">← Etkinlik listesi</Link>
      <h1 style={{ marginTop: 12 }}>{data.title}</h1>
      <div style={{ opacity: .8, marginBottom: 12 }}>
        {new Date(data.startDate).toLocaleString()} — {new Date(data.endDate).toLocaleString()}
        {data.createdByUser?.nameSurname ? ` • ${data.createdByUser.nameSurname}` : ""}
      </div>
      {data.imagePath && (
        <img src={`http://localhost:5138/${data.imagePath}`} alt={data.title} style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 16 }} />
      )}
      <div dangerouslySetInnerHTML={{ __html: data.longDescription ?? "" }} />

      {data.last5 && data.last5.length > 0 && (
        <>
          <hr style={{ margin: "24px 0" }} />
          <h3>Son 5 Etkinlik</h3>
          <ul>
            {data.last5.map(e => (
              <li key={e.eventId}>
                <a href={`/events/${e.eventId}`}>{e.title}</a>
                {e.startDate && ` — ${new Date(e.startDate).toLocaleDateString()}`}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
