import { Component, OnInit } from '@angular/core';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
  { path: '/dashboard', title: 'Dashboard',  icon: 'design_app', class: '' },
  // { path: '/icons', title: 'Icons',  icon:'education_atom', class: '' },
  { path: '/aboutus', title: 'About Us',  icon:'users_single-02', class: '' },
  { path: '/apidoc', title: 'API',  icon:'education_atom', class: '' },
  { path: '/advanced', title: 'Advanced Analysis',  icon:'shopping_credit-card', class: '' },

    // { path: '/user-profile', title: 'User Profile',  icon:'users_single-02', class: '' },
    // { path: '/table-list', title: 'Table List',  icon:'design_bullet-list-67', class: '' },
    // { path: '/typography', title: 'Typography',  icon:'text_caps-small', class: '' },
    { path: '/upgrade', title: 'Contact Us',  icon:'business_globe', class: 'active active-pro' }

];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor() { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  isMobileMenu() {
      if ( window.innerWidth > 991) {
          return false;
      }
      return true;
  };
}
