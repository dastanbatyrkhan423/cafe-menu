let cart = {};
let cartItemCount = 0;

function updateCart() {
    // Обновляем количество товаров в корзине
    cartItemCount = 0;
    let totalPrice = 0;
    
    for (let id in cart) {
        if (cart[id] && cart[id].quantity > 0) {
            cartItemCount += cart[id].quantity;
            totalPrice += cart[id].price * cart[id].quantity;
        }
    }
    
    // Обновляем счетчик на иконке корзины
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.innerText = cartItemCount;
    }
    
    // Сохраняем корзину в localStorage, чтобы она была доступна на странице корзины
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('cartTotal', totalPrice.toFixed(2));
}

function addToCart(dishId, dishName, dishPrice, dishImage) {
    console.log("Добавляем в корзину:", { dishId, dishName, dishPrice, dishImage });
    
    // Проверяем, что событие существует
    if (!event || !event.currentTarget) {
        console.error('Событие не найдено');
        updateCartData();
        return;
    }
    
    performAddToCartAnimation();
    
    function performAddToCartAnimation() {
        const button = event.currentTarget;
        const cartIcon = document.querySelector('.cart-icon');
        
        if (!cartIcon) {
            console.error('Иконка корзины не найдена');
            updateCartData();
            return;
        }
        
        const buttonRect = button.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();

        // Находим изображение блюда
        let imageUrl = '/static/images/no-image.jpg';
        const menuItem = button.closest('.menu-item');
        if (menuItem) {
            const itemImage = menuItem.querySelector('.menu-item-img');
            if (itemImage && itemImage.src) {
                imageUrl = itemImage.src;
            }
        }

        // Создаем элемент изображения
        const flyingImg = document.createElement('img');
        flyingImg.src = imageUrl;
        flyingImg.style.cssText = `
            position: fixed;
            z-index: 10000;
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 50%;
            pointer-events: none;
            top: ${buttonRect.top}px;
            left: ${buttonRect.left}px;
            opacity: 0;
            transform: scale(0.5);
            transition: all 0.8s cubic-bezier(0.2, 0.6, 0.4, 1);
            background: #ffd700;
        `;

        // Обработчик ошибки загрузки изображения
        flyingImg.onerror = function() {
            this.style.background = '#ffd700';
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.style.fontSize = '20px';
            this.style.color = '#000';
            this.style.fontWeight = 'bold';
            this.textContent = '✓';
        };

        document.body.appendChild(flyingImg);

        // Задержка перед анимацией для гарантированной отрисовки
        setTimeout(() => {
            flyingImg.style.opacity = '1';
            flyingImg.style.transform = 'scale(1)';
            
            setTimeout(() => {
                flyingImg.style.top = (cartRect.top + cartRect.height/2 - 25) + 'px';
                flyingImg.style.left = (cartRect.left + cartRect.width/2 - 25) + 'px';
                flyingImg.style.transform = 'scale(0.5)';
            }, 50);
        }, 50);

        // Обработчик завершения анимации
        const animationEndHandler = (event) => {
            if (event.propertyName === 'left') {
                flyingImg.removeEventListener('transitionend', animationEndHandler);
                flyingImg.remove();
                
                // Анимация встряхивания корзины
                cartIcon.classList.add('cart-shake');
                setTimeout(() => cartIcon.classList.remove('cart-shake'), 500);
                
                // Обновляем корзину
                updateCartData();
            }
        };

        flyingImg.addEventListener('transitionend', animationEndHandler);
    }

    function updateCartData() {
        let cart = JSON.parse(localStorage.getItem('cart') || '{}');

        if (cart[dishId]) {
            cart[dishId].quantity++;
        } else {
            cart[dishId] = {
                id: dishId,
                name: dishName,
                price: dishPrice,
                quantity: 1,
                image: dishImage || '/static/images/no-image.jpg'
            };
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Обновляем счетчик
        let count = 0;
        for (const id in cart) {
            if (cart[id] && cart[id].quantity > 0) {
                count += cart[id].quantity;
            }
        }
        
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.innerText = count;
        }
        
        // Показываем уведомление
        showNotification("Товар добавлен в корзину");
    }
}

// Функция для уведомления
function showNotification(message) {
    // Создаем элемент для уведомления
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    
    // Добавляем на страницу
    document.body.appendChild(notification);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 2500);
}

