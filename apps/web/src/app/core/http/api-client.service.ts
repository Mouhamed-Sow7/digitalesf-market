import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

const API_BASE_URL = environment.apiBaseUrl;

@Injectable({ providedIn: "root" })
export class ApiClientService {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include", // indispensable : le JWT vit en cookie httpOnly
      headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? `Erreur API (${res.status})`);
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  get<T>(path: string) {
    return this.request<T>(path, { method: "GET" });
  }

  post<T>(path: string, body: unknown) {
    return this.request<T>(path, { method: "POST", body: JSON.stringify(body) });
  }
}
