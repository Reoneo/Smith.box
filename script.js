// script.js

// --- 0) Setup & Globals ---
let takenDomains = [];
const typingSpeed = 100,
      erasingSpeed = 50,
      delayBetween = 2000;
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
let provider, signer;

// Elements
const domainInput   = document.getElementById('domain-input');
const searchBtn     = document.getElementById('search-btn');
const searchResult  = document.getElementById('search-result');
const walletBtn     = document.getElementById('wallet-connect');
const changingText  = document.getElementById('changing-text');

// --- 1) Load & parse CSV of taken domains ---
fetch('/domains.csv')
  .then(res => res.text())
  .then(csvString => {
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        // Assumes CSV has a column "domain"
        takenDomains = data.map(r => r.domain.trim());
      }
    });
  })
  .catch(err => console.error('CSV load error:', err));

// --- 2) Typing Animation ---
function typeWord(word, i = 0) {
  if (i < word.length) {
    changingText.textContent += word.charAt(i);
    setTimeout(() => typeWord(word, i + 1), typingSpeed);
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
    setTimeout(() => typeWord(subdomains[idx]), typingSpeed);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  typeWord(subdomains[idx]);
});

// --- 3) Domain Search & UI Feedback ---
searchBtn.addEventListener('click', () => {
  const d = domainInput.value.trim();
  if (!d) {
    searchResult.textContent = 'Please enter a domain.';
    return;
  }
  if (takenDomains.includes(d)) {
    searchResult.textContent = `${d} is already reserved.`;
  } else {
    searchResult.innerHTML = `
      <span>${d} is available!</span>
      <button id="reserve-btn">Reserve for $5</button>
    `;
    document
      .getElementById('reserve-btn')
      .addEventListener('click', () => reserveDomain(d));
  }
});

// --- 4) Wallet Connect & Handlers ---
walletBtn.addEventListener('click', connectWallet);

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

// --- 5) Reserve Domain & Mint NFT ---
async function reserveDomain(domain) {
  if (!signer) {
    alert('Please connect your wallet first.');
    return;
  }

  // Replace these with your contract's actual address & ABI:
  const CONTRACT_ADDR = 'YOUR_CONTRACT_ADDRESS_HERE';
  const CONTRACT_ABI  = [ /* ... your ABI array ... */ ];
  const contract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, signer);

  try {
    // 1) Pay $5 – in ETH; adjust via oracle if needed
    const ethValue = ethers.utils.parseEther('0.005'); 
    const tx = await contract.register(domain, { value: ethValue });
    searchResult.textContent = 'Waiting for payment confirmation…';
    await tx.wait();

    // 2) Mint NFT as proof
    const mintTx = await contract.mintNFT(domain);
    searchResult.textContent = 'Waiting for NFT mint…';
    await mintTx.wait();

    searchResult.textContent = `🎉 ${domain} reserved and NFT minted!`;
    takenDomains.push(domain);

    // Optionally: update your back-end / CSV via an API call here

  } catch (err) {
    console.error('Reservation error:', err);
    searchResult.textContent = 'Reservation failed: ' + (err.message || err);
  }
}