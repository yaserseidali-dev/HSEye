// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Close menu when link is clicked
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Add to Cart
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cartCount = document.querySelector('.cart-count');
let cart = [];

addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const productCard = button.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        const productPrice = productCard.querySelector('.price').textContent;

        // Add to cart
        cart.push({
            name: productName,
            price: productPrice
        });

        // Update cart count
        if (cartCount) {
            cartCount.textContent = cart.length;
        }

        // Show notification
        showNotification(`${productName} به سبد خرید اضافه شد!`);

        // Change button style
        button.style.backgroundColor = '#28a745';
        button.textContent = '✓ اضافه شد';
        setTimeout(() => {
            button.style.backgroundColor = '';
            button.textContent = 'افزودن به سبد';
        }, 2000);
    });
});

// Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #28a745;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Smooth scroll
const links = document.querySelectorAll('a[href^="#"]');
links.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Contact Form
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('پیام شما با موفقیت ارسال شد!');
        contactForm.reset();
    });
}

// Load cart from localStorage
window.addEventListener('load', () => {
    const savedCart = localStorage.getItem('hseye-cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        if (cartCount) {
            cartCount.textContent = cart.length;
        }
    }
});

// Save cart to localStorage
window.addEventListener('beforeunload', () => {
    localStorage.setItem('hseye-cart', JSON.stringify(cart));
});