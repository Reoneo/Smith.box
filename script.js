// script.js
document.addEventListener('DOMContentLoaded', () => {
  // Typing effect (unchanged)
  const subdomains = [
    '', 'Sam.Smith.box', 'Jessica.Smith.box', 'Dave.Smith.box',
    'Zoe.Smith.box','Wallet.Smith.box','NFT.Smith.box',
    '1.Smith.box','Tom.Smith.box'
  ];
  let idx = 0, typingSpeed=100, erasingSpeed=50, delay=2000;
  const el = document.getElementById('changing-text');

  function typeWord(word,i=0){
    if(i<word.length){
      el.textContent += word.charAt(i);
      setTimeout(()=>typeWord(word,i+1),typingSpeed);
    } else setTimeout(eraseWord,delay);
  }
  function eraseWord(){
    if(el.textContent.length>0){
      el.textContent = el.textContent.slice(0,-1);
      setTimeout(eraseWord,erasingSpeed);
    } else {
      idx=(idx+1)%subdomains.length;
      setTimeout(()=>typeWord(subdomains[idx]),typingSpeed);
    }
  }
  typeWord(subdomains[idx]);

  // Optional: you can remove any scroll-based reveals since scrolling is disabled
});