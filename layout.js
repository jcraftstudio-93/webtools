(() => {
  "use strict";

  const BASE_PATH = "/webtools";

  async function fetchHtml(path) {
    const response = await fetch(path, {
      cache: "no-cache"
    });

    if (!response.ok) {
      throw new Error(
        `${path} 불러오기 실패: ${response.status}`
      );
    }

    return response.text();
  }

  async function loadCommonLayout() {
    const headerContainer =
      document.getElementById("siteHeaderContainer");

    const footerContainer =
      document.getElementById("siteFooterContainer");

    try {
      const [headerHtml, footerHtml] =
        await Promise.all([
          fetchHtml(`${BASE_PATH}/header.html`),
          fetchHtml(`${BASE_PATH}/footer.html`)
        ]);

      if (headerContainer) {
        headerContainer.innerHTML = headerHtml;
      }

      if (footerContainer) {
        footerContainer.innerHTML = footerHtml;
      }

      initializeHeader();
      initializeFooter();

      document.dispatchEvent(
        new CustomEvent("jcraftLayoutReady")
      );
    } catch (error) {
      console.error(
        "공통 헤더/푸터를 불러오지 못했습니다.",
        error
      );

      if (headerContainer) {
        headerContainer.innerHTML =
          '<div style="padding:16px;text-align:center;background:#fff3f3;color:#b42318;">헤더를 불러오지 못했습니다.</div>';
      }
    }
  }

  function initializeHeader() {
    const desktopMenuItems =
      document.querySelectorAll(
        ".desktop-menu-item[data-mega-target]"
      );

    const megaMenuArea =
      document.getElementById("megaMenuArea");

    const megaMenuOverlay =
      document.getElementById("megaMenuOverlay");

    const megaPanels =
      document.querySelectorAll(".mega-panel");

    const mobileMenuButton =
      document.getElementById("mobileMenuButton");

    const mobileMenuIcon =
      document.getElementById("mobileMenuIcon");

    const mobileNavigation =
      document.getElementById("mobileNavigation");

    const mobileCategories =
      document.querySelectorAll(".mobile-category");

    let megaCloseTimer = null;

    const updateMobileMenuIcon = (isOpen) => {
      if (!mobileMenuIcon) {
        return;
      }

      mobileMenuIcon.innerHTML = isOpen
        ? `
          <path d="M6 6l12 12"></path>
          <path d="M18 6 6 18"></path>
        `
        : `
          <path d="M4 7h16"></path>
          <path d="M4 12h16"></path>
          <path d="M4 17h16"></path>
        `;
    };

    const closeMobileMenu = () => {
      if (!mobileNavigation || !mobileMenuButton) {
        return;
      }

      mobileNavigation.classList.remove("open");
      document.body.classList.remove(
        "mobile-menu-open"
      );

      mobileMenuButton.setAttribute(
        "aria-expanded",
        "false"
      );

      mobileMenuButton.setAttribute(
        "aria-label",
        "메뉴 열기"
      );

      updateMobileMenuIcon(false);
    };

    const closeMegaMenu = () => {
      desktopMenuItems.forEach((item) => {
        item.classList.remove("active");
      });

      megaPanels.forEach((panel) => {
        panel.classList.remove("active");
      });

      if (megaMenuArea) {
        megaMenuArea.classList.remove("open");
        megaMenuArea.setAttribute(
          "aria-hidden",
          "true"
        );
      }

      if (megaMenuOverlay) {
        megaMenuOverlay.classList.remove("open");
      }
    };

    const openMegaMenu = (
      targetId,
      menuItem
    ) => {
      if (
        window.innerWidth <= 860 ||
        !megaMenuArea ||
        !megaMenuOverlay
      ) {
        return;
      }

      window.clearTimeout(megaCloseTimer);

      megaPanels.forEach((panel) => {
        panel.classList.toggle(
          "active",
          panel.id === targetId
        );
      });

      desktopMenuItems.forEach((item) => {
        item.classList.toggle(
          "active",
          item === menuItem
        );
      });

      megaMenuArea.classList.add("open");
      megaMenuOverlay.classList.add("open");

      megaMenuArea.setAttribute(
        "aria-hidden",
        "false"
      );
    };

    const scheduleMegaMenuClose = () => {
      megaCloseTimer = window.setTimeout(
        closeMegaMenu,
        160
      );
    };

    desktopMenuItems.forEach((menuItem) => {
      const targetId =
        menuItem.dataset.megaTarget;

      menuItem.addEventListener(
        "mouseenter",
        () => openMegaMenu(targetId, menuItem)
      );

      menuItem.addEventListener(
        "focusin",
        () => openMegaMenu(targetId, menuItem)
      );

      menuItem.addEventListener(
        "mouseleave",
        scheduleMegaMenuClose
      );
    });

    if (megaMenuArea) {
      megaMenuArea.addEventListener(
        "mouseenter",
        () => {
          window.clearTimeout(megaCloseTimer);
        }
      );

      megaMenuArea.addEventListener(
        "mouseleave",
        scheduleMegaMenuClose
      );
    }

    if (megaMenuOverlay) {
      megaMenuOverlay.addEventListener(
        "mouseenter",
        scheduleMegaMenuClose
      );

      megaMenuOverlay.addEventListener(
        "click",
        closeMegaMenu
      );
    }

    if (
      mobileMenuButton &&
      mobileNavigation
    ) {
      mobileMenuButton.addEventListener(
        "click",
        () => {
          const isOpen =
            mobileNavigation.classList.toggle("open");

          document.body.classList.toggle(
            "mobile-menu-open",
            isOpen
          );

          mobileMenuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
          );

          mobileMenuButton.setAttribute(
            "aria-label",
            isOpen
              ? "메뉴 닫기"
              : "메뉴 열기"
          );

          updateMobileMenuIcon(isOpen);
        }
      );

      mobileNavigation
        .querySelectorAll("a")
        .forEach((link) => {
          link.addEventListener(
            "click",
            closeMobileMenu
          );
        });
    }

    mobileCategories.forEach((category) => {
      const button =
        category.querySelector(
          ".mobile-category-button"
        );

      if (!button) {
        return;
      }

      button.addEventListener("click", () => {
        const willOpen =
          !category.classList.contains("open");

        mobileCategories.forEach((item) => {
          item.classList.remove("open");
        });

        if (willOpen) {
          category.classList.add("open");
        }
      });
    });

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") {
          closeMegaMenu();
          closeMobileMenu();
        }
      }
    );

    window.addEventListener(
      "resize",
      () => {
        if (window.innerWidth <= 860) {
          closeMegaMenu();
        } else {
          closeMobileMenu();
        }
      }
    );
  }

  function initializeFooter() {
    const currentYear =
      document.getElementById("currentYear");

    const scrollTopButton =
      document.getElementById("scrollTopButton");

    if (currentYear) {
      currentYear.textContent =
        String(new Date().getFullYear());
    }

    if (!scrollTopButton) {
      return;
    }

    const handleScroll = () => {
      scrollTopButton.classList.toggle(
        "visible",
        window.scrollY > 550
      );
    };

    scrollTopButton.addEventListener(
      "click",
      () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    );

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true
      }
    );

    handleScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      loadCommonLayout
    );
  } else {
    loadCommonLayout();
  }
})();

