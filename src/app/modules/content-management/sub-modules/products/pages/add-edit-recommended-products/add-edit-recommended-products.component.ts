import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/core/interfaces/product.interface';
import { HttpService } from 'src/app/core/services/http/http.service';

@Component({
  selector: 'app-add-edit-recommended-products',
  templateUrl: './add-edit-recommended-products.component.html',
  styleUrls: ['./add-edit-recommended-products.component.scss']
})
export class AddEditRecommendedProductsComponent implements OnInit {

  isEdit: any;
  productFormGroup!: FormGroup;
  productDetails!: Product;
  productId!: number;
  today = new Date().toDateString();

  constructor(private http: HttpService, private activatedRoute: ActivatedRoute, private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.productId = +(this.activatedRoute.snapshot.paramMap.get('id') as string);
    this.isEdit = this.activatedRoute.snapshot.data.isEdit;
    this.isEdit ? this.getProduct() : this.initForm();
  }

  initForm() {
    this.productFormGroup = this.fb.group({
      id: [this.productId],
      titleEn: ['', Validators.required],
      titleAr: ['', Validators.required],
      descriptionEn: ['', Validators.required],
      descriptionAr: ['', Validators.required],
      priceBefore: [0, Validators.required],
      priceAfter: [0, Validators.required],
      photo: ['', Validators.required],
      vendorNameEn: ['', Validators.required],
      vendorNameAr: ['', Validators.required],
      expireDate: ['', Validators.required]
    });
  }

  getProduct() {
    this.http.get<Product>(`RecommendedProducts/Get/${this.productId}`).subscribe(data => { this.productDetails = data; this.initForm(); this.productFormGroup.patchValue(data)});
  }

  doAction() {
    this.isEdit ? this.editProduct() : this.addProduct();
  }

  addProduct() {
    this.http.post('RecommendedProducts/Add', this.productFormGroup.value).subscribe(() => this.router.navigateByUrl('/content/recommended-products'));
  }

  editProduct() {
    this.http.put('RecommendedProducts/Update', this.productFormGroup.value).subscribe(() => this.router.navigateByUrl('/content/recommended-products'));
  }
}
