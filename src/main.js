import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  console.log("Tirapisu LP Loaded");

  // Mobile Menu Toggle
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.header__nav');
  
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('open');
      const spans = menuBtn.querySelectorAll('span');
      
      // Simple hamburger to X animation logic (optional, css can handle if class added)
      if (nav.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    // Close menu on link click
    const links = nav.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        const spans = menuBtn.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }

  // Fade In Animation on Scroll (Intersection Observer)
  const observerOptions = {
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Animate once
      }
    });
  }, observerOptions);

  // Targets to animate
  const targets = document.querySelectorAll('.section-title, .feature-card, .benefit-card, .class-card, .review-card, .flow-steps, .pricing-cards');
  targets.forEach(target => {
    target.classList.add('fade-in-section');
    observer.observe(target);
  });
});
