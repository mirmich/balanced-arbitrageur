export function shortenAddress(address: String) {
  return address.slice(0, 5).concat('...').concat(address.slice(-3));
}
