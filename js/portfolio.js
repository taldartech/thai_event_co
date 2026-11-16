/**
 * THAI DECOR COLLECTIVE – PORTFOLIO & GALLERY
 * Filter tabs, asymmetric layout transitions, lightbox data binding
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Portfolio Category Filtering (on work.html or index.html)
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item-filterable');

  if (filterButtons.length > 0 && portfolioItems.length > 0) {
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        // Active class toggle
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        portfolioItems.forEach((item) => {
          const category = item.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            item.style.display = 'block';
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            }, 10);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'translateY(16px)';
            setTimeout(() => {
              item.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  // 2. Lightbox Items Registration
  const galleryItems = document.querySelectorAll('.gallery-item[data-lightbox-src]');
  if (galleryItems.length > 0) {
    const itemsData = Array.from(galleryItems).map((el) => ({
      src: el.getAttribute('data-lightbox-src'),
      title: el.getAttribute('data-lightbox-title') || '',
      category: el.getAttribute('data-lightbox-category') || '',
    }));

    galleryItems.forEach((el, index) => {
      el.addEventListener('click', () => {
        if (typeof window.openLightbox === 'function') {
          window.openLightbox(index, itemsData);
        }
      });
    });
  }
});

