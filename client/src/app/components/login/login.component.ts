import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';

import { CustomersService } from './../../services/customer-management/customers.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

   loginForm: FormGroup;
   uploading = false;

   constructor(
      private router: Router,
      private Service: CustomersService,
      private snackBar: MatSnackBar
   ) { }

   ngOnInit() {
      this.loginForm = new FormGroup({
         email: new FormControl('', [Validators.required, Validators.email]),
         password: new FormControl('', [Validators.required])
      });
   }

   submit() {
      if (this.loginForm.valid && !this.uploading) {
         this.uploading = true;
         const Info = this.loginForm.value;
         this.Service.customer_login(Info).subscribe(response => {
            this.uploading = false;
            if (response.Status) {
               localStorage.setItem('Session', response.Response);
               localStorage.setItem('SessionKey', response.Key);
               localStorage.setItem('SessionVerify', btoa(Date()));
               this.router.navigate(['/dashboard']);
               this.snackBar.open('You are successfully Logged In.', 'X', { panelClass: ['custom-snackBar', 'color-green'], duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
            } else {
               if (response.Message === undefined || response.Message === '' || response.Message === null) {
                  response.Message = 'Some Error Occoured!, Please try again.';
               }
               this.snackBar.open(response.Message, 'X', { panelClass: ['custom-snackBar', 'color-red'], duration: 10000, horizontalPosition: 'right', verticalPosition: 'top' });
            }
         });
      } else {
         Object.keys(this.loginForm.controls).map(obj => {
            const FControl = this.loginForm.controls[obj] as FormControl;
            if (FControl.invalid) {
               FControl.markAsTouched();
               FControl.markAsDirty();
            }
         });
      }
   }

}
