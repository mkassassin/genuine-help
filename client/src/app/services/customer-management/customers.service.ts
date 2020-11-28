import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';

const DevURL = 'http://localhost:3000/API/customerManagement/';
const StageURL = 'https://genuinehelp.in.net/API/customerManagement/';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

   constructor(private http: HttpClient, private router: Router) { }

   customerReference_AsyncValidate(data: any): Observable<any> {
      return this.http.post<any>(DevURL + 'customerReference_AsyncValidate', data).pipe(map(res => res), catchError(err => of(err)));
   }

   customerEmail_AsyncValidate(data: any): Observable<any> {
      return this.http.post<any>(DevURL + 'customerEmail_AsyncValidate', data).pipe(map(res => res), catchError(err => of(err)));
   }

   customer_registration(data: any): Observable<any> {
      return this.http.post<any>(DevURL + 'customer_registration', data).pipe(map(res => res), catchError(err => of(err)));
   }

   customer_login(data: any): Observable<any> {
      return this.http.post<any>(DevURL + 'customer_login', data).pipe(map(res => res), catchError(err => of(err)));
   }

   customerDetails(data: any): Observable<any> {
      return this.http.post<any>(DevURL + 'customerDetails', data).pipe(map(res => res), catchError(err => of(err)));
   }

   referralsList(data: any): Observable<any> {
      return this.http.post<any>(DevURL + 'referralsList', data).pipe(map(res => res), catchError(err => of(err)));
   }

   ifLoggedIn() {
      if (localStorage.getItem('Session') && localStorage.getItem('SessionKey') && localStorage.getItem('SessionVerify')) {
         const LastSession = new Date(atob(localStorage.getItem('SessionVerify'))).getTime();
         const NowSession = new Date().getTime();
         const SessionDiff: number = NowSession - LastSession;
         const SessionDiffHours: number = SessionDiff / 1000 / 60 / 60;
         if (SessionDiffHours < 2) {
            return 'Valid';
         } else {
            return 'Expired';
         }
      } else {
         localStorage.clear();
         return 'Invalid';
      }
   }

   loginCustomer_Info() {
      if (localStorage.getItem('Session') && localStorage.getItem('SessionKey') && localStorage.getItem('SessionVerify')) {
         return CryptoJS.AES.decrypt(localStorage.getItem('Session'), localStorage.getItem('SessionKey').slice(3, 10)).toString(CryptoJS.enc.Utf8);
      } else {
         localStorage.clear();
         this.router.navigate(['/login']);
      }
   }

}
