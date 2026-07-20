/* =========================================================
   Personal Portfolio — main.js
   - Loads all content from /data/*.json
   - Theme switching (dark / light), persisted to localStorage
   - Language switching (zh / en), persisted to localStorage
   - Renders every section dynamically
   ========================================================= */
(function () {
  "use strict";

  /* ---------------- Settings ---------------- */
  var LS_THEME = "portfolio-theme";
  var LS_LANG = "portfolio-lang";
  var DATA_FILES = {
    profile: "data/profile.json",
    skills: "data/skills.json",
    experience: "data/experience.json",
    certificates: "data/certificates.json",
    projects: "data/projects.json",
    ui: "data/ui-strings.json",
  };

  var state = {
    theme: localStorage.getItem(LS_THEME) || "dark",
    lang: localStorage.getItem(LS_LANG) || "zh",
    data: {},
  };

  /* ---------------- Helpers ---------------- */
  // Pick the right language string from a {zh, en} object
  function t(field) {
    if (field == null) return "";
    if (typeof field === "string") return field;
    return field[state.lang] || field.zh || field.en || "";
  }

  function el(id) { return document.getElementById(id); }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Supported social icons (Font Awesome)
  var ICON_MAP = {
    github: "fa-brands fa-github",
    email: "fa-solid fa-envelope",
    mail: "fa-solid fa-envelope",
    blog: "fa-solid fa-blog",
    link: "fa-solid fa-link",
    website: "fa-solid fa-globe",
    twitter: "fa-brands fa-x-twitter",
    x: "fa-brands fa-x-twitter",
    linkedin: "fa-brands fa-linkedin",
    wechat: "fa-brands fa-weixin",
    qq: "fa-brands fa-qq",
    phone: "fa-solid fa-phone",
    zhihu: "fa-brands fa-zhihu",
    bilibili: "fa-brands fa-bilibili",
  };
  function iconClass(name) {
    return ICON_MAP[(name || "").toLowerCase()] || "fa-solid fa-link";
  }

  /* ---------------- Theme ---------------- */
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    var icon = el("themeIcon");
    if (icon) {
      icon.className = state.theme === "dark"
        ? "fa-solid fa-moon"
        : "fa-solid fa-sun";
    }
  }
  function toggleTheme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem(LS_THEME, state.theme);
    applyTheme();
  }

  /* ---------------- Language ---------------- */
  function applyLang() {
    var label = el("langLabel");
    if (label) label.textContent = state.lang === "zh" ? "中" : "EN";
    document.documentElement.setAttribute("lang", state.lang);
    applyUiStrings();
    renderAll(); // re-render content in the new language
  }
  function toggleLang() {
    state.lang = state.lang === "zh" ? "en" : "zh";
    localStorage.setItem(LS_LANG, state.lang);
    applyLang();
  }

  // Apply static UI strings (nav, section titles, buttons, etc.)
  function applyUiStrings() {
    var ui = state.data.ui || {};
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      var keys = node.getAttribute("data-i18n").split(".");
      var val = ui;
      for (var i = 0; i < keys.length; i++) {
        val = val ? val[keys[i]] : undefined;
      }
      if (val && typeof val === "object") val = t(val);
      if (val != null) {
        if (node.tagName === "INPUT" || node.tagName === "TEXTAREA") {
          node.placeholder = val;
        } else {
          node.textContent = val;
        }
      }
    });
    // Logo text (derived from name or static)
    var name = state.data.profile ? t(state.data.profile.name) : "";
    var logo = el("logo");
    if (logo && name) logo.textContent = name;
  }

  /* ---------------- Data loading ---------------- */
  function loadJson(url) {
    return fetch(url, { cache: "no-cache" }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
      return res.json();
    });
  }

  function loadAll() {
    showStatus(true, "loading");
    var keys = Object.keys(DATA_FILES);
    var promises = keys.map(function (k) {
      return loadJson(DATA_FILES[k]).then(function (d) {
        state.data[k] = d;
      });
    });
    return Promise.all(promises)
      .then(function () {
        showStatus(false);
        applyTheme();
        applyLang();
        initInteractions();
      })
      .catch(function (err) {
        console.error(err);
        var msg = state.lang === "zh"
          ? "数据加载失败。请通过本地服务器（如 python -m http.server）打开，或部署到 GitHub / Gitee Pages。"
          : "Failed to load data. Please open via a local server (e.g. python -m http.server) or deploy to GitHub / Gitee Pages.";
        showStatus(true, "error", msg);
      });
  }

  function showStatus(show, type, customMsg) {
    var overlay = el("statusOverlay");
    var box = el("statusBox");
    if (!overlay) return;
    if (!show) { overlay.hidden = true; return; }
    overlay.hidden = false;
    if (customMsg) {
      box.textContent = customMsg;
    } else if (type === "error") {
      box.textContent = state.lang === "zh" ? "加载出错" : "Error";
    } else {
      box.textContent = state.lang === "zh" ? "加载中…" : "Loading…";
    }
  }

  /* ---------------- Renderers ---------------- */
  function renderAll() {
    renderHero();
    renderSkills();
    renderExperience();
    renderCertificates();
    renderProjects();
    renderContact();
    el("year").textContent = new Date().getFullYear();
    var fn = state.data.profile ? t(state.data.profile.name) : "";
    if (fn) el("footerName").textContent = fn;
    // Re-bind reveal animations after content is (re)rendered, otherwise
    // elements created on language toggle would stay invisible.
    setupRevealObserver();
  }

  function renderHero() {
    var p = state.data.profile;
    if (!p) return;
    el("heroName").textContent = t(p.name);
    el("heroTitle").textContent = t(p.title);
    el("heroTagline").textContent = t(p.tagline);
    el("heroIntro").textContent = t(p.intro);
    if (p.avatar) el("heroAvatar").src = p.avatar;
    el("logo").textContent = t(p.name) || "Portfolio";

    var resume = el("heroResume");
    if (p.resumeUrl) {
      resume.href = p.resumeUrl;
      resume.style.display = "";
      resume.textContent = state.data.ui
        ? t(state.data.ui.hero.ctaResume) : "Resume";
    } else {
      resume.style.display = "none";
    }

    // socials
    var wrap = el("heroSocials");
    wrap.innerHTML = (p.socials || [])
      .map(function (s) {
        return (
          '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener" title="' +
          escapeHtml(s.name) + '"><i class="' + iconClass(s.icon) + '"></i></a>'
        );
      })
      .join("");
  }

  function renderSkills() {
    var s = state.data.skills;
    if (!s) return;
    var grid = el("skillsGrid");
    grid.innerHTML = (s.categories || [])
      .map(function (cat) {
        var items = (cat.items || [])
          .map(function (it) {
            return (
              '<div class="skill-item">' +
              '<div class="skill-head"><span>' + escapeHtml(t(it.name)) +
              '</span><span class="skill-pct">' + (it.level || 0) + "%</span></div>" +
              '<div class="skill-bar"><div class="skill-fill" data-level="' +
              (it.level || 0) + '"></div></div></div>'
            );
          })
          .join("");
        return (
          '<div class="skill-card reveal"><h3>' + escapeHtml(t(cat.name)) +
          "</h3>" + items + "</div>"
        );
      })
      .join("");
  }

  function renderExperience() {
    var e = state.data.experience;
    if (!e) return;

    function timeline(items) {
      return (
        '<div class="timeline">' +
        (items || [])
          .map(function (it) {
            return (
              '<div class="timeline-item">' +
              '<div class="tl-period">' + escapeHtml(t(it.period)) + "</div>" +
              '<div class="tl-title">' + escapeHtml(t(it.title)) + "</div>" +
              '<div class="tl-company">' + escapeHtml(t(it.company)) + "</div>" +
              (it.description ? '<div class="tl-desc">' + escapeHtml(t(it.description)) + "</div>" : "") +
              "</div>"
            );
          })
          .join("") +
        "</div>"
      );
    }

    function achievements(items) {
      return (
        '<ul class="achievements-list">' +
        (items || [])
          .map(function (it) {
            return (
              '<li><span class="ach-label">' + escapeHtml(it.label || "") +
              "</span><br>" + escapeHtml(t(it.text)) + "</li>"
            );
          })
          .join("") +
        "</ul>"
      );
    }

    var panels =
      '<div class="tab-panel active" data-panel="work">' + timeline(e.work) + "</div>" +
      '<div class="tab-panel" data-panel="education">' + timeline(e.education) + "</div>" +
      '<div class="tab-panel" data-panel="achievements">' + achievements(e.achievements) + "</div>";

    el("expPanels").innerHTML = panels;
  }

  function renderCertificates() {
    var c = state.data.certificates;
    if (!c) return;
    el("certGrid").innerHTML = (c.items || [])
      .map(function (it) {
        return (
          '<div class="info-card reveal"><h3>' + escapeHtml(t(it.title)) + "</h3>" +
          (it.subtitle ? "<p>" + escapeHtml(t(it.subtitle)) + "</p>" : "") +
          (it.category ? '<span class="badge">' + escapeHtml(t(it.category)) + "</span>" : "") +
          "</div>"
        );
      })
      .join("");
  }

  function renderProjects() {
    var p = state.data.projects;
    if (!p) return;
    el("projGrid").innerHTML = (p.items || [])
      .map(function (it) {
        var tags = (it.tags || [])
          .map(function (tg) { return "<span>" + escapeHtml(tg) + "</span>"; })
          .join("");

        // Media — three cases, in priority order:
        //   1) video  -> <video> player (takes priority)
        //   2) images -> carousel / slider (multiple preview shots)
        //   3) image  -> single static image (backward compatible)
        var media;
        if (it.video) {
          var poster = it.image ? ' poster="' + escapeHtml(it.image) + '"' : "";
          media =
            '<video class="proj-media" controls preload="metadata" ' +
            'src="' + escapeHtml(it.video) + '"' + poster + "></video>";
        } else if (it.images && it.images.length) {
          var slides = it.images
            .map(function (src, i) {
              return (
                '<div class="carousel-slide"><img class="carousel-img" src="' +
                escapeHtml(src) + '" alt="' + escapeHtml(t(it.title)) + " " + (i + 1) + '"></div>'
              );
            })
            .join("");
          var dots = it.images
            .map(function (_, i) {
              return (
                '<button class="carousel-dot' + (i === 0 ? " active" : "") +
                '" data-go="' + i + '" aria-label="slide ' + (i + 1) + '"></button>'
              );
            })
            .join("");
          var multi = it.images.length > 1;
          media =
            '<div class="proj-carousel" data-index="0">' +
            '<div class="carousel-track">' + slides + "</div>" +
            (multi
              ? '<button class="carousel-btn prev" data-dir="-1" aria-label="previous"><i class="fa-solid fa-chevron-left"></i></button>' +
                '<button class="carousel-btn next" data-dir="1" aria-label="next"><i class="fa-solid fa-chevron-right"></i></button>' +
                '<div class="carousel-dots">' + dots + "</div>"
              : "") +
            "</div>";
        } else {
          media = it.image
            ? '<img class="proj-img" src="' + escapeHtml(it.image) + '" alt="' + escapeHtml(t(it.title)) + '">'
            : '<img class="proj-img" src="assets/project-1.svg" alt="">';
        }

        // Video cards are <div> (the player has its own controls and must
        // not trigger card navigation); the title links out when a URL exists.
        if (it.video) {
          var titleLink = it.link
            ? '<a href="' + escapeHtml(it.link) + '" target="_blank" rel="noopener">' +
              escapeHtml(t(it.title)) + "</a>"
            : escapeHtml(t(it.title));
          return (
            '<div class="project-card reveal">' + media +
            '<div class="proj-body"><h3>' + titleLink + "</h3>" +
            '<p>' + escapeHtml(t(it.description)) + "</p>" +
            '<div class="proj-tags">' + tags + "</div></div></div>"
          );
        }

        var href = it.link ? ' href="' + escapeHtml(it.link) + '" target="_blank" rel="noopener"' : "";
        return (
          '<a class="project-card reveal"' + href + ">" + media +
          '<div class="proj-body"><h3>' + escapeHtml(t(it.title)) + "</h3>" +
          '<p>' + escapeHtml(t(it.description)) + "</p>" +
          '<div class="proj-tags">' + tags + "</div></div></a>"
        );
      })
      .join("");
  }

  function renderContact() {
    var p = state.data.profile;
    var ui = state.data.ui;
    if (ui && ui.contact) {
      el("contactTitle").textContent = t(ui.contact.title);
      el("contactSub").textContent = t(ui.contact.subtitle);
      el("footerRights").textContent = t(ui.contact.rights);
    }
    var wrap = el("contactSocials");
    if (!wrap || !p || !p.socials) return;
    wrap.innerHTML = p.socials
      .map(function (s) {
        return (
          '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">' +
          '<i class="' + iconClass(s.icon) + '"></i>' + escapeHtml(s.name) + "</a>"
        );
      })
      .join("");
  }

  /* ---------------- Carousel ---------------- */
  // Bound once via event delegation on #projGrid, so it keeps working
  // after language toggles re-render the project cards.
  function carouselGo(carousel, index) {
    if (!carousel) return;
    var slides = carousel.querySelectorAll(".carousel-slide");
    var count = slides.length;
    if (count === 0) return;
    index = ((index % count) + count) % count; // wrap around
    carousel.setAttribute("data-index", String(index));
    var track = carousel.querySelector(".carousel-track");
    if (track) track.style.transform = "translateX(" + (-index * 100) + "%)";
    carousel.querySelectorAll(".carousel-dot").forEach(function (dot, i) {
      dot.classList.toggle("active", i === index);
    });
  }

  /* ---------------- Interactions ---------------- */
  function initInteractions() {
    if (state.inited) return; // guard against double-binding
    state.inited = true;
    el("themeBtn").addEventListener("click", toggleTheme);
    el("langBtn").addEventListener("click", toggleLang);

    // Project image carousels (event delegation on the grid container)
    var projGrid = el("projGrid");
    if (projGrid) {
      projGrid.addEventListener("click", function (e) {
        var btn = e.target.closest(".carousel-btn");
        if (btn) {
          var car = btn.closest(".proj-carousel");
          var dir = parseInt(btn.getAttribute("data-dir"), 10) || 0;
          carouselGo(car, (parseInt(car.getAttribute("data-index"), 10) || 0) + dir);
          return;
        }
        var dot = e.target.closest(".carousel-dot");
        if (dot) {
          carouselGo(dot.closest(".proj-carousel"), parseInt(dot.getAttribute("data-go"), 10) || 0);
        }
      });
      // Touch swipe for mobile
      var startX = null;
      projGrid.addEventListener("touchstart", function (e) {
        var car = e.target.closest(".proj-carousel");
        if (car) startX = e.touches[0].clientX;
      }, { passive: true });
      projGrid.addEventListener("touchend", function (e) {
        if (startX === null) return;
        var car = e.target.closest(".proj-carousel");
        if (car) {
          var dx = e.changedTouches[0].clientX - startX;
          if (Math.abs(dx) > 40) {
            carouselGo(car, (parseInt(car.getAttribute("data-index"), 10) || 0) + (dx < 0 ? 1 : -1));
          }
        }
        startX = null;
      }, { passive: true });
    }

    // Mobile menu
    var menuBtn = el("menuBtn");
    var navLinks = el("navLinks");
    menuBtn.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { navLinks.classList.remove("open"); });
    });

    // Tabs
    el("expTabs").querySelectorAll(".tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        var name = tab.getAttribute("data-tab");
        el("expTabs").querySelectorAll(".tab").forEach(function (x) {
          x.classList.toggle("active", x === tab);
        });
        el("expPanels").querySelectorAll(".tab-panel").forEach(function (panel) {
          panel.classList.toggle("active", panel.getAttribute("data-panel") === name);
        });
      });
    });

    // Navbar scroll state
    var navbar = el("navbar");
    window.addEventListener("scroll", function () {
      navbar.classList.toggle("scrolled", window.scrollY > 20);
    });

    // Active nav link on scroll
    var sections = document.querySelectorAll("section[id]");
    var navAnchors = navLinks.querySelectorAll("a");
    window.addEventListener("scroll", function () {
      var pos = window.scrollY + 120;
      var current = "";
      sections.forEach(function (sec) {
        if (sec.offsetTop <= pos) current = sec.getAttribute("id");
      });
      navAnchors.forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("href") === "#" + current);
      });
    });

    setupRevealObserver();
  }

  // Reveal-on-scroll + animate skill bars.
  // Stored at module scope so we can disconnect the previous instance
  // before re-binding after a language switch (which re-renders content).
  var revealObserver = null;
  function setupRevealObserver() {
    if (revealObserver) revealObserver.disconnect();
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // animate any skill bars inside
            entry.target.querySelectorAll(".skill-fill").forEach(function (bar) {
              bar.style.width = (bar.getAttribute("data-level") || 0) + "%";
            });
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach(function (node) {
      revealObserver.observe(node);
    });
    // Also kick skill bars directly if skills section not wrapped in .reveal
    document.querySelectorAll(".skill-fill").forEach(function (bar) {
      if (!bar.closest(".reveal")) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) {
              bar.style.width = (bar.getAttribute("data-level") || 0) + "%";
              io.unobserve(bar);
            }
          });
        }, { threshold: 0.2 });
        io.observe(bar);
      }
    });
  }

  /* ---------------- Boot ---------------- */
  document.addEventListener("DOMContentLoaded", loadAll);
})();
