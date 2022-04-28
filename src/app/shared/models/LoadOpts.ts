import { SortModel } from './SortModel';

export class LoadOptions {
  pageSize = 0;
  pageNumber = 0;
  orderByValue?: SortModel[] = [];
  filter?: any = {};
  searchCriteria?= '';
}
