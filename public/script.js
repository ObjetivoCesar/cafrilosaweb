// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(0, 0, 0, 0.98)';
    } else {
        header.style.background = 'rgba(0, 0, 0, 0.95)';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.benefit-card, .expansion-card, .feature');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.style.opacity = '1';
});

// Initialize page
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease';

// Mobile menu toggle (if needed in future)
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Add click effect to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple effect styles
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);


// Mobile Slider Functionality
let currentSlides = {
    'benefits-slider': 0,
    'innovation-slider': 0,
    'expansion-slider': 0
};

function initializeSliders() {
    // Only initialize sliders on mobile devices
    if (window.innerWidth <= 768) {
        const sliders = [
            { id: 'benefits-grid', dotsId: 'benefits-dots', sliderId: 'benefits-slider' },
            { id: 'innovation-features', dotsId: 'innovation-dots', sliderId: 'innovation-slider' },
            { id: 'expansion-grid', dotsId: 'expansion-dots', sliderId: 'expansion-slider' }
        ];
        
        sliders.forEach(sliderConfig => {
            const slider = document.querySelector(`.${sliderConfig.id}`);
            const dotsContainer = document.getElementById(sliderConfig.dotsId);
            
            if (slider && dotsContainer) {
                const cards = slider.children;
                const totalCards = cards.length;
                
                // Create dots
                dotsContainer.innerHTML = '';
                for (let i = 0; i < totalCards; i++) {
                    const dot = document.createElement('div');
                    dot.className = `slider-dot ${i === 0 ? 'active' : ''}`;
                    dot.onclick = () => goToSlide(sliderConfig.sliderId, i);
                    dotsContainer.appendChild(dot);
                }
            }
        });
    }
}

function slideCards(sliderId, direction) {
    // Only work on mobile devices
    if (window.innerWidth > 768) return;
    
    const sliderMap = {
        'benefits-slider': '.benefits-grid',
        'innovation-slider': '.innovation-features',
        'expansion-slider': '.expansion-grid'
    };
    
    const slider = document.querySelector(sliderMap[sliderId]);
    if (!slider) return;
    
    const cards = slider.children;
    const totalCards = cards.length;
    
    currentSlides[sliderId] += direction;
    
    // Loop around
    if (currentSlides[sliderId] < 0) {
        currentSlides[sliderId] = totalCards - 1;
    } else if (currentSlides[sliderId] >= totalCards) {
        currentSlides[sliderId] = 0;
    }
    
    updateSliderPosition(sliderId);
}

function goToSlide(sliderId, slideIndex) {
    // Only work on mobile devices
    if (window.innerWidth > 768) return;
    
    currentSlides[sliderId] = slideIndex;
    updateSliderPosition(sliderId);
}

function updateSliderPosition(sliderId) {
    // Only work on mobile devices
    if (window.innerWidth > 768) return;
    
    const sliderMap = {
        'benefits-slider': { selector: '.benefits-grid', dotsId: 'benefits-dots' },
        'innovation-slider': { selector: '.innovation-features', dotsId: 'innovation-dots' },
        'expansion-slider': { selector: '.expansion-grid', dotsId: 'expansion-dots' }
    };
    
    const config = sliderMap[sliderId];
    if (!config) return;
    
    const slider = document.querySelector(config.selector);
    const dotsContainer = document.getElementById(config.dotsId);
    
    if (!slider) return;
    
    const cards = slider.children;
    const cardWidth = cards[0].offsetWidth + 20; // card width + gap
    
    // Update slider position
    slider.style.transform = `translateX(-${currentSlides[sliderId] * cardWidth}px)`;
    
    // Update dots
    if (dotsContainer) {
        const dots = dotsContainer.children;
        for (let i = 0; i < dots.length; i++) {
            dots[i].classList.toggle('active', i === currentSlides[sliderId]);
        }
    }
}

// Initialize sliders when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeSliders();
    
    // Update slider positions on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            initializeSliders();
            Object.keys(currentSlides).forEach(sliderId => {
                updateSliderPosition(sliderId);
            });
        } else {
            // Reset sliders on desktop
            Object.keys(currentSlides).forEach(sliderId => {
                currentSlides[sliderId] = 0;
                const sliderMap = {
                    'benefits-slider': '.benefits-grid',
                    'innovation-slider': '.innovation-features',
                    'expansion-slider': '.expansion-grid'
                };
                const slider = document.querySelector(sliderMap[sliderId]);
                if (slider) {
                    slider.style.transform = 'translateX(0)';
                }
            });
        }
    });
});

