import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { shareReplay, switchMap } from 'rxjs/operators';
import { Observable, timer } from 'rxjs';
import IconService from 'icon-sdk-js';
import { Pool } from './pool';

const CACHE_SIZE = 1;
const REFRESH_INTERVAL = 600000;

@Injectable({
  providedIn: 'root',
})
export class PairService {
  private cache$: Observable<Pool[]>;
  constructor(private http: HttpClient) {}

  address: string = 'https://ctz.solidwallet.io/api/v3';
  newPoolsApi: string = 'https://balanced.icon.community/api/v1/pools';
  httpProvider = new IconService.HttpProvider(this.address);
  iconService = new IconService(this.httpProvider);

  getPools() {
    if (!this.cache$) {
      const timer$ = timer(0, REFRESH_INTERVAL);

      this.cache$ = timer$.pipe(
        switchMap((_) => this.getPoolsNew()),
        shareReplay(CACHE_SIZE)
      );
    }
    return this.cache$;
  }
  private getPoolsNew() {
    return this.http.get<Pool[]>(this.newPoolsApi);
  }
}
