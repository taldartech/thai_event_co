/**
 * THAI DECOR COLLECTIVE – NAVIGATION JAVASCRIPT
 * Full-screen overlay menu, keyboard escape, active state tracking
 */

document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileOverlay = document.querySelector('.mobile-nav-overlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (menuToggle && mobileOverlay) {
    const toggleMenu = () => {
      const isOpen = mobileOverlay.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    const openMenu = () => {
      mobileOverlay.classList.add('open');
      menuToggle.classList.add('is-active');
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';

      // Stagger animate links if GSAP exists
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(
          '.mobile-nav-item',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.2 }
        );
      }
    };

    const closeMenu = () => {
      mobileOverlay.classList.remove('open');
      menuToggle.classList.remove('is-active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    menuToggle.addEventListener('click', toggleMenu);

    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileOverlay.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  // Active navigation highlight based on current pathname
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link-custom');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
});

