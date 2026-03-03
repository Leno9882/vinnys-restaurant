/* ==========================================================================
   VINNY'S RISTORANTE - MASTER JS (REFINED & UNIFIED)
   ========================================================================== */

// 1. Menu Data
const menuData = {
    "Hot Sandwiches": [
        { name: "Chicken Parm", prices: ["$11.75", "$12.75"] },
        { name: "Meatball", prices: ["$11.75", "$12.75"] },
        { name: "Sausage", prices: ["$10.75", "$11.75"] },
        { name: "Eggplant", prices: ["$11.25", "$12.25"] }
    ]
};

// 2. Rendering Engine
function renderMenu(category) {
    const display = document.getElementById('menu-display');
    if (!display || !menuData[category]) return; 

    const items = menuData[category];
    let html = `<h2 class="menu-cat-title">${category.toUpperCase()}</h2>`;
    
    if(category === "Hot Sandwiches") {
        html += `<p class="menu-cat-subtitle">Add Cheese +$1.50</p>`;
    }

    items.forEach(item => {
        html += `
            <div class="menu-row">
                <span class="dish-name">${item.name}</span>
                <span class="dish-price">${item.prices.join(' | ')}</span>
            </div>
        `;
    });
    display.innerHTML = html;
}

// 3. YouTube & Local Video Controls
function initVideoControls() {
    const localVideo = document.getElementById('hero-video');
    const youtubeIframe = document.getElementById('menu-video-iframe');
    const volumeBtn = document.getElementById('menu-mute-toggle') || document.getElementById('mute-toggle'); 

    if (!volumeBtn) return;

    volumeBtn.addEventListener('click', () => {
        const isCurrentlyOff = volumeBtn.innerText.toUpperCase().includes("ON");

        if (youtubeIframe) {
            if (isCurrentlyOff) {
                youtubeIframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
                youtubeIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                volumeBtn.innerText = "SOUND OFF";
                volumeBtn.style.backgroundColor = "var(--it-red)";
            } else {
                youtubeIframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
                volumeBtn.innerText = "SOUND ON";
                volumeBtn.style.backgroundColor = "var(--glass-bg)";
            }
        } 
        else if (localVideo) {
            localVideo.muted = !localVideo.muted;
            volumeBtn.innerText = localVideo.muted ? 'SOUND ON' : 'SOUND OFF';
            volumeBtn.style.backgroundColor = localVideo.muted ? "var(--glass-bg)" : "var(--it-red)";
        }
    });
}

// 4. Smooth Scrolling
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const nav = document.querySelector('.menu-cat-nav');
                const navHeight = nav ? nav.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });
}

// 5. Smart Navbar & Morph Logic
let lastScrollY = window.scrollY;
function initNavEffects() {
    const nav = document.querySelector('.menu-cat-nav');
    const hero = document.querySelector('.menu-hero');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 150) {
            nav.classList.add('nav-hidden');
        } else {
            nav.classList.remove('nav-hidden');
        }

        if (hero && window.innerWidth >= 1024) {
            if (currentScrollY > hero.offsetHeight - 100) {
                nav.classList.add('side-shift');
            } else {
                nav.classList.remove('side-shift');
            }
        }
        lastScrollY = currentScrollY;
    });
}

// 6. Intersection Observer
function initScrollObserver() {
    const sections = document.querySelectorAll(".menu-category-section");
    const navLinks = document.querySelectorAll(".menu-cat-nav a");
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute("id");
                    navLinks.forEach(link => {
                        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
                    });
                }
            });
        },
        { root: null, threshold: 0.3 }
    );
    sections.forEach(section => observer.observe(section));
}

// 7. AUTO-CALENDAR LOGIC
function initSpecialsDates() {
    const dateElements = document.querySelectorAll('.js-date');
    if (!dateElements.length) return;
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());

    dateElements.forEach(el => {
        const dayOffset = parseInt(el.getAttribute('data-day'));
        const targetDate = new Date(sunday);
        targetDate.setDate(sunday.getDate() + dayOffset);

        const getOrdinal = (d) => {
            if (d > 3 && d < 21) return 'th';
            switch (d % 10) {
                case 1:  return "st";
                case 2:  return "nd";
                case 3:  return "rd";
                default: return "th";
            }
        };

        const month = targetDate.toLocaleString('en-US', { month: 'long' });
        const day = targetDate.getDate();
        el.innerText = `${month} ${day}${getOrdinal(day)}`;

        if (targetDate.toDateString() === today.toDateString()) {
            el.closest('.special-card')?.classList.add('is-today');
        }
    });
}

