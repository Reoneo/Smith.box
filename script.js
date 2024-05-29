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
    const options = {
        strings: ['jake.smith.box', 'jessica.smith.box', 'alex.smith.box', 'taylor.smith.box'],
        typeSpeed: 100,
        backSpeed: 50,
        backDelay: 1500,
        loop: true
    };

    const typed = new Typed('#typed-text', options);

    // Animate header elements on load
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