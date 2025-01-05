document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const categoryParam = params.get("category");
  const booksContainer = document.getElementById("booksContainer");
  const searchInput = document.getElementById("searchInput");

  if (booksContainer && categoryParam) {
    fetch("books.json")
      .then(res => res.json())
      .then(data => {
        let books =
          categoryParam === "All Books"
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
});

function renderBooks(container, books) {
  container.innerHTML = "";
  books.forEach(b => {
    const box = document.createElement("div");
    box.className = "col-md-3 book-box";
    box.innerHTML = `
      <h3 class="book-title">${b.title}</h3>
      <p><strong>Author:</strong> ${b.author}</p>
      <p><strong>Publisher:</strong> ${b.publisher}</p>
      <p><strong>ISBN:</strong> ${b.isbn}</p>
      <div class="d-flex justify-content-between align-items-end">
        <p class="book-price">₹${b.price}</p>
        ${b.thumbnail ? `<img src="${b.thumbnail}" alt="${b.title} thumbnail" class="book-thumbnail">` : ''}
      </div>
    `;
    container.appendChild(box);
  });
}