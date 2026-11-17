// ===============================================
// ОСНОВНАЯ ЛОГИКА МАГАЗИНА - ИСПРАВЛЕННАЯ ВЕРСИЯ
// ===============================================

class ShopApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.cart = [];
        this.allProducts = [];
        this.currentCategory = 'Все товары';
        
        this.initTelegram();
        this.initDOM();
        this.initEventListeners();
        this.init();
    }

    // Инициализация Telegram Web App
    initTelegram() {
        if (this.tg) {
            this.tg.ready();
            this.tg.expand();
            if (this.tg.colorScheme === 'dark') {
                document.body.classList.add('telegram-dark-theme');
            }
        }
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            catalogContainer: document.getElementById('product-catalog'),
            loader: document.getElementById('loader'),
            cartButton: document.getElementById('cart-button'),
            cartCounter: document.getElementById('cart-counter'),
            cartModal: document.getElementById('cart-modal'),
            closeCartButton: document.getElementById('close-cart-button'),
            cartItemsContainer: document.getElementById('cart-items-container'),
            cartTotalPriceEl: document.getElementById('cart-total-price'),
            submitOrderButton: document.getElementById('submit-order-button'),
            customerNameInput: document.getElementById('customer-name-input'),
            organizationInput: document.getElementById('organization-input'),
            phoneInput: document.getElementById('phone-input'),
            addressInput: document.getElementById('address-input'),
            categoriesContainer: document.getElementById('categories-container'),
            orderForm: document.getElementById('order-form'),
            cartSummary: document.querySelector('.cart-summary')
        };
    }

    // Инициализация обработчиков событий
    initEventListeners() {
        // Корзина
        this.elements.cartButton.addEventListener('click', () => this.openCart());
        this.elements.closeCartButton.addEventListener('click', () => this.closeCart());
        this.elements.cartModal.addEventListener('click', (e) => {
            if (e.target === this.elements.cartModal) this.closeCart();
        });

        // Форма заказа
        this.elements.submitOrderButton.addEventListener('click', () => this.submitOrder());

        // Клавиатура
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeImageViewer();
                if (this.elements.cartModal.style.display === 'flex') this.closeCart();
            }
        });

        // Полноэкранный просмотр фотографий
        this.createImageViewer();
    }

    // Основная инициализация
    async init() {
        this.applyConfig();
        this.renderCategories();
        await this.loadProducts();
        this.filterProductsByCategory(this.currentCategory);
    }

    // Применение конфигурации
    applyConfig() {
        document.title = SHOP_CONFIG.shopTitle;
        document.getElementById('shop-title').textContent = SHOP_CONFIG.shopTitle;
        
        const logoImg = document.getElementById('logo-img');
        logoImg.src = SHOP_CONFIG.logoPath;
        logoImg.onerror = () => { logoImg.style.display = 'none'; };
        
        // Применение цветов
        const root = document.documentElement;
        root.style.setProperty('--primary-color', SHOP_CONFIG.colors.primary);
        root.style.setProperty('--secondary-color', SHOP_CONFIG.colors.secondary);
        root.style.setProperty('--accent-color', SHOP_CONFIG.colors.accent);
        root.style.setProperty('--success-color', SHOP_CONFIG.colors.success);

        // Заголовки секций скрыты в интерфейсе — не обращаемся к отсутствующим элементам.
    }

    // ИСПРАВЛЕНО: Загрузка товаров
    async loadProducts() {
        try {
            this.showLoader();

            // Используем только встроенный каталог — старые тестовые данные не подставляем.
            if (!Array.isArray(window.EMBEDDED_CATALOG)) {
                throw new Error('Встроенный каталог не загружен или содержит синтаксическую ошибку');
            }

            console.log('Используем встроенный каталог');
            this.allProducts = window.EMBEDDED_CATALOG;
            this.renderProducts(this.allProducts);
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
            this.showError('Не удалось загрузить каталог. Проверьте embedded-catalog.js');
        } finally {
            this.hideLoader();
        }
    }

    // Тестовые данные (fallback)
    getTestProducts() {
        return [
            { id: 1, sku: "SHR-3545-001", name: "Шурупы универсальные 3,5x45", description: "Шурупы высокого качества для крепления различных материалов", price: 34.30, photo: "https://images.unsplash.com/photo-1609205292622-0d43b9e24f11?w=300&h=300&fit=crop", category: "Крепеж" },
            { id: 2, sku: "KRA-10L-003", name: "Краска водоэмульсионная белая 10л", description: "Высококачественная водоэмульсионная краска для внутренних работ", price: 478.60, photo: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=300&fit=crop", category: "Лакокрасочные" },
            { id: 3, sku: "DRL-850W-006", name: "Дрель ударная 850Вт", description: "Профессиональная ударная дрель с регулировкой оборотов", price: 1650.00, photo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=300&fit=crop", category: "Инструменты" },
            { id: 4, sku: "CEM-M500-009", name: "Цемент М500 50кг", description: "Портландцемент марки 500 для приготовления бетона", price: 160.10, photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop", category: "Стройматериалы" }
        ];
    }

    // Показать загрузчик
    showLoader() {
        this.elements.loader.style.display = 'block';
        this.elements.catalogContainer.style.display = 'none';
    }

    // Скрыть загрузчик
    hideLoader() {
        this.elements.loader.style.display = 'none';
        this.elements.catalogContainer.style.display = 'grid';
    }

    // Показать ошибку
    showError(message) {
        this.elements.loader.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="font-size: 48px; margin-bottom: 16px;">😞</div>
                <p>${message}</p>
            </div>
        `;
    }

    // Отображение товаров
    renderProducts(productsToRender) {
        this.elements.catalogContainer.innerHTML = '';
        
        if (productsToRender.length === 0) {
            this.elements.catalogContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px; color: white;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🤷‍♂️</div>
                    <p style="font-size: 18px; opacity: 0.8;">${SHOP_CONFIG.messages.noProducts}</p>
                </div>
            `;
            return;
        }
        
        productsToRender.forEach((product, index) => {
            const card = this.createProductCard(product);
            if (SHOP_CONFIG.animation.enabled) {
                card.style.animationDelay = `${index * SHOP_CONFIG.animation.staggerDelay}ms`;
            }
            this.elements.catalogContainer.appendChild(card);
        });
    }


    // Создание полноэкранного просмотрщика изображений
    createImageViewer() {
        const viewer = document.createElement('div');
        viewer.className = 'image-viewer';
        viewer.setAttribute('aria-hidden', 'true');
        viewer.innerHTML = '<button type="button" class="image-viewer-close" aria-label="Закрыть">×</button><img class="image-viewer-img" alt="">';
        document.body.appendChild(viewer);
        viewer.addEventListener('click', () => this.closeImageViewer());
        viewer.querySelector('.image-viewer-img').addEventListener('click', () => this.closeImageViewer());
        viewer.querySelector('.image-viewer-close').addEventListener('click', () => this.closeImageViewer());
        this.elements.imageViewer = viewer;
        this.elements.imageViewerImg = viewer.querySelector('.image-viewer-img');
    }

    openImageViewer(src, alt) {
        if (!this.elements.imageViewer || !src) return;
        this.elements.imageViewerImg.src = src;
        this.elements.imageViewerImg.alt = alt || '';
        this.elements.imageViewer.classList.add('active');
        this.elements.imageViewer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('image-viewer-open');
    }

    closeImageViewer() {
        if (!this.elements?.imageViewer) return;
        this.elements.imageViewer.classList.remove('active');
        this.elements.imageViewer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('image-viewer-open');
    }

    // Карточка товара с каруселью изображений
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        const formattedPrice = product.price == null ? 'Цена уточняется' : this.formatPrice(product.price);
        const fallbackPhoto = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="#171316"/><path d="M300 95 L440 165 L440 390 L300 505 L160 390 L160 165 Z" fill="none" stroke="#713b50" stroke-width="5"/><text x="300" y="285" fill="#c7aab6" font-family="Arial,sans-serif" font-size="30" text-anchor="middle" letter-spacing="4">COFFIN</text><text x="300" y="330" fill="#c7aab6" font-family="Arial,sans-serif" font-size="30" text-anchor="middle" letter-spacing="4">BOFFIN</text><text x="300" y="385" fill="#806775" font-family="Arial,sans-serif" font-size="15" text-anchor="middle">ФОТО СКОРО</text></svg>');
        const sourcePhotos = product.photos || product.gallery || product.photo || [];
        const photos = (Array.isArray(sourcePhotos) ? sourcePhotos : [sourcePhotos])
            .filter(photo => typeof photo === 'string' && photo.trim())
            .map(photo => photo.trim());
        if (!photos.length) photos.push(fallbackPhoto);

        const thumbnailsHtml = photos.length > 1
            ? `<div class="product-thumbnails" aria-label="Выбрать фото">${photos.map((photo, index) =>
                `<button type="button" class="product-thumb-button ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Фото ${index + 1}">
                    <img src="${photo}" alt="" loading="lazy">
                </button>`).join('')}</div>`
            : '';

        card.innerHTML = `
            <div class="product-photo">
                <div class="product-carousel">
                    <img class="product-main-img" src="${photos[0]}" alt="${product.name}" loading="lazy">
                    ${photos.length > 1 ? `
                        <button type="button" class="product-carousel-arrow prev" aria-label="Предыдущее фото">‹</button>
                        <button type="button" class="product-carousel-arrow next" aria-label="Следующее фото">›</button>
                        <span class="product-carousel-count">1 / ${photos.length}</span>
                    ` : ''}
                </div>
                ${thumbnailsHtml}
            </div>
            <div class="product-details">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <div class="product-price">${formattedPrice}</div>
                    <button class="add-to-cart-button" ${product.price == null ? 'disabled title="Цена будет добавлена позже"' : ''}>${product.price == null ? 'Скоро в продаже' : 'В корзину'}</button>
                </div>
            </div>
        `;

        const mainImg = card.querySelector('.product-main-img');
        const thumbnails = [...card.querySelectorAll('.product-thumb-button')];
        const counter = card.querySelector('.product-carousel-count');
        let currentIndex = 0;
        const showPhoto = (index) => {
            currentIndex = (index + photos.length) % photos.length;
            mainImg.src = photos[currentIndex];
            if (counter) counter.textContent = `${currentIndex + 1} / ${photos.length}`;
            thumbnails.forEach((thumb, i) => {
                thumb.classList.toggle('active', i === currentIndex);
                thumb.setAttribute('aria-current', i === currentIndex ? 'true' : 'false');
            });
        };

        card.querySelector('.product-carousel-arrow.prev')?.addEventListener('click', () => showPhoto(currentIndex - 1));
        card.querySelector('.product-carousel-arrow.next')?.addEventListener('click', () => showPhoto(currentIndex + 1));
        thumbnails.forEach((thumb, index) => thumb.addEventListener('click', () => showPhoto(index)));

        const carousel = card.querySelector('.product-carousel');
        let touchStartX = 0;
        carousel.addEventListener('touchstart', event => {
            touchStartX = event.changedTouches[0].clientX;
        }, { passive: true });
        carousel.addEventListener('touchend', event => {
            const deltaX = event.changedTouches[0].clientX - touchStartX;
            if (Math.abs(deltaX) > 40 && photos.length > 1) showPhoto(currentIndex + (deltaX < 0 ? 1 : -1));
        }, { passive: true });

        mainImg.addEventListener('error', () => { mainImg.src = fallbackPhoto; }, { once: true });
        mainImg.addEventListener('click', (event) => {
            event.stopPropagation();
            this.openImageViewer(mainImg.src, mainImg.alt);
        });
        mainImg.setAttribute('role', 'button');
        mainImg.setAttribute('tabindex', '0');
        mainImg.setAttribute('aria-label', 'Увеличить изображение');
        mainImg.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.openImageViewer(mainImg.src, mainImg.alt);
            }
        });

        const addToCartButton = card.querySelector('.add-to-cart-button');
        if (product.price != null) {
            addToCartButton.addEventListener('click', () => {
                this.addToCart(product);
                this.animateAddToCart(addToCartButton);
            });
        }
        return card;
    }

    // Информационная карточка шкатулки под конфигуратором — без кнопки покупки.
    createBoxProductInfoCard(product, config) {
        if (!product) return null;

        const card = document.createElement('article');
        card.className = 'product-card box-product-info-card';
        const photos = (Array.isArray(product.photos) ? product.photos :
            (Array.isArray(product.gallery) ? product.gallery :
            (Array.isArray(product.photo) ? product.photo : (product.photo ? [product.photo] : []))))
            .filter(photo => typeof photo === 'string' && photo.trim());
        const image = photos[0] || config.background || '';
        const formattedPrice = product.price == null ? 'Цена уточняется' : this.formatPrice(product.price);

        card.innerHTML = `
            ${image ? `<div class="product-photo"><img class="product-main-img box-product-info-image" src="${image}" alt="${product.name}" loading="lazy"></div>` : ''}
            <div class="product-details">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || ''}</p>
                <div class="product-footer">
                    <div class="product-price">${formattedPrice}</div>
                    <span class="box-product-info-note">Товар настраивается выше</span>
                </div>
            </div>
        `;

        const img = card.querySelector('.box-product-info-image');
        if (img) {
            img.addEventListener('error', () => img.closest('.product-photo')?.remove(), { once: true });
            img.addEventListener('click', () => this.openImageViewer(img.src, img.alt));
            img.setAttribute('role', 'button');
            img.setAttribute('tabindex', '0');
            img.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.openImageViewer(img.src, img.alt);
                }
            });
        }
        return card;
    }

    createBoxConfigurator() {
        const config = window.BOX_CONFIGURATOR_CONFIG;
        if (!config || !config.enabled) return null;
        const esc = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        const fronts = Array.isArray(config.frontDesigns) ? config.frontDesigns : [];
        const frontBases = Array.isArray(config.frontBaseDesigns) ? config.frontBaseDesigns : [];
        const backs = Array.isArray(config.backDesigns) ? config.backDesigns : [];
        const materials = Array.isArray(config.materials) ? config.materials : [];
        let fi = 0, fbi = 0, bi = 0, mi = 0;
        const section = document.createElement('section');
        section.className = 'box-configurator';
        section.setAttribute('aria-label', 'Конфигуратор шкатулки');
        const hasBg = Boolean(config.background);
        section.innerHTML =
            '<div class="box-configurator-heading"><h2>Собери свою шкатулку</h2><p>Выбери оформление передней и задней стороны</p></div>' +
            '<div class="box-configurator-preview ' + (hasBg ? '' : 'is-placeholder') + '">' +
              (hasBg ? '<img class="box-preview-background" src="' + esc(config.background) + '" alt="Обе стороны шкатулки">' :
                '<div class="box-preview-placeholder"><span>⚰</span><strong>Предпросмотр шкатулки</strong><small>Фоновое фото добавим позже</small></div>') +
              (hasBg ? '<img class="box-preview-back" alt="Выбранная карта Таро" hidden><img class="box-preview-front-base" alt="Подложка под анкх" hidden><img class="box-preview-front" alt="Выбранный анкх" hidden>' : '') +
            '</div>' +
            '<div class="box-configurator-controls">' +
              '<div class="box-configurator-control"><label>Выбор задника</label><div class="box-configurator-selector"><button type="button" class="box-configurator-arrow back-prev" aria-label="Предыдущий задник">‹</button><span class="box-configurator-value back-value"></span><button type="button" class="box-configurator-arrow back-next" aria-label="Следующий задник">›</button></div></div>' +
              '<div class="box-configurator-control"><label>Подложка под анкх (передник)</label><div class="box-configurator-selector"><button type="button" class="box-configurator-arrow base-prev" aria-label="Предыдущая подложка">‹</button><span class="box-configurator-value base-value"></span><button type="button" class="box-configurator-arrow base-next" aria-label="Следующая подложка">›</button></div></div>' +
              '<div class="box-configurator-control"><label>Цвет анкха (передник)</label><div class="box-configurator-selector"><button type="button" class="box-configurator-arrow front-prev" aria-label="Предыдущий цвет анкха">‹</button><span class="box-configurator-value front-value"></span><button type="button" class="box-configurator-arrow front-next" aria-label="Следующий цвет анкха">›</button></div></div>' +
              '<div class="box-configurator-control"><label>Материал шкатулки</label><div class="box-configurator-selector"><button type="button" class="box-configurator-arrow material-prev" aria-label="Предыдущий материал">‹</button><span class="box-configurator-value material-value"></span><button type="button" class="box-configurator-arrow material-next" aria-label="Следующий материал">›</button></div></div>' +
            '</div>' +
            '<div class="box-configurator-footer"><div class="box-configurator-price">' + (config.price == null ? 'Цена уточняется' : this.formatPrice(config.price)) + '</div><button type="button" class="box-configurator-add" disabled>Добавить в корзину</button><p class="box-configurator-hint"></p></div>';
        const frontImg = section.querySelector('.box-preview-front');
        const frontBaseImg = section.querySelector('.box-preview-front-base');
        const backImg = section.querySelector('.box-preview-back');
        const addBtn = section.querySelector('.box-configurator-add');
        const hint = section.querySelector('.box-configurator-hint');
        const update = () => {
            const front = fronts[fi], frontBase = frontBases[fbi], back = backs[bi], material = materials[mi];
            section.querySelector('.front-value').textContent = front ? front.name : 'Цвета добавим позже';
            section.querySelector('.back-value').textContent = back ? back.name : 'Дизайны добавим позже';
            section.querySelector('.base-value').textContent = frontBase ? frontBase.name : 'Варианты добавим позже';
            section.querySelector('.material-value').textContent = material ? material.name : 'Не задан';
            if (frontImg) { frontImg.src = front && front.image ? front.image : ''; frontImg.hidden = !(front && front.image); }
            if (frontBaseImg) { frontBaseImg.src = frontBase && frontBase.image ? frontBase.image : ''; frontBaseImg.hidden = !(frontBase && frontBase.image); }
            if (backImg) { backImg.src = back && back.image ? back.image : ''; backImg.hidden = !(back && back.image); }
            const ready = Boolean(config.background && front && front.image && frontBase && frontBase.image && back && back.image && material);
            addBtn.disabled = !ready || config.price == null;
            hint.textContent = ready ? 'Выбранные параметры будут переданы в заказ.' : 'Заказ станет доступен после добавления фонового фото и всех трёх наборов PNG-дизайнов.';
        };
        const bind = (key, list, get, set) => {
            const prev = section.querySelector('.' + key + '-prev');
            const next = section.querySelector('.' + key + '-next');
            [prev, next].forEach(button => { if (button) button.disabled = list.length < 2; });
            if (prev) prev.addEventListener('click', () => { if (!list.length) return; set((get() - 1 + list.length) % list.length); update(); });
            if (next) next.addEventListener('click', () => { if (!list.length) return; set((get() + 1) % list.length); update(); });
        };
        bind('back', backs, () => bi, value => { bi = value; });
        bind('front', fronts, () => fi, value => { fi = value; });
        bind('base', frontBases, () => fbi, value => { fbi = value; });
        bind('material', materials, () => mi, value => { mi = value; });
        addBtn.addEventListener('click', () => this.addConfiguredBoxToCart({
            productId: config.productId, productName: config.productName, price: config.price,
            background: config.background, front: fronts[fi], frontBase: frontBases[fbi], back: backs[bi], material: materials[mi]
        }));
        update();
        return section;
    }

    addConfiguredBoxToCart(selection) {
        const configuration = { front: selection.front.name, frontBase: selection.frontBase.name, back: selection.back.name, material: selection.material.name };
        const product = {
            id: [selection.productId, configuration.front, configuration.back, configuration.material].join('|'),
            name: selection.productName, description: 'Индивидуальная конфигурация шкатулки',
            category: 'Шкатулки', price: selection.price,
            photo: selection.background ? [selection.background] : [], configuration
        };
        this.addToCart(product);
        const button = this.elements.catalogContainer.querySelector('.box-configurator-add');
        if (button) this.animateAddToCart(button);
    }

    // Анимация добавления в корзину
    animateAddToCart(button) {
        const originalText = button.textContent;
        button.style.transform = 'scale(0.9)';
        button.textContent = SHOP_CONFIG.messages.addedToCart;
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
            button.textContent = originalText;
        }, 500);
    }

    // Форматирование цены
    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: SHOP_CONFIG.currency.code,
            minimumFractionDigits: 0
        }).format(price);
    }

    // Логика корзины
    addToCart(product) {
        const existingProduct = this.cart.find(p => p.id === product.id);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        this.updateCart();
        
        // Тактильная обратная связь
        if (this.tg && this.tg.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred('light');
        }
    }

    changeQuantity(productId, delta) {
        const product = this.cart.find(p => String(p.id) === String(productId));
        if (!product) return;

        product.quantity += delta;

        if (product.quantity <= 0) {
            this.cart = this.cart.filter(p => String(p.id) !== String(productId));
        }
        this.updateCart();
    }

    updateCart() {
        const totalItems = this.cart.reduce((sum, product) => sum + product.quantity, 0);
        this.elements.cartCounter.textContent = totalItems;
        this.elements.cartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
        this.renderCartItems();
        this.calculateTotalPrice();
    }

    renderCartItems() {
        this.elements.cartItemsContainer.innerHTML = '';

        if (this.cart.length === 0) {
            this.elements.cartItemsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: white;">
                    <div style="font-size: 64px; margin-bottom: 16px;">🛒</div>
                    <p style="font-size: 18px; opacity: 0.8;">${SHOP_CONFIG.messages.emptyCart}</p>
                    <p style="font-size: 14px; opacity: 0.6; margin-top: 8px;">${SHOP_CONFIG.messages.emptyCartDescription}</p>
                </div>
            `;
            this.elements.orderForm.style.display = 'none';
            this.elements.cartSummary.style.display = 'none';
            return;
        }
        
        this.elements.orderForm.style.display = 'block';
        this.elements.cartSummary.style.display = 'block';

        this.cart.forEach(product => {
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            const formattedPrice = this.formatPrice(product.price);
            const cartPhoto = Array.isArray(product.photo) ? product.photo[0] : (product.photos?.[0] || product.gallery?.[0] || product.photo);
            const placeholderPhoto = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#171316"/><path d="M50 12 L78 28 L78 72 L50 90 L22 72 L22 28 Z" fill="none" stroke="#713b50" stroke-width="2"/></svg>');
            
            const configurationHtml = product.configuration ? `<div class="cart-item-configuration">Передник, анкх: ${product.configuration.front}<br>Подложка: ${product.configuration.frontBase}<br>Задник: ${product.configuration.back}<br>Материал: ${product.configuration.material}</div>` : '';
            itemEl.innerHTML = `
                <img src="${cartPhoto || placeholderPhoto}" class="cart-item-img" alt="${product.name}" 
                     onerror="this.src='https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&h=100&fit=crop';">
                <div class="cart-item-details">
                    <div class="cart-item-name">${product.name}</div>
                    <div class="cart-item-price">${formattedPrice}</div>
                    ${configurationHtml}
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" data-product-id="${product.id}" data-delta="-1">−</button>
                    <span class="item-quantity">${product.quantity}</span>
                    <button class="quantity-btn" data-product-id="${product.id}" data-delta="1">+</button>
                </div>
            `;
            this.elements.cartItemsContainer.appendChild(itemEl);
        });

        // Добавляем обработчики для кнопок количества
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                const delta = parseInt(e.target.dataset.delta, 10);
                this.changeQuantity(productId, delta);
            });
        });
    }

    calculateTotalPrice() {
        const total = this.cart.reduce((sum, product) => sum + ((product.price || 0) * product.quantity), 0);
        const formattedTotal = this.formatPrice(total);
        this.elements.cartTotalPriceEl.textContent = formattedTotal;
    }

    // Управление модальным окном корзины
    openCart() {
        this.elements.cartModal.style.display = 'flex';
        this.renderCartItems();
    }

    closeCart() {
        this.elements.cartModal.style.display = 'none';
    }

    // Открываем личный чат продавца с подготовленным заказом
    submitOrder() {
        if (this.cart.length === 0) {
            this.showAlert(SHOP_CONFIG.messages.emptyCart);
            return;
        }

        const orderLines = this.cart.map(product => {
            const lineTotal = product.price * product.quantity;
            const description = (product.description || 'Описание не указано').trim();
            return `• ${product.category} — ${product.name}
  Описание: ${description}
  ${product.price} ₽ × ${product.quantity} = ${lineTotal} ₽${product.configuration ? `\n  Передник, анкх: ${product.configuration.front}\n  Подложка под анкх: ${product.configuration.frontBase}\n  Задник: ${product.configuration.back}\n  Материал: ${product.configuration.material}` : ''}`;
        });

        const total = this.cart.reduce((sum, product) => sum + product.price * product.quantity, 0);
        const message = [
            'Здравствуйте! Хочу купить:',
            '',
            ...orderLines,
            '',
            `Итого: ${total} ₽`
        ].join('\n');

        const telegramUrl = `https://t.me/djdktn?text=${encodeURIComponent(message)}`;

        if (this.tg && typeof this.tg.openTelegramLink === 'function') {
            this.tg.openTelegramLink(telegramUrl);
        } else {
            window.open(telegramUrl, '_blank', 'noopener');
        }
    }

    getPaymentMethodLabel(value) {
        const method = SHOP_CONFIG.paymentMethods.find(m => m.value === value);
        return method ? method.label : 'Не указан';
    }

    processOrder(orderData) {
        // Анимация отправки
        this.elements.submitOrderButton.innerHTML = SHOP_CONFIG.messages.sending;
        this.elements.submitOrderButton.disabled = true;

        setTimeout(() => {
            if (this.tg && this.tg.sendData) {
                this.tg.sendData(JSON.stringify(orderData));
            } else {
                console.log('Данные заказа:', orderData);
            }
            
            this.showAlert(SHOP_CONFIG.messages.orderSuccess);

            // Очищаем корзину и форму
            this.cart = [];
            this.updateCart();
            this.clearOrderForm();
            this.closeCart();
            
            this.elements.submitOrderButton.innerHTML = '✅ Оформить заказ';
            this.elements.submitOrderButton.disabled = false;

            if (this.tg && this.tg.close) {
                setTimeout(() => this.tg.close(), 1000);
            }
        }, 1500);
    }

    clearOrderForm() {
        this.elements.customerNameInput.value = '';
        this.elements.organizationInput.value = '';
        this.elements.phoneInput.value = '';
        this.elements.addressInput.value = '';
    }

    showAlert(message) {
        if (this.tg && this.tg.showAlert) {
            this.tg.showAlert(message);
        } else {
            alert(message);
        }
    }

    // Логика категорий
    renderCategories() {
        this.elements.categoriesContainer.innerHTML = '';
        
        // Фильтруем только включенные категории
        const enabledCategories = CATEGORIES.filter(cat => cat.enabled);
        
        enabledCategories.forEach((category, index) => {
            const button = document.createElement('div');
            button.className = 'category-button';
            
            if (SHOP_CONFIG.animation.enabled) {
                button.style.animationDelay = `${index * SHOP_CONFIG.animation.staggerDelay}ms`;
            }
            
            if (category.name === this.currentCategory) {
                button.classList.add('active');
            }
            
            button.innerHTML = `
                <span class="category-icon">${category.icon}</span>
                <span class="category-name">${category.name}</span>
                <span class="category-description">${category.description}</span>
            `;
            
            button.addEventListener('click', () => {
                this.filterProductsByCategory(category.name);
                document.querySelectorAll('.category-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
            });
            
            this.elements.categoriesContainer.appendChild(button);
        });
    }

    // Информационная карточка категории (не является товаром).
    // Поддерживает одну карточку (info) или карусель карточек (infoCards).
    createCategoryInfoCard(category) {
        const cardsData = Array.isArray(category?.infoCards)
            ? category.infoCards
            : (category?.info ? [category.info] : []);
        const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[char]));

        const slides = cardsData.map(info => {
            info = info || {};
            const title = (info.title || '').trim();
            const description = (info.description || '').trim();
            const dimensions = (info.dimensions || '').trim();
            const packaging = (info.packaging || '').trim();
            const image = (info.image || '').trim();
            if (!title && !description && !dimensions && !packaging && !image) return '';

            return `
                <article class="category-info-card">
                    ${image ? `<div class="category-info-image-wrap"><img class="category-info-image" src="${escapeHtml(image)}" alt="${escapeHtml(title || category.name)}" loading="lazy"></div>` : ''}
                    <div class="category-info-content">
                        ${title ? `<h2 class="category-info-title">${escapeHtml(title)}</h2>` : ''}
                        ${description ? `<p class="category-info-description">${escapeHtml(description)}</p>` : ''}
                        ${dimensions ? `<div class="category-info-detail"><span class="category-info-label">Размеры</span><p>${escapeHtml(dimensions)}</p></div>` : ''}
                        ${packaging ? `<div class="category-info-detail"><span class="category-info-label">Упаковка</span><p>${escapeHtml(packaging)}</p></div>` : ''}
                    </div>
                </article>
            `;
        }).filter(Boolean);

        if (!slides.length) return null;

        const wrapper = document.createElement('section');
        wrapper.className = 'category-info-carousel';
        wrapper.setAttribute('aria-label', 'Информация о категории');
        wrapper.innerHTML = `
            <div class="category-info-track">${slides.join('')}</div>
            ${slides.length > 1 ? `
                <div class="category-info-controls">
                    <button type="button" class="category-info-arrow prev" aria-label="Предыдущая карточка">‹</button>
                    <div class="category-info-pagination" aria-live="polite">
                        <span class="category-info-current">1</span> / <span>${slides.length}</span>
                    </div>
                    <button type="button" class="category-info-arrow next" aria-label="Следующая карточка">›</button>
                </div>
            ` : ''}
        `;

        const track = wrapper.querySelector('.category-info-track');
        const slideEls = [...track.children];
        let currentIndex = 0;
        const updateSlide = index => {
            currentIndex = (index + slideEls.length) % slideEls.length;
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            const current = wrapper.querySelector('.category-info-current');
            if (current) current.textContent = String(currentIndex + 1);
        };
        wrapper.querySelector('.category-info-arrow.prev')?.addEventListener('click', () => updateSlide(currentIndex - 1));
        wrapper.querySelector('.category-info-arrow.next')?.addEventListener('click', () => updateSlide(currentIndex + 1));

        let touchStartX = 0;
        track.addEventListener('touchstart', event => {
            touchStartX = event.changedTouches[0].clientX;
        }, { passive: true });
        track.addEventListener('touchend', event => {
            const deltaX = event.changedTouches[0].clientX - touchStartX;
            if (Math.abs(deltaX) > 45 && slideEls.length > 1) updateSlide(currentIndex + (deltaX < 0 ? 1 : -1));
        }, { passive: true });

        wrapper.querySelectorAll('.category-info-image').forEach(infoImage => {
            infoImage.addEventListener('error', () => {
                infoImage.closest('.category-info-image-wrap')?.remove();
            }, { once: true });
            infoImage.addEventListener('click', () => this.openImageViewer(infoImage.src, infoImage.alt));
        });
        return wrapper;
    }

    filterProductsByCategory(categoryName) {
        this.currentCategory = categoryName;
        let filtered = [];

        if (categoryName === 'Все товары') {
            filtered = this.allProducts;
        } else {
            filtered = this.allProducts.filter(product => product.category === categoryName);
        }
        const boxConfig = window.BOX_CONFIGURATOR_CONFIG;
        if (categoryName === boxConfig?.category && boxConfig?.enabled) {
            filtered = filtered.filter(product => product.id !== boxConfig.productId);
        }
        this.renderProducts(filtered);

        if (categoryName !== 'Все товары') {
            const category = CATEGORIES.find(item => item.name === categoryName);
            const infoCard = this.createCategoryInfoCard(category);
            if (infoCard) this.elements.catalogContainer.prepend(infoCard);
            if (categoryName === boxConfig?.category && boxConfig?.enabled) {
                const configurator = this.createBoxConfigurator();
                const boxProduct = this.allProducts.find(product => String(product.id) === String(boxConfig.productId));
                const productInfoCard = this.createBoxProductInfoCard(boxProduct, boxConfig);
                if (productInfoCard) this.elements.catalogContainer.prepend(productInfoCard);
                if (configurator) this.elements.catalogContainer.prepend(configurator);
            }
        }
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new ShopApp();
});
