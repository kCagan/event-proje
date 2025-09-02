// src/pages/CalendarPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import api from "../api/axios";

type EventDto = {
  eventId: number;
  title: string;
  startDate: string;
  endDate: string;
};

export default function CalendarPage() {
  const [items, setItems] = useState<EventDto[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    api
      .get<EventDto[]>("/event/public-upcoming")
      .then((r) => setItems(r.data))
      .catch(() => setItems([]));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      {/* Listeye dönüş linki */}
      <Link to="/events">← Etkinlik listesi</Link>

      <div style={{ marginTop: 16 }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={items.map((e) => ({
            id: String(e.eventId),
            title: e.title,
            start: e.startDate,
            end: e.endDate,
          }))}
          eventClick={(info) => {
            nav(`/events/${info.event.id}`);
          }}
        />
      </div>
    </div>
  );
}
