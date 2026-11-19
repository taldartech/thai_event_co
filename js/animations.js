/**
 * THAI EVENT COLLECTIVE – EDITORIAL ANIMATIONS (GSAP & SCROLLTRIGGER)
 * High-end decent section transitions, cool luxury image motion, and natural scroll
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Editorial Scroll Progress Bar (Responsive with native scrolling)
  const scrollLine = document.getElementById('editorialScrollLine');
  if (scrollLine) {
    const updateScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (window.scrollY / scrollHeight) : 0;
      scrollLine.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    };
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();
  }

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal-clip, .fade-up-item, section').forEach((el) => {
      el.classList.add('is-revealed', 'section-in-view');
    });
    return;
  }

  // If GSAP and ScrollTrigger are loaded
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // 2. Cinematic Hero Reveal Animation (First viewport entrance)
    const heroSection = document.querySelector('.hero-cinematic');
    if (heroSection) {
      const heroTimeline = gsap.timeline({ delay: 0.12 });

      heroTimeline
        .from('.hero-eyebrow', {
          y: 18,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out'
        })
        .from('.hero-headline .reveal-text-inner', {
          y: '105%',
          duration: 1.1,
          stagger: 0.12,
          ease: 'power4.out'
        }, '-=0.55')
        .from('.hero-subtext', {
          y: 20,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out'
        }, '-=0.65')
        .from('.hero-actions .btn-bespoke', {
          y: 18,
          opacity: 0,
          stagger: 0.1,
          duration: 0.7,
          ease: 'power3.out'
        }, '-=0.55')
        .from('.scroll-indicator-wrap', {
          opacity: 0,
          y: 10,
          duration: 0.9,
          ease: 'power2.out'
        }, '-=0.45');
    }

    // 3. Decent Section Entry Animation (Smooth, calm, executive transitions)
    const allSections = document.querySelectorAll('section:not(.hero-cinematic)');
    allSections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          section.classList.add('section-in-view');
        }
      });

      // Stagger section header elements (eyebrow -> title -> lead -> action)
      const eyebrow = section.querySelector('.eyebrow');
      const title = section.querySelector('.display-title, .display-title-sm, h2');
      const lead = section.querySelector('.lead-text, .lead, p.text-secondary');
      const headerElements = [eyebrow, title, lead].filter(Boolean);

      if (headerElements.length > 0) {
        gsap.from(headerElements, {
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          y: 28,
          opacity: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: 'power3.out'
        });
      }
    });

    // 4. Cool Animation on Images: Curtain Reveal with Scale Relaxation
    const clipImages = document.querySelectorAll('.reveal-clip');
    clipImages.forEach((clipWrap) => {
      const img = clipWrap.querySelector('img');
      
      ScrollTrigger.create({
        trigger: clipWrap,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          clipWrap.classList.add('is-revealed');
          if (img) {
            gsap.to(img, {
              scale: 1.0,
              duration: 1.35,
              ease: 'power3.out'
            });
          }
        }
      });
    });

    // 5. Cool Animation on Images: Subtle Scroll Parallax Depth
    const parallaxMediaImages = document.querySelectorAll(
      '.service-card-media img, .col-featured .work-card-media img, .col-side .work-card-media img, .gallery-item img'
    );
    parallaxMediaImages.forEach((img) => {
      const parent = img.parentElement;
      if (!parent) return;

      gsap.fromTo(
        img,
        { yPercent: -4 },
        {
          yPercent: 4,
          ease: 'none',
          scrollTrigger: {
            trigger: parent,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        }
      );
    });

    // 6. Interactive 3D Perspective Tilt on Image Cards (Desktop Only)
    if (window.matchMedia('(pointer: fine)').matches) {
      const interactiveCards = document.querySelectorAll('.work-card, .service-card-editorial, .gallery-item');
      interactiveCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -3.2; // subtle max 3.2deg
          const rotateY = ((x - centerX) / centerX) * 3.2;

          gsap.to(card, {
            rotationX: rotateX,
            rotationY: rotateY,
            transformPerspective: 1000,
            transformOrigin: 'center center',
            duration: 0.35,
            ease: 'power2.out'
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotationX: 0,
            rotationY: 0,
            duration: 0.65,
            ease: 'power3.out'
          });
        });
      });
    }

    // 7. Asymmetric Portfolio Work Cards Stagger
    const workCards = document.querySelectorAll('.portfolio-grid-asym .work-card');
    if (workCards.length > 0) {
      workCards.forEach((card, index) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none none'
          },
          y: 35,
          opacity: 0,
          duration: 0.9,
          delay: (index % 2) * 0.12,
          ease: 'power3.out'
        });
      });
    }

    // 8. Experience Gallery Stagger
    const galleryItems = document.querySelectorAll('.gallery-grid .gallery-item');
    if (galleryItems.length > 0) {
      ScrollTrigger.batch(galleryItems, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => {
          gsap.from(batch, {
            y: 28,
            opacity: 0,
            scale: 0.97,
            duration: 0.8,
            stagger: 0.09,
            ease: 'power3.out'
          });
        }
      });
    }

    // 9. Fade Up Items
    const fadeItems = document.querySelectorAll('.fade-up-item');
    fadeItems.forEach((item) => {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 85%',
        onEnter: () => item.classList.add('is-revealed'),
        once: true
      });
    });

    // 10. Approach Timeline Cards Stagger
    const approachSteps = document.querySelectorAll('.approach-card');
    if (approachSteps.length > 0) {
      gsap.from(approachSteps, {
        scrollTrigger: {
          trigger: '.approach-steps',
          start: 'top 82%',
          toggleActions: 'play none none none'
        },
        y: 30,
        opacity: 0,
        stagger: 0.12,
        duration: 0.85,
        ease: 'power3.out'
      });
    }

    // 11. Subtle Desktop Magnetic Interaction for CTA Buttons & Audio Pill
    if (window.matchMedia('(pointer: fine)').matches) {
      const magneticTargets = document.querySelectorAll('.btn-bespoke, .ambient-audio-widget');
      magneticTargets.forEach((target) => {
        target.addEventListener('mousemove', (e) => {
          const rect = target.getBoundingClientRect();
          const relX = e.clientX - rect.left - rect.width / 2;
          const relY = e.clientY - rect.top - rect.height / 2;
          gsap.to(target, {
            x: relX * 0.15,
            y: relY * 0.15,
            duration: 0.35,
            ease: 'power2.out'
          });
        });

        target.addEventListener('mouseleave', () => {
          gsap.to(target, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'power3.out'
          });
        });
      });
    }

    // 12. Check for URL Hash on Load & Trigger Decent Highlight
    if (window.location.hash) {
      const targetSection = document.querySelector(window.location.hash);
      if (targetSection) {
        setTimeout(() => {
          targetSection.classList.add('section-target-highlight');
        }, 300);
      }
    }

  } else {
    // Fallback: IntersectionObserver for lightweight non-JS environments
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed', 'section-in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-clip, .fade-up-item, section').forEach((el) => {
      observer.observe(el);
    });
  }
});
