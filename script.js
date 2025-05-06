// script.js

// ─── 0) Globals & Elements ─────────────────────────────────────────────
let takenDomains = [];
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

let provider, signer;
const walletBtn    = document.getElementById('wallet-connect');
const domainInput  = document.getElementById('domain-input');
const searchBtn    = document.getElementById('search-btn');
const searchResult = document.getElementById('search-result');
const changingText = document.getElementById('changing-text');
const dynamicLink  = document.getElementById('dynamic-link');

// ─── 1) Load & Parse CSV ───────────────────────────────────────────────
fetch('/domains.csv')
  .then(res => res.text())
  .then(csv => {
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        takenDomains = data.map(r => r.domain.trim());
      }
    });
  })
  .catch(err => console.error('Failed to load domains.csv:', err));

// ─── 2) Typing Animation ────────────────────────────────────────────────
function typeWord(word, pos = 0) {
  if (pos < word.length) {
    changingText.textContent += word.charAt(pos);
    setTimeout(() => typeWord(word, pos + 1), typingSpeed);
  } else {
    setTimeout(eraseWord, delayBetween);
  }
}
function eraseWord() {
  if (changingText.textContent.length > 0) {
    changingText.textContent = changingText.textContent.slice(0, -1);
    setTimeout(eraseWord, erasingSpeed);
  } else {
    idx = (idx + 1) % subdomains.length;
    typeWord(subdomains[idx]);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  typeWord(subdomains[idx]);
});

// ─── 3) Domain Search & Reserve ────────────────────────────────────────
searchBtn.addEventListener('click', () => {
  const domain = domainInput.value.trim();
  if (!domain) {
    searchResult.textContent = 'Please enter a domain.';
    return;
  }
  if (takenDomains.includes(domain)) {
    searchResult.textContent = `${domain} is already reserved.`;
  } else {
    searchResult.innerHTML = `
      <span>${domain} is available!</span>
      <button id="reserve-btn">Reserve for $5</button>
    `;
    document.getElementById('reserve-btn')
            .addEventListener('click', () => reserveDomain(domain));
  }
});

async function reserveDomain(domain) {
  if (!window.ethereum) {
    return alert('Please install MetaMask.');
  }
  if (!signer) {
    try {
      provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      await provider.send('eth_requestAccounts', []);
      signer = provider.getSigner();
      walletBtn.classList.add('connected');
      walletBtn.title = await signer.getAddress();
    } catch (err) {
      return console.error(err);
    }
  }

  // Replace with your contract's address & ABI
  const CONTRACT_ADDR = 'YOUR_CONTRACT_ADDRESS_HERE';
  const CONTRACT_ABI  = [ /* ... ABI array ... */ ];
  const contract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, signer);

  try {
    // 1) Pay $5 worth of ETH (hardcoded ~0.005 ETH)
    const tx = await contract.register(domain, {
      value: ethers.utils.parseEther('0.005')
    });
    searchResult.textContent = 'Processing payment…';
    await tx.wait();

    // 2) Mint NFT
    const mintTx = await contract.mintNFT(domain);
    searchResult.textContent = 'Minting NFT…';
    await mintTx.wait();

    searchResult.textContent = `🎉 ${domain} reserved & NFT minted!`;
    takenDomains.push(domain);

    // Optionally: notify your backend here to persist the reservation

  } catch (err) {
    console.error('Reservation error:', err);
    searchResult.textContent = 'Failed: ' + (err.message || err);
  }
}

// ─── 4) Wallet Connect Handlers ────────────────────────────────────────
walletBtn.addEventListener('click', connectWallet);

async function connectWallet() {
  if (!window.ethereum || !window.ethers) {
    return alert('Install MetaMask and include ethers.js.');
  }
  try {
    provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    await provider.send('eth_requestAccounts', []);
    signer = provider.getSigner();
    const addr = await signer.getAddress();
    walletBtn.classList.add('connected');
    walletBtn.title = addr;
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', () => window.location.reload());
  } catch (err) {
    if (err.code === 4001) console.log('User rejected connection');
    else console.error(err);
  }
}

function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    walletBtn.classList.remove('connected');
    walletBtn.title = 'Connect Wallet';
    signer = null;
  } else {
    walletBtn.title = accounts[0];
  }
}

// ─── 5) Dynamic Footer Link Rotation ──────────────────────────────────
;(function rotate() {
  const items = [
    { href: 'https://collectors.poap.xyz/scan/smith.box', text: 'www.poap.xyz/smith.box' },
    { href: 'https://opensea.io/0x71ab0b01e3ff45551e25b208e2a90298f73f7040', text: 'www.opensea.io/smith.box' }
  ];
  let cur = 0;
  setInterval(() => {
    cur = (cur + 1) % items.length;
    dynamicLink.href        = items[cur].href;
    dynamicLink.textContent = items[cur].text;
  }, 3000);
})();