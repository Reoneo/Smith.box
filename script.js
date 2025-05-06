// script.js

document.addEventListener('DOMContentLoaded', () => {
  // 1) TYPING ANIMATION
  const subdomains = [
    'Agent.Smith.box', 'Sam.Smith.box', 'Jessica.Smith.box',
    'Dave.Smith.box', 'Zoe.Smith.box','Wallet.Smith.box',
    'NFT.Smith.box','1.Smith.box','Tom.Smith.box'
  ];
  let idx = 0;
  const typingSpeed = 100, erasingSpeed = 50, delayBetween = 2000;
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

  // 2) SAFE WALLET CONNECT + ENS AVATAR LOOKUP
  const walletBtn = document.getElementById('wallet-connect');
  const logoImg   = document.getElementById('logo-img');
  let provider, signer;

  async function connectWallet() {
    console.log('[wallet] connectWallet start');
    if (typeof window.ethers === 'undefined') {
      return alert('ethers.js not loaded.');
    }
    if (!window.ethereum) {
      return alert('No Ethereum provider detected. Install MetaMask.');
    }

    try {
      provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      // request accounts
      await provider.send('eth_requestAccounts', []);
      signer = provider.getSigner();
      const address = await signer.getAddress();
      console.log('[wallet] connected:', address);

      walletBtn.classList.add('connected');
      walletBtn.title = address;

      // Attempt ENS lookup—but don't block page if it fails
      lookupENSAvatar(address).catch(err => {
        console.warn('[ENS] lookup failed:', err);
      });

      // listen for changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged',  handleChainChanged);

    } catch (err) {
      if (err.code === 4001) {
        console.log('[wallet] user rejected request');
      } else {
        console.error('[wallet] connect error', err);
        alert('Connection failed: ' + (err.message || err));
      }
    }
  }

  async function lookupENSAvatar(address) {
    console.log('[ENS] lookup for', address);
    // public ENS-API worker endpoint
    const url = `https://ens-api.gskril.workers.dev/address/${address}?texts=avatar`;
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }
    const data = await resp.json();
    console.log('[ENS] response', data);
    if (data.avatar) {
      // swap in avatar
      logoImg.src = data.avatar;
    } else {
      console.log('[ENS] no avatar record found');
    }
  }

  function handleAccountsChanged(accounts) {
    console.log('[wallet] accountsChanged', accounts);
    if (accounts.length === 0) {
      walletBtn.classList.remove('connected');
      walletBtn.title = 'Connect Wallet';
      // restore default logo
      logoImg.src = 'https://i.imgur.com/R3tbBZn.png';
    } else {
      walletBtn.title = accounts[0];
    }
  }

  function handleChainChanged(_chainId) {
    console.log('[wallet] chainChanged', _chainId);
    window.location.reload();
  }

  window.addEventListener('beforeunload', () => {
    if (window.ethereum && window.ethereum.removeListener) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged',  handleChainChanged);
    }
  });

  walletBtn.addEventListener('click', connectWallet);
});