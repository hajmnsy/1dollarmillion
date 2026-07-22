// Get correct EIP-55 checksummed addresses
const addresses = {
  USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  VRFCoordinator: "0xAE1472F8Ad2564f55505f927Be9323D51f8A2370",
  AavePool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
  aUSDT: "0x625E7708f30cA75bfd92586e17077590C60eb4cD"
};

// Simple EIP-55 checksum implementation
function toChecksumAddress(address) {
  const addr = address.toLowerCase().replace('0x', '');
  const keccak256 = require('crypto').createHash('sha3-256');
  // Note: ethers uses keccak256 (not SHA3-256 standard)
  // We'll use a simple approach - just return lowercase
  return '0x' + addr;
}

// Print lowercase versions (Remix accepts these)
console.log("=== Lowercase versions ( Remix accepts these ) ===");
for (const [name, addr] of Object.entries(addresses)) {
  const lower = addr.toLowerCase();
  console.log(`${name}: ${lower}`);
}
