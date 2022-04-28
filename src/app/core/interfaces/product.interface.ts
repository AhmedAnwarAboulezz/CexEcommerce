export interface Product {
    id: number;
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
    priceBefore: number;
    priceAfter: number;
    photo: string;
    vendorNameEn: string;
    vendorNameAr: string;
    expireDate: Date;
}
