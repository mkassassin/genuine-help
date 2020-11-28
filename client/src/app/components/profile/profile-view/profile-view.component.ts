import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';

import { CustomersService } from './../../../services/customer-management/customers.service';

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit {

   CustomerInfo: any = null;

   constructor(
      private Service: CustomersService,
      private snackBar: MatSnackBar,
      public router: Router,
   ) {
      const Info = JSON.parse(this.Service.loginCustomer_Info());
      this.Service.customerDetails({id: Info._id}).subscribe(response => {
         if (response.Status) {
            this.CustomerInfo = response.Response.customer;
            this.CustomerInfo.currentLevel = this.CustomerInfo.currentLevel.replace('_', ' ');
         } else {
            if (response.Message === undefined || response.Message === '') {
               response.Message = 'Some error occoured!, Please try again';
            }
            this.snackBar.open(response.Message, 'X', { panelClass: ['custom-snackBar', 'color-red'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
         }
      });
   }

   ngOnInit() {
   }

}
