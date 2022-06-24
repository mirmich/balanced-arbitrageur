import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AssetLogosService {
  constructor(private http: HttpClient) {}

  getAssetLogo(token: string) {
    const template = `https://raw.githubusercontent.com/balancednetwork/assets/master/blockchains/icon/assets/${token}/logo.png`;
    return this.http.get<string>(template).pipe(
      map(() => template),
      catchError(() => {
        return of(
          'https://raw.githubusercontent.com/mirmich/balanced-arbitrageur/master/src/icons/assetLogos/shitcoin2.svg'
        );
      })
    );
  }
}
