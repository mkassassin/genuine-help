import { Component, OnInit } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';

import { CustomersService } from './../../services/customer-management/customers.service';
import { HelpService } from './../../services/help-management/help.service';


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
      AvailableAmount: 0,
      NextEligibleDate: null,
      ProcessStatus: 'Open', // Open, In-Progress, Completed
   };
   withdrawal = {
      Status: 'Locked', // Active, Locked
      CurrentLevel: null,
      AvailableAmount: 0,
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

   RequestInProgress = false;

   constructor(
      private Service: CustomersService,
      private snackBar: MatSnackBar,
      private clipboardService: ClipboardService,
      private helpService: HelpService,
      public router: Router,
   ) {
      const Info = JSON.parse(this.Service.loginCustomer_Info());
      this.Service.customerDetails({id: Info._id}).subscribe(response => {
         if (response.Status) {
            this.CustomerInfo = response.Response.customer;
            this.ReferralsCount = response.Response.referralCount;
            this.CustomerInfo.provideCompletionDate = this.CustomerInfo.provideCompletionDate === null ? new Date() : this.CustomerInfo.provideCompletionDate;
            this.after72Hours = new Date(new Date(this.CustomerInfo.provideCompletionDate).setHours( new Date(this.CustomerInfo.provideCompletionDate).getHours() + 72));
            this.after144Hours = new Date(new Date(this.CustomerInfo.provideCompletionDate).setHours( new Date(this.CustomerInfo.provideCompletionDate).getHours() + 144));
            this.referralHelpDataFind();
            this.provideHelpDataFind();
            this.getHelpDataFind();
            this.eligibilityGet();
            this.getWithdrawalData();
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

   eligibilityGet() {
      if (this.CustomerInfo !== null) {
         const currentLevel = this.CustomerInfo.currentLevel.split('_')[1];
         const LevelCode = parseInt(currentLevel, 10);
         const Arr = Array(LevelCode).fill(1).map((x, y) => (x + y) * 3);
         let GHAmount = 150;
         let PHAmount = 50;
         let lastAmount = 25;
         Arr.map(obj => {
            PHAmount = lastAmount * 2;
            lastAmount = PHAmount;
            GHAmount = lastAmount * 3;
         });
         if (LevelCode > 3 && LevelCode < 5) {
            PHAmount = PHAmount + 50;
         } else if (LevelCode > 4 && LevelCode < 9) {
            PHAmount = PHAmount + 150;
         }
         this.provideHelp.AvailableAmount = PHAmount;
         this.getHelp.AvailableAmount = GHAmount;
         this.withdrawal.AvailableAmount = GHAmount;
      }
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
         if (this.CustomerInfo.getHelpStatus === 'In-progress') {
            this.getHelp.Status = 'Active';
         } else {
            this.getHelp.Status = 'Locked';
         }
         this.getHelp.ProcessStatus = this.CustomerInfo.getHelpStatus;
         this.getHelp.CurrentLevel = this.CustomerInfo.currentLevel.replace('_', ' ');
         this.CustomerInfo.provideCompletionDate = this.CustomerInfo.provideCompletionDate === null ? new Date() : this.CustomerInfo.provideCompletionDate;
         this.getHelp.NextEligibleDate = new Date(new Date(this.CustomerInfo.provideCompletionDate).setHours( new Date(this.CustomerInfo.provideCompletionDate).getHours() + 72 ));
         if (this.CustomerInfo.getHelpStatus === 'In-progress' || this.CustomerInfo.provideHelpStatus === 'Open' || this.CustomerInfo.provideHelpStatus === 'In-progress') {
            this.getHelp.NextEligibleDate = new Date(new Date().setHours( new Date().getHours() + 72 ));
         }
      }
   }

   getWithdrawalData() {
      if (this.CustomerInfo !== null) {
         this.CustomerInfo.provideCompletionDate = this.CustomerInfo.provideCompletionDate === null ? new Date() : this.CustomerInfo.provideCompletionDate;
         const provideHelpNextEligibleDate = new Date(new Date(this.CustomerInfo.provideCompletionDate).setHours( new Date(this.CustomerInfo.provideCompletionDate).getHours() + 72 ));
         if (this.CustomerInfo.getHelpStatus !== 'In-progress' && this.referrals.activeReferrals >= 3 && this.referrals.activeReferrals > 0 && (this.CustomerInfo.getHelpStatus === 'Open' || (this.CustomerInfo.provideHelpStatus === 'Completed' && provideHelpNextEligibleDate < new Date()))) {
            this.withdrawal.Status = 'Active';
         } else {
            this.withdrawal.Status = 'Locked';
         }
         this.withdrawal.ProcessStatus = this.CustomerInfo.getHelpStatus;
         this.withdrawal.CurrentLevel = this.CustomerInfo.currentLevel.replace('_', ' ');
         this.withdrawal.NextEligibleDate = new Date(new Date(this.CustomerInfo.provideCompletionDate).setHours( new Date(this.CustomerInfo.provideCompletionDate).getHours() + 72 ));
         if (this.CustomerInfo.getHelpStatus === 'In-progress' || this.CustomerInfo.provideHelpStatus === 'Open' || this.CustomerInfo.provideHelpStatus === 'In-progress') {
            this.withdrawal.NextEligibleDate = new Date(new Date().setHours( new Date().getHours() + 72 ));
         }
      }
   }

   copyLink() {
      this.clipboardService.copyFromContent(this.referrals.link);
      this.snackBar.open('Referral Link Successfully Copied', 'X', { panelClass: ['custom-snackBar', 'color-green'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
   }

   RaiseGetHelpRequest() {
      this.RequestInProgress = true;
      const data = {
         customer: this.CustomerInfo._id,
         requestAmount: this.withdrawal.AvailableAmount
      };
      this.helpService.getHelpRequest_Create(data).subscribe(response => {
         if (response.Status) {
            this.snackBar.open('Get Help Request Successfully Raised', 'X', { panelClass: ['custom-snackBar', 'color-green'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
            this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
               this.router.navigate(['/get-help'])
            );
         } else {
            if (response.Message === undefined || response.Message === '') {
               response.Message = 'Some error occoured!, Please try again';
            }
            this.snackBar.open(response.Message, 'X', { panelClass: ['custom-snackBar', 'color-red'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
         }
      });
   }

}
