import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import firebaseConfig from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 1. Force Scroll to Top and Disable Browser Restoration
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Fix for Safari back/forward cache "freeze"
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Verify top position after DOM is ready
    if (!window.location.hash) {
        window.scrollTo(0, 0);
    }

    console.log('NOVAX loaded');

    // Mobile Menu
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav__link');

    if (mobileBtn && nav) {
        mobileBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            mobileBtn.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                mobileBtn.classList.remove('active');
            });
        });
    }

    // Scroll Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('.section:not(.hero)');
    sections.forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });

    // Typing Animation
    const typingText = document.getElementById('typing-text');
    const phrases = ["impulsa", "escala", "conecta", "simplifica", "crece"];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 150;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            typingText.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 100;
        } else {
            typingText.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 150;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typeSpeed = 2500;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 400;
        }

        setTimeout(type, typeSpeed);
    }

    if (typingText) {
        type();
    }

    // Canvas Particles
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
                this.color = `rgba(0, 240, 255, ${Math.random() * 0.5})`;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < 120; i++) particles.push(new Particle());
        }

        function animateParticles() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach((p, index) => {
                p.update();
                p.draw();
                for (let j = index + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 240, 255, ${0.1 - distance / 1500})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(animateParticles);
        }

        initParticles();
        animateParticles();
    }

    // 3D Tilt Effect & Magnetic Buttons
    const interactiveElements = document.querySelectorAll('.service-card, .project-card, .btn');
    interactiveElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            if (el.classList.contains('btn')) {
                el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            } else {
                const rx = (y / (rect.height / 2)) * -5;
                const ry = (x / (rect.width / 2)) * 5;
                el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
            }
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });

    // Custom Selects
    function setupCustomSelect(selectId, inputId) {
        const customSelect = document.getElementById(selectId);
        if (!customSelect) return;
        const trigger = customSelect.querySelector('.select-trigger');
        const triggerText = trigger.querySelector('span');
        const options = customSelect.querySelectorAll('.option');
        const hiddenInput = document.getElementById(inputId);

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.custom-select').forEach(s => {
                if (s !== customSelect) s.classList.remove('active');
            });
            customSelect.classList.toggle('active');
        });

        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.getAttribute('data-value');
                const text = Array.from(option.childNodes)
                    .filter(node => node.nodeType === 3)
                    .map(node => node.textContent.trim())
                    .filter(c => c.length > 0)
                    .join(' ');

                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                triggerText.innerText = text;
                triggerText.style.color = 'var(--text-main)';
                hiddenInput.value = value;
                customSelect.classList.remove('active');
            });
        });
    }

    setupCustomSelect('serviceSelect', 'serviceInput');
    setupCustomSelect('budgetSelect', 'budgetInput');

    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('active'));
    });

    // --- Anti-Bot: registrar tiempo al primer campo tocado ---
    let formStartTime = null;
    const quoteForm = document.getElementById('quoteForm');

    if (quoteForm) {
        const formFields = quoteForm.querySelectorAll('input:not([type=hidden]):not(#_gotcha), textarea, .select-trigger');
        formFields.forEach(field => {
            field.addEventListener('focus', () => {
                if (!formStartTime) formStartTime = Date.now();
            }, { once: true });
        });

        quoteForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const btn = document.getElementById('submitBtn');
            const captchaError = document.getElementById('captcha-error');
            const botError = document.getElementById('bot-error');

            // ---- CAPA 1: Honeypot ----
            const honeypot = document.getElementById('_gotcha');
            if (honeypot && honeypot.value !== '') {
                console.warn('Bot detectado: honeypot lleno.');
                return; // Silencioso: el bot cree que fue exitoso
            }

            // ---- CAPA 2: Time-based check (mínimo 5 segundos) ----
            const elapsed = Date.now() - (formStartTime || Date.now());
            if (elapsed < 5000) {
                if (botError) botError.style.display = 'block';
                setTimeout(() => { if (botError) botError.style.display = 'none'; }, 4000);
                return;
            }
            if (botError) botError.style.display = 'none';

            // ---- CAPA 3: reCAPTCHA v2 ----
            let captchaToken = '';
            if (typeof grecaptcha !== 'undefined') {
                captchaToken = grecaptcha.getResponse();
                if (!captchaToken) {
                    if (captchaError) captchaError.style.display = 'block';
                    return;
                }
            }
            if (captchaError) captchaError.style.display = 'none';

            // ---- Todo OK: procesar envío ----
            btn.disabled = true;
            btn.textContent = 'Enviando Solicitud...';

            const formData = new FormData(quoteForm);
            const data = {};
            formData.forEach((value, key) => {
                if (!key.startsWith('_') && key !== 'g-recaptcha-response') data[key] = value;
            });
            data.timestamp = serverTimestamp();
            data.captchaVerified = !!captchaToken;

            // 1. Guardar en Base de Datos (Seguridad #1)
            try {
                await addDoc(collection(db, "leads"), data);
                console.log("Lead guardado exitosamente en Base de Datos");
            } catch (fsError) {
                console.error("Fallo guardar lead:", fsError);
            }

            // 2. Envío a Formspree (incluye g-recaptcha-response automáticamente)
            quoteForm.target = "hidden_iframe";
            quoteForm.submit();

            // 3. Redirigir a página de gracias
            setTimeout(() => {
                window.location.href = 'thank-you.html';
            }, 500);
        });
    }
});
