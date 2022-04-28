import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditRecommendedProductsComponent } from './pages/add-edit-recommended-products/add-edit-recommended-products.component';
import { ProductsComponent } from './pages/products/products.component';

const routes: Routes = [
  {
    path: '',
    component: ProductsComponent
  },
  {
    path: 'product',
    children: [
      {
        path: 'add',
        data: { isEdit: false },
        component: AddEditRecommendedProductsComponent
      },
      {
        path: ':id',
        data: { isEdit: true },
        component: AddEditRecommendedProductsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
