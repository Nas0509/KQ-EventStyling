(() => {
    const navigation = document.querySelector(".nav-links");
    if (!navigation) return;

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
