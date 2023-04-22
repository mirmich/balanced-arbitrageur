import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Token } from './model/token';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor(private http: HttpClient) {}

  balancedTokensEndpoint: string =
    'https://balanced.icon.community/api/v1/tokens';

  /**
   * Returns the array of the tokens that are traded at Balanced
   */
  getTokens(): Observable<Token[]> {
    return this.http.get<Token[]>(this.balancedTokensEndpoint);
  }
}
