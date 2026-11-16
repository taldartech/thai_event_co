/**
 * THAI EVENT COLLECTIVE – EDITORIAL ANIMATIONS (GSAP & SCROLLTRIGGER)
 * High-end editorial transitions, curtain reveals, subtle magnetic pull, and scroll progress
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Editorial Scroll Progress Bar
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
    document.querySelectorAll('.reveal-clip, .fade-up-item').forEach((el) => {
      el.classList.add('is-revealed');
    });
    return;
  }

  // If GSAP and ScrollTrigger are loaded
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // 2. Cinematic Hero Reveal Animation
    const heroSection = document.querySelector('.hero-cinematic');
    if (heroSection) {
      const heroTimeline = gsap.timeline({ delay: 0.15 });

      heroTimeline
        .from('.hero-eyebrow', {
          y: 20,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out'
        })
        .from('.hero-headline .reveal-text-inner', {
          y: '105%',
          duration: 1.15,
          stagger: 0.14,
          ease: 'power4.out'
        }, '-=0.6')
        .from('.hero-subtext', {
          y: 24,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out'
        }, '-=0.7')
        .from('.hero-actions .btn-bespoke', {
          y: 20,
          opacity: 0,
          stagger: 0.12,
          duration: 0.75,
          ease: 'power3.out'
        }, '-=0.6')
        .from('.scroll-indicator-wrap', {
          opacity: 0,
          y: 10,
          duration: 1.1,
          ease: 'power2.out'
        }, '-=0.5');
    }

    // 3. Section Header Staggered Reveals (Eyebrow -> Heading -> Supporting Copy)
    const sectionHeaders = document.querySelectorAll(
      '.section-header, .work-header-row, .why-header-row, .about-hero-inner, .page-header-content'
    );
    sectionHeaders.forEach((headerWrap) => {
      const eyebrow = headerWrap.querySelector('.eyebrow');
      const title = headerWrap.querySelector('.display-title, .display-title-sm, .hero-headline, h1, h2');
      const lead = headerWrap.querySelector('.lead-text, .lead, p.text-secondary');

      const elements = [eyebrow, title, lead].filter(Boolean);
      if (elements.length > 0) {
        gsap.from(elements, {
          scrollTrigger: {
            trigger: headerWrap,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          y: 35,
          opacity: 0,
          duration: 0.95,
          stagger: 0.12,
          ease: 'power3.out'
        });
      }
    });

    // 4. Standalone Display Headings
    const standaloneHeadings = document.querySelectorAll('.display-title, .display-title-sm');
    standaloneHeadings.forEach((heading) => {
      if (heading.closest('.hero-cinematic') || heading.closest('.section-header') || heading.closest('.work-header-row')) {
        return;
      }
      gsap.from(heading, {
        scrollTrigger: {
          trigger: heading,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 35,
        opacity: 0,
        duration: 0.95,
        ease: 'power3.out'
      });
    });

    // 5. Asymmetric Portfolio Work Cards Stagger
    const workCards = document.querySelectorAll('.portfolio-grid-asym .work-card');
    if (workCards.length > 0) {
      workCards.forEach((card, index) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none none'
          },
          y: 40,
          opacity: 0,
          duration: 1.0,
          delay: (index % 2) * 0.15,
          ease: 'power3.out'
        });
      });
    }

    // 6. Experience Gallery Stagger
    const galleryItems = document.querySelectorAll('.gallery-grid .gallery-item');
    if (galleryItems.length > 0) {
      ScrollTrigger.batch(galleryItems, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => {
          gsap.from(batch, {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out'
          });
        }
      });
    }

    // 7. Image Curtain Reveals
    const clipImages = document.querySelectorAll('.reveal-clip');
    clipImages.forEach((img) => {
      ScrollTrigger.create({
        trigger: img,
        start: 'top 80%',
        onEnter: () => img.classList.add('is-revealed'),
        once: true
      });
    });

    // 8. Fade Up Items
    const fadeItems = document.querySelectorAll('.fade-up-item');
    fadeItems.forEach((item) => {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 85%',
        onEnter: () => item.classList.add('is-revealed'),
        once: true
      });
    });

    // 9. Subtle Scroll Parallax on Hero and Atmosphere Backgrounds
    const parallaxImgs = document.querySelectorAll('.parallax-bg');
    parallaxImgs.forEach((img) => {
      gsap.to(img, {
        scrollTrigger: {
          trigger: img.parentElement,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        },
        y: 60,
        ease: 'none'
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
        y: 35,
        opacity: 0,
        stagger: 0.14,
        duration: 0.9,
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
            x: relX * 0.18,
            y: relY * 0.18,
            duration: 0.35,
            ease: 'power2.out'
          });
        });

        target.addEventListener('mouseleave', () => {
          gsap.to(target, {
            x: 0,
            y: 0,
            duration: 0.65,
            ease: 'power3.out'
          });
        });
      });
    }

  } else {
    // Fallback: IntersectionObserver for lightweight non-JS environments
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-clip, .fade-up-item').forEach((el) => {
      observer.observe(el);
    });
  }
});

