const $ = (selector, parent = document) => parent.querySelector(selector);

const $$ = (selector, parent = document) => [
  ...parent.querySelectorAll(selector),
];

const formatMoney = (amount) => `₦${amount.toLocaleString("en-NG")}`;

const menuToggle = $("#menuToggle");
const mobileNav = $("#mobileNav");

menuToggle.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", isOpen);

  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

$$(".mobile-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileNav.classList.remove("open");

    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.setAttribute("aria-label", "Open menu");
  });
});

/* =========================================
   DARK / LIGHT MODE
========================================= */

const themeToggle = $("#themeToggle");

const savedTheme = localStorage.getItem("eatmore-theme");

if (savedTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");

  themeToggle.textContent = "☾";
} else {
  themeToggle.textContent = "☼";
}

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";

  if (isDark) {
    document.documentElement.removeAttribute("data-theme");

    localStorage.setItem("eatmore-theme", "light");

    themeToggle.textContent = "☼";
  } else {
    document.documentElement.setAttribute("data-theme", "dark");

    localStorage.setItem("eatmore-theme", "dark");

    themeToggle.textContent = "☾";
  }
});

/* =========================================
   MENU FILTER
========================================= */

const menuTabs = $$(".menu-tab");

const menuCards = $$(".menu-card");

menuTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    menuTabs.forEach((button) => {
      button.classList.remove("active");
    });

    tab.classList.add("active");

    const filter = tab.dataset.filter;

    menuCards.forEach((card) => {
      if (filter === "all" || card.dataset.category === filter) {
        card.hidden = false;
      } else {
        card.hidden = true;
      }
    });
  });
});

/* =========================================
   CART
========================================= */

let cart = JSON.parse(localStorage.getItem("eatmore-cart")) || [];

const cartDrawer = $("#cartDrawer");

const drawerOverlay = $("#drawerOverlay");

const cartItems = $("#cartItems");

const cartCount = $("#cartCount");

const cartTotal = $("#cartTotal");

/* -----------------------------------------
   SAVE CART
----------------------------------------- */

function saveCart() {
  localStorage.setItem("eatmore-cart", JSON.stringify(cart));

  renderCart();
}

/* -----------------------------------------
   RENDER CART
----------------------------------------- */

function renderCart() {
  const quantity = cart.reduce((total, item) => total + item.quantity, 0);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = quantity;

  cartTotal.textContent = formatMoney(total);

  if (cart.length === 0) {
    cartItems.innerHTML = `

            <div class="empty-cart">

                <span>🛒</span>

                <p>
                    Your cart is empty.
                </p>

                <small>
                    Add something delicious
                    from the menu.
                </small>

            </div>

        `;

    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item, index) => `

            <div class="cart-row">

                <div>

                    <strong>
                        ${item.name}
                    </strong>

                    <small>
                        ${item.quantity}
                        ×
                        ${formatMoney(item.price)}
                    </small>

                    <button
                        class="remove-item"
                        data-index="${index}"
                    >
                        Remove
                    </button>

                </div>

                <strong>
                    ${formatMoney(item.price * item.quantity)}
                </strong>

            </div>

        `,
    )
    .join("");

  $$(".remove-item").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);

      cart.splice(index, 1);

      saveCart();

      showToast("Item removed from cart.");
    });
  });
}

/* -----------------------------------------
   OPEN CART
----------------------------------------- */

function openCart() {
  cartDrawer.classList.add("open");

  drawerOverlay.classList.add("open");

  cartDrawer.setAttribute("aria-hidden", "false");
}

/* -----------------------------------------
   CLOSE CART
----------------------------------------- */

function closeCart() {
  cartDrawer.classList.remove("open");

  drawerOverlay.classList.remove("open");

  cartDrawer.setAttribute("aria-hidden", "true");
}

/* -----------------------------------------
   CART BUTTONS
----------------------------------------- */

$("#cartButton").addEventListener("click", openCart);

$("#closeCart").addEventListener("click", closeCart);

drawerOverlay.addEventListener("click", closeCart);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
  }
});

/* =======s==================================
   ADD TO CART
========================================= */

$$(".add-button").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.name;

    const price = Number(button.dataset.price);

    const existing = cart.find((item) => item.name === name);

    if (existing) {
      existing.quantity++;
    } else {
      cart.push({
        name,
        price,

        quantity: 1,
      });
    }

    saveCart();

    showToast(`${name} added to cart.`);

    openCart();
  });
});

/* =========================================
   CHECKOUT
========================================= */

$("#checkoutButton").addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Add an item before checkout.");

    return;
  }

  showToast("Checkout is ready to connect to your payment provider.");
});

/* =========================================
   FAQ ACCORDION
========================================= */

$$(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.parentElement;

    const isOpen = item.classList.toggle("open");

    button.setAttribute("aria-expanded", isOpen);
  });
});

/* =========================================
   NEWSLETTER
========================================= */

$("#newsletterForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const email = $("#email");

  if (!email.checkValidity()) {
    email.reportValidity();

    return;
  }

  email.value = "";

  showToast("You're on the list — welcome!");
});

/* =========================================
   TOAST
========================================= */

function showToast(message) {
  const toast = $("#toast");

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

/* =========================================
   SCROLL REVEAL
========================================= */

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");

        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
  },
);

$$(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

/* =========================================
   ACTIVE NAVIGATION
========================================= */

const sections = $$("main section[id]");

const navLinks = $$(".desktop-nav a");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle(
            "active",

            link.getAttribute("href") === `#${entry.target.id}`,
          );
        });
      }
    });
  },
  {
    rootMargin: "-40% 0px -50% 0px",
  },
);

sections.forEach((section) => {
  sectionObserver.observe(section);
});

/* =========================================
   INITIAL CART
========================================= */

renderCart();
