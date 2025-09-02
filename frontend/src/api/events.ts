// frontend/src/api/events.ts
import api from "./axios";

/* ── Tipler ──────────────────────────────────────────────────────────────── */
export type EventDto = {
  eventId: number;
  title: string;
  createdAt: string;       // DateTime -> ISO string
  startDate: string;
  endDate: string;
  shortDescription?: string;
  isActive: boolean;
  createdByName?: string | null;
};

/** Detay için geniş tip (controller detayında bunlar var) */
export type EventDetail = {
  eventId: number;
  title: string;
  startDate: string;
  endDate: string;
  shortDescription?: string;
  longDescription?: string;
  imagePath?: string;
  isActive: boolean;
  createdAt: string;
  createdByUser?: { userId: number; nameSurname: string; email: string } | null;
};

export type EventUpsert = {
  title: string;
  startDate: string;
  endDate: string;
  shortDescription?: string;
  longDescription?: string;
  imagePath?: string;
  isActive: boolean;
};

// ---- Public (Kullanıcı arayüzü) ----
export async function listPublic(): Promise<EventDto[]> {
  const r = await api.get<EventDto[]>("/event/public");
  return r.data;
}
export async function getPublicById(id: number): Promise<EventDetail> {
  const r = await api.get<EventDetail>(`/event/${id}/public`);
  return r.data;
}

// ---- Yönetim / Kullanıcıya özel ----
export async function listMine(): Promise<EventDto[]> {
  // Controller mine=true’yi filtre olarak kullanıyor
  const r = await api.get<EventDto[]>("/event", { params: { mine: true } });
  return r.data;
}
export async function getById(id: number): Promise<EventDetail> {
  const r = await api.get<EventDetail>(`/event/${id}`);
  return r.data;
}
export async function create(payload: EventUpsert): Promise<void> {
  await api.post("/event", payload);
}
export async function update(id: number, payload: EventUpsert): Promise<void> {
  await api.put(`/event/${id}`, payload);
}
export async function remove_(id: number): Promise<void> {
  await api.delete(`/event/${id}`);
}

// Sadece dosya alıyor, id değil -> { imagePath } döner
export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await api.post<{ imagePath: string }>("/event/upload-image", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return r.data.imagePath;
}