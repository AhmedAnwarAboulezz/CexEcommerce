import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CardDownloadComponent } from './pages/card-download/card-download.component';
import { CardLoginComponent } from './pages/card-login/card-login.component';
import { CardsComponent } from './pages/cards/cards.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { MyCartComponent } from './pages/my-cart/my-cart.component';
import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { OrderDetailsComponent } from './pages/order-details/order-details.component';
import { TermsConditionsComponent } from './pages/terms-conditions/terms-conditions.component';
import { TransactionResultComponent } from './pages/transaction-result/transaction-result.component';

const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  {
    path: 'products',
    component: CardsComponent
  },
  {
    path: 'my-cart',
    component: MyCartComponent
  },
  {
    path: 'checkout',
    component: CheckoutComponent
  },
  {
    path: 'transaction-result/:cardId',
    component: TransactionResultComponent
  },
  {
    path: 'my-orders',
    component: MyOrdersComponent    
  },
  {
    path: 'card-login',
    component: CardLoginComponent    
  },
  {
    path:'terms-conditions',
    component:TermsConditionsComponent
  },
  {
    path: 'order-details/:id',
    component: OrderDetailsComponent    
  },
  {
    path: 'card-download/:id',
    component: CardDownloadComponent
  }

  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreRoutingModule { }
