/* ═══════════════════════════════════════════════════════════════════════════
   OOMS MEDIA — interactions
   nav · mobile menu · reveal · counters · compare slider · parallax ·
   hero spotlight · scroll progress · whatsapp float · strategy form
   ═══════════════════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ── Navbar glass on scroll + scroll progress ─────────────────────────── */
  const nav = $("#nav");
  const progress = $("#scrollProgress");
  const waFloat = $("#waFloat");

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 24);
    if (waFloat) waFloat.classList.toggle("show", y > 600);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── Mobile menu ──────────────────────────────────────────────────────── */
  const burger = $("#navBurger");
  const menu = $("#mobileMenu");
  const setMenu = (open) => {
    burger.classList.toggle("open", open);
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Menu sluiten" : "Menu openen");
    menu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(!burger.classList.contains("open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("open")) setMenu(false);
  });
  window.matchMedia("(min-width: 921px)").addEventListener("change", (e) => {
    if (e.matches) setMenu(false);
  });

  /* ── Scroll reveal ────────────────────────────────────────────────────── */
  const revealEls = $$("[data-reveal]");
  if (reduced) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ── Animated counters ────────────────────────────────────────────────── */
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (reduced || target === 0) { el.textContent = String(target); return; }
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { runCounter(entry.target); counterIO.unobserve(entry.target); }
      });
    },
    { threshold: 0.6 }
  );
  $$("[data-count]").forEach((el) => counterIO.observe(el));

  /* ── Before / after comparison slider ─────────────────────────────────── */
  const compare = $("#compare");
  const handle = $("#compareHandle");
  if (compare && handle) {
    const frame = $(".compare__frame", compare);
    let pos = 50;
    const setPos = (value) => {
      pos = Math.min(94, Math.max(6, value));
      compare.style.setProperty("--pos", pos + "%");
      handle.setAttribute("aria-valuenow", String(Math.round(pos)));
    };
    const posFromEvent = (e) => {
      const rect = frame.getBoundingClientRect();
      setPos(((e.clientX - rect.left) / rect.width) * 100);
    };
    let dragging = false;
    frame.addEventListener("pointerdown", (e) => { dragging = true; frame.setPointerCapture(e.pointerId); posFromEvent(e); });
    frame.addEventListener("pointermove", (e) => { if (dragging) posFromEvent(e); });
    const stop = () => (dragging = false);
    frame.addEventListener("pointerup", stop);
    frame.addEventListener("pointercancel", stop);
    handle.addEventListener("keydown", (e) => {
      const step = e.shiftKey ? 10 : 4;
      if (e.key === "ArrowLeft") { setPos(pos - step); e.preventDefault(); }
      else if (e.key === "ArrowRight") { setPos(pos + step); e.preventDefault(); }
    });
    if (!reduced) {
      const nudgeIO = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        nudgeIO.disconnect();
        let t = 0;
        const nudge = () => {
          t += 1 / 60;
          if (dragging || t > 1.6) return;
          setPos(50 + Math.sin(t * Math.PI) * 8);
          requestAnimationFrame(nudge);
        };
        setTimeout(() => requestAnimationFrame(nudge), 550);
      }, { threshold: 0.5 });
      nudgeIO.observe(compare);
    }
  }

  /* ── Card cursor spotlight ────────────────────────────────────────────── */
  if (finePointer) {
    $$(".card, .goal").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }

  /* ── Hero parallax + spotlight ────────────────────────────────────────── */
  const hero = $("#hero");
  const parallaxEls = $$("[data-parallax]");
  if (hero && finePointer && !reduced) {
    let raf = null;
    window.addEventListener("pointermove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const dx = e.clientX / window.innerWidth - 0.5;
        const dy = e.clientY / window.innerHeight - 0.5;
        parallaxEls.forEach((el) => {
          const depth = parseFloat(el.dataset.parallax) || 10;
          el.style.setProperty("--px", (-dx * depth).toFixed(1) + "px");
          el.style.setProperty("--py", (-dy * depth).toFixed(1) + "px");
        });
        const r = hero.getBoundingClientRect();
        if (e.clientY > r.top && e.clientY < r.bottom) {
          hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
          hero.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
        }
        raf = null;
      });
    }, { passive: true });
  }

  /* ── Strategy / goals form ────────────────────────────────────────────── */
  const form = $("#goalForm");
  if (form) {
    const goals = $$(".goal", form);
    const panel = $("#goalPanel");
    const countNum = $("#goalCountNum");
    const errorEl = $("#formError");
    const success = $("#goalSuccess");
    const emailBtn = $("#submitEmail");

    const selected = () => goals.filter((g) => g.getAttribute("aria-pressed") === "true").map((g) => g.dataset.goal);

    const refresh = () => {
      const sel = selected();
      countNum.textContent = String(sel.length);
      const open = sel.length > 0;
      panel.classList.toggle("is-open", open);
      panel.setAttribute("aria-hidden", String(!open));
    };

    goals.forEach((g) => {
      g.addEventListener("click", () => {
        g.setAttribute("aria-pressed", g.getAttribute("aria-pressed") === "true" ? "false" : "true");
        refresh();
      });
    });

    const fields = {
      name: $("#f-name"), business: $("#f-business"), email: $("#f-email"),
      phone: $("#f-phone"), current: $("#f-current"), notes: $("#f-notes"),
    };

    const validate = () => {
      let ok = true;
      let firstInvalid = null;
      const required = ["name", "business", "email"];
      required.forEach((key) => {
        const el = fields[key];
        const wrap = el.closest(".field");
        const valid = el.value.trim() !== "" && (key !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
        wrap.classList.toggle("is-invalid", !valid);
        if (!valid && !firstInvalid) firstInvalid = el;
        if (!valid) ok = false;
      });
      if (!ok) {
        errorEl.hidden = false;
        errorEl.textContent = "Vul je naam, bedrijfsnaam en een geldig e-mailadres in.";
        if (firstInvalid) firstInvalid.focus();
      } else {
        errorEl.hidden = true;
      }
      return ok;
    };

    const buildMessage = () => {
      const sel = selected();
      const lines = ["Nieuwe aanvraag via oomsmedia.nl", ""];
      if (sel.length) {
        lines.push("Doelen:");
        sel.forEach((s) => lines.push("• " + s));
        lines.push("");
      }
      lines.push("Naam: " + fields.name.value.trim());
      lines.push("Bedrijf: " + fields.business.value.trim());
      lines.push("E-mail: " + fields.email.value.trim());
      if (fields.phone.value.trim()) lines.push("Telefoon: " + fields.phone.value.trim());
      if (fields.current.value.trim()) lines.push("Huidige website: " + fields.current.value.trim());
      if (fields.notes.value.trim()) { lines.push(""); lines.push("Opmerkingen: " + fields.notes.value.trim()); }
      return lines.join("\n");
    };

    const showSuccess = () => {
      if (success) {
        panel.style.display = "none";
        $(".goalgrid", form).style.display = "none";
        $("#goalCount").style.display = "none";
        success.hidden = false;
        success.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      }
    };

    // WhatsApp submit (primary)
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate()) return;
      const url = "https://wa.me/31622576578?text=" + encodeURIComponent(buildMessage());
      window.open(url, "_blank", "noopener");
      showSuccess();
    });

    // Email submit (secondary)
    if (emailBtn) {
      emailBtn.addEventListener("click", () => {
        if (!validate()) return;
        const subject = "Aanvraag premium website — " + (fields.business.value.trim() || fields.name.value.trim());
        const url = "mailto:oomsmedianl@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(buildMessage());
        window.location.href = url;
        showSuccess();
      });
    }

    // clear invalid state on input
    Object.values(fields).forEach((el) =>
      el.addEventListener("input", () => el.closest(".field").classList.remove("is-invalid"))
    );

    refresh();
  }

  /* ── Footer year ──────────────────────────────────────────────────────── */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
