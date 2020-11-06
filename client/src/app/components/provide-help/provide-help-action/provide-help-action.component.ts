import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

import { BsModalRef,  BsModalService } from 'ngx-bootstrap/modal';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PaymentUpdateModelComponent } from './../../../models/payment-update-model/payment-update-model.component';
import { CustomersService } from './../../../services/customer-management/customers.service';
import { HelpService } from './../../../services/help-management/help.service';

@Component({
  selector: 'app-provide-help-action',
  templateUrl: './provide-help-action.component.html',
  styleUrls: ['./provide-help-action.component.css']
})
export class ProvideHelpActionComponent implements OnInit {

   modalReference: BsModalRef;
   modalReferenceOne: BsModalRef;

   CustomerInfo: any = null;
   proofPreview = '';

   GetHelpRequests: any[] = [];

   screenHeight: any;
   screenWidth: any;

   constructor(
      public ModalService: BsModalService,
      public ModalServiceOne: BsModalService,
      public router: Router,
      public Service: HelpService,
      public customerService: CustomersService,
      private snackBar: MatSnackBar,
   ) {
      const Info = JSON.parse(this.customerService.loginCustomer_Info());
      this.customerService.customerDetails({id: Info._id}).subscribe(response => {
         if (response.Status) {
            this.CustomerInfo = response.Response.customer;
            this.provideHelpDataFind();
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

   provideHelpDataFind() {
      if (this.CustomerInfo !== null) {
         if (this.CustomerInfo.provideHelpStatus === 'Open') {
            this.Service.Available_GetHelpRequestsList({id: this.CustomerInfo._id, provideAmount: 50 }).subscribe(response => {
               if (response.Status) {
                  this.GetHelpRequests = response.Response;
               } else {
                  if (response.Message === undefined || response.Message === '') {
                     response.Message = 'Some error occoured!, Please try again';
                  }
                  this.snackBar.open(response.Message, 'X', { panelClass: ['custom-snackBar', 'color-red'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
               }
            });
         } else if (this.CustomerInfo.provideHelpStatus === 'In-progress' || this.CustomerInfo.provideHelpStatus === 'Completed' ) {
            this.Service.getHelpRequest_toMe({customer: this.CustomerInfo._id }).subscribe(response => {
               if (response.Status) {
                  this.GetHelpRequests = response.Response;
               } else {
                  if (response.Message === undefined || response.Message === '') {
                     response.Message = 'Some error occoured!, Please try again';
                  }
                  this.snackBar.open(response.Message, 'X', { panelClass: ['custom-snackBar', 'color-red'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
               }
            });
         }
      }
   }

   OpenProofModel(template: TemplateRef<any>, idx) {
      this.proofPreview = '';
      this.proofPreview = 'https://genuinehelp.in.net/Image/Proof/' + this.GetHelpRequests[idx].proofFile;
      this.modalReferenceOne = this.ModalServiceOne.show(template, { id: 99966, class: 'second' });
   }

   sendPaymentRequest() {
      const getHelpRequest = [];
      this.GetHelpRequests.map(obj => {
         const newObj = {
            getHelp: obj.getHelpId,
            transferAmount: obj.transferAmount,
            currentLevel: this.CustomerInfo.currentLevel
         };
         getHelpRequest.push(newObj);
      });
      const Data = {
         customer : this.CustomerInfo._id,
         GetHelpRequests: getHelpRequest
      };
      this.Service.provideHelpRequest_Create(Data).subscribe(response => {
         if (response.Status) {
            this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
               this.router.navigate(['/provide-help'])
            );
         } else {
            if (response.Message === undefined || response.Message === '') {
               response.Message = 'Some error occoured!, Please try again';
            }
            this.snackBar.open(response.Message, 'X', { panelClass: ['custom-snackBar', 'color-red'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
         }
      });
   }

   paymentComplete(idx: any) {
      const initialState = {
         CustomerInfo: this.CustomerInfo,
         provideHelpInfo: this.GetHelpRequests[idx]
      };
      this.modalReference = this.ModalService.show(PaymentUpdateModelComponent, Object.assign({initialState}, { id: 999, ignoreBackdropClick: true, class: 'modal-md modal-dialog-centered animated zoomIn' }));
      this.modalReference.content.onClose.subscribe(response => {
         if (response.Status) {
            this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
               this.router.navigate(['/provide-help'])
            );
         }
      });
    }

}
