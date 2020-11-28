import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';

const DevURL = 'http://localhost:3000/API/helpManagement/';
const StageURL = 'https://genuinehelp.in.net/API/helpManagement/';

@Injectable({
  providedIn: 'root'
})
export class HelpService {

   constructor(private http: HttpClient) { }

   getHelpRequest_Create(data: any): Observable<any> {
      return this.http.post<any>(DevURL + 'getHelpRequest_Create', data).pipe(map(res => res), catchError(err => of(err)));
   }

   Available_GetHelpRequestsList(data: any): Observable<any> {
      return this.http.post<any>(DevURL + 'Available_GetHelpRequestsList', data).pipe(map(res => res), catchError(err => of(err)));
   }

   provideHelpRequest_Create(data: any): Observable<any> {
      return this.http.post<any>(DevURL + 'provideHelpRequest_Create', data).pipe(map(res => res), catchError(err => of(err)));
   }

   provideHelpRequest_toMe(data: any): Observable<any> {
      return this.http.post<any>(DevURL + 'provideHelpRequest_toMe', data).pipe(map(res => res), catchError(err => of(err)));
   }

   provideHelpRequest_Accept(data: any): Observable<any> {
      return this.http.post<any>(DevURL + 'provideHelpRequest_Accept', data).pipe(map(res => res), catchError(err => of(err)));
   }

   getHelpRequest_toMe(data: any): Observable<any> {
      return this.http.post<any>(DevURL + 'getHelpRequest_toMe', data).pipe(map(res => res), catchError(err => of(err)));
   }

   provideHelpRequest_Reject(data: any): Observable<any> {
      return this.http.post<any>(DevURL + 'provideHelpRequest_Reject', data).pipe(map(res => res), catchError(err => of(err)));
   }

   provideHelp_PaymentProofUpdate(data: any): Observable<any> {
      return this.http.post<any>(DevURL + 'provideHelp_PaymentProofUpdate', data).pipe(map(res => res), catchError(err => of(err)));
   }

   provideHelpRequest_PaymentAccept(data: any): Observable<any> {
      return this.http.post<any>(DevURL + 'provideHelpRequest_PaymentAccept', data).pipe(map(res => res), catchError(err => of(err)));
   }

}
