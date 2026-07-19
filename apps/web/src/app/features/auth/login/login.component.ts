import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/auth/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4">
      <form class="w-full max-w-sm space-y-4" (ngSubmit)="submit()">
        <h1 class="text-xl font-semibold">Connexion</h1>

        <input class="w-full border rounded px-3 py-2" type="email" placeholder="Email"
               name="email" [(ngModel)]="email" required />
        <input class="w-full border rounded px-3 py-2" type="password" placeholder="Mot de passe"
               name="password" [(ngModel)]="password" required />

        @if (error()) {
          <p class="text-sm text-red-600">{{ error() }}</p>
        }

        <button class="w-full bg-black text-white rounded px-3 py-2" type="submit">
          Se connecter
        </button>

        <p class="text-sm text-center">
          Pas de compte ? <a routerLink="/register" class="underline">Créer un compte</a>
        </p>
      </form>
    </div>
  `,
})
export class LoginComponent {
  email = "";
  password = "";
  error = signal<string | null>(null);

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  async submit() {
    this.error.set(null);
    try {
      await this.auth.login({ email: this.email, password: this.password });
      this.router.navigate(["/dashboard"]);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : "Erreur de connexion");
    }
  }
}
