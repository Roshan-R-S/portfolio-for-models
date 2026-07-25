// ===== UTILITY FUNCTIONS =====
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const logError = (context, error) => {
  console.error(`[${context}]`, error);
};

// ===== NAVBAR SCROLL EFFECT =====
try {
  const navbar = document.getElementById('navbar');
  const scrollHandler = debounce(() => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, 10);
  window.addEventListener('scroll', scrollHandler);
} catch (error) {
  logError('Navbar scroll', error);
}

// ===== MOBILE MENU WITH FOCUS TRAP =====
try {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const navBackdrop = document.getElementById('navBackdrop');

  // Focus trap elements
  const getFocusableElements = () => {
    return navLinks.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
  };

  const trapFocus = (event) => {
    if (!navLinks.classList.contains('active')) return;

    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  const openMenu = () => {
    navLinks.classList.add('active');
    navBackdrop.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    navLinks.querySelector('a').focus();
    document.addEventListener('keydown', trapFocus);
  };

  const closeMenu = () => {
    navLinks.classList.remove('active');
    navBackdrop.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    menuToggle.focus();
    document.removeEventListener('keydown', trapFocus);
  };

  menuToggle.addEventListener('click', () => {
    if (navLinks.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when backdrop is clicked
  navBackdrop.addEventListener('click', closeMenu);

  // Close menu when a link is clicked
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      closeMenu();
    }
  });
} catch (error) {
  logError('Mobile menu', error);
}

// ===== PORTFOLIO FILTER =====
try {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      
      galleryItems.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        if (match) {
          item.classList.remove('hidden');
          void item.offsetWidth;
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
} catch (error) {
  logError('Portfolio filter', error);
}

// ===== ENHANCED LIGHTBOX =====
try {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxLoading = document.getElementById('lightboxLoading');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  let currentImageIndex = -1;
  let visibleGalleryItems = [];

  const updateVisibleItems = () => {
    visibleGalleryItems = Array.from(galleryItems).filter(
      item => !item.classList.contains('hidden')
    );
  };

  const updateLightboxCounter = () => {
    lightboxCounter.textContent = `${currentImageIndex + 1} / ${visibleGalleryItems.length}`;
  };

  const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = src;
    });
  };

  const openLightbox = async (index) => {
    try {
      updateVisibleItems();
      if (index < 0 || index >= visibleGalleryItems.length) return;

      const item = visibleGalleryItems[index];
      const img = item.querySelector('img');
      const highResSrc = img.src.replace('w=800', 'w=1600');

      lightboxLoading.classList.add('active');
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      await preloadImage(highResSrc);

      lightboxImg.src = highResSrc;
      lightboxImg.alt = img.alt;
      currentImageIndex = index;
      updateLightboxCounter();

      lightboxLoading.classList.remove('active');
      lightboxClose.focus();

      // Preload next image
      const nextIndex = (currentImageIndex + 1) % visibleGalleryItems.length;
      const nextImg = visibleGalleryItems[nextIndex].querySelector('img');
      preloadImage(nextImg.src.replace('w=800', 'w=1600')).catch(() => {});
    } catch (error) {
      logError('Lightbox open', error);
      lightboxLoading.classList.remove('active');
    }
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentImageIndex = -1;
    lightboxLoading.classList.remove('active');
  };

  const navigateLightbox = (direction) => {
    const newIndex = direction === 'next'
      ? (currentImageIndex + 1) % visibleGalleryItems.length
      : (currentImageIndex - 1 + visibleGalleryItems.length) % visibleGalleryItems.length;
    openLightbox(newIndex);
  };

  // Gallery item click handlers
  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      updateVisibleItems();
      const index = visibleGalleryItems.indexOf(item);
      if (index !== -1) {
        openLightbox(index);
      }
    });
    
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        updateVisibleItems();
        const index = visibleGalleryItems.indexOf(item);
        if (index !== -1) {
          openLightbox(index);
        }
      }
    });
  });

  // Lightbox controls
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => navigateLightbox('prev'));
  lightboxNext.addEventListener('click', () => navigateLightbox('next'));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      navigateLightbox('next');
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigateLightbox('prev');
    }
  });
} catch (error) {
  logError('Lightbox', error);
}

// ===== CONTACT FORM VALIDATION =====
try {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const showError = (field, message) => {
      const group = field.parentElement;
      const errorSpan = group.querySelector('.form-error');
      group.classList.add('error');
      errorSpan.textContent = message;
      errorSpan.classList.add('show');
    };

    const clearError = (field) => {
      const group = field.parentElement;
      const errorSpan = group.querySelector('.form-error');
      group.classList.remove('error');
      errorSpan.textContent = '';
      errorSpan.classList.remove('show');
    };

    const showFormStatus = (message, isSuccess) => {
      const statusEl = document.getElementById('formStatus');
      statusEl.textContent = message;
      statusEl.classList.remove('success', 'error');
      statusEl.classList.add(isSuccess ? 'success' : 'error');
    };

    const validateForm = () => {
      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const message = document.getElementById('message');
      let isValid = true;

      // Validate name
      if (!name.value.trim()) {
        showError(name, 'Name is required');
        isValid = false;
      } else if (name.value.trim().length < 2) {
        showError(name, 'Name must be at least 2 characters');
        isValid = false;
      } else {
        clearError(name);
      }

      // Validate email
      if (!email.value.trim()) {
        showError(email, 'Email is required');
        isValid = false;
      } else if (!validateEmail(email.value)) {
        showError(email, 'Please enter a valid email');
        isValid = false;
      } else {
        clearError(email);
      }

      // Validate message
      if (!message.value.trim()) {
        showError(message, 'Message is required');
        isValid = false;
      } else if (message.value.trim().length < 10) {
        showError(message, 'Message must be at least 10 characters');
        isValid = false;
      } else {
        clearError(message);
      }

      return isValid;
    };

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        showFormStatus('Please fix the errors above', false);
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      try {
        // Simulate form submission (replace with actual backend call)
        await new Promise(resolve => setTimeout(resolve, 1000));

        showFormStatus('Message sent successfully! We\'ll be in touch soon.', true);
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      } catch (error) {
        logError('Form submission', error);
        showFormStatus('Failed to send message. Please try again.', false);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    });

    // Clear error on input
    document.querySelectorAll('.contact-form input, .contact-form textarea').forEach(field => {
      field.addEventListener('input', () => {
        if (field.parentElement.classList.contains('error')) {
          clearError(field);
        }
      });
    });
  }
} catch (error) {
  logError('Contact form', error);
}

// ===== SCROLL REVEAL WITH INTERSECTION OBSERVER =====
try {
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
} catch (error) {
  logError('Scroll reveal', error);
}

// ===== SMOOTH SCROLL BEHAVIOR FOR NAVIGATION =====
try {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        const targetElement = document.querySelector(href);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
} catch (error) {
  logError('Smooth scroll', error);
}

// ===== IMAGE ERROR HANDLING =====
try {
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
      logError('Image load failed', `URL: ${this.src}`);
      // Add fallback or visual indicator if needed
      this.style.opacity = '0.5';
      this.alt = 'Image failed to load';
    });
  });
} catch (error) {
  logError('Image error handling', error);
}

// ===== ANALYTICS SNIPPET (Optional) =====
// Replace with your analytics tracking code
// Example: Google Analytics, Mixpanel, etc.