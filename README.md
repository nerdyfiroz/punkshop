# Agent Punks

Agent Punks is a BNB Smart Chain ERC-721 mint and marketplace prototype.

## Mint rules

- An address with a Binance Agent ID can claim one free NFT and pays gas only.
- The collection supply is capped at 5,000 NFTs.
- The first 1,000 eligible Agent ID wallets can claim one free NFT through `FREE_MINT_SUPPLY`.
- Agent ID holders can mint up to 10 NFTs per transaction; the first NFT is free and each additional NFT costs `0.001 BNB`.
- Non-Agent ID wallets cannot mint.

## Contract

`contracts/AgentPunks.sol` includes ERC-721 metadata, configurable Agent ID eligibility, free and paid minting, on-chain rarity assignment, escrowed listings, buy/cancel/edit listing support, 1/3/7/custom-day expiries, refundable offers, and a 2.5% marketplace fee.

The contract currently combines the NFT mint and marketplace, so one deployed Agent Punks address handles both. It has two separate BSC payout addresses:

- `mintFeeRecipient`: receives paid mint revenue (`0.001 BNB` per paid NFT).
- `protocolFeeRecipient`: receives the `2.5%` fee from completed sales and accepted offers.

Both addresses can be updated by the contract owner with `setMintFeeRecipient` and `setProtocolFeeRecipient`. Use [deployment/bsc-mainnet.example.json](deployment/bsc-mainnet.example.json) as the BSC Mainnet input template. Replace every placeholder with a verified address before deployment. The official Agent ID registry address is required; do not guess it.

The supplied artwork is pinned at `bafybeigfxxuudcushujdasli3oneak4cdssr5z76sr32bmbqlvzpw5x3eq`. The metadata CID is `bafybeid74u3pubfwezis6txcjq3hnynmvwun4uozgzsfpysvncnolm6lqu`, so the base URI is `ipfs://bafybeid74u3pubfwezis6txcjq3hnynmvwun4uozgzsfpysvncnolm6lqu/` and `tokenURI(1)` resolves to `1.json`.

The constructor requires the official Binance Agent ID registry address. Do not deploy with a guessed address. The registry must implement:

```solidity
interface IAgentIdRegistry {
    function hasAgentId(address account) external view returns (bool);
}
```

## Compile

OpenZeppelin is pinned to a Solidity 0.8.24-compatible release:

```powershell
npm install
npx solc@0.8.24 --base-path . --include-path node_modules --bin contracts/AgentPunks.sol
```

The browser UI uses only `bandito_test_1024.png` as an image and reads the deployed contract live from BNB Smart Chain. The contract must be redeployed after the Agent ID-only mint rule change because smart contracts are immutable. The deployed contract address is `0xFc8b714a1bEf212E0fea94Dd1bb3D472573c1d75`. Configure the page with this address:

```html
<script>window.AGENT_PUNKS_ADDRESS = "0xFc8b714a1bEf212E0fea94Dd1bb3D472573c1d75";</script>
```

Place that line before `script.js`, or open the page with `?contract=0x...`. The page uses the injected EIP-1193 provider supplied by Binance Agentic Wallet, loads live listings and mint/sale activity from contract events, and sends mint, list, buy, and delist transactions through the wallet.

Minting is restricted on-chain to eligible Agent ID wallets. The first 1,000 eligible wallets can claim one free NFT. In a multi-mint, the first NFT is free and additional NFTs cost `0.001 BNB` each; every mint transaction is capped at 10 NFTs. Non-eligible wallets cannot mint.