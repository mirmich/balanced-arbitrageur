import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PairPrice } from './pair-price';

@Injectable()
export class PriceServiceService {
  constructor(private http: HttpClient) {}

  getPrices() {
    return this.http.get<PairPrice[]>('/assets/prices.json');
  }
}
