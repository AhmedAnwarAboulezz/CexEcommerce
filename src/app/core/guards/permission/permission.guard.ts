import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserPath, UserType } from '../../enum/user.enum';
import { HttpService } from '../../services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  
  userPath = UserPath
  userTypes = UserType;

  constructor(private http: HttpService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const userType = +this.http.getUserToken().UserType;
      if (route.data.allowedUserTypes.includes(userType)) {
        return true;
      }
      
      const userPath = this.userTypes[userType] as ('Admin' | 'Customer' | 'Mareking' | 'Support' | 'Store' | 'TopManagement');
      const allowedPath = this.userPath[userPath];
      this.router.navigateByUrl(allowedPath);
      return false;
  }
  
}
