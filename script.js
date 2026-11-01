const CONFIG = {
  chainId: '0x38',
  chainName: 'BNB Smart Chain',
  rpcUrls: [
    'https://bsc.publicnode.com',
    'https://bsc-rpc.publicnode.com',
    'https://bsc-dataseed.binance.org',
    'https://bsc-dataseed1.defibit.io',
    'https://bsc-dataseed1.ninicoin.io',
  ],
  explorer: 'https://bscscan.com',
  deploymentBlock: 130890669,
  contractAddress: window.AGENT_PUNKS_ADDRESS || new URLSearchParams(window.location.search).get('contract') || '',
};

const ABI = [
  'function mint(uint256 quantity) payable',
  'function approve(address to, uint256 tokenId)',
  'function list(uint256 tokenId, uint256 price, uint256 duration)',
  'function editListing(uint256 tokenId, uint256 newPrice, uint256 duration)',
  'function buy(uint256 tokenId) payable',
  'function cancelListing(uint256 tokenId)',
  'function hasAgentId(address account) view returns (bool)',
  'function freeMintClaimed(address account) view returns (bool)',
  'function MINT_PRICE() view returns (uint256)',
  'function totalMinted() view returns (uint256)',
  'function freeMinted() view returns (uint256)',
  'function FREE_MINT_SUPPLY() view returns (uint256)',
  'function MAX_SUPPLY() view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function listings(uint256 tokenId) view returns (address seller, uint256 price, uint256 expiresAt)',
  'event Minted(address indexed minter, uint256 indexed tokenId, bool freeMint, uint8 rarity)',
  'event Listed(address indexed seller, uint256 indexed tokenId, uint256 price)',
  'event ListingEdited(address indexed seller, uint256 indexed tokenId, uint256 price)',
  'event ListingCancelled(address indexed seller, uint256 indexed tokenId)',
  'event Sold(address indexed seller, address indexed buyer, uint256 indexed tokenId, uint256 price)',
];

const walletButton = document.querySelector('#walletButton');
const walletLabel = document.querySelector('#walletLabel');
const mineButton = document.querySelector('#mineButton');
const toast = document.querySelector('#toast');
const mintedCount = document.querySelector('#mintedCount');
const remainingCount = document.querySelector('#remainingCount');
const freeMintedCount = document.querySelector('#freeMintedCount');
const mintProgressFill = document.querySelector('#mintProgressFill');
const mintProgressLabel = document.querySelector('#mintProgressLabel');
const promptButton = document.querySelector('#promptButton');
const mintQuantity = document.querySelector('#mintQuantity');
const marketList = document.querySelector('#marketList');
const marketSearch = document.querySelector('#marketSearch');
const marketSort = document.querySelector('#marketSort');
const marketStatus = document.querySelector('#marketStatus');
const marketMinPrice = document.querySelector('#marketMinPrice');
const marketMaxPrice = document.querySelector('#marketMaxPrice');
const marketFloor = document.querySelector('#marketFloor');
const marketListings = document.querySelector('#marketListings');
const sellSection = document.querySelector('#sellSection');
let currentListings = [];
const marketListingState = new Map();
let marketLastBlock = 0;
let refreshInFlight = false;
const activityFeed = document.querySelector('#activityFeed');
const listButton = document.querySelector('#listButton');
const durationOptions = document.querySelectorAll('.duration-option');
const customDuration = document.querySelector('#customDuration');
const directMintButton = document.querySelector('#directMintButton');
const sellPromptButton = document.querySelector('#sellPromptButton');
const editPromptButton = document.querySelector('#editPromptButton');
let listingDuration = 1;
let walletProvider;
let browserProvider;
let signer;
let contract;
let account = '';
let refreshTimer;

