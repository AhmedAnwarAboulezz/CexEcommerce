import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (state.url.includes('account')) {
      if (localStorage.getItem('token')) {
        this.router.navigate(['/home']);
        return false;
      } else {
        return true;
      }
    } else if (state.url.includes('home')) {
      if (localStorage.getItem('token')) {
        return true;
      } else {
        this.router.navigate(['/account']);
        return false;
      }
    }

    return true;
  }
}
