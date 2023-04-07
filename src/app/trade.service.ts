import { Injectable } from '@angular/core';
import IconService from 'icon-sdk-js';
import { WalletProxyService } from './core/walllet/service/wallet-proxy.service';

@Injectable({
  providedIn: 'root',
})
export class TradeService {
  constructor(private walletProxyService: WalletProxyService) {}
  /**
   * Executes the trade
   *
   * @param contractAddress The address of the swap smart contracts
   * @param tokenFrom The source token of the trade
   * @param tokenTo The target token of the trade
   * @param minimumRecieve0 The mininum that should be recieved after the trade
   * @param path0 The path that should be taken over when executing the trade e.g. bnUSD -> IUSDT -> sICX -> bnUSD
   */
  doTradeRPC(
    contractAddress: string,
    tokenFrom: string,
    toToken: string,
    minimumRecieve0: string,
    path0: string[]
  ): any {
    const data = {
      method: '_swap',
      params: {
        toToken: toToken,
        minimumRecieve: minimumRecieve0,
        path: path0,
      },
    };

    const rpcResult = {
      jsonrpc: '2.0',
      method: 'icx_sendTransaction',
      id: 1234,
      params: {
        version: '0x3',
        from: 'hx97180db9263685f07bed00df5111481513ab30c1',
        to: tokenFrom,
        stepLimit: '0x42c1d80',
        timestamp: IconService.IconConverter.toHexNumber(
          new Date().getTime() * 1000
        ),
        nid: '0x1',
        nonce: '0x1',
        dataType: 'call',
        data: {
          method: 'transfer',
          params: {
            _to: contractAddress,
            _value: '0x16345785d8a0000',
            _data: IconService.IconConverter.toHex(JSON.stringify(data)),
          },
        },
      },
    };
    return rpcResult;
  }
}

/**
 * {
    "to": "cx88fd7df7ddff82f7cc735c871dc519838cb235bb",
    "from": "hx97180db9263685f07bed00df5111481513ab30c1",
    "nid": "0x1",
    "version": "0x3",
    "timestamp": "0x5f59e7100d498",
    "stepLimit": "0x42c1d80",
    "value": "0x0",
    "dataType": "call",
    "data": {
        "method": "transfer",
        "params": {
            "_to": "cx21e94c08c03daee80c25d8ee3ea22a20786ec231",
            "_value": "0x16345785d8a0000", How many you wanna trade
            "_data": "0x7b226d6574686f64223a225f73776170222c22706172616d73223a7b22746f546f6b656e223a22637862623238373166343638613330303866383062303866646465356238623935313538336163663036222c226d696e696d756d52656365697665223a223938303232393635343338383536323834222c2270617468223a5b22637862623238373166343638613330303866383062303866646465356238623935313538336163663036225d7d7d"
        }
    }
}
^^ data
{"method":"_swap","params":{"toToken":"cxbb2871f468a3008f80b08fdde5b8b951583acf06","minimumReceive":"98022965438856284","path":["cxbb2871f468a3008f80b08fdde5b8b951583acf06"]}}
 */

/**
 * 
 * {
 * SWAP bnUSD to sICX
    "to": "cx88fd7df7ddff82f7cc735c871dc519838cb235bb", recipient is bnUSD contract
    "from": "hx97180db9263685f07bed00df5111481513ab30c1", me
    "nid": "0x1", idk
    "version": "0x3", idk
    "timestamp": "0x5e50abe017af8",
    "stepLimit": "0x42c1d80",
    "value": "0x0",
    "dataType": "call",
    "data": {
        "method": "transfer",
        "params": {
            "_to": "cx21e94c08c03daee80c25d8ee3ea22a20786ec231", balanced router contract
            "_value": "0x1812482108e2eeb", amount probably
            "_data": "0x7b226d6574686f64223a225f73776170222c22706172616d73223a7b22746f546f6b656e223a22637832363039623932346533336566303062363438613430393234356337656133393463343637383234222c226d696e696d756d52656365697665223a22323939313134363231373733363937393839222c2270617468223a5b22637833613336656131663662396161336432646439636236386538393837626363336161626161613838222c22637832363039623932346533336566303062363438613430393234356337656133393463343637383234225d7d7d"
        }
    }
}

{
  USDS TO bnUSd
    "to": "cxbb2871f468a3008f80b08fdde5b8b951583acf06", source token e.g USDS
    "from": "hx97180db9263685f07bed00df5111481513ab30c1",
    "nid": "0x1",
    "version": "0x3",
    "timestamp": "0x5f0d51de51918",
    "stepLimit": "0x42c1d80",
    "value": "0x0",
    "dataType": "call",
    "data": {
        "method": "transfer",
        "params": {
            "_to": "cx21e94c08c03daee80c25d8ee3ea22a20786ec231",
            "_value": "0x19567b1c64cc571",
            "_data": "0x7b226d6574686f64223a225f73776170222c22706172616d73223a7b22746f546f6b656e223a22637838386664376466376464666638326637636337333563383731646335313938333863623233356262222c226d696e696d756d52656365697665223a22313133333335363231353431373538353238222c2270617468223a5b22637838386664376466376464666638326637636337333563383731646335313938333863623233356262225d7d7d"
        }
    }
}

Stability fund
{
    "to": "cx88fd7df7ddff82f7cc735c871dc519838cb235bb",
    "from": "hx97180db9263685f07bed00df5111481513ab30c1",
    "nid": "0x1",
    "version": "0x3",
    "timestamp": "0x5e50b3354e948",
    "stepLimit": "0x42c1d80",
    "value": "0x0",
    "dataType": "call",
    "data": {
        "method": "transfer",
        "params": {
            "_to": "cxa09dbb60dcb62fffbd232b6eae132d730a2aafa6",
            "_value": "0x1812482108e2eeb",
            "_data": "0x637862623238373166343638613330303866383062303866646465356238623935313538336163663036"
        }
    }
}


 */
