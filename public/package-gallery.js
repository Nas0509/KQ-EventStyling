(() => {
    document.querySelectorAll('.package-gallery').forEach((gallery) => {
        const cover = gallery.querySelector('.package-gallery-cover');
        const packageCard = gallery.closest('.package-card');
        const counter = gallery.querySelector('.gallery-count');
        if (!cover || !packageCard) return;

        const photos = [cover, ...gallery.querySelectorAll('.package-gallery-thumbs img')]
            .map((image) => ({
                src: new URL(image.getAttribute('src'), document.baseURI).href,
                alt: image.alt
            }));
        if (photos.length < 2) return;

        // Load each image once and wait for it before changing the visible photo.
        const loadedPhotos = photos.map((photo) => {
            const image = new Image();
            image.src = photo.src;
            return new Promise((resolve) => {
                if (image.complete) {
                    resolve(image.naturalWidth > 0);
                } else {
                    image.addEventListener('load', () => resolve(true), { once: true });
                    image.addEventListener('error', () => resolve(false), { once: true });
                }
            });
        });

        let current = 0;
        let intervalId;
        let transitionId = 0;
        let isTransitioning = false;
        let queuedDirection = 0;
        const incoming = document.createElement('img');
        incoming.className = 'package-gallery-next-image';
        incoming.alt = '';
        incoming.setAttribute('aria-hidden', 'true');
        incoming.draggable = false;
        gallery.append(incoming);

        const updateCounter = () => {
            if (counter) counter.textContent = `Photo ${current + 1} of ${photos.length}`;
        };

        const showPhoto = async (direction) => {
            if (isTransitioning) {
                queuedDirection = direction;
                return;
            }
            isTransitioning = true;
            const transition = ++transitionId;
            let nextIndex = current;
            let ready = false;
            for (let attempt = 0; attempt < photos.length; attempt += 1) {
                nextIndex = (nextIndex + direction + photos.length) % photos.length;
                if (await loadedPhotos[nextIndex]) {
                    ready = true;
                    break;
                }
            }

            if (ready && transition === transitionId && nextIndex !== current) {
                incoming.src = photos[nextIndex].src;
                incoming.alt = photos[nextIndex].alt;
                gallery.classList.add('is-changing');
                window.setTimeout(() => {
                    if (transition === transitionId) {
                        cover.src = photos[nextIndex].src;
                        cover.alt = photos[nextIndex].alt;
                        current = nextIndex;
                        updateCounter();
                        gallery.classList.remove('is-changing');
                    }
                    isTransitioning = false;
                    if (queuedDirection) {
                        const queued = queuedDirection;
                        queuedDirection = 0;
                        showPhoto(queued);
                    }
                }, 560);
                return;
            }

            isTransitioning = false;
            if (queuedDirection) {
                const queued = queuedDirection;
                queuedDirection = 0;
                showPhoto(queued);
            }
        };

        const stopAuto = () => {
            window.clearInterval(intervalId);
            intervalId = undefined;
        };
        const startAuto = () => {
            stopAuto();
            intervalId = window.setInterval(() => showPhoto(1), 3500);
        };

        const previous = document.createElement('button');
        previous.type = 'button';
        previous.className = 'gallery-control gallery-control-prev';
        previous.setAttribute('aria-label', 'Previous package photo');
        previous.innerHTML = '&#8249;';
        previous.addEventListener('click', () => showPhoto(-1));

        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'gallery-control gallery-control-next';
        next.setAttribute('aria-label', 'Next package photo');
        next.innerHTML = '&#8250;';
        next.addEventListener('click', () => showPhoto(1));
        gallery.append(previous, next);

        packageCard.addEventListener('pointerenter', startAuto);
        packageCard.addEventListener('pointerleave', stopAuto);

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
                }
            }, { threshold: [0, 0.5, 1] });
            observer.observe(packageCard);
            mobileView.addEventListener?.('change', () => {
                if (!mobileView.matches && isInView) {
                    isInView = false;
                    stopAuto();
                }
            });
        }
        updateCounter();
    });
})();
