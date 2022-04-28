import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AlertService } from 'src/app/core/services/alert/alert.service';
import { HttpService } from 'src/app/core/services/http/http.service';
import { LoadingService } from 'src/app/core/services/loading/loading.service';
import { TranslationService } from 'src/app/core/services/translation/translation.service';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { Order } from '../models/paymentTransaction';
import { money } from '../models/resultCode';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {
  cartCount = 0;
  phoneNumber = "";
  orders:Order[] = [];
  lang: any;

  constructor(
    private translateService: TranslationService,
    private localStorage: StorageService,
    private alertService: AlertService,
    private router: Router,
    private httpService: HttpService,
    private loadingService:LoadingService,
    private service:StoreService
  ) {

   }

  ngOnInit(): void {
    this.translateService.currentLanguage$.subscribe(lang => { this.lang = lang;  });
    this.checkValidUser();
  }

  checkValidUser(){
    let token = localStorage.getItem('token');
    let phone = this.localStorage.getHash('phoneNumber');
    let expDate = this.localStorage.getHash('expireDate');
    let jwt = new JwtHelperService ();
    if(token !== undefined && token !== null && !jwt.isTokenExpired(token) && phone !== undefined && phone !== null && phone !== ""){
        this.phoneNumber = phone??"";
        this.getPreviousOrders();
    }
    else{
      if(phone == undefined || phone == null || phone == ""
      || expDate == undefined || expDate == null || new Date(expDate) <= new Date()
      )
      {
        this.alertService.warning('عفوا عليك تسجيل الدخول لطلباتك السابقة');
        this.router.navigate(['/store/card-login']);
      }
      else{
        this.phoneNumber = phone??"";
        this.getPreviousOrders();
      }
    }  
  }

  getPreviousOrders(){
    this.service.getOrdersByPhoneNumber(this.phoneNumber.toString()).subscribe(res => {
       console.log("Finished Order", res);
       this.orders = res;
    });
  //  this.orders = [
  //    {
  //     id:1,
  //     code:67574,
  //     statusEn:'New',
  //     statusAr:'جديد',
  //     totalPayment:this.getmoney(1620),
  //     dayDate: new Date(),
  //     //accurecy:'SAR'
  //    },
  //    {
  //     id:8,
  //     code:2096,
  //     statusEn:'Cancelled',
  //     statusAr:'ملغي',
  //     totalPayment:this.getmoney(500),
  //     dayDate: new Date(),
  //     //accurecy:'SAR'
  //    },
     
  //  ];
  }

  getOrderDtails(orderId:any){    
    this.router.navigate([`/store/order-details/${orderId}`]);
  }

  getmoney(amount:number):money{
    let tt : money = {
      amount:amount, currencyAr:"ريال", currencyEn:"SAR"
    };
    return tt;
  }
  goToCards(){
    this.router.navigate(['/store']);

  }
  logOut(){
    this.deleteStorage();
    this.router.navigate(['/store/card-login']);
  }

  deleteStorage(){
    this.localStorage.removeItemHash('pay-prod');
    this.localStorage.removeItemHash('cart-prod');
    this.localStorage.removeItemHash('shcheckoutshId');
    this.localStorage.removeItemHash('expireDate');
    this.localStorage.removeItemHash('otpexpiration');
    this.localStorage.removeItemHash('phoneNumber');  

  }

}



