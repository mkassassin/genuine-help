import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RoutesRecognized } from '@angular/router';

import { CustomersService } from './services/customer-management/customers.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

   responsiveMenu = false;
   UserLoggedIn: boolean;
   CustomerInfo = null;

   constructor(private router: Router, private Service: CustomersService) {
      router.events.subscribe(event => {
         if (event instanceof NavigationEnd) {
            if (event.url === '/login' ||  event.url.includes('registration') || event.url === '/') {
               this.UserLoggedIn = false;
            } else {
               this.CustomerInfo = JSON.parse(this.Service.loginCustomer_Info());
               this.UserLoggedIn = true;
            }
         }
      });
   }

   ngOnInit() {

   }

   logOut() {
      localStorage.clear();
      this.UserLoggedIn = false;
      this.router.navigate(['/login']);
   }
}
