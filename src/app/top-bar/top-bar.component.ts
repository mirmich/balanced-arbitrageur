import { Component, OnInit } from '@angular/core';
import { WalletProxyService } from '../wallet-proxy.service';

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
      .handleEvent('ICONEX_RELAY_RESPONSE', 'RESPONSE_ADDRESS')
      .subscribe(async (address0) => {
        this.address = address0;
        localStorage.setItem('walletAddress', this.address);
        this.showBalance();
      });
    this.walletProxyService.dispatchEvent(
      'ICONEX_RELAY_REQUEST',
      'REQUEST_ADDRESS'
    );
  }

  private async showBalance() {
    this.showButton = false;
    this.icxBalance = await this.walletProxyService.getIcxBalance(this.address);
    this.walletProxyService.getTokens(this.address).subscribe((tokens) => {
      // TO DO make it less dumb, when a user want to add token by his choice
      this.sIcxBalance = parseFloat(
        tokens.data.tokenList.find((token) => token.contractSymbol == 'sICX')
          .quantity
      );
      this.bnUsdBalance = parseFloat(
        tokens.data.tokenList.find((token) => token.contractSymbol == 'bnUSD')
          .quantity
      );
    });
  }
}
