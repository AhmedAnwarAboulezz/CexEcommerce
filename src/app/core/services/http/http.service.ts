import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlertService } from '../alert/alert.service';
import { environment } from './../../../../environments/environment';

interface User {
  jti: string;
  sub: string;
  UserId: string;
  UserTypeId: string;
  UserType: string;
  Role: string;
  exp: number;
  iss: string;
  aud: string;
}
@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private serverUrl = environment.hostAPI;

  constructor(private http: HttpClient, private alertService: AlertService) {}

  get<T>(APIName: string): Observable<T | any> {
    return this.http.get<T>(`${this.serverUrl}${APIName}`).pipe(
      map((event: any) => {
        if (event.data?.data || event.data) {
          return event.data;
        } else {
          this.alertHandling(event);
          return;
        }
      })
    );
  }
  getWithDataOnly<T>(APIName: string): Observable<T | any> {
    return this.http.get<T>(`${this.serverUrl}${APIName}`).pipe(
      map((event: any) => {
        return event.data;
      })
    );
  }

  post(APIName: string, body?: any) {
    return this.http
      .post(`${this.serverUrl}${APIName}`, body ? body : null)
      .pipe(
        map((event: any) => {
          console.log(`🚀 ~ returnthis.http.post ~ event`, event);
          if (event.data) {
            return event.data;
          }

          if (event.result) {
            return event.result;
          }

          this.alertHandling(event);
          return;
        })
      );
  }

  put(APIName: string, body: any) {
    return this.http.put(`${this.serverUrl}${APIName}`, body).pipe(
      map((event: any) => {
        this.alertHandling(event);
        return event.data;
      })
    );
  }

  delete(APIName: string, body?: any) {
    return this.http
      .delete(`${this.serverUrl}${APIName}`, body ? body : null)
      .pipe(
        map((event: any) => {
          this.alertHandling(event);
          return event.data;
        })
      );
  }

  private alertHandling(event: any) {
    if (event.status) {
      if (
        event.status === 200 ||
        event.status === 201 ||
        event.status === 202
      ) {
        this.alertService.success(
          event.message ? event.message : 'Successfully Done...'
        );
      } else {
        this.alertService.error(
          event.message ? event.message : 'Technical Error'
        );
      }
    } else {
      if (
        event.result.status === 200 ||
        event.result.status === 201 ||
        event.result.status === 202
      ) {
        this.alertService.success(
          event.result.message ? event.result.message : 'Successfully Done...'
        );
      } else {
        this.alertService.error(
          event.result.message ? event.result.message : 'Technical Error'
        );
      }
    }
  }

  getUserToken(): User {
    return this.convertTokenJWT();
  }

  convertTokenJWT(token = localStorage.getItem('token') as string) {
    if (token) {
      let base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'),
        jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
        );

      return JSON.parse(jsonPayload);
    }
  }


  postSpecific(apiUrl: string, body?: any, option?:any) {
    return this.http
      .post(apiUrl, body ? body : null,option);
  }

  getSpecific(apiUrl: string, option?:any) {
    return this.http
      .get(apiUrl,option);
  }

}
