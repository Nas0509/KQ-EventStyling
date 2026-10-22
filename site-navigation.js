(() => {
    const navigation = document.querySelector(".nav-links");
    if (!navigation) return;

    const menuToggle = document.getElementById("customerNavToggle");
    const links = Array.from(navigation.querySelectorAll('a[href^="#"]'));
    const sections = links
        .map(link => document.getElementById(link.hash.slice(1)))
        .filter(Boolean);

    function setActive(id) {
        links.forEach(link => {
            const active = link.hash === `#${id}`;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
        });
    }

    function setMenuOpen(open) {
        if (!menuToggle) return;
        navigation.classList.toggle("is-open", open);
        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
        });

        navigation.addEventListener("click", event => {
            if (event.target.closest('a[href^="#"]')) setMenuOpen(false);
        });

        document.addEventListener("click", event => {
            if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) {
                setMenuOpen(false);
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
                setMenuOpen(false);
                menuToggle.focus();
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 800) setMenuOpen(false);
        });
    }

    links.forEach(link => link.addEventListener("click", () => {
        setActive(link.hash.slice(1));
    }));

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            const visible = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
            if (visible[0]) setActive(visible[0].target.id);
        }, { rootMargin: "-18% 0px -68% 0px", threshold: 0 });
        sections.forEach(section => observer.observe(section));
    }

    const initialId = window.location.hash.slice(1);
    setActive(sections.some(section => section.id === initialId) ? initialId : "home");
})();
