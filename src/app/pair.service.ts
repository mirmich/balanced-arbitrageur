import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PairPrice } from './pair-price';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { IAssetBalance, IPairReq } from './pair-req';
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
        _id: '0x3',
        _token: 'cxf61cd5a45dc9f91c15aa65831a30a90d59a09619',
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
    return this.http.post<IAssetBalance>(this.address, this.req);
  }
}