// 8. MOBILE NAV WIGGLE HINT
function initMobileHint() {
    const mobileNavList = document.querySelector('.menu-cat-nav ul');
    if (window.innerWidth < 1024 && mobileNavList) {
        setTimeout(() => {
            mobileNavList.scrollTo({ left: 60, behavior: 'smooth' });
            setTimeout(() => {
                mobileNavList.scrollTo({ left: 0, behavior: 'smooth' });
            }, 600);
        }, 1500);
    }
}

/* ==========================================================================
   SLACK INTEGRATIONS
   ========================================================================== */

// SHARED WEBHOOK CONFIG (UNIFIED)
const SLACK_BASE = 'https://hooks.slack.com/services/T0AHTHUDVDL/';
const SLACK_KEY = 'B0AJ8UUGHBN/k1lQvfvOQ3Lu87r7VxdyADIy'; // The specific #all-vinnysatnight Key
const slackUrl = SLACK_BASE + SLACK_KEY;

// 9. Private Parties
function initSlackReservations() {
    const partyForm = document.getElementById('party-form');
    if (!partyForm) return;

    partyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = partyForm.querySelector('.vinny-btn');
        const originalText = btn.innerText;
        btn.innerText = 'SENDING...';
        btn.disabled = true;

        const payload = {
            text: `🚨 *New Private Party Inquiry!*\n\n` +
                  `*Name:* ${document.getElementById('party-name').value}\n` +
                  `*Phone:* ${document.getElementById('party-phone').value}\n` +
                  `*Email:* ${document.getElementById('party-email').value}\n` +
                  `*Guests:* ${document.getElementById('party-size').value}\n` +
                  `*Date:* ${document.getElementById('party-date').value}\n` +
                  `_Sent from Vinny's Ristorante Website_`
        };

        fetch(slackUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(() => {
            alert('Thank you! Your inquiry has been sent to our team via Slack.');
            btn.innerText = 'SENT!';
            partyForm.reset();
        })
        .catch(() => {
            alert('Connection error. Please call us at (617) 628-9214.');
            btn.disabled = false;
            btn.innerText = originalText;
        });
    });
}

// 10. Regular Reservations
function initGeneralReservations() {
    const resForm = document.getElementById('res-form');
    if (!resForm) return;

    resForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = resForm.querySelector('.vinny-btn');
        const originalText = btn.innerText;
        btn.innerText = 'BOOKING...';
        btn.disabled = true;

        const payload = {
            text: `🍷 *New Table Reservation!*\n\n` +
                  `*Name:* ${document.getElementById('res-name').value}\n` +
                  `*Phone:* ${document.getElementById('res-phone').value}\n` +
                  `*Guests:* ${document.getElementById('res-guests').value}\n` +
                  `*Date:* ${document.getElementById('res-date').value} at ${document.getElementById('res-time').value}\n` +
                  `*Occasion:* ${document.getElementById('res-occasion').value}`
        };

        fetch(slackUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(() => {
            alert('Reservation request sent! We will see you soon.');
            btn.innerText = 'BOOKED!';
            resForm.reset();
        })
        .catch(() => {
            alert('Error. Please call (617) 628-9214 to book.');
            btn.disabled = false;
            btn.innerText = originalText;
        });
    });
}

// 12. Catering Requests
function initCateringReservations() {
    const catForm = document.getElementById('catering-form');
    if (!catForm) return;

    catForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = catForm.querySelector('.vinny-btn');
        const originalText = btn.innerText;
        btn.innerText = 'SENDING...';
        btn.disabled = true;

        const payload = {
            text: `🥘 *NEW CATERING REQUEST!*\n\n` +
                  `*Name:* ${document.getElementById('cat-name').value}\n` +
                  `*Phone:* ${document.getElementById('cat-phone').value}\n` +
                  `*Email:* ${document.getElementById('cat-email').value}\n` +
                  `*Company:* ${document.getElementById('cat-company').value || 'N/A'}\n` +
                  `*Details:* ${document.getElementById('cat-size').value} on ${document.getElementById('cat-date').value} at ${document.getElementById('cat-time').value}\n` +
                  `*Service:* ${document.getElementById('cat-service').value}\n` +
                  `*Budget:* ${document.getElementById('cat-budget').value || 'Not specified'}\n` +
                  `*Requests:* ${document.getElementById('cat-requests').value || 'None'}`
        };

        fetch(slackUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(() => {
            alert('Catering request sent! We will be in touch shortly.');
            btn.innerText = 'SENT!';
            catForm.reset();
        })
        .catch(() => {
            alert('Error. Please call (617) 628-9214 for catering.');
            btn.disabled = false;
            btn.innerText = originalText;
        });
    });
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initVideoControls();
    initSmoothScroll();
    initNavEffects();
    initScrollObserver();
    initSpecialsDates();
    initMobileHint();
    initSlackReservations();      // Parties
    initGeneralReservations();    // Regular Tables
    initCateringReservations();   // Catering
});