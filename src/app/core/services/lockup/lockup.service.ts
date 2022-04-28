import { Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';

@Injectable({
  providedIn: 'root'
})
export class LockupService {

  constructor(private httpService: HttpService) { }

  getComplainStatuses() {
    return this.httpService.get('Lookups/GetAllComplainStatuses');
  }

  getCountries() {
    return this.httpService.get('Lookups/GetAllCountries');
  }

  getCitiesByCountryId(code: string) {
    return this.httpService.get(`Lookups/GetAllCitiesByCountryCode/${code}`);
  }

  getDistrictsByCityId(id: any) {
    return this.httpService.get(`Lookups/GetAllDistrictsByCityId/${id}`);
  }

  getMaritalStatuses() {
    return [
      {
        id: 1,
        nameEn: 'Single',
        nameAr: 'أعزب/ة'
      },
      {
        id: 2,
        nameEn: 'Married',
        nameAr: 'متزوج/ة'
      },
      {
        id: 3,
        nameEn: 'Divorced',
        nameAr: 'مطلق/ة'
      },
      {
        id: 4,
        nameEn: 'Widowed',
        nameAr: 'أرمل/ة'
      }
    ]
  }
  getPreferredLanguages() {
    return this.httpService.get('Lookups/GetAllLanguages');
  }

  getRelationShipTypes() {
    return this.httpService.get('Lookups/GetAllRelationShips');
  }

  getAllReasons() {
    return this.httpService.get('Lookups/GetAllReasons');
  }

  getAllStores() {
    return this.httpService.get('Lookups/GetAllStores');
  }

  getAllDistrics() {
    return this.httpService.get('Lookups/GetAllDistricts');
  }

}
