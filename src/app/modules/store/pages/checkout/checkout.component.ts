import { DOCUMENT } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { Guid } from 'guid-typescript';
import * as moment from 'moment';
import { AlertService } from 'src/app/core/services/alert/alert.service';
import { HttpService } from 'src/app/core/services/http/http.service';
import { LoadingService } from 'src/app/core/services/loading/loading.service';
import { TranslationService } from 'src/app/core/services/translation/translation.service';
import { GlobalVars } from 'src/app/shared/constants';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { PaymentOrder, Product } from '../models/resultCode';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  lang: any;
  cartItems: Product[] = [];
  cartCount = 0;
  totalPrice = 0;
  phoneNumber:any;
  result:PaymentOrder = {};
  cardId:any = 'E9A59F52C2F3E746F7E414E5C9ECE8AC.uat01-vm-tx01';
  showPay = false;
  orderId:any;
  redirectUrl = "";

  //testMode=GlobalVars.TestModeVisa;
  entityId=GlobalVars.EnitiyIdMada;
  dataBrands = "MADA";
  payMethod = 2;
  BrowserName: any;
  constructor(
    private translateService: TranslationService,
    private localStorage: StorageService,
    private alertService: AlertService,
    private router: Router,
    private httpService: HttpService,
    private loadingService:LoadingService,
    private renderer2: Renderer2,
    private service:StoreService,
    @Inject(DOCUMENT) public _document: Document
  ) {
   }

  ngOnInit(): void {
    this.BrowserName=getBrowserName() ;

    this.translateService.currentLanguage$.subscribe(lang => { this.lang = lang;  });
    this.redirectUrl = this.getRedirectUrl();
    this.result = this.getCartStorage();
    if(this.result == null || this.result == undefined){
      this.alertService.warning('عفوا سلة التسوق فارغة');
      this.router.navigate(['/store']);
    }
    else{
      // this.orderId = Guid.create();
      // this.localStorage.setHash("lastOrderId",this.orderId);
      this.cartCount = this.result.cartCount ?? 0;
      this.cartItems = this.result.products??[];
      this.phoneNumber = this.result.phoneNumber;
      this.totalPrice = this.result.totalPrice??0;
      let expDate = moment(new Date()).add(1,"days").toDate();
      this.localStorage.setHash('expireDate',expDate);
      this.localStorage.setHash('phoneNumber',this.phoneNumber);
      this.setProductsAndGetOrderId();
      //this.initPayCard();
    }
  }
  getCartStorage(): any{
    return this.localStorage.getObjectHash('pay-prod');
  }
  getTotalCount(){
    return this.cartItems.length;
  }

  setProductsAndGetOrderId(){
    this.service.addProducts(this.result).subscribe(res=>{
      if(res !== undefined && res !== null && res !== "")
      {
          this.orderId = res;
          this.localStorage.setHash("lastOrderId",this.orderId);
          this.initPayCard();
      }
    },error => {
      this.alertService.error(" حصل خطأ عند تسجيل البيانات يرجى المحاولة مرة آخرى");
    });
  }

  initPayCard(){ 
    this.loadingService.showLoader();
     var body = this.getBody();
     this.httpService.postSpecific(GlobalVars.ApiGatewayUrl,body).subscribe((data: any) => {
      console.log(`🚀 ~ this.httpService.get ~ data`, data);
      this.cardId = data.id;
      this.localStorage.setHash("shcheckoutshId",this.cardId)
     this.addJavaScripts();
      this.showPay = true;
      this.delay();
      //this.loadingService.hideLoader();
    },error => {
      this.loadingService.hideLoader();
    });
  }

  delay(){
     setTimeout(() => {
      this.loadingService.hideLoader();
    }, 2000);
  }

  addJavaScripts(){
    const s = this.renderer2.createElement('script');
    s.type = 'text/javascript';
    s.src = GlobalVars.ApiFormUrl+this.cardId;
    s.text = ``;
    this.renderer2.appendChild(this._document.body, s);
    const s2 = this.renderer2.createElement('script');
    s2.type = 'text/javascript';
    s2.text = `var wpwlOptions = { locale: "${this.lang}",
    applePay: {
      displayName: "ALSADHAN",
      total: { label: "ALSADHAN" },
      supportedNetworks: ["masterCard", "visa", "mada"],
      supportedCountries: ["SA"]
    }
  
  
  }`;
    //s2.text = `var wpwl-container = { direction: "ltr" }`;
    this.renderer2.appendChild(this._document.body, s2);
  }
  getBody():string{
    let body = "entityId=" + this.entityId 
    + "&amount="+ this.totalPrice 
    +  "&currency="+ GlobalVars.Currency 
    + "&paymentType=" + GlobalVars.PaymentType
    //comment testMode in production
    //+ "&testMode="+ this.testMode
    + "&customer.email="+this.phoneNumber+"@al-sadhan.com"
    + "&billing.street1=Riyadh"
    + "&billing.city=Riyadh"
    + "&billing.state=Riyadh"
    + "&billing.country=SA"
    + "&billing.postcode=12345"
    + "&customer.givenName="+this.phoneNumber
    + "&customer.surname="+this.phoneNumber
    + "&merchantTransactionId="+this.orderId;
    return body;
  }

  getRedirectUrl(){
    let currentDomain = window.location.href.split("store")[0];
    return currentDomain + "store/transaction-result/"+this.entityId+"/";
  }
  

  changePayMethod(event:any){
    console.log(event);
    if(event.value == '1'){
      this.entityId = GlobalVars.EnitiyIdVisa;
      this.dataBrands = "VISA MASTER";
      this.payMethod = 1;
      //this.testMode = GlobalVars.TestModeVisa;
    }
    else if (event.value=='2') {
      this.entityId = GlobalVars.EnitiyIdMada;
      this.dataBrands = "MADA";
      this.payMethod = 2;
      //this.testMode = GlobalVars.TestModeMada;
    }
    else{
      this.entityId = GlobalVars.EnitiyIdAPPLE;
      this.dataBrands = "APPLEPAY";
      this.payMethod = 3;
      
    }
    
    this.redirectUrl = this.getRedirectUrl();
    this.initPayCard();
  }
}


export class ApiData{
  entityId?:string;
  amount?:string;
  currency?:string;
  paymentType?:string;

}

function getBrowserName() {
  const agent = window.navigator.userAgent.toLowerCase()
  switch (true) {
    case agent.indexOf('edge') > -1:
      return 'edge';
    case agent.indexOf('opr') > -1 && !!(<any>window).opr:
      return 'opera';
    case agent.indexOf('chrome') > -1 && !!(<any>window).chrome:
      return 'chrome';
    case agent.indexOf('trident') > -1:
      return 'ie';
    case agent.indexOf('firefox') > -1:
      return 'firefox';
    case agent.indexOf('safari') > -1:
      return 'safari';
    default:
      return 'other';
  }
}