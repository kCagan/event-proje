import api from "./axios";

export type UserDto = {
  userId: number;
  nameSurname: string;
  email: string;
  birthDate?: string;
};

// ⬇️ YENİ: Event ve detay tipleri
export type EventDto = {
  eventId: number;
  title: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export type UserDetailDto = UserDto & {
  createdAt?: string;
  events?: EventDto[];
};


export function getUserIdFromToken(): number | null {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const id = payload?.userId ?? payload?.nameid ?? payload?.sub;
    return typeof id === "string" ? parseInt(id, 10) : Number(id);
  } catch {
    return null;
  }
}

export async function getById(id: number) {
  const r = await api.get<UserDto>(`/user/${id}`);
  return r.data;
}

// ⬇️ YENİ: Detay (events dahil)
export async function getDetailById(id: number) {
  const r = await api.get<UserDetailDto>(`/user/${id}`);
  return r.data;
}

export async function update(id: number, body: Partial<UserDto> & { password?: string }) {
  const r = await api.put(`/user/${id}`, body);
  return r.data;
} 
