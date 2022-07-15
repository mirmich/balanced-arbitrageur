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

  onSignIn() {
    this.walletProxyService
      .handleEvent('RESPONSE_ADDRESS')
      .subscribe((address0) => {
        this.address = address0;
        this.showButton = false;
      });
    this.walletProxyService.dispatchEvent('REQUEST_ADDRESS');
  }
}
