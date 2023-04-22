import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AssetLogosService {
  private defaultLogo =
    'https://raw.githubusercontent.com/mirmich/balanced-arbitrageur/master/src/icons/assetLogos/shitcoin2.svg';
  private icxLogo =
    'https://raw.githubusercontent.com/mirmich/balanced-arbitrageur/master/src/icons/assetLogos/icon.png';

  constructor(private http: HttpClient) {}

  getAssetLogo(token: string) {
    const template = `https://raw.githubusercontent.com/balancednetwork/assets/master/blockchains/icon/assets/${token}/logo.png`;
    return this.http.head(template).pipe(
      map(() => template),
      catchError(() => {
        // Only sICX/ICX pool should have quote_token null
        if (token == null) {
          return of(this.icxLogo);
        }
        return of(this.defaultLogo);
      })
    );
  }
}
