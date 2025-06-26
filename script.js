// ===== Scroll-Triggered Section Reveal =====
const sections = document.querySelectorAll('.nfm-section');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
    }
  });
}, {
  threshold: 0.1
});

sections.forEach(section => {
  observer.observe(section);
});

// Nav toggle
const hamburger = document.getElementById('hamburger-btn');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
});

// FAQ accordion
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
      const entry = item.closest('.faq-entry');
      const isActive = entry.classList.contains('active');

      document.querySelectorAll('.faq-entry').forEach(e => e.classList.remove('active'));

      if (!isActive) entry.classList.add('active');
    });
  });

  // Smooth scroll to top
  const scrollBtn = document.querySelector('.back-to-top');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});


  document.addEventListener("DOMContentLoaded", function () {
    let slideIndex = 0;
    const slides = document.querySelectorAll(".announcement-slideshow .slide");
    const prevBtn = document.querySelector(".announcement-slideshow .prev");
    const nextBtn = document.querySelector(".announcement-slideshow .next");
    let autoplayInterval;

    function showSlide(index) {
      slides.forEach(slide => slide.classList.remove("active"));
      slides[index].classList.add("active");
    }

    function nextSlide() {
      slideIndex = (slideIndex + 1) % slides.length;
      showSlide(slideIndex);
    }

    function prevSlide() {
      slideIndex = (slideIndex - 1 + slides.length) % slides.length;
      showSlide(slideIndex);
    }

    function startAutoplay() {
      autoplayInterval = setInterval(nextSlide, 7000);
    }

    function stopAutoplay() {
      clearInterval(autoplayInterval);
    }

    // Event listeners
    nextBtn.addEventListener("click", () => {
      stopAutoplay();
      nextSlide();
      startAutoplay();
    });

    prevBtn.addEventListener("click", () => {
      stopAutoplay();
      prevSlide();
      startAutoplay();
    });

    // Initialize
    showSlide(slideIndex);
    startAutoplay();
  });



