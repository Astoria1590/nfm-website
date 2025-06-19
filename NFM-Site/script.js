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




