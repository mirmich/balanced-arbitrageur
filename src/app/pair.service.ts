import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PairPrice } from './pair-price';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { IPairReq } from './pair-req';
import { IPairReqParams } from './pair-req-params';

@Injectable({
  providedIn: 'root',
})
export class PairService {
  constructor(private http: HttpClient) {}

  params: IPairReqParams = {
    to: 'cxa0af3165c08318e988cb30993b3048335b94af6c',
    dataType: 'call',
    data: {
      method: 'getPoolTotal',
      params: {
        _id: '0x8',
        _token: 'cxbb2871f468a3008f80b08fdde5b8b951583acf0',
      },
    },
  };

  req: IPairReq = {
    jsonrpc: '2.0',
    id: 1631894860562,
    method: 'icx_call',
    params: this.params,
  };

  address: string = 'https://ctz.solidwallet.io/api/v3';

  getPrices() {
    return this.http.get<PairPrice[]>('/assets/prices.json');
  }

  getPricesReal() {
    return this.http.post(this.address, this.req);
  }
}
