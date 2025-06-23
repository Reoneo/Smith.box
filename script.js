// script.js

document.addEventListener('DOMContentLoaded', () => {
  // 1) TYPING ANIMATION
  const subdomains = [
    'Marcel.Smith.box',
    'Aaliyah.Smith.box',
    'Maleek.Smith.box',
    'Lauren.Smith.box',
    'Reon.Smith.box',
    'Site.Smith.box',
    'Wallet.Smith.box',
    'Email.Smith.box',
    'username.Smith.box'
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

  // start the loop
  typeWord(subdomains[idx]);
});