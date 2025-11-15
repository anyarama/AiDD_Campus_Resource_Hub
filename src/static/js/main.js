// Campus Resource Hub - Main JavaScript helpers
/* global bootstrap */

document.addEventListener('DOMContentLoaded', () => {
    initAutoDismissAlerts();
    initImagePreview();
    initDatetimeMinimums();
    initDeleteConfirmations();
    initSearchReset();
    initSmoothScroll();
    initFormValidation();
    initTextareaCounters();
    initRatingStars();
    initTooltipsAndPopovers();
    initRealtimeMessaging();
    initSkipLinkFocus();
    initNotificationCenter();
    initNavbarScrollEffect();
    initCardAnimations();
    initEnhancedButtonEffects();
    initParallaxEffects();
    initProgressiveImageLoading();
    initCarouselLazyLoading();
    initFormPlaceholderAnimations();
    initWaitlistOfferExperience();
});

function initAutoDismissAlerts() {
    document.querySelectorAll('.alert').forEach(alert => {
        if (alert.dataset.autodismiss === 'false' || alert.classList.contains('alert-sticky')) {
            return;
        }
        const dismissAfter = parseInt(alert.dataset.dismissAfter || '5000', 10);
        setTimeout(() => {
            try {
                const instance = bootstrap.Alert.getOrCreateInstance(alert);
                instance.close();
            } catch (err) {
                console.error('Failed to dismiss alert', err);
            }
        }, Number.isNaN(dismissAfter) ? 5000 : dismissAfter);
    });
}

function initImagePreview() {
    const input = document.querySelector('input[type="file"][name="images"]');
    if (!input) return;

    input.addEventListener('change', event => {
        const files = Array.from(event.target.files || []);
        const previewContainer = document.getElementById('image-preview');
        if (!previewContainer) return;
        previewContainer.innerHTML = '';

        files.forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = e => {
                const wrapper = document.createElement('div');
                wrapper.className = 'image-preview-item';
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'Preview';
                wrapper.appendChild(img);
                previewContainer.appendChild(wrapper);
            };
            reader.readAsDataURL(file);
        });
    });
}

function initDatetimeMinimums() {
    const inputs = document.querySelectorAll('input[type="datetime-local"]');
    if (!inputs.length) return;
    const now = new Date();
    const isoMinutes = now.toISOString().slice(0, 16);
    inputs.forEach(input => {
        input.min = isoMinutes;
    });
}

function initDeleteConfirmations() {
    document.querySelectorAll('[data-confirm-delete]').forEach(button => {
        button.addEventListener('click', event => {
            if (!window.confirm('Are you sure you want to delete this item?')) {
                event.preventDefault();
            }
        });
    });
}

function initSearchReset() {
    const searchForm = document.getElementById('resource-search-form');
    if (!searchForm) return;
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'btn btn-outline-secondary';
    clearBtn.textContent = 'Clear Filters';
    clearBtn.addEventListener('click', () => {
        searchForm.reset();
        searchForm.submit();
    });
    const submitBtn = searchForm.querySelector('button[type="submit"]');
    if (submitBtn && submitBtn.parentNode) {
        submitBtn.parentNode.insertBefore(clearBtn, submitBtn);
    }
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', event => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function initFormValidation() {
    document.querySelectorAll('.needs-validation').forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
}

function initTextareaCounters() {
    document.querySelectorAll('textarea[maxlength]').forEach(textarea => {
        const maxLength = parseInt(textarea.getAttribute('maxlength'), 10);
        if (!maxLength) return;
        const counter = document.createElement('small');
        counter.className = 'text-muted float-end';
        textarea.parentNode.appendChild(counter);

        const updateCounter = () => {
            const remaining = maxLength - textarea.value.length;
            counter.textContent = `${remaining} characters remaining`;
        };
        textarea.addEventListener('input', updateCounter);
        updateCounter();
    });
}

function initRatingStars() {
    const stars = document.querySelectorAll('.rating-stars .star');
    if (!stars.length) return;
    const ratingInput = document.querySelector('input[name="rating"]');
    if (!ratingInput) return;

    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            const rating = index + 1;
            ratingInput.value = rating;
            stars.forEach((s, i) => {
                s.classList.toggle('active', i < rating);
            });
        });
    });
}

function initTooltipsAndPopovers() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(el => new bootstrap.Tooltip(el));
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(el => new bootstrap.Popover(el));
}

