import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PairPrice } from './pair-price';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PairService {
  constructor(private http: HttpClient) {}

  address: string = 'https://ctz.solidwallet.io/api/v3';

  getPrices() {
    return this.http.get<PairPrice[]>('/assets/prices.json');
  }

  getPricesReal() {
    return this.http.post(this.address);
  }
}
