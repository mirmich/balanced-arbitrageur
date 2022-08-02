export interface IPoolStatsReqParams {
  to: string;
  dataType: string;
  data: {
    method: string;
    params?: {
      _id: string;
    };
  };
  id?: string;
}

export interface IPoolStatsReq {
  jsonrpc: string;
  id: number;
  method: string;
  params: any;
}

export interface ITokenName {
  jsonrpc: string;
  id: number;
  result: string;
}

export interface IPoolStats {
  id?: number;
  jsonrpc?: string;
  result?: {
    base: string;
    base_decimals: string;
    base_token: string;
    min_quote: string;
    name: string;
    price: string;
    quote: string;
    quote_decimals: string;
    quote_token: string;
    total_supply: string;
  };
}

export interface IcxBalanceResult {
  jsonrpc: string;
  id: number;
  result: string;
}

export interface TokensBalanceResultTokens {
  contractAddr: string;
  contractName: string;
  contractSymbol: string;
  quantity: string;
  tokenPrice: string;
  totalTokenPrice: string;
}

export interface TokensBalanceResultData {
  tokenList: TokensBalanceResultTokens[];
}

export interface TokensBalanceResult {
  description: string;
  result: string;
  data: TokensBalanceResultData;
}

export interface TradeParams {
  toToken: string;
  minimumReceive: string;
  path: String[];
}

export interface Trade {
  method: string;
  params: TradeParams;
}

//{"method":"_swap","params":{"toToken":"cx2609b924e33ef00b648a409245c7ea394c467824","minimumReceive":"299114621773697989","path":["cx3a36ea1f6b9aa3d2dd9cb68e8987bcc3aabaaa88","cx2609b924e33ef00b648a409245c7ea394c467824"]}}
