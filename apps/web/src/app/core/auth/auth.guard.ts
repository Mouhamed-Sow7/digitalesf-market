import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    await auth.loadCurrentUser();
  }

  if (auth.isAuthenticated()) return true;

  router.navigate(["/login"]);
  return false;
};
