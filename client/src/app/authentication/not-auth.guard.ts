import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { Observable } from 'rxjs';

import { CustomersService } from './../services/customer-management/customers.service';


@Injectable({
  providedIn: 'root'
})
export class NotAuthGuard implements CanActivate {

   constructor( private router: Router, private Service: CustomersService) {}

   canActivate(): Observable<boolean> | Promise<boolean> | boolean {
      if (this.Service.ifLoggedIn() === 'Invalid') {
         return true;
      } else {
         this.router.navigate(['/dashboard']);
         return false;
      }
   }
}