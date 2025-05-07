// script.js

// ------------------------------
// 1) TYPING ANIMATION
// ------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const subdomains = [
    'Agent.Smith.box',
    'Sam.Smith.box',
    'Jessica.Smith.box',
    'Dave.Smith.box',
    'Zoe.Smith.box',
    'Wallet.Smith.box',
    'NFT.Smith.box',
    '1.Smith.box',
    'Tom.Smith.box'
  ];
  let idx = 0;
  const typingSpeed = 100,
        erasingSpeed = 50,
        delayBetween = 2000;
  const textEl = document.getElementById('changing-text');

  function typeWord(word, i = 0) {
    if (i < word.length) {
      textEl.textContent += word.charAt(i);
      setTimeout(() => typeWord(word, i + 1), typingSpeed);
    } else {
      setTimeout(eraseWord, delayBetween);
    }
  }

  function eraseWord() {
    if (textEl.textContent.length > 0) {
      textEl.textContent = textEl.textContent.slice(0, -1);
      setTimeout(eraseWord, erasingSpeed);
    } else {
      idx = (idx + 1) % subdomains.length;
      setTimeout(() => typeWord(subdomains[idx]), typingSpeed);
    }
  }

  typeWord(subdomains[idx]);
});

// ------------------------------
// 2) WALLET CONNECT
// ------------------------------
(() => {
  const walletBtn = document.getElementById('wallet-connect');
  let provider, signer;

  async function connectWallet() {
    if (typeof window.ethers === 'undefined') {
      return alert('ethers.js not loaded.');
    }
    if (!window.ethereum) {
      return alert('No Ethereum provider detected. Install MetaMask.');
    }

    try {
      provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      await provider.send('eth_requestAccounts', []);
      signer = provider.getSigner();
      const address = await signer.getAddress();

      walletBtn.classList.add('connected');
      walletBtn.title = address;

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

    } catch (err) {
      if (err.code === 4001) {
        console.log('User rejected wallet connection');
      } else {
        console.error('Wallet connect failed', err);
        alert('Connection failed: ' + (err.message || err));
      }
    }
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      walletBtn.classList.remove('connected');
      walletBtn.title = 'Connect Wallet';
    } else {
      walletBtn.title = accounts[0];
    }
  }

  function handleChainChanged(_chainId) {
    window.location.reload();
  }

  window.addEventListener('beforeunload', () => {
    if (window.ethereum && window.ethereum.removeListener) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  });

  walletBtn.addEventListener('click', connectWallet);
})();

// ------------------------------
// 3) SEARCH BAR LOGIC
// ------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('ens-search-input');
  const btn   = document.getElementById('ens-search-button');

  function doSearch() {
    let q = input.value.trim().toLowerCase();
    if (!q) return;
    // Normalize ENS names if library available
    if (window.ENS && q.endsWith('.eth')) {
      try {
        q = ENS.namehash.normalize(q);
      } catch (e) {
        // fallback to raw
      }
    }
    window.location.search = '?q=' + encodeURIComponent(q);
  }

  btn.addEventListener('click', doSearch);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });
});

// ------------------------------
// 4) PROFILE LOADER
// ------------------------------
window.loadENSProfile = async function(query) {
  // Instantiate ethers + ENS.js
  const provider = new ethers.providers.Web3Provider(window.ethereum || window.ethereum);
  const ens = new ENS({
    provider,
    ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
  });

  // Determine whether input is address or name
  let name = null, address = null;
  if (/^0x[a-fA-F0-9]{40}$/.test(query)) {
    address = query;
    try {
      name = await ens.name(address);
    } catch {}
  } else {
    name = query;
    try {
      address = await ens.address(name);
    } catch {}
  }

  // Fallback: if no forward or reverse, treat query as address
  if (!address && /^0x[a-fA-F0-9]{40}$/.test(query)) {
    address = query;
  }
  if (!name) {
    name = null;
  }

  // Fetch full profile (texts + avatar)
  let profile = {};
  try {
    profile = await ens.getProfile(name || address, {
      texts: true,
      coinTypes: false,
      contentHash: false
    });
  } catch (err) {
    console.error('ENS profile fetch error:', err);
  }

  // Populate header
  document.getElementById('profile-name').textContent = name || address;
  const addrEl = document.getElementById('profile-address');
  addrEl.textContent = address || '—';

  // Avatar
  const img = document.getElementById('profile-avatar');
  img.src = (profile.avatar && profile.avatar.url) || '/default-avatar.png';

  // Description
  document.getElementById('profile-description').textContent =
    (profile.texts && profile.texts.description) || 'No profile description.';

  // Social Links
  const socialMap = {
    'com.twitter':  'https://twitter.com/',
    'com.github':   'https://github.com/',
    'com.linkedin': 'https://linkedin.com/in/',
    'url':          ''
  };
  const socialContainer = document.getElementById('social-links');
  socialContainer.innerHTML = '';
  if (profile.texts) {
    for (const [key, prefix] of Object.entries(socialMap)) {
      const handle = profile.texts[key];
      if (handle) {
        const a = document.createElement('a');
        a.href = prefix + handle;
        a.target = '_blank';
        a.rel = 'noopener';
        const icon = key === 'url'
          ? '<i class="fas fa-link"></i>'
          : `<i class="fab fa-${key.split('.')[1]}"></i>`;
        a.innerHTML = icon;
        socialContainer.appendChild(a);
      }
    }
  }

  // Keywords
  const tagContainer = document.getElementById('keyword-tags');
  tagContainer.innerHTML = '';
  const keywords = (profile.texts && profile.texts.keywords) || '';
  keywords.split(',').map(t => t.trim()).filter(Boolean).forEach(t => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = t;
    tagContainer.appendChild(span);
  });
};

// ------------------------------
// 5) SIMPLE ROUTING
// ------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const query  = params.get('q')?.trim();

  if (query) {
    document.getElementById('search-container').style.display  = 'none';
    document.getElementById('profile-container').style.display = 'flex';
    if (window.loadENSProfile) window.loadENSProfile(query);
  } else {
    document.getElementById('search-container').style.display  = 'flex';
    document.getElementById('profile-container').style.display = 'none';
  }
});