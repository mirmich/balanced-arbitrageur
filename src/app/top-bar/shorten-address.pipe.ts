import { Pipe, PipeTransform } from '@angular/core';
import { shortenAddress } from '../utils/wallet-util';

@Pipe({
  name: 'shortenAddress',
})
export class ShortenAddressPipe implements PipeTransform {
  transform(address: string): string {
    return shortenAddress(address);
  }
}