const agentPrompt = 'Open the Agent Punks website at https://www.punksnft.store and read the mint guide. Help me mint Agent Punks NFT with my Binance Agentic Wallet on BNB Smart Chain. The NFT contract address is 0x01d75929fB14C4094A35fC16DDaB91F108614720 . First check my Agent ID eligibility, wallet balance, contract status, gas estimate, network, and Developer Mode. Show me the exact transaction preview, including contract address, function, quantity, value, gas estimate, and recipient, then wait for my explicit approval before sending. Use English, never guess a token ID or contract address, and never treat a pending transaction as confirmed.';

const marketPrompts = {
  buy: 'Open the Agent Punks website at https://www.punksnft.store and read the market guide. Help me buy a listed Agent Punks NFT with my Binance Agentic Wallet on BNB Smart Chain. A normal wallet can buy; Agent ID eligibility is not required for marketplace purchases. First check the listing, seller, exact price, wallet balance, network, gas estimate, and Developer Mode. Show me the exact transaction preview for approval before sending, including contract address, function, token ID, value, gas estimate, and recipient. Use English, never guess a token ID or price, and never treat a pending transaction as confirmed.',
  sell: 'Open the Agent Punks website at https://www.punksnft.store and read the market guide. Help me list my Agent Punks NFT for sale with my Binance Agentic Wallet on BNB Smart Chain. First check wallet ownership, approvals, listing status, price, duration, network, wallet balance, and Developer Mode. Show me the exact transaction preview for approval before sending, including contract address, function, token ID, price, duration, gas estimate, and recipient. Use English, never guess a token ID or price, and never treat a pending transaction as confirmed.',
  edit: 'Open the Agent Punks website at https://www.punksnft.store and read the market guide. Help me change the price or duration of my existing Agent Punks listing with my Binance Agentic Wallet on BNB Smart Chain. First check wallet ownership, current listing, new price, duration, network, wallet balance, and Developer Mode. Show me the exact transaction preview for approval before sending, including contract address, function, token ID, new price, duration, gas estimate, and recipient. Use English, never guess a token ID or price, and never treat a pending transaction as confirmed.',
};

function getAgentPrompt() {
  const requestedQuantity = Number(mintQuantity?.value);
  const quantity = Number.isInteger(requestedQuantity) && requestedQuantity >= 1 && requestedQuantity <= 10
    ? requestedQuantity
    : 1;
  return `${agentPrompt} I want to mint exactly ${quantity} Agent Punks NFT${quantity === 1 ? '' : 's'}.`;
}

function getMarketPrompt(type) {
  const tokenId = document.querySelector('#sellTokenId')?.value || '[token ID]';
  const price = document.querySelector('#sellPrice')?.value || '[price in BNB]';
  const duration = document.querySelector('#customDuration')?.value || '[duration in days]';
  return `${marketPrompts[type]} I want to ${type === 'sell' ? 'list' : 'update'} token ID ${tokenId} at ${price} BNB for ${duration} days.`;
}

async function copyPrompt(prompt, message) {
  try {
    await navigator.clipboard.writeText(prompt);
    showToast(message);
  } catch {
    showToast('Select and copy the prompt from the browser');
  }
}

function initLobbyCarousel() {
  const carousel = document.querySelector('#lobbyCarousel');
  if (!carousel) return;
  const track = carousel.querySelector('.lobby-carousel-track');
  const slides = [...carousel.querySelectorAll('.lobby-slide')];
  const count = carousel.querySelector('.lobby-carousel-count');
  const previous = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');
  let current = 0;
  let timer;

  function showSlide(index, direction = 1) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
      slide.classList.toggle('is-entering', slideIndex === current);
      slide.dataset.direction = direction > 0 ? 'next' : 'previous';
    });
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }

  function restartTimer() {
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(current + 1), 5000);
  }

  previous?.addEventListener('click', () => {
    showSlide(current - 1, -1);
    restartTimer();
  });
  next?.addEventListener('click', () => {
    showSlide(current + 1);
    restartTimer();
  });
  showSlide(0);
  restartTimer();
}

initLobbyCarousel();

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3200);
}

function shortenAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function configured() {
  return ethers.isAddress(CONFIG.contractAddress);
}

function getReadContract() {
  if (!configured()) return null;
  browserProvider ||= new ethers.JsonRpcProvider(CONFIG.rpcUrls[0], 56, { staticNetwork: true });
  return new ethers.Contract(CONFIG.contractAddress, ABI, browserProvider);
}

function getWriteContract() {
  if (!contract && signer) contract = new ethers.Contract(CONFIG.contractAddress, ABI, signer);
  return contract;
}

async function ensureBsc() {
  const chainId = await walletProvider.request({ method: 'eth_chainId' });
  if (chainId !== CONFIG.chainId) {
    await walletProvider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CONFIG.chainId }] });
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    showToast('Open this page with Binance Agentic Wallet or another EIP-1193 wallet');
    return;
  }
  try {
    walletProvider = window.ethereum;
    await walletProvider.request({ method: 'eth_requestAccounts' });
    await ensureBsc();
    browserProvider = new ethers.BrowserProvider(walletProvider);
    signer = await browserProvider.getSigner();
    account = await signer.getAddress();
    contract = new ethers.Contract(CONFIG.contractAddress, ABI, signer);
    walletLabel.textContent = shortenAddress(account);
    walletButton.querySelector('.wallet-dot').style.background = '#f47d38';
    updateMintLabel();
    showToast(configured() ? 'Agentic Wallet connected on BNB Smart Chain' : 'Wallet connected — add the deployed contract address');
    await refreshLiveData();
  } catch (error) {
    showToast(error.code === 4001 ? 'Wallet connection cancelled' : `Wallet connection failed: ${error.shortMessage || error.message}`);
  }
}

async function updateMintLabel() {
  if (!mineButton || !mintQuantity) return;
  if (!account || !configured()) {
    mineButton.innerHTML = `${account ? 'Configure contract to mint' : 'Connect wallet to mint'} <span></span>`;
    return;
  }
  try {
    const readContract = getReadContract();
    if (!(await readContract.hasAgentId(account))) {
      mineButton.innerHTML = 'Agent ID required <span>!</span>';
      return;
    }
    const freeAvailable = !(await readContract.freeMintClaimed(account));
    const quantity = Math.min(10, Math.max(1, Number(mintQuantity.value)));
    const paidQuantity = freeAvailable ? quantity - 1 : quantity;
    mineButton.innerHTML = `${freeAvailable ? 'Mint free + paid' : 'Mint publicly'} · ${ethers.formatEther((await readContract.MINT_PRICE()) * BigInt(paidQuantity))} BNB <span></span>`;
  } catch {
    mineButton.innerHTML = 'Mint with Agentic Wallet <span></span>';
  }
}

async function mint() {
  if (!account) return connectWallet();
  if (!configured()) return showToast('Set window.AGENT_PUNKS_ADDRESS after deploying the contract');
  const quantity = Number(mintQuantity.value);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) return showToast('Choose between 1 and 10 NFTs');
  try {
    mineButton.disabled = true;
    mineButton.innerHTML = 'Confirm mint in wallet <span>...</span>';
    const readContract = getReadContract();
    const eligible = await readContract.hasAgentId(account);
    if (!eligible) {
      showToast('This mint is available only to Agent ID wallets');
      return;
    }
    const claimed = await readContract.freeMintClaimed(account);
    const paidQuantity = !claimed ? quantity - 1 : quantity;
    const value = (await readContract.MINT_PRICE()) * BigInt(paidQuantity);
    const tx = await getWriteContract().mint(quantity, { value });
    showToast(`Mint submitted: ${tx.hash.slice(0, 10)}...`);
    await tx.wait();
    showToast('Mint confirmed — your punk is on-chain');
    await refreshLiveData();
  } catch (error) {
    showToast(`Mint failed: ${error.shortMessage || error.message}`);
  } finally {
    mineButton.disabled = false;
    await updateMintLabel();
  }
}

