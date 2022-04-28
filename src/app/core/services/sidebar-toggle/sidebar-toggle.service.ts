import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarToggleService {

  private isSidebarOpened = new BehaviorSubject<boolean>(false);
  isSidebarOpened$ = this.isSidebarOpened.asObservable();

  toggle() {
    this.isSidebarOpened.next(!this.isSidebarOpened.value);
  }
}
