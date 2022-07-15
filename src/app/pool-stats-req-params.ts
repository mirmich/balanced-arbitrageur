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
