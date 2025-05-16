document.addEventListener('DOMContentLoaded', () => {
  // ─── 1) TYPING HEADER ───
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

  // start typing
  typeWord(subdomains[idx]);


  // ─── 2) WALLET CONNECT ───
  const walletBtn = document.getElementById('wallet-connect');
  let provider, signer;

  async function connectWallet() {
    if (typeof window.ethers === 'undefined' || !window.ethereum) {
      return alert('MetaMask (or another EVM wallet) not detected.');
    }

    try {
      provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      await provider.send('eth_requestAccounts', []); // request access
      signer = provider.getSigner();
      const address = await signer.getAddress();

      walletBtn.classList.add('connected');
      walletBtn.title = address;

      // handle account/network changes
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

  walletBtn.addEventListener('click', connectWallet);
  window.addEventListener('beforeunload', () => {
    if (window.ethereum && window.ethereum.removeListener) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  });


  // ─── 3) FEATURE ROTATOR ───
  const featureList = [
    // Plain text
    'ENS Powered Web3 username',
    // Link version
    '<a href="https://recruitment.box/smith.box" target="_blank" rel="noopener">Recruitment.box/smith.box</a>',

    'NFT-bound ownership and control',
    '<a href="https://www.smith.box" target="_blank" rel="noopener">www.smith.box</a>',

    'Website and email hosting via ICANN DNS resolution',
    '<a href="mailto:hello@smith.box">hello@smith.box</a>',

    'Onchain management of name records (Avatar, Handles, A, CNAME, MX)'
  ];

  const container = document.getElementById('features');

  // build DOM nodes
  featureList.forEach((html, i) => {
    const div = document.createElement('div');
    div.className = 'feature' + (i === 0 ? ' active' : '');
    div.innerHTML = html;
    container.appendChild(div);
  });

  // rotation loop
  let current = 0;
  setInterval(() => {
    const items = container.querySelectorAll('.feature');
    items[current].classList.remove('active');
    current = (current + 1) % items.length;
    items[current].classList.add('active');
  }, 4000); // switch every 4s
});