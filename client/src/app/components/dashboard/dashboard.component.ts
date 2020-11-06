import { Component, OnInit } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { ClipboardService } from 'ngx-clipboard';

import { CustomersService } from './../../services/customer-management/customers.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

   CustomerInfo: any = null;
   ReferralsCount: any = null;

   provideHelp = {
      Status: 'Locked', // Active, Locked
      CurrentLevel: null,
      AvailableAmount: 50,
      NextEligibleDate: null,
      ProcessStatus: 'Open', // Open, In-Progress, Completed
   };
   getHelp = {
      Status: 'Locked', // Active, Locked
      CurrentLevel: null,
      AvailableAmount: 10000,
      NextEligibleDate: null,
      ProcessStatus: 'Open', // Open, In-Progress, Completed
   };
   referrals = {
      activeReferrals: 0,
      rejectedReferrals: 0,
      link: ''
   };

   after72Hours = new Date();
   after144Hours = new Date();

   constructor(
      private Service: CustomersService,
      private snackBar: MatSnackBar,
      private clipboardService: ClipboardService
   ) {
      const Info = JSON.parse(this.Service.loginCustomer_Info());
      this.Service.customerDetails({id: Info._id}).subscribe(response => {
         if (response.Status) {
            this.CustomerInfo = response.Response.customer;
            this.ReferralsCount = response.Response.referralCount;
            this.CustomerInfo.provideCompletionDate = this.CustomerInfo.provideCompletionDate === null ? new Date() : this.CustomerInfo.provideCompletionDate;
            this.after72Hours = new Date(new Date(this.CustomerInfo.provideCompletionDate).setHours( new Date(this.CustomerInfo.provideCompletionDate).getHours() + 72));
            this.after144Hours = new Date(new Date(this.CustomerInfo.provideCompletionDate).setHours( new Date(this.CustomerInfo.provideCompletionDate).getHours() + 144));

            this.provideHelpDataFind();
            this.getHelpDataFind();
            this.referralHelpDataFind();
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

   referralHelpDataFind() {
      if (this.ReferralsCount !== null && this.CustomerInfo !== null) {
         this.referrals.activeReferrals = this.ReferralsCount.activeReferrals;
         this.referrals.rejectedReferrals = this.ReferralsCount.rejectedReferrals;
         this.referrals.link = 'https://genuinehelp.in.net/registration/' + this.CustomerInfo._id;
      }
   }

   provideHelpDataFind() {
      if (this.CustomerInfo !== null) {
         this.provideHelp.Status = this.CustomerInfo.provideHelpStatus !== 'Pending' && this.CustomerInfo.provideHelpStatus !== 'Completed' ? 'Active' : 'Locked';
         this.provideHelp.ProcessStatus = this.CustomerInfo.provideHelpStatus;
         this.provideHelp.CurrentLevel = this.CustomerInfo.currentLevel.replace('_', ' ');
         this.CustomerInfo.provideCompletionDate = this.CustomerInfo.provideCompletionDate === null ? this.CustomerInfo.createdAt : this.CustomerInfo.provideCompletionDate;
         this.provideHelp.NextEligibleDate = new Date(new Date(this.CustomerInfo.provideCompletionDate).setHours( new Date(this.CustomerInfo.provideCompletionDate).getHours() + 72 ));
      }
   }

   getHelpDataFind() {
      if (this.CustomerInfo !== null) {
         this.getHelp.Status = this.CustomerInfo.getHelpStatus !== 'Pending' && this.CustomerInfo.getHelpStatus !== 'Completed' ? 'Active' : 'Locked';
         this.getHelp.ProcessStatus = this.CustomerInfo.getHelpStatus;
         this.getHelp.CurrentLevel = this.CustomerInfo.currentLevel.replace('_', ' ');
         this.CustomerInfo.provideCompletionDate = this.CustomerInfo.provideCompletionDate === null ? new Date() : this.CustomerInfo.provideCompletionDate;
         this.getHelp.NextEligibleDate = new Date(new Date(this.CustomerInfo.provideCompletionDate).setHours( new Date(this.CustomerInfo.provideCompletionDate).getHours() + 72 ));
      }
   }

   copyLink() {
      this.clipboardService.copyFromContent(this.referrals.link);
      this.snackBar.open('Referral Link Successfully Copied', 'X', { panelClass: ['custom-snackBar', 'color-green'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
   }

}
