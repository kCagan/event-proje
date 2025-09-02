import api from "./axios";

export type LoginRequest = { email: string; password: string };
export type RegisterRequest = {
  nameSurname: string;
  email: string;
  password: string;
  birthDate: string; // ISO string: "2000-05-18T00:00:00Z" gibi
};

export async function login(data: LoginRequest) {
  // Backend: POST /api/user/login  -> { token: "..." }
  const res = await api.post<{ token: string }>("/user/login", data);
  return res.data;
}

export async function register(data: RegisterRequest) {
  // Backend: POST /api/user/register
  const res = await api.post("/user/register", data);
  return res.data;
}
export function getToken(): string | null {
  return localStorage.getItem("token");
}
export function clearToken() {
  localStorage.removeItem("token");
}

export function getUserIdFromToken(): number | null {
  const t = localStorage.getItem("token");
  if (!t) return null;
  try {
    const payload = JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    // ASP.NET JWT’lerde genelde nameid ya da sub olur:
    const v = payload.nameid ?? payload.sub ?? payload.userId ?? null;
    return v ? Number(v) : null;
  } catch { return null; }
}