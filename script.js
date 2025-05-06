// ens-avatar-fetcher.js

// Configuration
const CONFIG = {
  infuraKey: 'YOUR_INFURA_KEY', // Replace with your Infura key
  cacheTTL: 300000, // 5 minutes cache
  ensjsVersion: '3.0.0',
  defaultChainId: 1,
  avatarSizes: [256, 512] // Supported avatar sizes
};

// Cache Store
const avatarCache = new Map();

// Initialize Providers
const httpTransport = viem.http(`https://mainnet.infura.io/v3/${CONFIG.infuraKey}`);
const wagmiClient = wagmi.createClient({
  transport: httpTransport,
  chainId: CONFIG.defaultChainId
});

const ensInstance = new ENSJS.ENS({
  transport: httpTransport,
  chainId: CONFIG.defaultChainId
});

// DOM Elements
const elements = {
  wagmiInput: document.getElementById('ensInput1'),
  wagmiButton: document.querySelector('[onclick="fetchWithWagmi()"]'),
  wagmiContainer: document.getElementById('avatarContainer1'),
  
  ensjsInput: document.getElementById('ensInput2'),
  ensjsButton: document.querySelector('[onclick="fetchWithENSJS()"]'),
  ensjsContainer: document.getElementById('avatarContainer2')
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  elements.wagmiButton.addEventListener('click', handleWagmiFetch);
  elements.ensjsButton.addEventListener('click', handleEnsjsFetch);
  
  // Add debounced input handlers
  elements.wagmiInput.addEventListener('input', debounce(prefetchAvatar, 500));
  elements.ensjsInput.addEventListener('input', debounce(prefetchAvatar, 500));
});

// Utility Functions
const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
};

const validateENSName = (name) => {
  return /^([a-z0-9-]+\.)+eth$/.test(name);
};

const updateUI = (container, content, type = 'success') => {
  container.innerHTML = content;
  container.className = `${type} avatar-container`;
};

// Core Logic
async function fetchEnsAvatar(name, method = 'wagmi') {
  try {
    if (!validateENSName(name)) {
      throw new Error('Invalid ENS name format');
    }

    // Check cache first
    const cacheKey = `${name}-${method}`;
    const cached = avatarCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CONFIG.cacheTTL) {
      return cached.data;
    }

    let avatarUrl;
    
    if (method === 'wagmi') {
      avatarUrl = await wagmi.fetchEnsAvatar(wagmiClient, { name });
    } else {
      const { url } = await ensInstance.getAvatar(name);
      avatarUrl = url;
    }

    if (!avatarUrl) throw new Error('No avatar found');
    
    // Verify URL format and response
    const validProtocols = ['https:', 'ipfs:', 'data:'];
    const urlObj = new URL(avatarUrl);
    if (!validProtocols.includes(urlObj.protocol)) {
      throw new Error('Unsupported avatar protocol');
    }

    // Cache the result
    avatarCache.set(cacheKey, {
      data: avatarUrl,
      timestamp: Date.now()
    });

    return avatarUrl;
  } catch (error) {
    console.error(`ENS Avatar Error (${method}):`, error);
    throw error;
  }
}

// Handlers
async function handleWagmiFetch() {
  const name = elements.wagmiInput.value.trim();
  updateUI(elements.wagmiContainer, '<div class="loading">Searching ENS records...</div>', 'loading');

  try {
    const avatar = await fetchEnsAvatar(name, 'wagmi');
    updateUI(elements.wagmiContainer, `
      <img src="${avatar}" 
           class="avatar-image" 
           alt="ENS Avatar for ${name}"
           loading="lazy"
           srcset="${CONFIG.avatarSizes.map(size => `${avatar}?size=${size} ${size}w`).join(', ')}">
      <div class="success">Avatar found for ${name}</div>
    `);
  } catch (error) {
    updateUI(elements.wagmiContainer, `
      <div class="error">Error: ${error.message}</div>
    `, 'error');
  }
}

async function handleEnsjsFetch() {
  const name = elements.ensjsInput.value.trim();
  updateUI(elements.ensjsContainer, '<div class="loading">Querying ENS resolver...</div>', 'loading');

  try {
    const avatar = await fetchEnsAvatar(name, 'ensjs');
    updateUI(elements.ensjsContainer, `
      <img src="${avatar}" 
           class="avatar-image" 
           alt="ENS Avatar for ${name}"
           loading="lazy"
           srcset="${CONFIG.avatarSizes.map(size => `${avatar}?size=${size} ${size}w`