async function directMint() {
  if (!account) return connectWallet();
  if (!configured()) return showToast('Set window.AGENT_PUNKS_ADDRESS after deploying the contract');
  try {
    if (!(await getReadContract().hasAgentId(account))) {
      showToast('Direct mint is unavailable: this contract requires an Agent ID');
      return;
    }
    await mint();
  } catch (error) {
    showToast(`Direct mint check failed: ${error.shortMessage || error.message}`);
  }
}

async function listPunk() {
  if (!account) return connectWallet();
  if (!configured()) return showToast('Set window.AGENT_PUNKS_ADDRESS after deploying the contract');
  const tokenId = Number(document.querySelector('#sellTokenId').value);
  const price = document.querySelector('#sellPrice').value;
  const durationDays = Number(customDuration.value) || listingDuration;
  if (!Number.isInteger(tokenId) || tokenId < 1 || !price || durationDays < 1) return showToast('Enter a token ID, price, and duration');
  try {
    listButton.disabled = true;
    const nft = getWriteContract();
    showToast('Approve the marketplace in your wallet');
    const approval = await nft.approve(CONFIG.contractAddress, tokenId);
    await approval.wait();
    showToast('Confirm listing in your wallet');
    const tx = await nft.list(tokenId, ethers.parseEther(price), durationDays * 86400);
    await tx.wait();
    showToast(`Punk #${tokenId} listed for ${price} BNB`);
    await refreshLiveData();
  } catch (error) {
    showToast(`Listing failed: ${error.shortMessage || error.message}`);
  } finally {
    listButton.disabled = false;
  }
}

async function buyPunk(tokenId, price) {
  if (!account) return connectWallet();
  try {
    const tx = await getWriteContract().buy(tokenId, { value: price });
    showToast('Purchase submitted — waiting for confirmation');
    await tx.wait();
    showToast(`Punk #${tokenId} purchased`);
    await refreshLiveData();
  } catch (error) {
    showToast(`Purchase failed: ${error.shortMessage || error.message}`);
  }
}

async function cancelListing(tokenId) {
  try {
    const tx = await getWriteContract().cancelListing(tokenId);
    await tx.wait();
    showToast(`Punk #${tokenId} delisted`);
    await refreshLiveData();
  } catch (error) {
    showToast(`Delist failed: ${error.shortMessage || error.message}`);
  }
}

async function queryEvents(readContract, filter, fromBlock, toBlock) {
  const logs = [];
  const chunkSize = activityFeed && !marketList ? 100 : 10000;
  for (let start = fromBlock; start <= toBlock; start += chunkSize + 1) {
    const end = Math.min(start + chunkSize, toBlock);
    logs.push(...await readContract.queryFilter(filter, start, end));
  }
  return logs;
}