function initRealtimeMessaging() {
    const threadEl = document.querySelector('[data-message-thread]');
    if (!threadEl) return;

    const feedUrl = threadEl.dataset.feedUrl;
    const currentUserId = Number(threadEl.dataset.currentUser || 0);
    let lastMessageId = Number(threadEl.dataset.lastMessageId || 0);
    const pollIntervalMs = 10000;

    const scrollToBottom = () => {
        threadEl.scrollTop = threadEl.scrollHeight;
    };

    const removeEmptyState = () => {
        const emptyState = threadEl.querySelector('.message-empty');
        if (emptyState) {
            emptyState.remove();
        }
    };

    const formatTimestamp = isoString => {
        const date = new Date(isoString);
        if (Number.isNaN(date.getTime())) {
            return isoString;
        }
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    };

    const appendMessage = message => {
        if (!message || !message.message_id) return;
        if (threadEl.querySelector(`[data-message-id="${message.message_id}"]`)) {
            return;
        }
        removeEmptyState();
        const wrapper = document.createElement('div');
        const isCurrentUser = message.sender_id === currentUserId;
        wrapper.className = `message-item ${isCurrentUser ? 'sent' : 'received'}`;
        wrapper.dataset.messageId = message.message_id;

        const meta = document.createElement('div');
        meta.className = 'message-meta';
        const name = document.createElement('strong');
        name.textContent = isCurrentUser ? 'You' : (message.sender_name || 'Participant');
        const time = document.createElement('span');
        time.className = 'text-muted';
        time.textContent = formatTimestamp(message.timestamp);
        meta.appendChild(name);
        meta.appendChild(time);

        const body = document.createElement('p');
        body.className = 'mb-0';
        body.textContent = message.content;

        wrapper.appendChild(meta);
        wrapper.appendChild(body);
        threadEl.appendChild(wrapper);
        lastMessageId = Math.max(lastMessageId, message.message_id);
        threadEl.dataset.lastMessageId = String(lastMessageId);
        scrollToBottom();
    };

    const fetchMessages = async () => {
        if (!feedUrl) return;
        const url = new URL(feedUrl, window.location.origin);
        if (lastMessageId) {
            url.searchParams.set('after_id', lastMessageId);
        }
        try {
            const response = await fetch(url, {
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) {
                return;
            }
            const payload = await response.json();
            if (payload && Array.isArray(payload.messages)) {
                payload.messages.forEach(appendMessage);
            }
        } catch (error) {
            console.warn('Message polling failed', error);
        }
    };

    // Initial state
    scrollToBottom();
    fetchMessages();
    const pollHandle = window.setInterval(fetchMessages, pollIntervalMs);

    // Enhance reply form for instant sends
    const replyForm = document.querySelector('[data-message-reply-form]');
    if (!replyForm) return;
    const textarea = replyForm.querySelector('textarea[name="content"]');

    const showInlineFeedback = message => {
        let feedback = replyForm.querySelector('.inline-message');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'alert alert-warning inline-message mt-3';
            replyForm.appendChild(feedback);
        }
        feedback.textContent = message;
        setTimeout(() => feedback.remove(), 4000);
    };

    replyForm.addEventListener('submit', async event => {
        if (!textarea) return;
        const messageText = textarea.value.trim();
        if (!messageText) {
            showInlineFeedback('Please enter a message before sending.');
            event.preventDefault();
            return;
        }

        event.preventDefault();
        const formData = new FormData(replyForm);
        try {
            const response = await fetch(replyForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            const payload = await response.json();
            if (payload.success && payload.message) {
                appendMessage(payload.message);
                textarea.value = '';
            } else if (payload.error) {
                showInlineFeedback(payload.error);
            }
        } catch (error) {
            console.error('Realtime reply failed, falling back to full submission', error);
            window.clearInterval(pollHandle);
            replyForm.submit();
        }
    });
}

function initSkipLinkFocus() {
    const skipLink = document.querySelector('.skip-link');
    const mainContent = document.getElementById('main-content');
    if (!skipLink || !mainContent) return;
    skipLink.addEventListener('click', () => {
        setTimeout(() => {
            mainContent.focus();
        }, 0);
    });
}

function initNotificationCenter() {
    const root = document.querySelector('[data-notification-root]');
    if (!root) return;
    const toggle = root.querySelector('[data-notification-toggle]');
    if (!toggle) return;

    const feedUrl = toggle.dataset.notificationFeed;
    const ackUrl = toggle.dataset.notificationAck;
    if (!feedUrl || !ackUrl) return;

    const listEl = root.querySelector('[data-notification-list]');
    const emptyEl = root.querySelector('[data-notification-empty]');
    let badgeEl = toggle.querySelector('.notification-badge');
    const csrfToken = getCsrfToken();
    let hasFetchedOnce = false;
    let ackInFlight = false;

    const ensureBadge = () => {
        if (badgeEl) return badgeEl;
        badgeEl = document.createElement('span');
        badgeEl.className = 'notification-badge';
        toggle.appendChild(badgeEl);
        return badgeEl;
    };

    const updateBadge = newCount => {
        if (!newCount) {
            if (badgeEl) {
                badgeEl.remove();
                badgeEl = null;
            }
            return;
        }
        const badge = ensureBadge();
        badge.textContent = newCount > 9 ? '9+' : String(newCount);
    };

    const renderItems = items => {
        if (!listEl) return;
        if (!items || !items.length) {
            listEl.innerHTML = '';
            if (emptyEl) emptyEl.classList.remove('d-none');
            return;
        }
        const markup = items.map(renderNotificationItem).join('');
        listEl.innerHTML = markup;
        if (emptyEl) emptyEl.classList.add('d-none');
    };

    const updateFromPayload = payload => {
        if (!payload) return;
        renderItems(payload.items || []);
        updateBadge(payload.new_count || 0);
    };

    const fetchFeed = () => {
        fetch(feedUrl, { headers: { Accept: 'application/json' } })
            .then(resp => (resp.ok ? resp.json() : Promise.reject(resp.status)))
            .then(payload => {
                hasFetchedOnce = true;
                updateFromPayload(payload);
            })
            .catch(error => console.warn('Notification feed failed', error));
    };

    const acknowledge = () => {
        if (ackInFlight) return;
        ackInFlight = true;
        const headers = { Accept: 'application/json' };
        if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
        }
        fetch(ackUrl, { method: 'POST', headers })
            .then(resp => (resp.ok ? resp.json() : Promise.reject(resp.status)))
            .then(data => updateFromPayload(data?.payload))
            .catch(error => console.warn('Notification ack failed', error))
            .finally(() => { ackInFlight = false; });
    };

    toggle.addEventListener('show.bs.dropdown', () => {
        if (!hasFetchedOnce) {
            fetchFeed();
        }
        acknowledge();
    });
}

