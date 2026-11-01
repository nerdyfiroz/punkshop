const CONTRACT_ADDRESS = '0x01d75929fB14C4094A35fC16DDaB91F108614720';
module.exports = async function handler(request, response) {
  if (request.method !== 'GET') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey) {
    response.status(503).json({ error: 'ETHERSCAN_API_KEY is not configured' });
    return;
  }

  const latestBlock = Number(request.query.toBlock);
  const requestedFromBlock = Number(request.query.fromBlock);
  const fromBlock = Number.isSafeInteger(requestedFromBlock) ? requestedFromBlock : 0;
  const toBlock = Number.isSafeInteger(latestBlock) ? latestBlock : fromBlock + 2000;
  if (fromBlock < 0 || toBlock < fromBlock || toBlock - fromBlock > 5000) {
    response.status(400).json({ error: 'Block range must be between 0 and 5,000 blocks' });
    return;
  }
  try {
    const url = new URL('https://api.etherscan.io/v2/api');
    url.search = new URLSearchParams({
      chainid: '56',
      module: 'logs',
      action: 'getLogs',
      address: CONTRACT_ADDRESS,
      fromBlock: String(fromBlock),
      toBlock: String(toBlock),
      apikey: apiKey,
    });
    const result = await fetch(url);
    if (!result.ok) throw new Error(`Etherscan request failed with ${result.status}`);
    const body = await result.json();
    if (body.status === '0' && body.message !== 'No records found') {
      throw new Error(body.result || body.message || 'Etherscan returned an error');
    }
    const logs = Array.isArray(body.result) ? body.result : [];

    response.setHeader('Cache-Control', 'no-store');
    response.status(200).json({ logs, fromBlock, toBlock });
  } catch (error) {
    response.status(502).json({ error: error.message });
  }
};
