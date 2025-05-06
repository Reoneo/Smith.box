// script.js

// 1) Typing animation (unchanged from before)...
document.addEventListener('DOMContentLoaded', () => {
  const subdomains = [
    'Agent.Smith.box','Sam.Smith.box','Jessica.Smith.box',
    'Dave.Smith.box','Zoe.Smith.box','Wallet.Smith.box',
    'NFT.Smith.box','1.Smith.box','Tom.Smith.box'
  ];
  let idx = 0;
  const speed = 100, eraseSpeed = 50, delay = 2000;
  const el = document.getElementById('changing-text');

  function type(w,i=0){
    if(i<w.length){
      el.textContent += w.charAt(i);
      setTimeout(()=>type(w,i+1),speed);
    } else setTimeout(erase,delay);
  }
  function erase(){
    if(el.textContent.length>0){
      el.textContent = el.textContent.slice(0,-1);
      setTimeout(erase,eraseSpeed);
    } else {
      idx=(idx+1)%subdomains.length;
      setTimeout(()=>type(subdomains[idx]),speed);
    }
  }
  type(subdomains[idx]);
});

// 2) Wallet connect / disconnect via Web3Modal + ethers.js
const providerOptions = {
  walletconnect: {
    package: window.WalletConnectProvider.default,
    options: {
      infuraId: 'YOUR_INFURA_ID'  // ← replace with your Infura ID or other RPC
    }
  }
};

const web3Modal = new window.Web3Modal.default({
  cacheProvider: false,
  providerOptions
});

let web3Provider, signer, userAddress;

async function connectWallet() {
  try {
    const instance = await web3Modal.connect();
    web3Provider = new ethers.providers.Web3Provider(instance);
    signer = web3Provider.getSigner();
    userAddress = await signer.getAddress();

    // Update button UI
    const btn = document.getElementById('wallet-button');
    btn.classList.add('connected');
    btn.querySelector('span').textContent =
      userAddress.slice(0,6) + '…' + userAddress.slice(-4);

    // Listen for disconnect
    instance.on('disconnect', resetUI);
  } catch (e) {
    console.error('Connection failed', e);
    alert('Connection failed: ' + (e.message||e));
  }
}

function resetUI() {
  web3Modal.clearCachedProvider();
  const btn = document.getElementById('wallet-button');
  btn.classList.remove('connected');
  btn.querySelector('span').textContent = 'Connect Wallet';
}

// On click: connect if not, else disconnect
document.getElementById('wallet-button').addEventListener('click', () => {
  if (!signer) {
    connectWallet();
  } else {
    if (confirm('Disconnect wallet?')) resetUI();
  }
});