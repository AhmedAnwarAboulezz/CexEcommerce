import { PaymentTransaction } from "./paymentTransaction";

export class ResultCode{
    code?:string;
    description?:string;  
}
export class PaymentCard{
    //id?:number;
    bin?: string;
    binCountry?: string;
    last4Digits?: string;
    holder?: string;
    expiryMonth?: string;
    expiryYear?: string;
    type?: string;
    country?: string;
    maxPanLength?: string;
    regulatedFlag?: string;
    //paymentTransactionId?: number;
    //paymentTransaction?:PaymentTransaction;
}


export class PaymentTransactionDetail{   
    productId?:number;
    quantity?:number;
    //product?:Product;
    amount?:number;
    barcode?:string
    expirePeriod?:number;
    vatPercent?:number;
    vatCode?:string;
}

export class Product{
    id?:number;
    photo?:string;
    titleAr?:string;
    titleEn?:string;
    price?:money;
    barcode?:string;
    customCode?:number;
    notes?:string;
    quantity?:number;
    expirePeriod?:number;
    backgroundImage?:string;
    vatPercent?:number;
    vatCode?:string;
  }
  
  export class money{
    amount: number = 0;
    currencyAr: string = "ريال";
    currencyEn: string = "SAR";
  }

  export class PaymentOrder{
    products?: Product[];
    phoneNumber?: string;
    totalPrice?: number;
    totalItems?:number;
    cartCount?:number;
    statusCode?:boolean;
  }