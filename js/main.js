/**
 * THAI DECOR COLLECTIVE – MAIN JAVASCRIPT
 * Smooth Scroll (Lenis), Header state, Lightbox Modal, and Form Handling
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lenis Smooth Scroll
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger if present
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // 2. Header Scroll Effect
  const header = document.querySelector('.site-header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // 3. Dynamic Footer Year
  const yearEl = document.querySelector('.current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 4. Native Dialog Lightbox
  const lightboxDialog = document.getElementById('lightboxDialog');
  if (lightboxDialog) {
    const lightboxImg = lightboxDialog.querySelector('.lightbox-img-el');
    const lightboxTitle = lightboxDialog.querySelector('.lightbox-title');
    const lightboxCategory = lightboxDialog.querySelector('.lightbox-category');
    const closeBtn = lightboxDialog.querySelector('.lightbox-close-btn');
    const prevBtn = lightboxDialog.querySelector('.lightbox-prev');
    const nextBtn = lightboxDialog.querySelector('.lightbox-next');

    let currentGalleryItems = [];
    let currentIndex = 0;

    window.openLightbox = (index, items) => {
      currentGalleryItems = items;
      currentIndex = index;
      updateLightboxContent();
      if (typeof lightboxDialog.showModal === 'function') {
        lightboxDialog.showModal();
        document.body.style.overflow = 'hidden';
      }
    };

    function updateLightboxContent() {
      if (!currentGalleryItems || currentGalleryItems.length === 0) return;
      const item = currentGalleryItems[currentIndex];
      if (item) {
        lightboxImg.src = item.src;
        lightboxImg.alt = item.title || 'Thai Event Collective Corporate Gallery';
        if (lightboxTitle) lightboxTitle.textContent = item.title || '';
        if (lightboxCategory) lightboxCategory.textContent = item.category || '';
      }
    }

    function closeLightbox() {
      if (lightboxDialog.open) {
        lightboxDialog.close();
        document.body.style.overflow = '';
      }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    lightboxDialog.addEventListener('click', (e) => {
      if (e.target === lightboxDialog) {
        closeLightbox();
      }
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + currentGalleryItems.length) % currentGalleryItems.length;
        updateLightboxContent();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % currentGalleryItems.length;
        updateLightboxContent();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (!lightboxDialog.open) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
      if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
    });
  }

  // 5. Contact / Enquiry Form Validation & Handler
  const contactForm = document.getElementById('enquiryForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const statusEl = document.getElementById('formStatus');
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      // Basic client-side validation
      const name = contactForm.querySelector('#clientName')?.value.trim();
      const email = contactForm.querySelector('#clientEmail')?.value.trim();
      const eventType = contactForm.querySelector('#eventType')?.value;
      const message = contactForm.querySelector('#clientMessage')?.value.trim();

      if (!name || !email || !message) {
        if (statusEl) {
          statusEl.className = 'form-status-msg error';
          statusEl.textContent = 'Please complete all required fields (Name, Email, and Message) before submitting.';
          statusEl.style.display = 'block';
        }
        return;
      }

      // Visual sending state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Sending Enquiry...';
      }

      // Simulate network request to configured endpoint
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = submitBtn.dataset.originalText || 'Send Enquiry';
        }
        if (statusEl) {
          statusEl.className = 'form-status-msg success';
          statusEl.innerHTML = '<strong>Corporate RFP Received.</strong> Thank you, ' + name + '. The Thai Event Collective corporate production team in Bangkok & Phuket will review your parameters and return a detailed proposal within 24 hours.';
          statusEl.style.display = 'block';
        }
        contactForm.reset();
      }, 900);
    });
  }

  // 6. Premium Background Corporate Audio Controller (ON by default)
  const audioWidget = document.getElementById('ambientAudioWidget');
  const bgAudio = document.getElementById('bgAmbientAudio');

  if (audioWidget && bgAudio) {
    let fadeInterval = null;
    const targetVolume = 0.32; // Soft, polished corporate background level
    bgAudio.volume = 0;

    // Default is ON unless user explicitly turned it OFF in this session
    const isMutedByUser = sessionStorage.getItem('tec_ambient_sound') === 'false';

    const playAudio = () => {
      bgAudio.play().then(() => {
        audioWidget.classList.add('is-playing');
        audioWidget.setAttribute('aria-pressed', 'true');
        audioWidget.setAttribute('title', 'Sound is ON (Click to mute)');
        const statusText = audioWidget.querySelector('.ambient-audio-status');
        if (statusText) statusText.textContent = '[ ON ]';
        sessionStorage.setItem('tec_ambient_sound', 'true');

        // Smooth volume fade in
        clearInterval(fadeInterval);
        fadeInterval = setInterval(() => {
          if (bgAudio.volume < targetVolume - 0.04) {
            bgAudio.volume = Math.min(targetVolume, bgAudio.volume + 0.04);
          } else {
            bgAudio.volume = targetVolume;
            clearInterval(fadeInterval);
          }
        }, 50);
      }).catch((err) => {
        // Autoplay policy awaiting user gesture
        console.log('Audio autoplay awaiting user interaction gesture:', err);
      });
    };

    const pauseAudio = () => {
      audioWidget.classList.remove('is-playing');
      audioWidget.setAttribute('aria-pressed', 'false');
      audioWidget.setAttribute('title', 'Sound is OFF (Click to play)');
      const statusText = audioWidget.querySelector('.ambient-audio-status');
      if (statusText) statusText.textContent = '[ OFF ]';
      sessionStorage.setItem('tec_ambient_sound', 'false');

      // Smooth volume fade out
      clearInterval(fadeInterval);
      fadeInterval = setInterval(() => {
        if (bgAudio.volume > 0.04) {
          bgAudio.volume = Math.max(0, bgAudio.volume - 0.04);
        } else {
          bgAudio.volume = 0;
          bgAudio.pause();
          clearInterval(fadeInterval);
        }
      }, 40);
    };

    audioWidget.addEventListener('click', () => {
      if (bgAudio.paused || bgAudio.volume === 0 || !audioWidget.classList.contains('is-playing')) {
        playAudio();
      } else {
        pauseAudio();
      }
    });

    audioWidget.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        audioWidget.click();
      }
    });

    if (isMutedByUser) {
      // User explicitly turned sound off earlier
      audioWidget.classList.remove('is-playing');
      audioWidget.setAttribute('aria-pressed', 'false');
      const statusText = audioWidget.querySelector('.ambient-audio-status');
      if (statusText) statusText.textContent = '[ OFF ]';
      bgAudio.pause();
    } else {
      // DEFAULT: Sound is ON
      // Attempt immediate playback
      playAudio();

      // In case browser policy requires a user gesture, start on first interaction anywhere
      const unlockAudioGesture = () => {
        if (sessionStorage.getItem('tec_ambient_sound') !== 'false' && (bgAudio.paused || bgAudio.volume === 0)) {
          playAudio();
        }
        window.removeEventListener('click', unlockAudioGesture);
        window.removeEventListener('touchstart', unlockAudioGesture);
        window.removeEventListener('scroll', unlockAudioGesture);
        window.removeEventListener('keydown', unlockAudioGesture);
      };

      window.addEventListener('click', unlockAudioGesture, { once: true, passive: true });
      window.addEventListener('touchstart', unlockAudioGesture, { once: true, passive: true });
      window.addEventListener('scroll', unlockAudioGesture, { once: true, passive: true });
      window.addEventListener('keydown', unlockAudioGesture, { once: true, passive: true });
    }
  }
});