function renderNotificationItem(item) {
    const body = item?.body ? `<div class="notification-subtitle">${escapeHtml(item.body)}</div>` : '';
    const newClass = item?.is_new ? ' notification-item--new' : '';
    const dot = item?.is_new ? '<span class="notification-dot" aria-hidden="true"></span>' : '';
    return `
        <a class="notification-item${newClass}" href="${escapeAttr(item?.url || '#')}">
            <div class="notification-icon notification-icon--${escapeAttr(item?.accent || 'muted')}">
                <i class="bi ${escapeAttr(item?.icon || 'bi-bell-fill')}" aria-hidden="true"></i>
            </div>
            <div class="notification-body">
                <div class="notification-title">${escapeHtml(item?.title || 'Update')}</div>
                ${body}
                <div class="notification-meta">${escapeHtml(item?.time_display || '')}</div>
            </div>
            ${dot}
        </a>
    `;
}

function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
}

function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
    return escapeHtml(value).replace(/\s+/g, ' ').trim();
}

function initNavbarScrollEffect() {
    const navbar = document.querySelector('.global-nav');
    if (!navbar) return;

    let lastScrollTop = 0;
    let ticking = false;

    const updateNavbar = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScrollTop = scrollTop;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    });

    // Initial check
    updateNavbar();
}

function initCardAnimations() {
    // Use Intersection Observer for performant card animations
    const cards = document.querySelectorAll('.resource-card, .dashboard-card, .insight-card, .stat-card, .hero-panel');
    if (!cards.length) return;

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
        // Fallback: show all cards immediately
        cards.forEach(card => card.classList.add('fade-in-visible'));
        return;
    }

    // Add initial hidden class
    cards.forEach(card => card.classList.add('fade-in-hidden'));

    // Create observer with optimized options
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -30px 0px',
        threshold: 0.05
    };

    let animationCounter = 0;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Use CSS classes instead of inline styles for better performance
                // Stagger animation with requestAnimationFrame for smoother performance
                const delay = animationCounter * 40; // Reduced delay for snappier feel
                animationCounter++;

                requestAnimationFrame(() => {
                    setTimeout(() => {
                        entry.target.classList.remove('fade-in-hidden');
                        entry.target.classList.add('fade-in-visible');
                    }, delay);
                });

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all cards
    cards.forEach(card => observer.observe(card));

    // Reset counter after a short delay
    setTimeout(() => { animationCounter = 0; }, 1000);
}

function initEnhancedButtonEffects() {
    // Add ripple effect to primary buttons
    const buttons = document.querySelectorAll('.btn-primary, .btn-outline-secondary, .nav-pill--accent');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple-effect');

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
}

