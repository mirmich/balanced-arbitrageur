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
