import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/core/services/alert/alert.service';
import { TranslationService } from 'src/app/core/services/translation/translation.service';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { PaymentOrder, Product } from '../models/resultCode';

@Component({
  selector: 'app-my-cart',
  templateUrl: './my-cart.component.html',
  styleUrls: ['./my-cart.component.scss']
})
export class MyCartComponent implements OnInit {
  lang: any;
  cartItems: Product[] = [];
  cartCount = 0;
  totalPrice = 0;
  phoneNumber:string = "";
  acceptedTerms = false;
  constructor(
    private translateService: TranslationService,
    private localStorage: StorageService,
    private alertService: AlertService,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.cartItems = this.getCartStorage();
    this.checkEmptyCart();
    this.getTotalPrice();
    this.translateService.currentLanguage$.subscribe(lang => { this.lang = lang;  });
    this.resetCount();
    let phone = this.localStorage.getHash('phoneNumber');
    if(phone !== undefined && phone !== null && phone !== ""){
      this.phoneNumber = phone;
    }

  }
  getCartStorage(): any[]{
    let res = this.localStorage.getObjectHash('cart-prod');
    if(res == null) return [];
    return res;
  }
  resetCount(){
    this.cartCount = 0;
    this.cartItems.map(a=>a.quantity).forEach(quan => {
      if(quan !== undefined) this.cartCount = this.cartCount + quan;
    });
    //this.changeRef.detectChanges();
  }

  addToCart(proditem:any,type: number){
    if(proditem !== undefined){ 
      if(type == 2){
        this.cartItems = this.cartItems.filter(a=>a.id !== proditem.id);
      }
      else{
        proditem.quantity = proditem.quantity !== undefined ? proditem.quantity + type : 0;
        if(proditem.quantity <= 0) this.cartItems = this.cartItems.filter(a=>a.id !== proditem.id);
      }
      if(type == 1) this.alertService.info("تم إضافة عنصر للسلة");
      else if(type == -1 || type == 2) this.alertService.warning("تم حذف عنصر من السلة");
      this.resetCount();
      debugger;
      this.localStorage.setObjectHash('cart-prod', this.cartItems);
      this.checkEmptyCart();
      this.getTotalPrice();
    }
 
  }

  checkEmptyCart(){
    if(this.cartItems.length < 1) {
      this.alertService.warning('عفوا سلة التسوق فارغة');
      this.router.navigate(['/store']);
    }
  }

  getTotalPrice(){
    this.totalPrice = 0;
    this.cartItems.forEach((item:Product) => {
      this.totalPrice+= ((item.quantity ?? 0 )*(item.price?.amount ?? 0));
    });
  }

  getTotalCount(){
    return this.cartItems.length;
  }

  confirmPayment(){
    let result: PaymentOrder = {
      phoneNumber: this.phoneNumber,
      products: this.cartItems,
      totalPrice: this.totalPrice,
      totalItems: this.getTotalCount(),
      cartCount:this.cartCount
    }
    console.log("Result : ", result);
    this.localStorage.setObjectHash('pay-prod', result);
    this.router.navigate(['/store/checkout']);

    //saveDate in backend and return error
    //redirect to checkout payment page
  }

  checkPhoneNumber():boolean{
   let length = +this.phoneNumber.length;
   if(length >= 9) return false;
    return true;
  }

}


