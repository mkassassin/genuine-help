import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';


import { ModalModule } from 'ngx-bootstrap/modal';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { ClipboardModule } from 'ngx-clipboard';


import { RegistrationComponent } from './components/registration/registration.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProvideHelpActionComponent } from './components/provide-help/provide-help-action/provide-help-action.component';
import { GetHelpActionComponent } from './components/get-help/get-help-action/get-help-action.component';
import { ReferralsListComponent } from './components/referrals/referrals-list/referrals-list.component';

import { PaymentUpdateModelComponent } from './models/payment-update-model/payment-update-model.component';


@NgModule({
  declarations: [
    AppComponent,
    RegistrationComponent,
    LoginComponent,
    DashboardComponent,
    ProvideHelpActionComponent,
    PaymentUpdateModelComponent,
    GetHelpActionComponent,
    ReferralsListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatButtonModule,
    MatSnackBarModule,
    ModalModule.forRoot(),
    ButtonsModule,
    ClipboardModule
  ],
  providers: [],
  entryComponents: [PaymentUpdateModelComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
