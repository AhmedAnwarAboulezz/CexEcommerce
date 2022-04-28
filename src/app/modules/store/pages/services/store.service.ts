import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';
import { PaymentTransaction } from '../models/paymentTransaction';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  constructor(private httpService: HttpService) { }

  getComplainStatuses() {
    return this.httpService.get('Lookups/GetAllComplainStatuses');
  }



  getCitiesByCountryId(code: string) {
    return this.httpService.get(`Lookups/GetAllCitiesByCountryCode/${code}`);
  }

  getOrderDetails(orderId:any){
    return this.httpService.get(`DigitalCard/PaymentTransactions/GetOrderDetails/${orderId}`);

    
  }
  getOrdersByPhoneNumber(phoneNumber: string){
    return this.httpService.get(`DigitalCard/PaymentTransactions/GetOrders/${phoneNumber}`);

  }
  sendPrivateCode(phoneNumber:string){
    return this.httpService.get(`DigitalCard/PaymentTransactions/SendPrivateCode/${phoneNumber}`);

  }
  isVerifiedOTP(phoneNumber:string,otpCode:string){
    return this.httpService.get(`DigitalCard/PaymentTransactions/IsVerified/${phoneNumber}/${otpCode}`);

    
  }
  getCardsPaged() {
    let filter = {
      "pageNumber": 1,
      "pageSize": 100,
      "filter": {
        "textSearch": ""
      }
    };
    return this.httpService.post('DigitalCard/Products/GetPaged', filter);
  }

  AddPaymentTransation(transaction:PaymentTransaction) {
    return this.httpService.post('DigitalCard/PaymentTransactions/Add', transaction);
  }

  SendToBeneficiary(sendToObj:any){
    return this.httpService.post('DigitalCard/PaymentTransactions/SendToBeneficiary', sendToObj)
    
  }
  SendMultipleToBeneficiary(sendToObj:any){
    return this.httpService.post('DigitalCard/PaymentTransactions/SendToMultipleBeneficiary', sendToObj)
    
  }

  getCardDetailsByCode(szscratchcode:string){

    return this.httpService.get(`DigitalCard/PaymentTransactions/GetOrderDetailsByScratch/${szscratchcode}`);

  }

  addProducts(sendToObj:any){
    return this.httpService.post('DigitalCard/PaymentTransactions/AddProducts', sendToObj)
    
  }
}
