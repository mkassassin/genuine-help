import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Subject } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { MatSnackBar } from '@angular/material/snack-bar';

import { HelpService } from './../../services/help-management/help.service';

@Component({
  selector: 'app-payment-update-model',
  templateUrl: './payment-update-model.component.html',
  styleUrls: ['./payment-update-model.component.css']
})
export class PaymentUpdateModelComponent implements OnInit {

   onClose: Subject<any>;
   proofForm: FormGroup;

   @ViewChild('fileInput') fileInput: ElementRef;

   Uploading = false;
   proofPreviewAvailable = false;
   proofPreview: any;

   CustomerInfo: any;
   provideHelpInfo: any;

   screenHeight: any;
   screenWidth: any;

   uploading = false;

   constructor(
      public modalReference: BsModalRef,
      public bsModalRefOne: BsModalRef,
      public modalService: BsModalService,
      public Service: HelpService,
      private snackBar: MatSnackBar
   ) { }

   ngOnInit() {
      this.onClose = new Subject();
      this.proofForm = new FormGroup({
         customer: new FormControl(this.CustomerInfo._id, Validators.required),
         provideHelp: new FormControl(this.provideHelpInfo.ProvideHelpId, Validators.required),
         remarks: new FormControl(''),
         proof: new FormControl('', Validators.required),
      });
      this.getScreenSize();
   }

   getScreenSize(event?: any) {
      this.screenHeight = window.innerHeight - 80;
      this.screenWidth = window.innerWidth - 40;
   }

   OpenUploadModel(template: TemplateRef<any>) {
      this.bsModalRefOne = this.modalService.show(template, { id: 9996, class: 'second' });
   }

   onFileChange(event) {
      if (event.target.files && event.target.files.length > 0) {
         const reader = new FileReader();
         reader.readAsDataURL(event.target.files[0]);
         reader.onload = (events) => {
            this.proofPreview = events.target['result'];
            this.proofPreviewAvailable = true;
            this.proofForm.controls.proof.setValue(this.proofPreview);
         };
      } else {
         this.fileInput.nativeElement.value = null;
         this.proofPreviewAvailable = false;
         this.proofPreview = null;
         this.proofForm.controls.proof.setValue('');
      }
   }

   submit() {
      if (this.proofForm.valid && !this.uploading) {
         this.uploading = true;
         const Info = this.proofForm.value;
         this.Service.provideHelp_PaymentProofUpdate(Info).subscribe( response => {
            this.uploading = false;
            if (response.Status) {
               this.snackBar.open('Payment proof successfully updated.', 'X', { panelClass: ['custom-snackBar', 'color-green'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
               this.onClose.next({Status: true, Message: 'Successfully updated'});
               this.modalReference.hide();
            } else {
               if (response.Message === undefined || response.Message === '') {
                  response.Message = 'Some error occoured!, Please try again';
               }
               this.snackBar.open(response.Message, 'X', { panelClass: ['custom-snackBar', 'color-red'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
            }
         });
      }
   }

   close() {
      this.modalReference.hide();
   }

}
