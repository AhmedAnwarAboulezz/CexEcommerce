import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpService } from '../http/http.service';
import { TranslationService } from '../translation/translation.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userDetails: BehaviorSubject<any> = new BehaviorSubject(null);
  private userId: string;
  private userTypeId: string;

  constructor(private http: HttpService, private translateService: TranslationService) {
    this.userId = this.http.getUserToken().UserId;
    this.userTypeId = this.http.getUserToken().UserTypeId;
  }
  
  get userDetails$(): Observable<any> {
    this.translateService.currentLanguage$.subscribe(lang => {
      if (this.userDetails.value) {
        return this.userDetails.asObservable();
      }
      
      return this.getUserData().subscribe(value => {
        this.getUserCard().subscribe(cardDetails => {
          value ? value['cardDetails'] = cardDetails : '';
          this.userDetails.next(value);
        });
      });
    });
    
    return this.userDetails.asObservable();
  }
  
  private getUserData(): Observable<any> {
    return this.http.get(`Users/Get/${this.userId}`);
  }

  private getUserCard(): Observable<any> {
    return this.http.get(`Cards/GetByCustomerId/${this.userTypeId}`);
  }
}
