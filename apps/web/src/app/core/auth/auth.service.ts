import { Injectable, signal } from "@angular/core";
import { ApiClientService } from "../http/api-client.service";

export interface CurrentUser {
  id: string;
  email: string;
  profile: { displayName: string };
}

@Injectable({ providedIn: "root" })
export class AuthService {
  // Signals plutôt qu'un store global (NgRx) — décision CTO : pas de complexité
  // avant douleur réelle sur un état aussi simple qu'un utilisateur courant.
  readonly currentUser = signal<CurrentUser | null>(null);
  readonly isAuthenticated = signal(false);

  constructor(private api: ApiClientService) {}

  async register(payload: { email: string; password: string; displayName: string; country: string }) {
    const user = await this.api.post<CurrentUser>("/auth/register", payload);
    this.setUser(user);
    return user;
  }

  async login(payload: { email: string; password: string }) {
    const user = await this.api.post<CurrentUser>("/auth/login", payload);
    this.setUser(user);
    return user;
  }

  async logout() {
    await this.api.post("/auth/logout", {});
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  async loadCurrentUser() {
    try {
      const user = await this.api.get<CurrentUser>("/auth/me");
      this.setUser(user);
    } catch {
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
    }
  }

  private setUser(user: CurrentUser) {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }
}
