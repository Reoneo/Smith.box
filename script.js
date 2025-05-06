// script.js

document.addEventListener('DOMContentLoaded', () => {
  // 1) TYPING ANIMATION (unchanged)…
  const subdomains = [
    'Agent.Smith.box','Sam.Smith.box','Jessica.Smith.box',
    'Dave.Smith.box','Zoe.Smith.box','Wallet.Smith.box',
    'NFT.Smith.box','1.Smith.box','Tom.Smith.box'
  ];
  let idx = 0;
  const typingSpeed = 100, erasingSpeed = 50, delayBetween = 2000;
  const textEl = document.getElementById('changing-text');

  function typeWord(word, i = 0) {
    if (i < word.length) {
      textEl.textContent += word.charAt(i);
      setTimeout(() => typeWord(word, i + 1), typingSpeed);
    } else setTimeout(eraseWord, delayBetween);
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


  // 2) SAFE WALLET CONNECT with explicit error reporting
  const walletBtn = document.getElementById('wallet-connect');
  const statusBar = createStatusBar();
  const logoImg   = document.getElementById('logo-img');

  walletBtn.addEventListener('click', connectWallet);

  async function connectWallet() {
    clearStatus();
    console.log('[wallet] connectWallet start');

    if (typeof window.ethereum === 'undefined') {
      return reportError('No Ethereum provider detected. Install MetaMask.');
    }

    try {
      // Use the standard EIP-1102 requestAccounts call
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!Array.isArray(accounts) || accounts.length === 0) {
        throw { code: 'NO_ACCOUNTS', message: 'No accounts returned by provider.' };
      }

      const address = accounts[0];
      console.log('[wallet] connected:', address);

      walletBtn.classList.add('connected');
      walletBtn.title = address;

      // ENS lookup (non-blocking)
      lookupENSAvatar(address).catch(err => {
        console.warn('[ENS] lookup failed:', err);
      });

      // Listen for changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged',  handleChainChanged);

    } catch (err) {
      // Detailed handling
      if (err.code === 4001) {
        // user rejected
        console.log('[wallet] userRejectedRequest', err);
        reportError('Connection rejected by user.');
      } else {
        console.error('[wallet] connect error', err);
        reportError(`Connection failed (${err.code||'ERROR'}): ${err.message||err}`);
      }
    }
  }

  function handleAccountsChanged(accounts) {
    console.log('[wallet] accountsChanged', accounts);
    if (accounts.length === 0) {
      walletBtn.classList.remove('connected');
      walletBtn.title = 'Connect Wallet';
      logoImg.src = 'https://i.imgur.com/R3tbBZn.png';
      reportError('Wallet disconnected.');
    } else {
      walletBtn.title = accounts[0];
      clearStatus();
    }
  }

  function handleChainChanged(chainId) {
    console.log('[wallet] chainChanged', chainId);
    reportError('Chain changed, reloading…');
    setTimeout(() => window.location.reload(), 1000);
  }

  // ENS lookup via ENS-API worker
  async function lookupENSAvatar(address) {
    const url = `https://ens-api.gskril.workers.dev/address/${address}?texts=avatar`;
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`ENS API ${resp.status}`);
    const data = await resp.json();
    if (data.avatar) {
      logoImg.src = data.avatar;
    }
  }

  // STATUS BAR HELPERS
  function createStatusBar() {
    const bar = document.createElement('div');
    bar.id = 'status-bar';
    bar.style = `
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 10px;
      font-family: sans-serif;
      font-size: 0.9em;
      text-align: center;
      background: rgba(0,0,0,0.8);
      color: #fff;
      display: none;
      z-index: 999;
    `;
    document.body.appendChild(bar);
    return bar;
  }
  function reportError(msg) {
    statusBar.textContent = msg;
    statusBar.style.display = 'block';
  }
  function clearStatus() {
    statusBar.style.display = 'none';
    statusBar.textContent = '';
  }

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    if (window.ethereum && window.ethereum.removeListener) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged',  handleChainChanged);
    }
  });
});