/* BYD Recovery — interactions */
(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("navlinks");
  const year = document.getElementById("year");

  const savedTheme = (() => {
    try { return localStorage.getItem("byd-theme"); } catch (_) { return null; }
  })();

  const applyTheme = (theme, save = false) => {
    root.dataset.theme = theme;
    if (themeToggle) themeToggle.setAttribute("aria-pressed", theme === "dark");
    if (save) {
      try { localStorage.setItem("byd-theme", theme); } catch (_) {}
    }
  };

  applyTheme(savedTheme || root.dataset.theme || "light");

  themeToggle?.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
  });

  const closeMenu = () => {
    nav?.classList.remove("open");
    menuBtn?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  menuBtn?.addEventListener("click", () => {
    const open = nav?.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(Boolean(open)));
    document.body.classList.toggle("menu-open", Boolean(open));
  });

  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));

  document.addEventListener("click", event => {
    if (nav?.classList.contains("open") &&
        !nav.contains(event.target) &&
        !menuBtn.contains(event.target)) closeMenu();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  if (year) year.textContent = new Date().getFullYear();

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px" });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // Client-side protection/feedback for the quote form.
  const form = document.getElementById("quoteForm");
  const status = document.getElementById("formStatus");

  form?.addEventListener("submit", async event => {
    const honeypot = form.querySelector('[name="website"]');
    if (honeypot?.value.trim()) {
      event.preventDefault();
      return;
    }

    // Let native HTML validation handle missing required fields.
    if (!form.checkValidity()) return;

    // The form provider accepts normal POST requests. We submit with fetch so
    // visitors stay on the page and receive clear feedback.
    event.preventDefault();
    const button = form.querySelector("button[type=submit]");
    const original = button.innerHTML;
    button.disabled = true;
    button.innerHTML = "Sending…";
    status.className = "form-status show";
    status.textContent = "Sending your enquiry…";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error("Submission failed");
      form.reset();
      status.textContent = "Thanks — your enquiry has been sent. For urgent assistance, please call 07354 278990.";
    } catch (_) {
      status.className = "form-status show error";
      status.textContent = "We couldn't confirm the online submission. Please call 07354 278990 for urgent help.";
    } finally {
      button.disabled = false;
      button.innerHTML = original;
    }
  });
})();
