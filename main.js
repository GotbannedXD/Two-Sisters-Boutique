// Global Array state tracking engine now including quantities and variants
let cart = [];

/**
 * Smoothly opens or closes the sliding sidebar cart drawer layout
 */
function toggleCart() {
    const sidebar = document.getElementById('shoppingCartSide');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    }
}

/**
 * Cycles through the product image variants when < or > are clicked
 */
function navigateProduct(cardId, direction) {
    const card = document.getElementById(cardId);
    if (!card) return;

    // Parse the JSON list of variants from the data attribute
    const variantsData = card.getAttribute('data-variants');
    if (!variantsData) return;
    
    const variants = JSON.parse(variantsData);
    let currentIndex = parseInt(card.getAttribute('data-index')) || 0;

    // Calculate new active image index position
    currentIndex += direction;
    if (currentIndex >= variants.length) {
        currentIndex = 0; // Wrap around to first image
    } else if (currentIndex < 0) {
        currentIndex = variants.length - 1; // Wrap around to last image
    }

    // Save the new index back onto the HTML element
    card.setAttribute('data-index', currentIndex);

    // Swap presentation img file source path and visible indicator text
    const displayImg = card.querySelector('.product-img');
    const labelIndicator = card.querySelector('.current-variant-name');
    
    if (displayImg && variants[currentIndex]) {
        displayImg.src = variants[currentIndex].src;
    }
    if (labelIndicator && variants[currentIndex]) {
        labelIndicator.innerText = variants[currentIndex].label;
    }
}

/**
 * Extracts active selected variant info prior to cart injection
 */
function addSelectedToCart(cardId, baseName, price) {
    const card = document.getElementById(cardId);
    let chosenColor = "";
    
    if (card) {
        const variantsData = card.getAttribute('data-variants');
        let currentIndex = parseInt(card.getAttribute('data-index')) || 0;
        
        if (variantsData) {
            const variants = JSON.parse(variantsData);
            // Confirm item array contains multiple elements before checking labels
            if (variants.length > 1 && variants[currentIndex]) {
                chosenColor = variants[currentIndex].label;
            }
        }
    }
    
    // Concat arrow variant choices directly onto order items label structure
    const finalItemName = chosenColor ? `${baseName} (${chosenColor})` : baseName;
    addToCart(finalItemName, price);
}

/**
 * Adds items to cart, increasing quantity cleanly if tapped multiple times
 */
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: name, price: Number(price), quantity: 1 });
    }
    
    updateCartDOM();
}

/**
 * Filters or reduces item quantity until fully removed
 */
function removeFromCart(name) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        if (existingItem.quantity > 1) {
            existingItem.quantity -= 1;
        } else {
            cart = cart.filter(item => item.name !== name);
        }
    }
    updateCartDOM();
}

/**
 * Handles real-time layout changes depending on quantities
 */
function updateCartDOM() {
    const countElement = document.getElementById('cartCount');
    const contentWrapper = document.getElementById('cartContentWrapper');
    
    if (!contentWrapper) return;

    // Direct interface update to badge counters
    if (countElement) {
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        countElement.innerText = totalItems;
    }
    
    if (cart.length === 0) {
        contentWrapper.innerHTML = `
            <div class="empty-cart-state">
                <p>Your selection drawer is empty.</p>
                <a class="browse-btn" onclick="toggleCart()">Browse Catalog</a>
            </div>
        `;
        return;
    }
    
    let itemsHTML = '<div class="cart-items-list">';
    let totalValue = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalValue += itemTotal;
        const safeName = item.name.replace(/'/g, "\\'");
        
        itemsHTML += `
            <div class="cart-item">
                <div class="item-meta">
                    <h4>${item.name} <span style="color:var(--champagne-gold); font-weight:700;">(x${item.quantity})</span></h4>
                    <p>K${itemTotal}.00</p>
                </div>
                <button class="remove-item-btn" onclick="removeFromCart('${safeName}')">Remove</button>
            </div>
        `;
    });
    
    itemsHTML += '</div>';
    
    const summaryHTML = `
        <div class="cart-summary-footer">
            <div class="total-row">
                <span>Total Amount</span>
                <span>K${totalValue}.00</span>
            </div>
            <button class="whatsapp-checkout-btn" onclick="launchWhatsAppCheckout(${totalValue})">
                Place Order via WhatsApp
            </button>
        </div>
    `;
    
    contentWrapper.innerHTML = totalValue > 0 ? (itemsHTML + summaryHTML) : itemsHTML;
}

/**
 * Builds standard WhatsApp link chains detailing item quantities clearly
 */
function launchWhatsAppCheckout(total) {
    const merchantPhone = "260975107048"; 
    
    let orderLines = "";
    cart.forEach((item, index) => {
        orderLines += `${index + 1}. ${item.name} [x${item.quantity}] — K${item.price * item.quantity}.00\n`;
    });
    
    const messageText = `Hello Two Sisters Store,\n\n` +
                        `I would like to place an order for the following items from your collection:\n\n` +
                        `${orderLines}\n` +
                        `Total Order Value: K${total}.00\n\n` +
                        `Please verify item availability and share relevant checkout payment steps to confirm this order. Thank you.`;
                        
    const encodedURI = encodeURIComponent(messageText);
    const targetEndpoint = `https://wa.me/${merchantPhone}?text=${encodedURI}`;
    
    window.open(targetEndpoint, '_blank');
}

/**
 * Smoothly cycles through the landing hero background images automatically
 */
function initHeroSlideshow() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;
    
    let currentSlideIndex = 0;
    
    setInterval(() => {
        slides[currentSlideIndex].classList.remove('active');
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        slides[currentSlideIndex].classList.add('active');
    }, 4000);
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartDOM();
    initHeroSlideshow();
});