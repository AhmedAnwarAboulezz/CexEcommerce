import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/core/services/alert/alert.service';
import { HttpService } from 'src/app/core/services/http/http.service';
import { LoadingService } from 'src/app/core/services/loading/loading.service';
import { TranslationService } from 'src/app/core/services/translation/translation.service';
import { GlobalVars } from 'src/app/shared/constants';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { PaymentTransaction } from '../models/paymentTransaction';
import { PaymentCard, PaymentOrder, PaymentTransactionDetail, Product, ResultCode } from '../models/resultCode';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-transaction-result',
  templateUrl: './transaction-result.component.html',
  styleUrls: ['./transaction-result.component.scss']
})
export class TransactionResultComponent implements OnInit {
  lang: any;
  cartItems: Product[] = [];
  cartCount = 0;
  totalPrice = 0;
  phoneNumber:any;
  result:PaymentOrder = {};
  checkoutId="";
  counter=10;
  transationId = "";
  entityId = GlobalVars.EnitiyIdVisa;
  showRedirectbtn = false;
  constructor(
    private translateService: TranslationService,
    private localStorage: StorageService,
    private alertService: AlertService,
    private router: Router,
    private httpService: HttpService,
    private loadingService:LoadingService,
    private activeRoute: ActivatedRoute,
    private service:StoreService,
    public route: ActivatedRoute
  ) {
    this.route.params.subscribe((p: any) => { this.entityId = p.cardId; });

    let path =  this.activeRoute.snapshot.queryParams.resourcePath;
    if(path!== undefined && path !== null){
      this.checkoutId = path.split("/checkouts/")[1].split("/")[0];
    }
   }

  ngOnInit(): void {
    debugger;
    this.result = this.localStorage.getObjectHash('pay-prod');
    if(this.result !== null){
      //this.loadingService.showLoader();
      //this.cartCount = this.result.cartCount ?? 0;
      //this.checkoutId = this.localStorage.getHash("shcheckoutshId")??"";

      this.cartItems = this.result.products??[];
      this.phoneNumber = this.result.phoneNumber;
      this.totalPrice = this.result.totalPrice??0;
      this.getPayment();
    }
  }

  getPayment(){ 
    debugger;
    this.loadingService.showLoader();
    let url = GlobalVars.PaymentDetailsUrl.replace("{id}",this.checkoutId).replace("{entityId}",this.entityId);
     this.httpService.getSpecific(url).subscribe((data: any) => {
      console.log(`🚀 ~ paymentDetails.get ~ data`, data);
      this.transationId = data.id;
      this.loadingService.hideLoader();
      let mappedDto = this.mapTransationData(data);
      console.log(`🚀 ~ mapped Trnasaction`, mappedDto);

      ////backend to save transaction
      this.saveTransaction(mappedDto);
      ////delete storage except phone number
      this.deleteStorage();
      this.counterDecrese();
    },error => {
      this.counterDecrese();
      this.loadingService.hideLoader();
    });
  }

  saveTransaction(mappedDto:PaymentTransaction){
    this.service.AddPaymentTransation(mappedDto).subscribe(data =>{     
    });
  }
  counterDecrese(){
    setTimeout(() => {
      this.counter = this.counter - 1;
      if(this.counter>0){
        this.counterDecrese();
      }
      else{
        this.showRedirectbtn = true;
        this.router.navigate(['/store/my-orders']);
      }
    }, 1000);
  }

  deleteStorage(){
    this.localStorage.removeItemHash('pay-prod');
    this.localStorage.removeItemHash('cart-prod');
    this.localStorage.removeItemHash('shcheckoutshId');
  }

  mapTransationData(data:any):PaymentTransaction{
    let orderId = this.localStorage.getHash("lastOrderId")??"";
    let result = new PaymentTransaction();
    result.id = orderId;
    result.transactionId = orderId;
    //result.transactionId = data.id;
    result.phone = this.phoneNumber.toString();
    result.paymentType = data.paymentType;
    result.paymentBrand = data.paymentBrand;
    result.amount = data.amount;
    result.currency = data.currency;
    result.timestamp = data.timestamp;
    result.ndc = data.ndc;
    result.card = this.mapCardData(data.card);
    result.result = this.mapResultCodeData(data.result);
    result.paymentTransactionDetails = this.mapPaymentTransactionDetailData();
    return result

  }
  mapCardData(card:any):PaymentCard{
    let result = new PaymentCard();
    result.binCountry = card.binCountry;
    result.bin = card.bin;
    result.country = card.country;
    result.expiryMonth = card.expiryMonth;
    result.expiryYear = card.expiryYear;
    result.holder = card.holder;
    result.last4Digits = card.last4Digits;
    result.maxPanLength = card.maxPanLength;
    result.regulatedFlag = card.regulatedFlag;
    result.type = card.type;
    return result
  }
  mapResultCodeData(item:any):ResultCode{
    let result = new ResultCode();
    result.code = item.code;
    result.description = item.description;
    return result
  }
  mapPaymentTransactionDetailData():PaymentTransactionDetail[]{
    let result:PaymentTransactionDetail[] = [];
    this.cartItems.forEach((product:Product) => {
      let item: PaymentTransactionDetail = { 
        productId: product.id,
        quantity:product.quantity,
        barcode: product.barcode,
        expirePeriod: product.expirePeriod,
        vatCode: product.vatCode,
        vatPercent: product.vatPercent,
        amount: (product.price?.amount??0) * (product.quantity??0) };
      result.push(item);      
    })
    return result;
  }
}
