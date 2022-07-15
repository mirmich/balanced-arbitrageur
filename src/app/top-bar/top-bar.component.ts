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
    const customEvent = new CustomEvent('ICONEX_RELAY_REQUEST', {
      detail: {
        type: 'REQUEST_ADDRESS',
      },
    });
    

    this.walletProxyService
      .handleEvent('RESPONSE_ADDRESS')
      .subscribe((address0) => {
        console.log(address0);
        this.address = address0;
        this.showButton = false;
      });
    window.dispatchEvent(customEvent);
  }
}
