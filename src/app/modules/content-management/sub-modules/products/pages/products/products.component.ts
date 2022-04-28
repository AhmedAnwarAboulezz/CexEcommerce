import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/core/interfaces/product.interface';
import { HttpService } from 'src/app/core/services/http/http.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  products: Product[] = [];

  constructor(private http: HttpService) { }

  ngOnInit(): void {
    this.getRecommendedProducts();
  }

  getRecommendedProducts() {
    this.http.get<Product[]>('RecommendedProducts/GetAll').subscribe(products => {
      this.products = products;
    });
  }
}
