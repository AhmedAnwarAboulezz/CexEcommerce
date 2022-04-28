import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing.module';
import { ProductsComponent } from './pages/products/products.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddEditRecommendedProductsComponent } from './pages/add-edit-recommended-products/add-edit-recommended-products.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ProductComponent } from './components/product/product.component';


@NgModule({
  declarations: [
    ProductsComponent,
    AddEditRecommendedProductsComponent,
    ProductCardComponent,
    ProductComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ProductsRoutingModule
  ]
})
export class ProductsModule { }
