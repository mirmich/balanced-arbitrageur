import { Component, OnInit } from '@angular/core';
import { WalletProxyService } from '../wallet-proxy.service';
import { hexToDouble } from '../utils/pair-utils';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
})
export class TopBarComponent implements OnInit {
  constructor(private walletProxyService: WalletProxyService) {}

  ngOnInit() {}

  address: string = '';
  showButton = true;
  icxBalance: number = 0;
  bnUsdBalance: number = 0;
  sIcxBalance: number = 0;

  onSignIn() {
    this.walletProxyService
      .handleEvent('RESPONSE_ADDRESS')
      .subscribe((address0) => {
        this.address = address0;
        this.showButton = false;
        this.walletProxyService
          .getIcxBalance(this.address)
          .subscribe((icxBalance) => {
            this.icxBalance = hexToDouble(icxBalance.result, 6);
          });
        this.walletProxyService.getIcxBalanceSDK(this.address);
        this.walletProxyService.getTokens(this.address).subscribe((tokens) => {
          // TO DO make it less dumb, when a user want to add token by his choice
          this.sIcxBalance = parseFloat(
            tokens.data.tokenList.find(
              (token) => token.contractSymbol == 'sICX'
            ).quantity
          );
          this.bnUsdBalance = parseFloat(
            tokens.data.tokenList.find(
              (token) => token.contractSymbol == 'bnUSD'
            ).quantity
          );
        });
      });
    this.walletProxyService.dispatchEvent('REQUEST_ADDRESS');
  }
}
