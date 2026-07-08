/* ==========================================================================
   THE UNMACHINED — CLIENT LOGIC & INTERACTION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Active Reveal Text and Hero Stagger Reveal ---
    const revealTextElements = document.querySelectorAll('.reveal-text');
    revealTextElements.forEach(el => {
        // Trigger class to run delay animation
        setTimeout(() => {
            el.classList.add('active');
        }, 150);
    });



    // --- 2. Mobile Menu Toggle Logic ---
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    function toggleMobileMenu() {
        mobileToggle.classList.toggle('open');
        mobileOverlay.classList.toggle('open');
        // Prevent body scroll when menu is active
        if (mobileOverlay.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    mobileToggle.addEventListener('click', toggleMobileMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Close menu when a link is clicked
            if (mobileOverlay.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });


    // --- 3. Scroll Reveal Engine (Intersection Observer) ---
    const revealOnScrollElements = document.querySelectorAll('.scroll-reveal');
    const revealCards = document.querySelectorAll('.scroll-reveal-card');

    const revealObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element fits in viewport
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Stagger nested cards if present
                if (entry.target.classList.contains('scroll-reveal')) {
                    const nestedCards = entry.target.querySelectorAll('.scroll-reveal-card');
                    nestedCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('active');
                        }, index * 100);
                    });
                }
                observer.unobserve(entry.target);
            }
        });
    }, revealObserverOptions);

    revealOnScrollElements.forEach(el => revealObserver.observe(el));
    revealCards.forEach(card => revealObserver.observe(card));


    // --- 4. Interactive Number Count-Up Animation ---
    const statNumbers = document.querySelectorAll('.huge-number');
    
    function animateNumber(element) {
        const targetValue = parseInt(element.getAttribute('data-target'), 10);
        const suffix = element.hasAttribute('data-suffix') 
            ? element.getAttribute('data-suffix') 
            : (targetValue > 100 ? '+' : '');
        const duration = 1500; // 1.5 seconds animation duration
        const startTime = performance.now();
        const startValue = 0;

        function updateNumber(currentTime) {
            const elapsedTime = currentTime - startTime;
            if (elapsedTime >= duration) {
                element.textContent = targetValue + suffix;
                return;
            }

            const progress = elapsedTime / duration;
            // Ease out quad formula for smooth decelerating animation
            const easeProgress = progress * (2 - progress);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeProgress);
            
            element.textContent = currentValue + (currentValue === targetValue ? suffix : '');
            requestAnimationFrame(updateNumber);
        }

        requestAnimationFrame(updateNumber);
    }

    const statObserverOptions = {
        threshold: 0.5
    };

    const statObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, statObserverOptions);

    statNumbers.forEach(num => statObserver.observe(num));


    // --- 5. Interactive Next Session Countdown Timer ---
    const timerElement = document.getElementById('countdown-timer');
    if (timerElement) {
        const targetDateString = timerElement.getAttribute('data-target-date');
        
        // Parse date. If current time is past, set countdown to 30 days from now for visual excellence
        let targetDate = new Date(targetDateString);
        const now = new Date();
        
        if (targetDate <= now) {
            // Target date has passed, let's roll it forward to keep the countdown active and alive
            targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + 22);
            targetDate.setHours(18, 0, 0, 0);
        }

        const daysSpan = document.getElementById('days');
        const hoursSpan = document.getElementById('hours');
        const minutesSpan = document.getElementById('minutes');
        const secondsSpan = document.getElementById('seconds');

        function updateCountdown() {
            const currentTime = new Date();
            const timeDifference = targetDate - currentTime;

            if (timeDifference <= 0) {
                if (daysSpan) daysSpan.textContent = '00';
                if (hoursSpan) hoursSpan.textContent = '00';
                if (minutesSpan) minutesSpan.textContent = '00';
                if (secondsSpan) secondsSpan.textContent = '00';
                clearInterval(timerInterval);
                return;
            }

            const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

            if (daysSpan) daysSpan.textContent = days.toString().padStart(2, '0');
            if (hoursSpan) hoursSpan.textContent = hours.toString().padStart(2, '0');
            if (minutesSpan) minutesSpan.textContent = minutes.toString().padStart(2, '0');
            if (secondsSpan) secondsSpan.textContent = seconds.toString().padStart(2, '0');
        }

        updateCountdown(); // Run immediately
        const timerInterval = setInterval(updateCountdown, 1000); // Update every second
    }


    // --- 6. Navigation Link Highlight on Scroll ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerElement = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 100; // Account for navbar height

        // Highlight header on scroll
        if (window.scrollY > 50) {
            headerElement.style.background = 'rgba(10, 10, 18, 0.9)';
            headerElement.style.padding = '4px 0';
        } else {
            headerElement.style.background = 'rgba(10, 10, 18, 0.75)';
            headerElement.style.padding = '0';
        }

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });


    // --- 7. Button Hover Micro-interactions (Form feedback / Interactive Logs) ---
    const joinButtons = document.querySelectorAll('.join-btn-link');
    joinButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Highlight action on click - shows loading/interactive feedback before redirect
            console.log(`Action triggered for application type: ${btn.textContent.trim()}`);
        });
    });

});
