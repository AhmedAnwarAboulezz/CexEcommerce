import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplainsRoutingModule } from './complains-routing.module';
import { ComplainsComponent } from './Pages/complains/complains.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    ComplainsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ComplainsRoutingModule
  ]
})
export class ComplainsModule { }
