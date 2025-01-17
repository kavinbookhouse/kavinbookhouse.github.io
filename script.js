document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("category");
    const booksContainer = document.getElementById("booksContainer");
    const searchInput = document.getElementById("searchInput");
    const cartIcon = document.getElementById("cartIcon");
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
    // Show/hide cart icon based on items
    function updateCartIcon() {
      if (cartIcon) {
        cartIcon.style.display = cart.length > 0 ? "block" : "none";
      } else {
        console.error('Cart icon element not found');
      }
    }
  
    // Initialize cart icon
    updateCartIcon();
  
    // Cart icon click handler
    if (cartIcon) {
      cartIcon.addEventListener("click", () => {
        updateCartModal();
        const cartModal = new bootstrap.Modal(document.getElementById("cartModal"));
        cartModal.show();
      });
    }
  
    // WhatsApp button click handler
    const whatsappBtn = document.getElementById("whatsappBtn");
    if (whatsappBtn) {
      whatsappBtn.addEventListener("click", () => {
        sendWhatsAppMessage();
      });
    }
  
    if (booksContainer && categoryParam) {
      fetch("books.json")
        .then(res => res.json())
        .then(data => {
          let books = categoryParam === "All Books" 
            ? data 
            : data.filter(b => b.category === categoryParam);
  
          renderBooks(booksContainer, books);
  
          if (searchInput) {
            searchInput.addEventListener("input", () => {
              const query = searchInput.value.toLowerCase();
              const filtered = books.filter(b =>
                b.title.toLowerCase().includes(query) ||
                b.author.toLowerCase().includes(query)
              );
              renderBooks(booksContainer, filtered);
            });
          }
        });
    }
  
    function renderBooks(container, books) {
      container.innerHTML = "";
      books.forEach(book => {
        const box = document.createElement("div");
        box.className = "col-md-3 book-box";
        const cartItem = cart.find(item => item.book.title === book.title);
        const quantity = cartItem ? cartItem.quantity : 0;
  
        box.innerHTML = `
          <small class="text-muted">Title:</small>
          <h3 class="book-title">${book.title}</h3>
          <p><strong>Author:</strong> ${book.author}</p>
          <p><strong>Publisher:</strong> ${book.publisher}</p>
          <p><strong>ISBN:</strong> ${book.isbn}</p>
          <div class="d-flex justify-content-between align-items-end">
            <div>
              <small class="text-muted">Rate:</small>
              <p class="book-price">₹${book.price}</p>
            </div>
            ${book.thumbnail ? `<img src="${book.thumbnail}" alt="${book.title} thumbnail" class="book-thumbnail">` : ''}
          </div>
          <div class="quantity-controls">
            <button class="btn btn-secondary btn-sm minus-btn">-</button>
            <span class="quantity">${quantity}</span>
            <button class="btn btn-secondary btn-sm plus-btn">+</button>
          </div>
        `;
        container.appendChild(box);
  
        // Quantity control handlers
        const minusBtn = box.querySelector(".minus-btn");
        const plusBtn = box.querySelector(".plus-btn");
        const quantitySpan = box.querySelector(".quantity");
  
        minusBtn.addEventListener("click", () => {
          let quantity = parseInt(quantitySpan.textContent);
          if (quantity > 0) {
            quantity--;
            quantitySpan.textContent = quantity;
            updateCart(book, quantity);
          }
        });
  
        plusBtn.addEventListener("click", () => {
          let quantity = parseInt(quantitySpan.textContent);
          quantity++;
          quantitySpan.textContent = quantity;
          updateCart(book, quantity);
        });
      });
    }
  
    function updateCart(book, quantity) {
      const cartItem = cart.find(item => item.book.title === book.title);
      if (cartItem) {
        if (quantity === 0) {
          cart = cart.filter(item => item.book.title !== book.title);
        } else {
          cartItem.quantity = quantity;
        }
      } else if (quantity > 0) {
        cart.push({ book, quantity });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartIcon();
    }
  
    function updateCartModal() {
      const cartItems = document.getElementById("cartItems");
      if (cartItems) {
        cartItems.innerHTML = "";
        let total = 0;
  
        cart.forEach(item => {
          const itemTotal = item.book.price * item.quantity;
          total += itemTotal;
          const li = document.createElement("li");
          li.className = "list-group-item";
          li.textContent = `${item.book.title} - ₹${item.book.price} x ${item.quantity} = ₹${itemTotal}`;
          cartItems.appendChild(li);
        });
  
        // Add total price if cart has items
        if (cart.length > 0) {
          const totalLi = document.createElement("li");
          totalLi.className = "list-group-item active";
          totalLi.textContent = `Total: ₹${total}`;
          cartItems.appendChild(totalLi);
        }
      }
    }
  
    function sendWhatsAppMessage() {
      const items = cart.map(item => 
        `${item.book.title} - ₹${item.book.price} x ${item.quantity} = ₹${item.book.price * item.quantity}`
      );
      const total = cart.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
      const message = `Order Details:\n\n${items.join('\n')}\n\nTotal: ₹${total}`;
  
      // Copy to clipboard silently
      navigator.clipboard.writeText(message)
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
  
      // Open WhatsApp
      window.open(`https://wa.me/919884316268?text=${encodeURIComponent(message)}`, "_blank");
  
      // Clear the cart
      cart = [];
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartIcon();
      updateCartModal();
    }
  });