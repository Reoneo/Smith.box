document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for nav links
    const navLinks = document.querySelectorAll('.navbar ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector(link.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Menu button functionality
    const menuButton = document.getElementById('menu-button');
    const menuOverlay = document.getElementById('menu-overlay');

    menuButton.addEventListener('click', () => {
        menuButton.classList.toggle('active');
        menuOverlay.classList.toggle('active');
    });

    // Reveal sections on scroll
    const sections = document.querySelectorAll('.section');
    const revealOnScroll = () => {
        const scrollY = window.pageYOffset;
        sections.forEach(section => {
            if (section.offsetTop - window.innerHeight / 1.2 < scrollY) {
                section.classList.add('visible');
                anime({
                    targets: section,
                    opacity: [0, 1],
                    translateY: [50, 0],
                    easing: 'easeOutExpo',
                    duration: 1000,
                });
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger on load

    // Typing effect for subdomains in the header
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
    let currentIndex = 0;
    const typingSpeed = 100;
    const erasingSpeed = 50;
    const delayBetweenWords = 2000;
    const headerElement = document.getElementById('typed-header');

    const typeWord = (word, index = 0) => {
        if (index < word.length) {
            headerElement.textContent += word.charAt(index);
            setTimeout(() => typeWord(word, index + 1), typingSpeed);
        } else {
            setTimeout(eraseWord, delayBetweenWords);
        }
    };

    const eraseWord = () => {
        if (headerElement.textContent.length > 0) {
            headerElement.textContent = headerElement.textContent.slice(0, -1);
            setTimeout(eraseWord, erasingSpeed);
        } else {
            currentIndex = (currentIndex + 1) % subdomains.length;
            setTimeout(() => typeWord(subdomains[currentIndex]), typingSpeed);
        }
    };

    typeWord(subdomains[currentIndex]);

    // Animate header elements on load
    const animateHeaderElements = () => {
        anime({
            targets: '.header-content h1',
            opacity: [0, 1],
            translateY: [-50, 0],
            easing: 'easeOutExpo',
            duration: 1500,
        });

        anime({
            targets: '.header-content p',
            opacity: [0, 1],
            translateY: [-50, 0],
            delay: 500,
            easing: 'easeOutExpo',
            duration: 1500,
        });

        anime({
            targets: '.cta-button',
            opacity: [0, 1],
            scale: [0.8, 1],
            delay: 1000,
            easing: 'easeOutExpo',
            duration: 1500,
        });
    };

    animateHeaderElements();

    // Button hover animation
    const buttons = document.querySelectorAll('.cta-button, .submit-button');
    buttons.forEach(button => {
        button.addEventListener('mouseover', () => {
            anime({
                targets: button,
                scale: 1.1,
                duration: 300,
                easing: 'easeOutExpo'
            });
        });

        button.addEventListener('mouseout', () => {
            anime({
                targets: button,
                scale: 1.0,
                duration: 300,
                easing: 'easeOutExpo'
            });
        });
    });

    // Floating animations for header background
    anime({
        targets: '.header::before',
        keyframes: [
            { translateY: -10 },
            { translateY: 10 },
        ],
        duration: 10000,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: true
    });
});