async function queryVercelMarketEvents(fromBlock, toBlock, readContract) {
  const response = await fetch(`/api/market-events?fromBlock=${fromBlock}&toBlock=${toBlock}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Market event API unavailable');
  const body = await response.json();
  return body.logs.map((log) => readContract.interface.parseLog({ topics: log.topics, data: log.data })).filter(Boolean);
}

async function refreshLiveData() {
  if (refreshInFlight) return;
  refreshInFlight = true;
  const readContract = getReadContract();
  if (!marketList && !activityFeed && !mintedCount && !remainingCount && !freeMintedCount) {
    refreshInFlight = false;
    return;
  }
  if (!readContract) {
    if (marketList) marketList.innerHTML = '<div class="market-empty"><span class="empty-mark">—</span><strong>Contract address required</strong><span>Set window.AGENT_PUNKS_ADDRESS or use ?contract=0x… after deploying.</span></div>';
    refreshInFlight = false;
    return;
  }
  try {
    const total = await readContract.totalMinted();
    if (mintedCount) mintedCount.textContent = Number(total).toLocaleString();
    if (freeMintedCount) {
      const freeMinted = await readContract.freeMinted();
      freeMintedCount.textContent = Number(freeMinted).toLocaleString();
    }
    if (remainingCount) {
      const maxSupply = await readContract.MAX_SUPPLY();
      remainingCount.textContent = Number(maxSupply - total).toLocaleString();
      const progress = Math.min(100, Math.max(0, Number(total) / Number(maxSupply) * 100));
      if (mintProgressFill) mintProgressFill.style.width = `${progress}%`;
      if (mintProgressLabel) mintProgressLabel.textContent = `${progress.toFixed(1)}% minted`;
    }
    const marketOnly = marketList && !activityFeed;
    const listed = marketOnly ? marketListingState : new Map();
    const latestBlock = await browserProvider.getBlockNumber();
    const fromBlock = CONFIG.deploymentBlock;
    const activityFromBlock = activityFeed && !marketList
      ? Math.max(fromBlock, latestBlock - 2000)
      : fromBlock;
    const eventFromBlock = marketOnly && marketLastBlock ? marketLastBlock + 1 : activityFromBlock;
    const marketEvents = marketList && marketLastBlock
      ? queryVercelMarketEvents(eventFromBlock, latestBlock, readContract).catch(() => Promise.all([
        queryEvents(readContract, readContract.filters.Listed(), eventFromBlock, latestBlock),
        queryEvents(readContract, readContract.filters.ListingEdited(), eventFromBlock, latestBlock),
        queryEvents(readContract, readContract.filters.Sold(), eventFromBlock, latestBlock),
        queryEvents(readContract, readContract.filters.ListingCancelled(), eventFromBlock, latestBlock),
      ]).then((groups) => groups.flat()))
      : null;
    const [mintedLogs, listedLogs, editedLogs, soldLogs, cancelledLogs] = await Promise.all([
      activityFeed ? queryEvents(readContract, readContract.filters.Minted(), activityFromBlock, latestBlock) : [],
      marketList ? (marketEvents ? marketEvents.then((logs) => logs.filter((log) => log.name === 'Listed')) : queryEvents(readContract, readContract.filters.Listed(), eventFromBlock, latestBlock)) : [],
      marketList ? (marketEvents ? marketEvents.then((logs) => logs.filter((log) => log.name === 'ListingEdited')) : queryEvents(readContract, readContract.filters.ListingEdited(), eventFromBlock, latestBlock)) : [],
      activityFeed ? queryEvents(readContract, readContract.filters.Sold(), activityFromBlock, latestBlock) : marketList ? (marketEvents ? marketEvents.then((logs) => logs.filter((log) => log.name === 'Sold')) : queryEvents(readContract, readContract.filters.Sold(), eventFromBlock, latestBlock)) : [],
      marketList ? (marketEvents ? marketEvents.then((logs) => logs.filter((log) => log.name === 'ListingCancelled')) : queryEvents(readContract, readContract.filters.ListingCancelled(), eventFromBlock, latestBlock)) : [],
    ]);
    [...listedLogs, ...editedLogs].forEach((log) => listed.set(log.args.tokenId.toString(), { tokenId: log.args.tokenId, seller: log.args.seller, price: log.args.price }));
    [...soldLogs, ...cancelledLogs].forEach((log) => listed.delete(log.args.tokenId.toString()));
    if (marketOnly) marketLastBlock = latestBlock;
    renderListings([...listed.values()]);
    renderActivity([...mintedLogs, ...listedLogs, ...soldLogs].sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber)).slice(0, 8));
  } catch (error) {
    if (marketList) marketList.innerHTML = `<div class="market-empty"><strong>Live data unavailable</strong><span>${error.shortMessage || error.message}</span></div>`;
    if (activityFeed) activityFeed.innerHTML = `<div class="feed-item"><span class="feed-badge">!</span><div><strong>Live activity unavailable</strong><span>${error.shortMessage || error.message}</span></div><code>RETRYING</code></div>`;
  } finally {
    refreshInFlight = false;
  }
}

function renderListings(listings) {
  if (!marketList) return;
  currentListings = listings;
  const search = marketSearch?.value.trim().toLowerCase() || '';
  const status = marketStatus?.value || 'all';
  const minPrice = Number(marketMinPrice?.value) || 0;
  const maxPrice = Number(marketMaxPrice?.value) || Number.POSITIVE_INFINITY;
  const sort = marketSort?.value || 'price-asc';
  if (!listings.length) {
    if (marketListings) marketListings.textContent = '0';
    if (marketFloor) marketFloor.textContent = '—';
    marketList.innerHTML = '<div class="market-empty"><span class="empty-mark">—</span><strong>No active listings</strong><span>Live listings will appear here after a punk is listed.</span></div>';
    return;
  }
  const filtered = listings
    .filter((listing) => {
      const tokenId = listing.tokenId.toString();
      const price = Number(ethers.formatEther(listing.price));
      const mine = account && listing.seller.toLowerCase() === account.toLowerCase();
      return (!search || tokenId.includes(search.replace(/^#/, '')))
        && (status !== 'mine' || mine)
        && price >= minPrice
        && price <= maxPrice;
    })
    .sort((a, b) => {
      if (sort === 'token-desc') return Number(b.tokenId) - Number(a.tokenId);
      const difference = Number(a.price - b.price);
      return sort === 'price-desc' ? -difference : difference;
    });
  if (marketListings) marketListings.textContent = listings.length.toLocaleString();
  if (marketFloor) marketFloor.textContent = listings.length ? ethers.formatEther([...listings].sort((a, b) => Number(a.price - b.price))[0].price) : '—';
  if (!filtered.length) {
    marketList.innerHTML = '<div class="market-empty"><span class="empty-mark">—</span><strong>No matching listings</strong><span>Try clearing a filter or check back after the next chain refresh.</span></div>';
    return;
  }
  marketList.innerHTML = `<div class="market-card-grid">${filtered.map((listing) => {
    const price = ethers.formatEther(listing.price);
    const ownerAction = account && listing.seller.toLowerCase() === account.toLowerCase()
      ? `<button class="secondary-button cancel-listing" data-token="${listing.tokenId}">Delist</button>`
      : `<button class="mine-button buy-listing" data-token="${listing.tokenId}" data-price="${listing.price}">Buy <span></span></button>`;
    const promptAction = `<button class="prompt-button buy-prompt" data-token="${listing.tokenId}" data-price="${price}" type="button">Copy buy prompt</button>`;
    return `<article class="market-card" data-token-card="${listing.tokenId}"><div class="market-card-art"><span>APUNK #${listing.tokenId}</span><div class="market-art-placeholder">✦</div></div><div class="market-card-info"><div><strong>Punk #${listing.tokenId}</strong><span>${shortenAddress(listing.seller)}</span></div><b>${price} BNB</b></div><div class="market-card-actions">${ownerAction}${promptAction}</div></article>`;
  }).join('')}</div>`;
  marketList.querySelectorAll('.buy-listing').forEach((button) => button.addEventListener('click', () => buyPunk(button.dataset.token, button.dataset.price)));
  marketList.querySelectorAll('.cancel-listing').forEach((button) => button.addEventListener('click', () => cancelListing(button.dataset.token)));
  marketList.querySelectorAll('.buy-prompt').forEach((button) => button.addEventListener('click', () => copyPrompt(`${marketPrompts.buy} I want to buy token ID ${button.dataset.token} for ${button.dataset.price} BNB.`, 'Buy prompt copied')));
  loadListingImages(filtered);
}

function resolveMetadataUri(uri) {
  if (uri.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  return uri;
}

async function loadListingImages(listings) {
  const readContract = getReadContract();
  await Promise.all(listings.map(async (listing) => {
    try {
      const uri = resolveMetadataUri(await readContract.tokenURI(listing.tokenId));
      const response = await fetch(uri);
      const metadata = await response.json();
      const image = metadata.image ? resolveMetadataUri(metadata.image) : '';
      const card = marketList.querySelector(`[data-token-card="${listing.tokenId}"] .market-card-art`);
      if (card && image) card.innerHTML = `<img src="${image}" alt="Agent Punk #${listing.tokenId}" loading="lazy"><span>APUNK #${listing.tokenId}</span>`;
    } catch {
      // Keep the visual placeholder when token metadata is unavailable.
    }
  }));
}

