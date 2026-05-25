import { API_BASE_URL, ENDPOINTS } from "@/lib/api-config";
import { getAuthToken, setAuthToken, removeAuthToken } from "@/lib/auth";
import type { Billet, BilletDetail, Commentaire, CurrentUser } from "@/types";

export class BilletService {

  private static async request(
    path: string,
    options: RequestInit & { auth?: boolean } = {}
  ): Promise<Response> {
    const { auth, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers as Record<string, string>),
    };

    if (auth) {
      const token = await getAuthToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? `Erreur API ${res.status}`);
    }
    return res;
  }

  static async fetchBillets(): Promise<Billet[]> {
    const res  = await this.request(ENDPOINTS.billets);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Réponse API invalide");
    return data as Billet[];
  }

  static async fetchBilletDetail(id: string): Promise<BilletDetail> {
    const res = await this.request(ENDPOINTS.billetDetail(id), { auth: true });
    const json = await res.json();
    return (json.data ?? json) as BilletDetail;
  }

  static async fetchCurrentUser(): Promise<CurrentUser> {
    const res = await this.request(ENDPOINTS.user, { auth: true });
    const json = await res.json();
    return (json.data ?? json) as CurrentUser;
  }

  static async postCommentaire(payload: {
    COM_CONTENU: string;
    billet_id: number;
    user_id: number;
  }): Promise<Commentaire> {
    const res = await this.request(ENDPOINTS.commentaires, {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return (json.data ?? json) as Commentaire;
  }

  // Appel direct à l'API Laravel — pas de proxy CSRF nécessaire en mobile
  // (Sanctum Bearer Token ne requiert pas de CSRF, contrairement à la session cookie)
  static async login(email: string, password: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}${ENDPOINTS.login}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const rawText = await res.text();
    if (!res.ok) {
      const body = (() => { try { return JSON.parse(rawText); } catch { return {}; } })();
      throw new Error(body.message ?? `Erreur ${res.status}`);
    }
    const token = rawText.trim();
    if (!token || !token.includes("|")) throw new Error("Token invalide reçu du serveur.");
    await setAuthToken(token);
  }

  static async logout(): Promise<void> {
    await removeAuthToken();
  }

  static async register(name: string, email: string, password: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}${ENDPOINTS.register}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? `Erreur ${res.status}`);
    }
  }
}
