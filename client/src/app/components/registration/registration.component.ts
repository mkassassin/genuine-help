import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

import { MatSnackBar } from '@angular/material/snack-bar';

import { CustomersService } from './../../services/customer-management/customers.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

   registerForm: FormGroup;
   reference = null;
   uploading = false;

   constructor(
      private route: Router,
      private ActivateRoute: ActivatedRoute,
      private Service: CustomersService,
      private snackBar: MatSnackBar
   ) {
      this.reference = this.ActivateRoute.snapshot.paramMap.get('reference');
      if (this.reference === undefined || this.reference === null || this.reference === '') {
         this.route.navigate(['/login']);
      }
      const Data = { reference: this.reference };
      this.Service.customerReference_AsyncValidate(Data).subscribe(response => {
         if (!response.Status || !response.Available) {
            this.snackBar.open('The Referral link is Invalid, Please try again', 'X', { panelClass: ['custom-snackBar', 'color-red'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
            this.route.navigate(['/login']);
         }
      });
   }

   ngOnInit() {
      this.registerForm = new FormGroup({
         name: new FormControl('', [Validators.required]),
         email: new FormControl('', { validators : [Validators.required, Validators.email], asyncValidators: [this.emailExistValidate.bind(this)], updateOn: 'blur' }),
         mobile: new FormControl('', [Validators.required]),
         whatsApp: new FormControl(''),
         ePin: new FormControl('', [Validators.required]),
         password: new FormControl('', [Validators.required]),
         accNum: new FormControl(''),
         ifscCode: new FormControl(''),
         branch: new FormControl(''),
         UPIid: new FormControl('', [Validators.required]),
         reference: new FormControl(this.reference, [Validators.required]),
         termsAgree: new FormControl('', [Validators.required]),
      });
   }

   emailExistValidate( control: AbstractControl ) {
      const Data = { email: control.value };
      return this.Service.customerEmail_AsyncValidate(Data).pipe(map( response => {
         if (response.Status && response.Available) {
            return null;
         } else {
            return { emailExist: true };
         }
      }));
   }

   submit() {
      if (this.registerForm.valid && !this.uploading) {
         this.uploading = true;
         const Info = this.registerForm.value;
         this.Service.customer_registration(Info).subscribe( response => {
            this.uploading = false;
            if (response.Status) {
               this.snackBar.open('Registration successfully completed, Please Login.', 'X', { panelClass: ['custom-snackBar', 'color-green'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
               this.route.navigate(['/login']);
            } else {
               if (response.Message === undefined || response.Message === '') {
                  response.Message = 'Some error occoured!, Please try again';
               }
               this.snackBar.open(response.Message, 'X', { panelClass: ['custom-snackBar', 'color-red'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });

            }
         });
      } else {
         Object.keys(this.registerForm.controls).map(obj => {
            const FControl = this.registerForm.controls[obj] as FormControl;
            if (FControl.invalid) {
               FControl.markAsTouched();
               FControl.markAsDirty();
            }
         });
      }
   }


}
