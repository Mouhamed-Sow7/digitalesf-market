import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/auth/auth.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4">
      <form class="w-full max-w-sm space-y-4" (ngSubmit)="submit()">
        <h1 class="text-xl font-semibold">Créer un compte vendeur</h1>

        <input class="w-full border rounded px-3 py-2" placeholder="Nom affiché"
               name="displayName" [(ngModel)]="displayName" required />
        <input class="w-full border rounded px-3 py-2" type="email" placeholder="Email"
               name="email" [(ngModel)]="email" required />
        <input class="w-full border rounded px-3 py-2" type="password" placeholder="Mot de passe (8 caractères min.)"
               name="password" [(ngModel)]="password" required minlength="8" />
        <input class="w-full border rounded px-3 py-2" placeholder="Pays (ex: FR, SN, CI)"
               name="country" [(ngModel)]="country" maxlength="2" required />

        @if (error()) {
          <p class="text-sm text-red-600">{{ error() }}</p>
        }

        <button class="w-full bg-black text-white rounded px-3 py-2" type="submit">
          Créer mon compte
        </button>

        <p class="text-sm text-center">
          Déjà un compte ? <a routerLink="/login" class="underline">Se connecter</a>
        </p>
      </form>
    </div>
  `,
})
export class RegisterComponent {
  displayName = "";
  email = "";
  password = "";
  country = "";
  error = signal<string | null>(null);

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  async submit() {
    this.error.set(null);
    try {
      await this.auth.register({
        email: this.email,
        password: this.password,
        displayName: this.displayName,
        country: this.country.toUpperCase(),
      });
      this.router.navigate(["/dashboard"]);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : "Erreur lors de la création du compte");
    }
  }
}
