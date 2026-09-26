/* =========================================================
   TR SIGNATURE SALON — SCRIPT.JS
   Handles: sticky header, mobile menu, smooth scroll,
   scroll reveal animations, gallery lightbox, testimonial
   slider, FAQ accordion, contact form validation,
   back-to-top button, and footer year.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------------------------------------------------
     1. STICKY HEADER ON SCROLL
  --------------------------------------------------- */
  var header = document.getElementById('site-header');
  function handleHeaderScroll() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  handleHeaderScroll();
  window.addEventListener('scroll', handleHeaderScroll);

  /* ---------------------------------------------------
     2. MOBILE HAMBURGER MENU
  --------------------------------------------------- */
  var hamburger = document.getElementById('hamburger');
  var mainNav = document.getElementById('main-nav');

  function closeMenu() {
    mainNav.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', function () {
    var isOpen = mainNav.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu whenever a nav link is clicked
  document.querySelectorAll('.main-nav .nav-link, .nav-cta').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* ---------------------------------------------------
     3. SMOOTH SCROLL FOR ALL ANCHOR LINKS
     (CSS already sets scroll-behavior:smooth, this adds
     an offset so content isn't hidden under the fixed header)
  --------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId.length <= 1) return; // ignore "#" only
      var targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      e.preventDefault();
      var headerOffset = 80;
      var targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  });

  /* ---------------------------------------------------
     4. SCROLL REVEAL ANIMATIONS
  --------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // Fallback: just show everything
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------
     5. GALLERY LIGHTBOX
  --------------------------------------------------- */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');
  var currentGalleryIndex = 0;

  function openLightbox(index) {
    currentGalleryIndex = index;
    var item = galleryItems[currentGalleryIndex];
    var fullSrc = item.getAttribute('data-full');
    var altText = item.querySelector('img').getAttribute('alt');
    lightboxImg.setAttribute('src', fullSrc);
    lightboxImg.setAttribute('alt', altText);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.setAttribute('src', '');
    document.body.style.overflow = '';
  }

  function showNextImage(step) {
    currentGalleryIndex = (currentGalleryIndex + step + galleryItems.length) % galleryItems.length;
    var item = galleryItems[currentGalleryIndex];
    lightboxImg.setAttribute('src', item.getAttribute('data-full'));
    lightboxImg.setAttribute('alt', item.querySelector('img').getAttribute('alt'));
  }

  galleryItems.forEach(function (item, index) {
    item.addEventListener('click', function () { openLightbox(index); });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', function () { showNextImage(-1); });
  lightboxNext.addEventListener('click', function () { showNextImage(1); });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showNextImage(-1);
    if (e.key === 'ArrowRight') showNextImage(1);
  });

  /* ---------------------------------------------------
     6. TESTIMONIAL SLIDER
  --------------------------------------------------- */
  var track = document.getElementById('testimonial-track');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.testimonial-slide'));
  var dotsWrap = document.getElementById('testimonial-dots');
  var prevBtn = document.getElementById('testimonial-prev');
  var nextBtn = document.getElementById('testimonial-next');
  var currentSlide = 0;
  var slideTimer = null;

  // Build dots dynamically
  slides.forEach(function (_, i) {
    var dot = document.createElement('button');
    dot.classList.add('testimonial-dot');
    dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', function () { goToSlide(i); });
    dotsWrap.appendChild(dot);
  });
  var dots = Array.prototype.slice.call(document.querySelectorAll('.testimonial-dot'));

  function goToSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
    dots.forEach(function (d, i) { d.classList.toggle('active', i === currentSlide); });
    resetAutoSlide();
  }

  function resetAutoSlide() {
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = setInterval(function () { goToSlide(currentSlide + 1); }, 6000);
  }

  if (slides.length > 0) {
    prevBtn.addEventListener('click', function () { goToSlide(currentSlide - 1); });
    nextBtn.addEventListener('click', function () { goToSlide(currentSlide + 1); });
    resetAutoSlide();
  }

  /* ---------------------------------------------------
     7. FAQ ACCORDION
  --------------------------------------------------- */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-question');
    question.addEventListener('click', function () {
      var isActive = item.classList.contains('active');

      // Close all other items (accordion behaviour)
      faqItems.forEach(function (otherItem) {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      if (!isActive) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------------------------------------------------
     8. CONTACT FORM VALIDATION
  --------------------------------------------------- */
  var form = document.getElementById('contact-form');
  var successMsg = document.getElementById('form-success');

  function setError(fieldId, message) {
    var errorEl = document.getElementById('error-' + fieldId);
    var inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.classList.toggle('invalid', Boolean(message));
  }

  function validateForm() {
    var isValid = true;

    var name = document.getElementById('name').value.trim();
    if (name.length < 2) {
      setError('name', 'Please enter your full name.');
      isValid = false;
    } else {
      setError('name', '');
    }

    var phone = document.getElementById('phone').value.trim();
    var phonePattern = /^[0-9+\-\s()]{7,15}$/;
    if (!phonePattern.test(phone)) {
      setError('phone', 'Please enter a valid phone number.');
      isValid = false;
    } else {
      setError('phone', '');
    }

    var service = document.getElementById('service').value;
    if (!service) {
      setError('service', 'Please select a service.');
      isValid = false;
    } else {
      setError('service', '');
    }

    return isValid;
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      successMsg.hidden = true;

      if (validateForm()) {
        // NOTE: This demo does not send data anywhere yet.
        // See the guide for connecting this to email or WhatsApp automatically.
        successMsg.hidden = false;
        form.reset();
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    // Live re-validation as the user types/selects
    ['name', 'phone', 'service'].forEach(function (id) {
      var field = document.getElementById(id);
      field.addEventListener('input', function () { validateForm(); });
      field.addEventListener('change', function () { validateForm(); });
    });
  }

  /* ---------------------------------------------------
     9. BACK TO TOP BUTTON
  --------------------------------------------------- */
  var backToTopBtn = document.getElementById('back-to-top');
  function toggleBackToTop() {
    backToTopBtn.classList.toggle('visible', window.scrollY > 500);
  }
  toggleBackToTop();
  window.addEventListener('scroll', toggleBackToTop);
  backToTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------------------------------------------------
     10. FOOTER — CURRENT YEAR
  --------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
