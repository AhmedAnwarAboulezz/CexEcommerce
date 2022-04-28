import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { StoresComponent } from './components/stores/stores.component';
import { GiftboxComponent } from './components/giftbox/giftbox.component';

@NgModule({
  declarations: [HomeComponent, StoresComponent, GiftboxComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule
  ]
})
export class HomeModule { }
