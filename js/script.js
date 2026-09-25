document.addEventListener("DOMContentLoaded", function () {
  const cartKey = "ramshiRentalsCart";
  const usersKey = "ramshiUsers";
  const loggedInKey = "ramshiLoggedInUser";

  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      navLinks.classList.toggle("open");
      const expanded = navLinks.classList.contains("open");
      navToggle.setAttribute("aria-expanded", String(expanded));
    });
  }

  document.querySelectorAll(".rent-button").forEach(function (button) {
    button.addEventListener("click", function () {
      const card = button.closest(".rental-card");

      if (!card) {
        return;
      }

      const item = {
        name: card.querySelector(".rental-name")?.textContent.trim() || "Rental",
        category: card.querySelector(".rental-category")?.textContent.trim() || "General",
        price: card.querySelector(".rental-price")?.textContent.trim() || "₹0/day",
        image: card.querySelector("img")?.src || ""
      };

      const currentCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
      const duplicate = currentCart.find(function (entry) {
        return entry.name === item.name && entry.category === item.category;
      });

      if (!duplicate) {
        currentCart.push(item);
        localStorage.setItem(cartKey, JSON.stringify(currentCart));
      }

      window.location.href = "booking.html";
    });
  });

  const cards = Array.from(document.querySelectorAll(".rental-card"));
  const searchInput = document.getElementById("rental-search");
  const categoryFilter = document.getElementById("category-filter");
  const sortSelect = document.getElementById("sort-select");

  function parsePrice(value) {
    if (!value) {
      return 0;
    }

    const cleaned = value.replace(/[₹,/day\s]/g, "");
    return Number(cleaned) || 0;
  }

  function applyCatalogFilters() {
    if (!cards.length) {
      return;
    }

    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const selectedCategory = categoryFilter ? categoryFilter.value : "all";

    let filteredCards = cards.filter(function (card) {
      const name = card.querySelector(".rental-name")?.textContent.toLowerCase() || "";
      const category = card.querySelector(".rental-category")?.textContent.toLowerCase() || "";
      const matchesSearch = !searchValue || name.includes(searchValue) || category.includes(searchValue);
      const matchesCategory = selectedCategory === "all" || category.includes(selectedCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });

    if (sortSelect && sortSelect.value) {
      filteredCards.sort(function (a, b) {
        const priceA = parsePrice(a.querySelector(".rental-price")?.textContent || "₹0/day");
        const priceB = parsePrice(b.querySelector(".rental-price")?.textContent || "₹0/day");
        const nameA = a.querySelector(".rental-name")?.textContent || "";
        const nameB = b.querySelector(".rental-name")?.textContent || "";

        if (sortSelect.value === "price-low") {
          return priceA - priceB;
        }

        if (sortSelect.value === "price-high") {
          return priceB - priceA;
        }

        return nameA.localeCompare(nameB);
      });
    }

    cards.forEach(function (card) {
      card.style.display = "none";
    });

    filteredCards.forEach(function (card) {
      card.style.display = "flex";
    });

    const catalogGrid = document.querySelector(".rental-grid");
    if (catalogGrid && filteredCards.length) {
      filteredCards.forEach(function (card) {
        catalogGrid.appendChild(card);
      });
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyCatalogFilters);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", applyCatalogFilters);
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", applyCatalogFilters);
  }

  function renderCart() {
    const cartItems = document.getElementById("cart-items");
    const emptyState = document.getElementById("cart-empty");

    if (!cartItems) {
      return;
    }

    const items = JSON.parse(localStorage.getItem(cartKey) || "[]");

    cartItems.innerHTML = "";

    if (!items.length) {
      if (emptyState) {
        emptyState.classList.remove("hidden");
      }
      return;
    }

    if (emptyState) {
      emptyState.classList.add("hidden");
    }

    items.forEach(function (item, index) {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p>${item.category}</p>
          <p>${item.price}</p>
        </div>
        <div class="cart-date">Selected dates</div>
        <button type="button" class="remove-item" data-index="${index}">Remove</button>
      `;
      cartItems.appendChild(row);
    });

    document.querySelectorAll(".remove-item").forEach(function (button) {
      button.addEventListener("click", function () {
        const idx = Number(button.dataset.index);
        const savedItems = JSON.parse(localStorage.getItem(cartKey) || "[]");
        savedItems.splice(idx, 1);
        localStorage.setItem(cartKey, JSON.stringify(savedItems));
        renderCart();
      });
    });
  }

  const clearCartButton = document.getElementById("clear-cart");
  if (clearCartButton) {
    clearCartButton.addEventListener("click", function () {
      localStorage.setItem(cartKey, JSON.stringify([]));
      renderCart();
    });
  }

  if (document.body.dataset.page === "account") {
    const signUpForm = document.getElementById("sign-up-form");
    const signInForm = document.getElementById("sign-in-form");
    const signOutButton = document.getElementById("sign-out");
    const welcomeBlock = document.getElementById("welcome-user");
    const accountSection = document.getElementById("account-section");
    const accountActions = document.getElementById("account-actions");
    const accountMessage = document.getElementById("account-message");

    function setAccountMessage(message, type) {
      if (!accountMessage) {
        return;
      }

      accountMessage.textContent = message;
      accountMessage.className = "account-message " + type;
    }

    function updateLoggedInState(userName) {
      const userPanel = document.getElementById("user-panel");
      const welcomeMessage = document.getElementById("welcome-message");

      if (userPanel) {
        userPanel.classList.remove("hidden");
      }

      if (welcomeMessage) {
        welcomeMessage.textContent = "Welcome back, " + userName;
      }

      if (welcomeBlock) {
        welcomeBlock.classList.remove("hidden");
        welcomeBlock.textContent = "Welcome back, " + userName;
      }

      if (accountSection) {
        accountSection.classList.remove("hidden");
      }

      if (accountActions) {
        accountActions.classList.remove("hidden");
      }
    }

    function loadUserState() {
      const currentUser = JSON.parse(localStorage.getItem(loggedInKey) || "null");

      if (currentUser && currentUser.name) {
        updateLoggedInState(currentUser.name);
      }
    }

    if (signUpForm) {
      signUpForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const fullName = document.getElementById("signup-name").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const phone = document.getElementById("signup-phone").value.trim();
        const password = document.getElementById("signup-password").value;
        const confirmPassword = document.getElementById("signup-confirm").value;

        const users = JSON.parse(localStorage.getItem(usersKey) || "[]");

        if (password !== confirmPassword) {
          setAccountMessage("Passwords do not match.", "error");
          return;
        }

        const existingUser = users.find(function (user) {
          return user.email.toLowerCase() === email.toLowerCase();
        });

        if (existingUser) {
          setAccountMessage("An account with this email already exists.", "error");
          return;
        }

        users.push({
          name: fullName,
          email: email,
          phone: phone,
          password: password
        });

        localStorage.setItem(usersKey, JSON.stringify(users));
        localStorage.setItem(loggedInKey, JSON.stringify({ name: fullName, email: email }));
        signUpForm.reset();
        setAccountMessage("Account created successfully.", "success");
        updateLoggedInState(fullName);
      });
    }

    if (signInForm) {
      signInForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("signin-email").value.trim();
        const password = document.getElementById("signin-password").value;
        const users = JSON.parse(localStorage.getItem(usersKey) || "[]");
        const user = users.find(function (entry) {
          return entry.email.toLowerCase() === email.toLowerCase() && entry.password === password;
        });

        if (!user) {
          setAccountMessage("Invalid email or password.", "error");
          return;
        }

        localStorage.setItem(loggedInKey, JSON.stringify({ name: user.name, email: user.email }));
        setAccountMessage("Welcome back, " + user.name + ".", "success");
        updateLoggedInState(user.name);
      });
    }

    if (signOutButton) {
      signOutButton.addEventListener("click", function () {
        localStorage.removeItem(loggedInKey);
        if (welcomeBlock) {
          welcomeBlock.classList.add("hidden");
        }
        if (accountSection) {
          accountSection.classList.add("hidden");
        }
        if (accountActions) {
          accountActions.classList.add("hidden");
        }
        setAccountMessage("You have been signed out.", "success");
      });
    }

    loadUserState();
    renderCart();
  }

  if (document.body.dataset.page === "booking") {
    const bookingForm = document.getElementById("booking-form");
    const successCard = document.getElementById("booking-success");
    const rentalItemSelect = document.getElementById("rental-item");

    const cartItems = JSON.parse(localStorage.getItem(cartKey) || "[]");
    if (rentalItemSelect && cartItems.length && rentalItemSelect.options.length) {
      const lastItem = cartItems[cartItems.length - 1];
      let found = false;

      Array.from(rentalItemSelect.options).forEach(function (option) {
        if (option.value === lastItem.name) {
          option.selected = true;
          found = true;
        }
      });

      if (!found) {
        const option = new Option(lastItem.name, lastItem.name);
        option.dataset.price = lastItem.price;
        rentalItemSelect.add(option);
        rentalItemSelect.value = lastItem.name;
      }
    }

    function showFieldError(fieldId, message) {
      const field = document.getElementById(fieldId);
      const hint = document.getElementById(fieldId + "-error");

      if (field) {
        field.classList.add("field-error");
      }

      if (hint) {
        hint.textContent = message;
        hint.classList.add("visible");
      }
    }

    function clearFieldError(fieldId) {
      const field = document.getElementById(fieldId);
      const hint = document.getElementById(fieldId + "-error");

      if (field) {
        field.classList.remove("field-error");
      }

      if (hint) {
        hint.textContent = "";
        hint.classList.remove("visible");
      }
    }

    function getTotalCost() {
      const itemName = rentalItemSelect ? rentalItemSelect.value : "";
      const selectedOption = rentalItemSelect ? rentalItemSelect.options[rentalItemSelect.selectedIndex] : null;
      const selectedPriceText = selectedOption ? selectedOption.dataset.price || "₹1200/day" : "₹1200/day";
      const rentalPrice = parsePrice(selectedPriceText);
      const startDate = document.getElementById("start-date");
      const endDate = document.getElementById("end-date");

      if (!startDate || !endDate || !startDate.value || !endDate.value) {
        return 0;
      }

      const start = new Date(startDate.value);
      const end = new Date(endDate.value);
      const dayDifference = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const rentalDays = Math.max(1, dayDifference + 1);
      const total = rentalPrice * rentalDays;

      if (itemName) {
        document.getElementById("booking-total").textContent = "₹" + total.toLocaleString("en-IN");
      }

      return total;
    }

    ["full-name", "phone", "email", "rental-item", "start-date", "end-date", "pickup-location"].forEach(function (fieldId) {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener("input", function () {
          clearFieldError(fieldId);
          if (fieldId === "start-date" || fieldId === "end-date") {
            getTotalCost();
          }
        });
      }
    });

    if (bookingForm) {
      bookingForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const requiredFields = [
          { id: "full-name", label: "Full Name" },
          { id: "phone", label: "Phone" },
          { id: "email", label: "Email" },
          { id: "rental-item", label: "Rental Item" },
          { id: "start-date", label: "Start Date" },
          { id: "end-date", label: "End Date" },
          { id: "pickup-location", label: "Pickup Location" }
        ];

        let hasError = false;

        requiredFields.forEach(function (field) {
          const input = document.getElementById(field.id);
          if (!input || !input.value.trim()) {
            showFieldError(field.id, field.label + " is required.");
            hasError = true;
          } else {
            clearFieldError(field.id);
          }
        });

        const phoneField = document.getElementById("phone");
        if (phoneField && phoneField.value.trim() && !/^\+?[0-9\s-]{10,15}$/.test(phoneField.value.trim())) {
          showFieldError("phone", "Enter a valid phone number.");
          hasError = true;
        }

        const emailField = document.getElementById("email");
        if (emailField && emailField.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim())) {
          showFieldError("email", "Enter a valid email address.");
          hasError = true;
        }

        const startDate = document.getElementById("start-date");
        const endDate = document.getElementById("end-date");

        if (startDate && startDate.value && endDate && endDate.value) {
          const start = new Date(startDate.value);
          const end = new Date(endDate.value);

          if (start > end) {
            showFieldError("end-date", "End date cannot be before start date.");
            hasError = true;
          }
        }

        if (hasError) {
          return;
        }

        const selectedItemName = rentalItemSelect ? rentalItemSelect.value : "Rental";
        const customerName = document.getElementById("full-name").value.trim();
        const total = getTotalCost();
        const startValue = new Date(startDate.value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        const endValue = new Date(endDate.value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        const bookingId = "RM" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + String(Math.floor(Math.random() * 100) + 1).padStart(2, "0");

        if (successCard) {
          document.getElementById("success-booking-id").textContent = bookingId;
          document.getElementById("success-rental-name").textContent = selectedItemName;
          document.getElementById("success-customer-name").textContent = customerName;
          document.getElementById("success-date-range").textContent = startValue + " - " + endValue;
          document.getElementById("success-total").textContent = "₹" + total.toLocaleString("en-IN");
          successCard.classList.add("visible");
        }

        bookingForm.classList.add("hidden");
      });
    }
  }

  if (document.body.dataset.page === "contact") {
    const contactForm = document.getElementById("contact-form");
    const contactMessage = document.getElementById("contact-message");

    if (contactForm) {
      contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("contact-name");
        const email = document.getElementById("contact-email");
        const subject = document.getElementById("contact-subject");
        const message = document.getElementById("contact-message-text");

        let valid = true;
        const fields = [name, email, subject, message];

        fields.forEach(function (field) {
          if (!field.value.trim()) {
            field.classList.add("field-error");
            valid = false;
          } else {
            field.classList.remove("field-error");
          }
        });

        if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
          email.classList.add("field-error");
          valid = false;
        }

        if (!valid) {
          if (contactMessage) {
            contactMessage.textContent = "Please complete all required fields correctly.";
            contactMessage.className = "contact-message error";
          }
          return;
        }

        if (contactMessage) {
          contactMessage.textContent = "Thank you! Your message has been sent successfully.";
          contactMessage.className = "contact-message success";
        }

        contactForm.reset();
      });
    }
  }

  if (document.body.dataset.page === "home") {
    renderCart();
  }
});
