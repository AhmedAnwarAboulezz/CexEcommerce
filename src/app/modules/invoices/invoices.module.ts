import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoicesRoutingModule } from './invoices-routing.module';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [InvoicesComponent],
  imports: [
    CommonModule,
    SharedModule,
    InvoicesRoutingModule
  ]
})
export class InvoicesModule { }