// Инициализация корзины при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, есть ли сохраненная корзина
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }

    // Настроим обработчики для прокрутки категорий
    const categoryNav = document.querySelector('.category-navigation');
    const categoryLinks = document.querySelectorAll('.category-link');
    const categories = document.querySelectorAll('.category');
    let lastScrollTop = 0;
    
    // Функция для плавного появления категорий при скролле
    function revealCategories() {
        categories.forEach(category => {
            const categoryTop = category.getBoundingClientRect().top;
            const categoryBottom = category.getBoundingClientRect().bottom;
            
            if (categoryTop < window.innerHeight - 100 && categoryBottom > 0) {
                category.style.opacity = '1';
                category.style.transform = 'translateY(0)';
            }
        });
    }

    // Обработка прокрутки
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Добавляем эффект прокрутки для навигации
        if (scrollTop > 100) {
            categoryNav.classList.add('scrolled');
            // Эффект скрытия навигации при прокрутке вниз
            if (scrollTop > lastScrollTop) {
                categoryNav.style.transform = 'translateY(-100%)';
            } else {
                categoryNav.style.transform = 'translateY(0)';
            }
        } else {
            categoryNav.classList.remove('scrolled');
            categoryNav.style.transform = 'translateY(0)';
        }

        lastScrollTop = scrollTop;
        revealCategories();

        // Подсвечиваем текущую категорию при скролле
        categories.forEach((category, index) => {
            const rect = category.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom >= 150) {
                categoryLinks.forEach(link => link.classList.remove('active'));
                categoryLinks[index].classList.add('active');
            }
        });
    });

    // Обработка клика по категории
    categoryLinks.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Анимация нажатия
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);

            // Удаляем активный класс у всех ссылок
            categoryLinks.forEach(l => l.classList.remove('active'));
            
            // Добавляем активный класс текущей ссылке
            this.classList.add('active');
            
            // Получаем целевую категорию
            const targetId = this.getAttribute('href').substring(1);
            const targetCategory = document.getElementById(targetId);
            
            if (targetCategory) {
                // Плавная прокрутка к категории
                const navHeight = categoryNav.offsetHeight;
                const targetPosition = targetCategory.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Добавляем эффект появления для элементов категории
                const menuItems = targetCategory.querySelectorAll('.menu-item');
                menuItems.forEach((item, i) => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, i * 100);
                });
            }
        });

        // Добавляем эффект при наведении
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });

        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Инициализация: показываем первую категорию и активируем первую ссылку
    if (categories.length > 0 && categoryLinks.length > 0) {
        categories[0].style.display = 'block';
        categoryLinks[0].classList.add('active');
    }

    // Добавляем плавное появление для всех элементов меню при загрузке
    document.querySelectorAll('.menu-item').forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Обработчики для кнопок прокрутки
    const scrollLeftBtn = document.getElementById('scroll-left');
    const scrollRightBtn = document.getElementById('scroll-right');
    
    if (scrollLeftBtn) {
        scrollLeftBtn.addEventListener('click', function() {
            const navigation = document.querySelector('.category-navigation');
            if (navigation) {
                navigation.scrollBy({
                    left: -200,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    if (scrollRightBtn) {
        scrollRightBtn.addEventListener('click', function() {
            const navigation = document.querySelector('.category-navigation');
            if (navigation) {
                navigation.scrollBy({
                    left: 200,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // Создаем файл-заглушку через JavaScript, если его нет
    createFallbackImage();
});

// Функция для создания и сохранения файла-заглушки
function createFallbackImage() {
    // Проверяем, существует ли уже заглушка
    const testImg = new Image();
    testImg.onload = function() {
        console.log("Изображение-заглушка уже существует");
    };
    testImg.onerror = function() {
        console.log("Изображение-заглушка не найдено, пытаемся создать динамически");
        
        // Создаем элемент canvas
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        // Заполняем фон серым цветом
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 200, 200);
        
        // Добавляем текст
        ctx.fillStyle = '#999999';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Нет изображения', 100, 100);
        
        // Создаем img элемент на странице с data URL из canvas
        const fallbackImg = document.createElement('img');
        fallbackImg.src = canvas.toDataURL('image/png');
        fallbackImg.style.display = 'none';
        fallbackImg.id = 'fallback-image';
        document.body.appendChild(fallbackImg);
        
        // Можно использовать эту заглушку для любого изображения, которое не загрузилось
        document.addEventListener('error', function(e) {
            if (e.target.tagName.toLowerCase() === 'img') {
                e.target.src = fallbackImg.src;
            }
        }, true);
    };
    
    // Проверяем наличие файла
    testImg.src = '/static/images/no-image.jpg';
}

// Добавляем новую функцию для анимации категорий
function initializeCategoryNavigation() {
    const categoryNav = document.querySelector('.category-navigation');
    const categoryLinks = document.querySelectorAll('.category-link');
    const categories = document.querySelectorAll('.category');
    const indicator = document.createElement('div');
    
    // Добавляем индикатор активной категории
    indicator.className = 'category-indicator';
    categoryNav.appendChild(indicator);

    // Функция для обновления индикатора
    function updateIndicator(link) {
        const rect = link.getBoundingClientRect();
        const navRect = categoryNav.getBoundingClientRect();
        
        indicator.style.width = `${rect.width}px`;
        indicator.style.left = `${rect.left - navRect.left}px`;
    }

    // Показываем первую категорию при загрузке
    if (categoryLinks.length > 0) {
        updateIndicator(categoryLinks[0]);
        categoryLinks[0].classList.add('active');
        if (categories[0]) {
            categories[0].classList.add('active');
        }
    }

    // Обработчик клика по категории
    categoryLinks.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Анимация индикатора
            updateIndicator(this);

            // Удаляем активный класс у всех ссылок и категорий
            categoryLinks.forEach(l => l.classList.remove('active'));
            categories.forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });

            // Активируем текущую категорию
            this.classList.add('active');
            if (categories[index]) {
                categories[index].style.display = 'block';
                categories[index].classList.add('active');

                // Анимация элементов категории
                const items = categories[index].querySelectorAll('.menu-item');
                items.forEach((item, i) => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, i * 100);
                });
            }
        });
    });

    // Обновляем индикатор при скролле
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        
        categories.forEach((category, index) => {
            const rect = category.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom >= 150) {
                categoryLinks.forEach(l => l.classList.remove('active'));
                categoryLinks[index].classList.add('active');
                updateIndicator(categoryLinks[index]);
            }
        });
    });
}

// Вызываем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeCategoryNavigation);