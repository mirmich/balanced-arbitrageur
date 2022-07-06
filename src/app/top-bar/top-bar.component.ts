import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
})
export class TopBarComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  onSignIn() {
    console.log('Sign in called');
    const customEvent = new CustomEvent('ICONEX_RELAY_REQUEST', {
      detail: {
        type: 'REQUEST_ADDRESS',
      },
    });
    const eventHandler = (event) => {
      const { type, payload } = event.detail;
      if (type === 'RESPONSE_ADDRESS') {
        console.log(payload); // e.g., hx19870922...
      }
    };
    window.addEventListener('ICONEX_RELAY_RESPONSE', eventHandler);
    window.dispatchEvent(customEvent);
  }
}