function renderActivity(logs) {
  if (!activityFeed) return;
  if (!logs.length) {
    activityFeed.innerHTML = '<div class="feed-item"><span class="feed-badge">AP</span><div><strong>No minting activity yet</strong><span>New confirmed mints will appear automatically.</span></div><code>LIVE</code></div>';
    return;
  }
  activityFeed.innerHTML = logs.map((log) => {
    const isSale = log.fragment.name === 'Sold';
    const tokenId = log.args.tokenId.toString();
    const address = isSale ? log.args.buyer : log.args.minter;
    return `<div class="feed-item"><span class="feed-badge">AP</span><div><strong>Punk #${tokenId} ${isSale ? 'sold' : 'minted'}</strong><span>${isSale ? `${ethers.formatEther(log.args.price)} BNB` : 'Confirmed on BNB Smart Chain'}</span></div><code>${shortenAddress(address)}</code><span class="feed-arrow"></span></div>`;
  }).join('');
}

walletButton?.addEventListener('click', connectWallet);
mineButton?.addEventListener('click', mint);
directMintButton?.addEventListener('click', directMint);
sellPromptButton?.addEventListener('click', () => copyPrompt(getMarketPrompt('sell'), 'Sell prompt copied'));
editPromptButton?.addEventListener('click', () => copyPrompt(getMarketPrompt('edit'), 'Price-change prompt copied'));
mintQuantity?.addEventListener('input', updateMintLabel);
listButton?.addEventListener('click', listPunk);
marketSearch?.addEventListener('input', () => renderListings(currentListings));
marketSort?.addEventListener('change', () => renderListings(currentListings));
marketStatus?.addEventListener('change', () => renderListings(currentListings));
marketMinPrice?.addEventListener('input', () => renderListings(currentListings));
marketMaxPrice?.addEventListener('input', () => renderListings(currentListings));
document.querySelector('#clearMarketFilters')?.addEventListener('click', () => {
  if (marketSearch) marketSearch.value = '';
  if (marketStatus) marketStatus.value = 'all';
  if (marketMinPrice) marketMinPrice.value = '';
  if (marketMaxPrice) marketMaxPrice.value = '';
  renderListings(currentListings);
});
document.querySelector('[data-scroll-sell]')?.addEventListener('click', () => sellSection?.scrollIntoView({ behavior: 'smooth' }));
promptButton?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(getAgentPrompt());
    showToast('Agent ID mint prompt copied');
  } catch {
    showToast('Select and copy the prompt from the browser');
  }
});
durationOptions.forEach((option) => option.addEventListener('click', () => {
  durationOptions.forEach((item) => item.classList.remove('active'));
  option.classList.add('active');
  listingDuration = Number(option.dataset.days);
  if (customDuration) customDuration.value = '';
  showToast(`Listing duration set to ${listingDuration} day${listingDuration === 1 ? '' : 's'}`);
}));
customDuration?.addEventListener('input', () => {
  const days = Number(customDuration.value);
  if (days > 0) {
    durationOptions.forEach((item) => item.classList.remove('active'));
    listingDuration = days;
  }
});
window.ethereum?.on('accountsChanged', () => window.location.reload());
refreshLiveData();
if (marketList || activityFeed || mintedCount || remainingCount || freeMintedCount) refreshTimer = window.setInterval(refreshLiveData, 2000);
