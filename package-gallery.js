(() => {
    const galleries = document.querySelectorAll('.package-gallery');
    const intervalMs = 2000;

    galleries.forEach((gallery) => {
        const cover = gallery.querySelector('.package-gallery-cover');
        const packageCard = gallery.closest('.package-card');
        const photos = [cover, ...gallery.querySelectorAll('.package-gallery-thumbs img')]
            .map((image) => ({ src: new URL(image.getAttribute('src'), document.baseURI).href, alt: image.alt }));
        photos.slice(1).forEach(({ src }) => {
            const preload = new Image();
            preload.src = src;
        });
        const counter = gallery.querySelector('.gallery-count');
        if (!cover || photos.length < 2) return;

        let current = 0;
        let intervalId;
        let transitionId = 0;
        const incoming = document.createElement('img');
        incoming.className = 'package-gallery-next-image';
        incoming.alt = '';
        incoming.setAttribute('aria-hidden', 'true');
        incoming.draggable = false;
        gallery.append(incoming);

        const showPhoto = async (index) => {
            current = (index + photos.length) % photos.length;
            const thisTransition = ++transitionId;
            const photo = photos[current];
            incoming.src = photo.src;
            try {
                await incoming.decode();
            } catch {
                return;
            }
            if (thisTransition !== transitionId) return;
            gallery.classList.add('is-changing');
            window.setTimeout(() => {
                if (thisTransition !== transitionId) return;
                cover.src = photo.src;
                cover.alt = photo.alt;
                if (counter) counter.textContent = `Photo ${current + 1} of ${photos.length}`;
                gallery.classList.remove('is-changing');
            }, 560);
        };
        const stopAuto = () => {
            window.clearInterval(intervalId);
            intervalId = undefined;
        };
        const startAuto = () => {
            stopAuto();
            intervalId = window.setInterval(() => showPhoto(current + 1), intervalMs);
        };
        const interact = (direction) => {
            showPhoto(current + direction);
        };

        const previous = document.createElement('button');
        previous.type = 'button';
        previous.className = 'gallery-control gallery-control-prev';
        previous.setAttribute('aria-label', 'Previous package photo');
        previous.innerHTML = '&#8249;';
        previous.addEventListener('click', () => interact(-1));

        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'gallery-control gallery-control-next';
        next.setAttribute('aria-label', 'Next package photo');
        next.innerHTML = '&#8250;';
        next.addEventListener('click', () => interact(1));

        gallery.append(previous, next);
        packageCard.addEventListener('pointerenter', startAuto);
        packageCard.addEventListener('pointerleave', () => {
            stopAuto();
            showPhoto(0);
        });

        // Phones have no hover state. Start cycling once this package is
        // mostly visible, and stop/reset it after the client scrolls away.
        if ('IntersectionObserver' in window) {
            const mobileView = window.matchMedia('(hover: none), (pointer: coarse)');
            let isInView = false;
            const observer = new IntersectionObserver(([entry]) => {
                const shouldPlay = mobileView.matches && entry.isIntersecting && entry.intersectionRatio >= 0.5;
                if (shouldPlay && !isInView) {
                    isInView = true;
                    startAuto();
                } else if (!shouldPlay && isInView) {
                    isInView = false;
                    stopAuto();
                    showPhoto(0);
                }
            }, { threshold: [0, 0.5, 1] });
            observer.observe(packageCard);
            mobileView.addEventListener?.('change', () => {
                if (!mobileView.matches && isInView) {
                    isInView = false;
                    stopAuto();
                    showPhoto(0);
                }
            });
        }
        if (counter) counter.textContent = `Photo 1 of ${photos.length}`;
    });
})();
