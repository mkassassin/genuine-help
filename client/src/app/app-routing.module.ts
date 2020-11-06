import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../app/authentication/auth.guard';
import { NotAuthGuard } from '../app/authentication/not-auth.guard';

import { RegistrationComponent } from './components/registration/registration.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProvideHelpActionComponent } from './components/provide-help/provide-help-action/provide-help-action.component';
import { GetHelpActionComponent } from './components/get-help/get-help-action/get-help-action.component';


const routes: Routes = [
   {
      path: '',
      redirectTo: '/login',
      pathMatch: 'full',
      data: {}
   },
   {
      path: 'login',
      component: LoginComponent,
      canActivate: [NotAuthGuard],
      data: {}
   },
   {
      path: 'registration/:reference',
      component: RegistrationComponent,
      canActivate: [NotAuthGuard],
      data: {}
   },
   {
      path: 'dashboard',
      component: DashboardComponent,
      canActivate: [AuthGuard],
      data: {}
   },
   {
      path: 'provide-help',
      component: ProvideHelpActionComponent,
      canActivate: [AuthGuard],
      data: {}
   },
   {
      path: 'get-help',
      component: GetHelpActionComponent,
      canActivate: [AuthGuard],
      data: {}
   }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
