import { money, PaymentCard, PaymentTransactionDetail, ResultCode } from "./resultCode";

export class PaymentTransaction{
    id?:string;
    transactionId ?:string;
    phone ?:string;
    paymentType ?:string;
    paymentBrand ?:string;
    amount ?:string;
    currency ?:string;
    timestamp ?:string;
    ndc ?:string;
    card ?:PaymentCard;
    result ?:ResultCode;
    paymentTransactionDetails ?:PaymentTransactionDetail[];
}


export class Order{
    id?:number;
    code?:number;
    statusEn?:string;
    statusAr?:string;
    dayDate?:Date;
    totalPayment?:number;
    // accurecy?:string;
    //totalPayment?:money;
  }

  export class MultipleSend {
    szSerialNmbr?:string;
    benficiaryMobile?:string;
  }