function initParallaxEffects() {
    // Parallax effect disabled to prevent layout shifts
    return;
}

function initProgressiveImageLoading() {
    // Shared function to load background images
    function loadBackgroundImage(element, bgUrl) {
        if (!bgUrl) return;

        // Add loading class
        element.classList.add('loading-bg');

        // Preload image
        const img = new Image();
        img.onload = () => {
            // Properly escape the URL for CSS
            const escapedUrl = bgUrl.replace(/'/g, "\\'").replace(/"/g, '\\"');
            element.style.backgroundImage = `url('${escapedUrl}')`;
            element.classList.remove('loading-bg');
            element.classList.add('loaded-bg');
            // Remove both lazy and eager attributes after loading
            element.removeAttribute('data-lazy-bg');
            element.removeAttribute('data-eager-bg');
        };
        img.onerror = () => {
            console.warn('Failed to load image:', bgUrl);
            element.classList.remove('loading-bg');
            element.classList.add('error-bg');
        };
        img.src = bgUrl;
    }

    // Eagerly load images marked for immediate display (first 6 visible images)
    const eagerImages = document.querySelectorAll('[data-eager-bg]');
    eagerImages.forEach(element => {
        const bgUrl = element.dataset.eagerBg;
        if (bgUrl) {
            // Load immediately without waiting
            loadBackgroundImage(element, bgUrl);
        }
    });

    // Lazy load remaining images for better performance
    const lazyImages = document.querySelectorAll('[data-lazy-bg], img[loading="lazy"]');

    if (!lazyImages.length) return;

    // Use Intersection Observer with larger rootMargin for earlier loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;

                if (img.hasAttribute('data-lazy-bg')) {
                    loadBackgroundImage(img, img.dataset.lazyBg);
                } else if (img.tagName === 'IMG' && img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }

                observer.unobserve(img);
            }
        });
    }, {
        // Increased rootMargin to start loading 200px before images enter viewport
        rootMargin: '200px 0px',
        threshold: 0.01
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

function initCarouselLazyLoading() {
    // Load carousel images on slide change for better performance
    const carousel = document.querySelector('#resourceCarousel');
    if (!carousel) return;

    const loadImage = (img) => {
        if (img.dataset.src && !img.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
    };

    // Load next and previous images when carousel slides
    carousel.addEventListener('slide.bs.carousel', (event) => {
        const nextSlide = event.relatedTarget;
        const img = nextSlide.querySelector('img[data-src]');
        if (img) {
            loadImage(img);
        }

        // Preload adjacent images
        const nextIndex = event.to;
        const items = carousel.querySelectorAll('.carousel-item');
        const prevIndex = (nextIndex - 1 + items.length) % items.length;
        const nextNextIndex = (nextIndex + 1) % items.length;

        [prevIndex, nextNextIndex].forEach(index => {
            const adjacentImg = items[index]?.querySelector('img[data-src]');
            if (adjacentImg) {
                setTimeout(() => loadImage(adjacentImg), 100);
            }
        });
    });
}

function initFormPlaceholderAnimations() {
    // Add smooth focus effects to form inputs
    const formControls = document.querySelectorAll('.form-control, .form-select');

    formControls.forEach(input => {
        // Add floating label effect if needed
        input.addEventListener('focus', function() {
            this.parentElement?.classList.add('input-focused');
        });

        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement?.classList.remove('input-focused');
            }
        });

        // Initialize for pre-filled inputs
        if (input.value) {
            input.parentElement?.classList.add('input-focused');
        }
    });
}

function initWaitlistOfferExperience() {
    const waitlistOffer = document.querySelector('[data-waitlist-offer]');
    if (!waitlistOffer) return;

    waitlistOffer.setAttribute('tabindex', '-1');

    const highlightOffer = () => {
        waitlistOffer.classList.add('waitlist-offer-highlight');
        setTimeout(() => waitlistOffer.classList.remove('waitlist-offer-highlight'), 4500);
    };

    setTimeout(() => {
        waitlistOffer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        try {
            waitlistOffer.focus({ preventScroll: true });
        } catch (err) {
            waitlistOffer.focus();
        }
        highlightOffer();
    }, 250);

    const adjustTrigger = waitlistOffer.querySelector('[data-waitlist-adjust]');
    if (adjustTrigger) {
        adjustTrigger.addEventListener('click', () => {
            const startInput = document.getElementById('start_datetime');
            if (startInput) {
                startInput.focus();
            }
            waitlistOffer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            highlightOffer();
        });
    }
}
