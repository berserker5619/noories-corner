import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, switchMap, take } from 'rxjs';
import { SharedDataService } from 'src/app/shared/shared-data.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private sharedData: SharedDataService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Set the 'apipass' header
    let modifiedRequest = request.clone({
      setHeaders: {
        'apipass': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlwYXNzIjoiQmVyc2Vya2VyQDU2MTkiLCJpYXQiOjE2Nzk1NTg5NDZ9.SIBzq80blOIwyNuXkfBrxB9clVaDYCI3AbWmUxRG-sU'
      }
    });

    // Check if the token is available and update the request headers accordingly
    return this.sharedData.getAuthTokenObs().pipe(
      take(1), // Take only the first emission to prevent multiple subscriptions
      switchMap(token => {
        
        if (token && !this.isUnauthenticatedEndpoint(request.url)) {
          modifiedRequest = modifiedRequest.clone({
            setHeaders: {
              'Authorization': `Bearer ${token}`
            }
          });
        }
        return next.handle(modifiedRequest);
      })
    );
  }

  isUnauthenticatedEndpoint(url: string): boolean {
    // Define the list of endpoints that do not require authentication
    const unauthenticatedEndpoints = ['users/register', 'users/login'];

    // Check if the URL includes any of the unauthenticated endpoints
    return unauthenticatedEndpoints.some(endpoint => url.includes(endpoint));
  }
}
