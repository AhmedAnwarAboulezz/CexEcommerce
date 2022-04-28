import { Component, OnInit } from '@angular/core';
import { UserType } from '../../enum/user.enum';
import { HttpService } from '../../services/http/http.service';
import { SidebarToggleService } from '../../services/sidebar-toggle/sidebar-toggle.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  isSidebarOpened = false;
  userTypes = UserType;
  userType = +this.http.getUserToken().UserType;

  constructor(private sidebarService: SidebarToggleService, private http: HttpService) { }

  ngOnInit(): void {
    console.log(this.userType)
    this.sidebarService.isSidebarOpened$.subscribe(isSidebarOpened => this.isSidebarOpened = isSidebarOpened);
  }

  sidebarToggle() {
    this.sidebarService.toggle();
  }

}

