import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RoutesRecognized } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';
import { ClipboardService } from 'ngx-clipboard';

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

   constructor(
      private router: Router,
      private Service: CustomersService,
      private snackBar: MatSnackBar,
      private clipboardService: ClipboardService
   ) {
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

   copyTelegramLink() {
      const Link = 'http://t.me/genuinehelpp';
      this.snackBar.open('Telegram Link Successfully Copied', 'X', { panelClass: ['custom-snackBar', 'color-green'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
      this.clipboardService.copyFromContent(Link);
   }

   copyWhatsAppLink() {
      const Link = 'https://chat.whatsapp.com/BlnbBwuUFBO6MEEG4TTBDq';
      this.snackBar.open('WhatsApp Link Successfully Copied', 'X', { panelClass: ['custom-snackBar', 'color-green'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
      this.clipboardService.copyFromContent(Link);
   }

   logOut() {
      localStorage.clear();
      this.UserLoggedIn = false;
      this.router.navigate(['/login']);
   }
}
