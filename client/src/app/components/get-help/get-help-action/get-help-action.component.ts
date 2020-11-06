import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

import { BsModalRef,  BsModalService } from 'ngx-bootstrap/modal';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CustomersService } from './../../../services/customer-management/customers.service';
import { HelpService } from './../../../services/help-management/help.service';

@Component({
  selector: 'app-get-help-action',
  templateUrl: './get-help-action.component.html',
  styleUrls: ['./get-help-action.component.css']
})
export class GetHelpActionComponent implements OnInit {

   modalReference: BsModalRef;

   CustomerInfo: any = null;
   proofPreview = '';

   provideHelpRequests: any[] = [];

   screenHeight: any;
   screenWidth: any;

   constructor(
      public ModalService: BsModalService,
      public router: Router,
      public Service: HelpService,
      public customerService: CustomersService,
      private snackBar: MatSnackBar,
   ) {
      const Info = JSON.parse(this.customerService.loginCustomer_Info());
      this.customerService.customerDetails({id: Info._id}).subscribe(response => {
         if (response.Status) {
            this.CustomerInfo = response.Response.customer;
            this.getHelpDataFind();
         } else {
            if (response.Message === undefined || response.Message === '') {
               response.Message = 'Some error occoured!, Please try again';
            }
            this.snackBar.open(response.Message, 'X', { panelClass: ['custom-snackBar', 'color-red'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
         }
      });
   }

   ngOnInit() {
      this.getScreenSize();
   }

   getScreenSize(event?: any) {
      this.screenHeight = window.innerHeight - 80;
      this.screenWidth = window.innerWidth - 40;
   }

   getHelpDataFind() {
      if (this.CustomerInfo !== null) {
         this.Service.provideHelpRequest_toMe({customer: this.CustomerInfo._id }).subscribe(response => {
            if (response.Status) {
               this.provideHelpRequests = response.Response;
            } else {
               if (response.Message === undefined || response.Message === '') {
                  response.Message = 'Some error occoured!, Please try again';
               }
               this.snackBar.open(response.Message, 'X', { panelClass: ['custom-snackBar', 'color-red'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
            }
         });
      }
   }

   OpenProofModel(template: TemplateRef<any>, idx) {
      this.proofPreview = '';
      this.proofPreview = 'https://genuinehelp.in.net/Image/Proof/' + this.provideHelpRequests[idx].proofFile;
      this.modalReference = this.ModalService.show(template, { id: 99966, class: 'second' });
   }

   acceptRequest(idx: any) {
      const Data = {
         customer : this.CustomerInfo._id,
         provideHelp: this.provideHelpRequests[idx]._id
      };
      this.Service.provideHelpRequest_Accept(Data).subscribe(response => {
         if (response.Status) {
            this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
               this.router.navigate(['/get-help'])
            );
            this.snackBar.open('Request Successfully Accepted', 'X', { panelClass: ['custom-snackBar', 'color-green'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
         } else {
            if (response.Message === undefined || response.Message === '') {
               response.Message = 'Some error occoured!, Please try again';
            }
            this.snackBar.open(response.Message, 'X', { panelClass: ['custom-snackBar', 'color-red'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
         }
      });
   }

   paymentAcceptRequest(idx: any) {
      const Data = {
         customer : this.CustomerInfo._id,
         provideHelp: this.provideHelpRequests[idx]._id
      };
      this.Service.provideHelpRequest_PaymentAccept(Data).subscribe(response => {
         if (response.Status) {
            this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
               this.router.navigate(['/get-help'])
            );
            this.snackBar.open('Request Successfully Accepted', 'X', { panelClass: ['custom-snackBar', 'color-green'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
         } else {
            if (response.Message === undefined || response.Message === '') {
               response.Message = 'Some error occoured!, Please try again';
            }
            this.snackBar.open(response.Message, 'X', { panelClass: ['custom-snackBar', 'color-red'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
         }
      });
   }


}
