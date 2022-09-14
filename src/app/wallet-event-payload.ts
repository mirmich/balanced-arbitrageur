export interface WalletEventPayload {
}

export interface WalletSigningEventPayload extends WalletEventPayload {
  from: string;
  hash: string;
}