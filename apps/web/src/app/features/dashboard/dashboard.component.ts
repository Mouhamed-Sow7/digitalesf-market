import { Component } from "@angular/core";
import { AuthService } from "../../core/auth/auth.service";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen p-4 space-y-4">
      <header class="flex items-center justify-between">
        <h1 class="text-lg font-semibold">
          Bonjour {{ auth.currentUser()?.profile?.displayName }}
        </h1>
        <button class="text-sm underline" (click)="logout()">Déconnexion</button>
      </header>

      <a routerLink="/products/new"
         class="block w-full text-center bg-black text-white rounded py-3">
        + Créer un produit
      </a>

      <section>
        <h2 class="text-sm text-gray-500 mb-2">Mes produits</h2>
        <p class="text-sm text-gray-400">Aucun produit pour l'instant — module Produit, sprint 1 suite.</p>
      </section>
    </div>
  `,
})
export class DashboardComponent {
  constructor(public auth: AuthService) {}

  async logout() {
    await this.auth.logout();
  }
}
