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
            if (e.key === 'Escape' && this.elements.cartModal.style.display === 'flex') {
                this.closeCart();
            }
        });
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

        // Обновление заголовков секций
        document.querySelector('.categories-section .section-title').textContent = SHOP_CONFIG.sectionTitles.categories;
        document.querySelector('.products-section .section-title').textContent = SHOP_CONFIG.sectionTitles.products;
    }

    // ИСПРАВЛЕНО: Загрузка товаров
    async loadProducts() {
        try {
            this.showLoader();
            
            // Проверяем наличие встроенного каталога
            if (window.EMBEDDED_CATALOG && Array.isArray(window.EMBEDDED_CATALOG)) {
                console.log('Используем встроенный каталог');
                this.allProducts = window.EMBEDDED_CATALOG;
                this.renderProducts(this.allProducts);
                return;
            }
            
            // Попытка загрузить из JSON файла
            try {
                const response = await fetch('data/catalog.json');
                if (response.ok) {
                    const data = await response.json();
                    this.allProducts = data;
                    console.log('Каталог загружен из JSON');
                } else {
                    throw new Error('Файл не найден');
                }
            } catch (error) {
                console.log('Не удалось загрузить catalog.json, используем тестовые данные');
                // Fallback к тестовым данным
                this.allProducts = this.getTestProducts();
            }
            
            this.renderProducts(this.allProducts);
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
            this.showError('Не удалось загрузить товары');
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


    // Создание карточки товара (с поддержкой нескольких фото)
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        const formattedPrice = this.formatPrice(product.price);
        
        // Нормализуем фото в массив
        const photos = Array.isArray(product.photo) ? product.photo : [product.photo];
        const mainPhoto = photos[0] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=300&fit=crop';
        
        // Генерируем миниатюры, если фото больше одного
        let thumbnailsHtml = '';
        if (photos.length > 1) {
            thumbnailsHtml = `<div class="product-thumbnails">` +
                photos.map((p, i) => 
                    `<img src="${p}" class="product-thumb ${i === 0 ? 'active' : ''}" 
                          data-src="${p}" alt="Фото ${i + 1}">`
                ).join('') +
                `</div>`;
        }
        
        card.innerHTML = `
            <div class="product-photo">
                <img class="product-main-img" src="${mainPhoto}" alt="${product.name}" 
                     onerror="this.src='https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=300&fit=crop';">
                ${thumbnailsHtml}
            </div>
            <div class="product-details">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <div class="product-price">${formattedPrice}</div>
                    <button class="add-to-cart-button">В корзину</button>
                </div>
            </div>
        `;
        
        // Логика переключения изображений по миниатюрам
        const mainImg = card.querySelector('.product-main-img');
        const thumbnails = card.querySelectorAll('.product-thumb');
        
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                mainImg.src = thumb.dataset.src;
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });
        
        const addToCartButton = card.querySelector('.add-to-cart-button');
        addToCartButton.addEventListener('click', () => {
            this.addToCart(product);
            this.animateAddToCart(addToCartButton);
        });
        
        return card;
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
        const product = this.cart.find(p => p.id === productId);
        if (!product) return;

        product.quantity += delta;

        if (product.quantity <= 0) {
            this.cart = this.cart.filter(p => p.id !== productId);
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
            
            itemEl.innerHTML = `
                <img src="${product.photo}" class="cart-item-img" alt="${product.name}" 
                     onerror="this.src='https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&h=100&fit=crop';">
                <div class="cart-item-details">
                    <div class="cart-item-name">${product.name}</div>
                    <div class="cart-item-price">${formattedPrice}</div>
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
                const productId = parseInt(e.target.dataset.productId, 10);
                const delta = parseInt(e.target.dataset.delta, 10);
                this.changeQuantity(productId, delta);
            });
        });
    }

    calculateTotalPrice() {
        const total = this.cart.reduce((sum, product) => sum + (product.price * product.quantity), 0);
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

    // ИСПРАВЛЕНО: Отправка заказа с обязательной организацией
    submitOrder() {
        const customerName = this.elements.customerNameInput.value.trim();
        const organization = this.elements.organizationInput.value.trim();
        const phone = this.elements.phoneInput.value.trim();
        const address = this.elements.addressInput.value.trim();
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

        if (this.cart.length === 0) {
            this.showAlert(SHOP_CONFIG.messages.emptyCart);
            return;
        }
        
        // ИСПРАВЛЕНО: Организация теперь обязательна
        if (!customerName || !organization || !phone || !address) {
            this.showAlert('Пожалуйста, заполните все обязательные поля: имя, организацию, телефон и адрес доставки.');
            return;
        }

        // Добавляем данные Telegram пользователя
        const telegramUser = this.tg ? this.tg.initDataUnsafe.user : null;

        const orderData = {
            items: this.cart.map(p => ({ 
                id: p.id, 
                sku: p.sku, // Добавляем артикул для админа
                name: p.name, 
                price: p.price, 
                quantity: p.quantity 
            })),
            totalPrice: this.cart.reduce((sum, p) => sum + (p.price * p.quantity), 0),
            customer: {
                name: customerName,
                organization: organization,
                phone: phone,
                address: address,
                paymentMethod: this.getPaymentMethodLabel(paymentMethod),
                // Telegram данные пользователя
                telegramId: telegramUser?.id || '',
                telegramUsername: telegramUser?.username || '',
                telegramFirstName: telegramUser?.first_name || '',
                telegramLastName: telegramUser?.last_name || ''
            },
            orderDate: new Date().toISOString(),
            shopInfo: {
                name: SHOP_CONFIG.shopTitle,
                contact: SHOP_CONFIG.contact
            }
        };

        this.processOrder(orderData);
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

    filterProductsByCategory(categoryName) {
        this.currentCategory = categoryName;
        let filtered = [];

        if (categoryName === 'Все товары') {
            filtered = this.allProducts;
        } else {
            const selectedCategory = CATEGORIES.find(cat => cat.name === categoryName);
            if (selectedCategory && selectedCategory.keywords.length > 0) {
                filtered = this.allProducts.filter(product => {
                    const productNameLower = product.name.toLowerCase();
                    const productDescriptionLower = product.description.toLowerCase();
                    return selectedCategory.keywords.some(keyword => 
                        productNameLower.includes(keyword.toLowerCase()) || 
                        productDescriptionLower.includes(keyword.toLowerCase())
                    );
                });
            } else {
                filtered = [];
            }
        }
        this.renderProducts(filtered);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new ShopApp();
});
