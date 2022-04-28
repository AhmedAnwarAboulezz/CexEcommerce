import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { iif } from 'rxjs';
import { AlertService } from 'src/app/core/services/alert/alert.service';
import { TranslationService } from 'src/app/core/services/translation/translation.service';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { Product } from '../models/resultCode';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {
  lang: any;
  products: Product[] = [];
  allProducts: Product[] = [];
  cartItems: Product[] = [];
  cartCount = 0;
  @ViewChild('StoreToolbarComponent', { static: true }) StoreToolbarComponent: any;

  constructor(
    private translateService: TranslationService,
    private localStorage: StorageService,
    private changeRef: ChangeDetectorRef,
    private service:StoreService,
    private alertService: AlertService

    ) { 
      //to test and remove later
      // let tt = this.getCartStorage();
      // if(tt.length == 0) this.localStorage.setObjectHash('cart-prod', ['3', '8']);    
  }

  ngOnInit(): void {
    this.cartItems = this.getCartStorage();
    this.translateService.currentLanguage$.subscribe(lang => { this.lang = lang;  });
    this.getProducts();
    // this.products = this.getProducts();
    // this.allProducts = this.products;
    // this.resetCount();

  }
  getCartStorage(): any[]{
    let res = this.localStorage.getObjectHash('cart-prod');
    if(res == null) return [];
    return res;
  }

  getProducts(){
    this.service.getCardsPaged().subscribe(res=>{
      console.log("ANWAR CARDS: ", res);
      let result = res.data;
      result =  this.getItemsQunatity(result);
      this.products = result;
      this.allProducts = this.products;
      this.resetCount();      
    });
    // let result: Product[] =  [
    //   {
    //     id: '1',        
    //     photo:'assets/images/cards/sanabel100.jpg',
    //     titleAr:'بطاقة سنابل الخير 100 ر.س',
    //     titleEn:'SANABEL ALKHAIR VOUCHER 100 SR',
    //     price:100,
    //     quantity: 0,
    //   },
    //   {
    //     id: '2',        
    //     photo:'assets/images/cards/sanabel250.jpg',
    //     titleAr:'بطاقة سنابل الخير 250 ر.س',
    //     titleEn:'SANABEL ALKHAIR VOUCHER 250 SR',
    //     price:250,
    //     quantity: 0,
    //   },
    //   {
    //     id: '3',        
    //     photo:'assets/images/cards/sanabel500.jpg',
    //     titleAr:'بطاقة سنابل الخير 500 ر.س',
    //     titleEn:'SANABEL ALKHAIR VOUCHER 500 SR',
    //     price:500,
    //     quantity: 0,
    //   },
    //   {
    //     id: '4',        
    //     photo:'assets/images/cards/salam.jpg',
    //     titleAr:'قسيمة تسوق سلام',
    //     titleEn:'SALAM GIFT VOUCHER',
    //     price:100,
    //     quantity: 0,
    //   },
    //   {
    //     id: '5',        
    //     photo:'assets/images/cards/zakat20.jpg',
    //     titleAr:'قسيمة زكاةالفطر 20 ر.س',
    //     titleEn:'ZAKAT ALFITR VOUCHER 20SR',
    //     price:20,
    //     quantity: 0,
    //   },
    //   {
    //     id: '6',        
    //     photo:'assets/images/cards/zakat100.jpg',
    //     titleAr:'قسيمة زكاةالفطر 100 ر.س',
    //     titleEn:'ZAKAT ALFITR VOUCHER 100SR',
    //     price:100,
    //     quantity: 0,
    //   },
    //   {
    //     id: '7',        
    //     photo:'assets/images/cards/zakat200.jpg',
    //     titleAr:'قسيمة زكاةالفطر 200 ر.س',
    //     titleEn:'ZAKAT ALFITR VOUCHER 200SR',
    //     price:200,
    //     quantity: 0,
    //   },
    //   {
    //     id: '8',        
    //     photo:'assets/images/cards/adahi1.jpg',
    //     titleAr:'قسيمة أضحية نعيمي (الرياض فقط)',
    //     titleEn:'Al Adha Naeemi VUCR (Riyadh only)',
    //     price:1748,
    //     quantity: 0,
    //   },
    //   {
    //     id: '9',        
    //     photo:'assets/images/cards/adahi2.jpg',
    //     titleAr:'قسيمة أضحية سواكني (الرياض فقط)',
    //     titleEn:'Al Adha Sawakni VUCR (Riyadh only)',
    //     price:1035,
    //     quantity: 0,
    //   },
    //   {
    //     id: '10',        
    //     photo:'assets/images/cards/adahi3.jpg',
    //     titleAr:'قسيمة أضحية بربري (الرياض فقط)',
    //     titleEn:'Al Adha Barbari VUCR (Riyadh only)',
    //     price:633,
    //     quantity: 0,
    //   }
    // ];

  }

  getItemsQunatity(products: Product[]): Product[]{
    this.cartItems.forEach(item => {
      let product = products.find(a=>a.id == item.id);
      if(product !== undefined) product.quantity = item.quantity;
    });
    return products;
  }

  resetCount(){
    this.cartCount = 0;
    this.cartItems.map(a=>a.quantity).forEach(quan => {
      if(quan !== undefined) this.cartCount = this.cartCount + quan;
    });
    //this.changeRef.detectChanges();
  }
  isInCart(item:Product): boolean{
    return this.cartItems.map(a=>a.id).includes(item.id);
  }

  addToCart(proditem:any,type: number){
    if(proditem !== undefined){ 
      if(type == 0){
        proditem.quantity = 1;
        let newproditem: Product = {
          id: proditem.id, barcode: proditem.barcode,
          photo: proditem.photo, titleAr: proditem.titleAr,
          titleEn: proditem.titleEn, price: proditem.price,
          quantity: proditem.quantity,
          expirePeriod:proditem.expirePeriod,
          vatCode: proditem.vatCode,
          vatPercent: proditem.vatPercent,

        }
        this.cartItems.push(newproditem);
      }
      else{
        proditem.quantity = proditem.quantity !== undefined ? proditem.quantity + type : 0;
        let test = this.cartItems.find(a=>a.id == proditem.id);
        if(test !== undefined && test.quantity !== undefined){ 
          test.quantity = test.quantity + type;
          if(test.quantity <= 0) this.cartItems = this.cartItems.filter(a=>a.id !== proditem.id);
        }
        if(type == 1|| type == 0) this.alertService.info("تم إضافة عنصر للسلة");
        else if(type == -1) this.alertService.warning("تم حذف عنصر من السلة");

      }
      this.resetCount();
      this.localStorage.setObjectHash('cart-prod', this.cartItems);
    }
 
  }
  filterProducts(name: string){
    if(name !== undefined && name !== ''){
      if(this.lang === 'en'){
        this.products = this.allProducts.filter(a=>a.titleEn?.toLowerCase().includes(name) || a.price?.amount?.toString().includes(name));
      }
      else{
        this.products = this.allProducts.filter(a=>a.titleAr?.includes(name) || a.price?.amount?.toString().includes(name));
      }
    } 
    else this.products = this.allProducts;
  }

}
