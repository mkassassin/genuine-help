import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';

import { CustomersService } from './../../../services/customer-management/customers.service';

@Component({
  selector: 'app-referrals-list',
  templateUrl: './referrals-list.component.html',
  styleUrls: ['./referrals-list.component.css']
})
export class ReferralsListComponent implements OnInit {

   referralsList: any[] = [];

   constructor(
      public router: Router,
      public Service: CustomersService,
      private snackBar: MatSnackBar,
   ) {
      const Info = JSON.parse(this.Service.loginCustomer_Info());
      this.Service.referralsList({id: Info._id}).subscribe(response => {
         if (response.Status) {
            this.referralsList = response.Response;
            this.referralsList = this.referralsList.map(obj => {
               obj.ActiveReferrals = 0;
               obj.RejectedReferrals = 0;
               obj.referrals.map(obj1 => {
                  if (obj1.Active_Status && !obj1.If_Deleted) {
                     obj.ActiveReferrals = obj.ActiveReferrals + 1;
                  } else {
                     obj.RejectedReferrals = obj.RejectedReferrals + 1;
                  }
               });
               obj.currentLevel = obj.currentLevel.replace('_', ' ');
               obj.status = (obj.Active_Status && !obj.If_Deleted) ? 'Active' : 'Rejected';
               return obj;
            });
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
