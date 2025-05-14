// script.js

document.addEventListener('DOMContentLoaded', () => {
  //
  // 1) TYPING ANIMATION
  //
  const subdomains = [
    'Agent.Smith.box',
    'Aaliyah.Smith.box',
    'Marcel.Smith.box',
    'Maleek.Smith.box',
    'Lauren.Smith.box',
    'Wallet.Smith.box',
    'NFT.Smith.box',
    '1.Smith.box',
    'YourName.Smith.box'
  ];
  let idx = 0;
  const typingSpeed = 100;
  const erasingSpeed = 50;
  const delayBetween = 2000;
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

  // kick off the first word
  typeWord(subdomains[idx]);


  //
  // 2) WALLET CONNECT WITH ethers.js
  //
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

  walletBtn.addEventListener('click', connectWallet);
  window.addEventListener('beforeunload', () => {
    if (window.ethereum && window.ethereum.removeListener) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  });


  //
  // 3) THREE.JS + ORBITCONTROLS 3D CUBE SWARM
  //
  const container = document.getElementById('webgl-canvas');

  // create renderer with transparent background
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // create scene & camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    10
  );
  camera.position.set(0, 0, 2);

  // orbit controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  // lock vertical tilt (pitch) to horizontal only
  controls.minPolarAngle = Math.PI / 2;
  controls.maxPolarAngle = Math.PI / 2;
  // restrict yaw rotation ±45°
  controls.minAzimuthAngle = -Math.PI / 4;
  controls.maxAzimuthAngle =  Math.PI / 4;

  // add 1,000 cubes around the origin
  const cubeGeo = new THREE.BoxGeometry(0.05, 0.05, 0.05);
  const cubeMat = new THREE.MeshNormalMaterial();
  for (let i = 0; i < 1000; i++) {
    const cube = new THREE.Mesh(cubeGeo, cubeMat);
    let pos;
    do {
      pos = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6
      );
    } while (pos.length() < 1);
    cube.position.copy(pos);
    scene.add(cube);
  }

  // animation loop
  function animate() {
    controls.update();
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(animate);

  // handle resizing
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
});