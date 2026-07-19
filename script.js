/* Sabyx Labs — shared site behavior */
(function () {
  "use strict";

  /* ---------- Theme (light/dark) ---------- */
  var root = document.documentElement;
  var THEME_KEY = "sabyx-theme";
  function applyTheme(t) {
    if (t === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
  }
  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) { saved = null; }
  if (saved) applyTheme(saved);
  else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme("dark");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var isDark = root.getAttribute("data-theme") === "dark";
        var next = isDark ? "light" : "dark";
        applyTheme(next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      });
    }

    /* ---------- Sticky nav ---------- */
    var nav = document.querySelector(".nav");
    function onScroll() {
      if (!nav) return;
      if (window.scrollY > 12) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");

      var backTop = document.querySelector(".back-to-top");
      if (backTop) {
        if (window.scrollY > 640) backTop.classList.add("show");
        else backTop.classList.remove("show");
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ---------- Mobile nav toggle ---------- */
    var navToggle = document.querySelector(".nav-toggle");
    var navLinks = document.querySelector(".nav-links");
    if (navToggle && navLinks) {
      navToggle.addEventListener("click", function () {
        var open = navLinks.classList.toggle("is-open");
        navToggle.classList.toggle("is-open", open);
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      navLinks.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          navLinks.classList.remove("is-open");
          navToggle.classList.remove("is-open");
          navToggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    /* ---------- Active nav link ---------- */
    var current = (window.location.pathname.split("/").pop() || "index.html");
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === current || (current === "" && href === "index.html")) {
        a.classList.add("active");
      }
    });

    /* ---------- Back to top ---------- */
    var backTop = document.querySelector(".back-to-top");
    if (backTop) {
      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    /* ---------- Scroll reveal ---------- */
    var revealEls = document.querySelectorAll("[data-reveal]");
    if ("IntersectionObserver" in window && revealEls.length) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
      );
      revealEls.forEach(function (el, i) {
        el.style.setProperty("--i", i % 8);
        io.observe(el);
      });
    } else {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }

    /* ---------- Animated counters ---------- */
    var counters = document.querySelectorAll("[data-counter]");
    function animateCounter(el) {
      var target = parseFloat(el.getAttribute("data-counter"));
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1400;
      var startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(target * eased);
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(step);
    }
    if ("IntersectionObserver" in window && counters.length) {
      var cio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              cio.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(animateCounter);
    }

    /* ---------- Portfolio filter ---------- */
    var filterBtns = document.querySelectorAll(".filter-btn");
    var projectCards = document.querySelectorAll(".portfolio-grid .project-card");
    if (filterBtns.length && projectCards.length) {
      filterBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          filterBtns.forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          var filter = btn.getAttribute("data-filter");
          projectCards.forEach(function (card) {
            var cats = (card.getAttribute("data-category") || "").split(" ");
            if (filter === "all" || cats.indexOf(filter) !== -1) {
              card.classList.remove("hide");
            } else {
              card.classList.add("hide");
            }
          });
        });
      });
    }

    /* ---------- FAQ accordion ---------- */
    document.querySelectorAll(".faq-item").forEach(function (item) {
      var q = item.querySelector(".faq-q");
      var a = item.querySelector(".faq-a");
      if (!q || !a) return;
      q.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");
        document.querySelectorAll(".faq-item.open").forEach(function (other) {
          if (other !== item) {
            other.classList.remove("open");
            other.querySelector(".faq-a").style.maxHeight = null;
          }
        });
        if (isOpen) {
          item.classList.remove("open");
          a.style.maxHeight = null;
        } else {
          item.classList.add("open");
          a.style.maxHeight = a.scrollHeight + "px";
        }
      });
    });

    /* ---------- Contact form validation (front-end only, no backend) ---------- */
    var form = document.querySelector("#contact-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var valid = true;
        var fields = form.querySelectorAll("[data-required]");
        fields.forEach(function (field) {
          var wrap = field.closest(".field");
          var value = field.value.trim();
          var ok = value.length > 0;
          if (field.type === "email" && ok) {
            ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          }
          if (wrap) wrap.classList.toggle("has-error", !ok);
          if (!ok) valid = false;
        });
        var successMsg = document.querySelector(".form-success");
        if (valid) {
          if (successMsg) successMsg.classList.add("show");
          form.reset();
          if (successMsg) {
            setTimeout(function () { successMsg.classList.remove("show"); }, 6000);
          }
        } else if (successMsg) {
          successMsg.classList.remove("show");
        }
      });
    }

    /* ---------- Newsletter form (front-end only) ---------- */
    var newsletterForms = document.querySelectorAll(".newsletter-form");
    newsletterForms.forEach(function (nf) {
      nf.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = nf.querySelector("input");
        var note = nf.parentElement.querySelector(".newsletter-note");
        if (input && input.value.trim()) {
          if (note) {
            var original = note.textContent;
            note.textContent = "Thanks — you're subscribed.";
            input.value = "";
            setTimeout(function () { note.textContent = original; }, 5000);
          }
        }
      });
    });
  });
})();
