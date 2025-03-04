document.addEventListener('DOMContentLoaded', () => {
    // Загружаем корзину при загрузке страницы
    const savedCart = localStorage.getItem('cart');
    if (!savedCart || Object.keys(JSON.parse(savedCart)).length === 0) {
        showEmptyCart();
    } else {
        displayCartItems(JSON.parse(savedCart));
        updateTotals();
    }

    // Настраиваем модальное окно
    const modal = document.getElementById('order-modal');
    const checkoutBtn = document.getElementById('checkout-btn');
    if (modal && checkoutBtn) {
        const close = document.querySelector('.close');
        
        checkoutBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });
        
        if (close) {
            close.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Настраиваем обработчик формы заказа
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitOrder();
        });
    }

    // Добавляем один обработчик на контейнер корзины
    const cartItemsContainer = document.getElementById('cart-items-container');
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', handleCartActions);
    }
    
    // Отображаем рекомендации, если мы на странице корзины
    if (window.location.pathname.includes('/cart/')) {
        displaySuggestions();
    }
});

// Обработчик всех действий с корзиной
function handleCartActions(e) {
    const target = e.target;
    
    // Проверяем, что клик был по кнопке +, - или удалить
    if (!target.classList.contains('plus') && 
        !target.classList.contains('minus') && 
        !target.classList.contains('remove-btn')) {
        return;
    }
    
    const cartItem = target.closest('.cart-item');
    if (!cartItem) return;

    const itemId = cartItem.dataset.id;
    if (!itemId) {
        console.error('ID товара не найден');
        return;
    }
    
    // Получаем текущую корзину из localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '{}');
    if (!cart[itemId]) {
        console.error('Товар не найден в корзине');
        return;
    }
    
    const quantityElement = cartItem.querySelector('.quantity');
    if (!quantityElement) {
        console.error('Элемент количества не найден');
        return;
    }
    
    let quantity = parseInt(quantityElement.textContent);

    // Обработка кнопки плюс
    if (target.classList.contains('plus')) {
        quantity++;
        cart[itemId].quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        quantityElement.textContent = quantity;
        updateTotals();
        
        // Добавляем анимацию нажатия
        target.classList.add('clicked');
        setTimeout(() => target.classList.remove('clicked'), 200);
    }

    // Обработка кнопки минус
    if (target.classList.contains('minus')) {
        if (quantity > 1) {
            quantity--;
            cart[itemId].quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            quantityElement.textContent = quantity;
            updateTotals();
            
            // Добавляем анимацию нажатия
            target.classList.add('clicked');
            setTimeout(() => target.classList.remove('clicked'), 200);
        }
    }

    // Обработка удаления
    if (target.classList.contains('remove-btn')) {
        delete cart[itemId];
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Анимация удаления
        cartItem.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            cartItem.remove();
            
            // Проверяем, остались ли товары в корзине
            if (Object.keys(cart).length === 0) {
                showEmptyCart();
            } else {
                updateTotals();
            }
        }, 300);
    }
}

function displayCartItems(cart) {
    const cartItemsContainer = document.getElementById('cart-items-container');
    if (!cartItemsContainer) {
        console.error("Контейнер для элементов корзины не найден");
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    
    // Проверяем, есть ли товары в корзине
    let hasItems = false;
    for (const id in cart) {
        if (cart[id] && cart[id].quantity > 0) {
            hasItems = true;
            break;
        }
    }
    
    if (!hasItems) {
        showEmptyCart();
        return;
    }
    
    // Отображаем товары
    for (const id in cart) {
        const item = cart[id];
        if (item && item.quantity > 0) {
            const template = document.getElementById('cart-item-template');
            if (!template) {
                console.error("Шаблон элемента корзины не найден");
                return;
            }
            
            const cartItem = template.content.cloneNode(true);
            
            const itemElement = cartItem.querySelector('.cart-item');
            itemElement.dataset.id = id;
            
            const img = cartItem.querySelector('img');
            img.src = item.image || '/static/images/no-image.jpg';
            img.alt = item.name;
            
            cartItem.querySelector('.item-name').textContent = item.name;
            cartItem.querySelector('.item-price').textContent = `${item.price.toFixed(0)} ₸`;
            cartItem.querySelector('.quantity').textContent = item.quantity;
            
            cartItemsContainer.appendChild(cartItem);
        }
    }
}

function showEmptyCart() {
    const container = document.querySelector('.container');
    if (container) {
        container.innerHTML = `
            <div class="header">
                <a href="/menu/" class="back-btn">
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 3C21.627 3 27 8.373 27 15C27 21.627 21.627 27 15 27C8.373 27 3 21.627 3 15C3 8.373 8.373 3 15 3ZM10.293 15.707L16.293 21.707C16.488 21.902 16.744 22 17 22C17.256 22 17.512 21.902 17.707 21.707C18.098 21.316 18.098 20.684 17.707 20.293L12.414 15L17.707 9.707C18.098 9.316 18.098 8.684 17.707 8.293C17.316 7.902 16.684 7.902 16.293 8.293L10.293 14.293C9.902 14.684 9.902 15.316 10.293 15.707Z" fill="currentColor"/>
                    </svg>
                </a>
                <h1>Ваш заказ</h1>
            </div>
            <div class="empty-cart">
                <h2>Ваша корзина пуста</h2>
                <p>Добавьте товары из меню, чтобы оформить заказ</p>
                <a href="/menu/" class="return-to-menu">Вернуться в меню</a>
            </div>
        `;
    }
}

function updateTotals() {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    let subtotal = 0;
    
    for (const id in cart) {
        if (cart[id] && cart[id].quantity > 0) {
            subtotal += cart[id].price * cart[id].quantity;
        }
    }
    
    const subtotalElement = document.getElementById('cart-subtotal');
    const totalElement = document.getElementById('cart-total');
    
    if (subtotalElement) {
        subtotalElement.textContent = `${subtotal.toFixed(0)} ₸`;
    }
    
    if (totalElement) {
        totalElement.textContent = `${subtotal.toFixed(0)} ₸`;
    }

    // Анимация обновления суммы
    [subtotalElement, totalElement].forEach(el => {
        if (el) {
            el.style.animation = 'none';
            el.offsetHeight;
            el.style.animation = 'highlight 0.5s ease-out';
        }
    });
}
function addToCart(id, name, price, image) {
    console.log("Добавляем товар с изображением:", image);
    let cart = JSON.parse(localStorage.getItem('cart') || '{}');

    if (cart[id]) {
        cart[id].quantity++;
    } else {
        cart[id] = {
            id: id,
            name: name,
            price: price,
            quantity: 1,
            image: image || "/static/images/no-image.jpg" // Изменили имя файла
        };
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Обновляем счетчик товаров в корзине, если находимся на странице меню
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        let count = 0;
        for (const itemId in cart) {
            if (cart[itemId] && cart[itemId].quantity > 0) {
                count += cart[itemId].quantity;
            }
        }
        cartCount.textContent = count;
    }
    
    // Если мы на странице корзины, обновляем отображение
    if (window.location.pathname.includes('/cart/')) {
        displayCartItems(cart);
        updateTotals();
    }
    
    // Показываем сообщение о добавлении
    const message = document.createElement('div');
    message.className = 'add-message';
    message.textContent = 'Товар добавлен в корзину';
    message.style.position = 'fixed';
    message.style.bottom = '20px';
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)';
    message.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    message.style.color = 'white';
    message.style.padding = '10px 20px';
    message.style.borderRadius = '5px';
    message.style.zIndex = '1000';
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 2000);
}

function submitOrder() {
    const form = document.getElementById('order-form');
    if (!form) {
        alert('Форма заказа не найдена');
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    
    // Собираем данные формы
    const formData = {
        name: form.elements.name.value,
        phone: form.elements.phone.value,
        address: form.elements.address.value,
        comment: form.elements.comment ? form.elements.comment.value : '',
        items: cart,
        total: parseFloat(document.getElementById('cart-total').textContent)
    };
    
    
    
    // Для тестирования просто покажем информацию о заказе
    alert('Заказ оформлен успешно!');
    localStorage.removeItem('cart');
    window.location.href = '/menu/';
}

document.addEventListener('DOMContentLoaded', function() {
    // Функция для форматирования цены
    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₸";
    }

    // Функция для обновления итоговой суммы
    function updateTotal() {
        let subtotal = 0;
        const items = document.querySelectorAll('.cart-item');
        
        items.forEach(item => {
            const price = parseInt(item.querySelector('.item-price').textContent);
            const quantity = parseInt(item.querySelector('.quantity').textContent);
            subtotal += price * quantity;
        });

        document.getElementById('cart-subtotal').textContent = formatPrice(subtotal);
        document.getElementById('cart-total').textContent = formatPrice(subtotal);

        // Анимация при обновлении суммы
        const totalElements = document.querySelectorAll('#cart-subtotal, #cart-total');
        totalElements.forEach(el => {
            el.style.animation = 'none';
            el.offsetHeight; // Триггер перерисовки
            el.style.animation = 'highlight 0.5s ease-out';
        });
    }

    // Функция для создания элемента корзины
    function createCartItem(item) {
        const template = document.getElementById('cart-item-template');
        const cartItem = template.content.cloneNode(true);
        
        const itemElement = cartItem.querySelector('.cart-item');
        itemElement.dataset.id = item.id;
        
        const img = cartItem.querySelector('img');
        img.src = item.image;
        img.alt = item.name;
        
        cartItem.querySelector('.item-name').textContent = item.name;
        cartItem.querySelector('.item-price').textContent = formatPrice(item.price);
        cartItem.querySelector('.quantity').textContent = item.quantity;

        // Обработчики событий для кнопок
        const minusBtn = cartItem.querySelector('.minus');
        const plusBtn = cartItem.querySelector('.plus');
        const removeBtn = cartItem.querySelector('.remove-btn');
        const quantitySpan = cartItem.querySelector('.quantity');

        minusBtn.addEventListener('click', () => {
            let quantity = parseInt(quantitySpan.textContent);
            if (quantity > 1) {
                quantitySpan.textContent = --quantity;
                updateTotal();
                // Анимация уменьшения
                minusBtn.classList.add('clicked');
                setTimeout(() => minusBtn.classList.remove('clicked'), 200);
            }
        });

        plusBtn.addEventListener('click', () => {
            let quantity = parseInt(quantitySpan.textContent);
            quantitySpan.textContent = ++quantity;
            updateTotal();
            // Анимация увеличения
            plusBtn.classList.add('clicked');
            setTimeout(() => plusBtn.classList.remove('clicked'), 200);
        });

        removeBtn.addEventListener('click', () => {
            itemElement.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                itemElement.remove();
                updateTotal();
                
                // Проверяем, остались ли товары в корзине
                const remainingItems = document.querySelectorAll('.cart-item');
                if (remainingItems.length === 0) {
                    showEmptyCart();
                }
            }, 300);
        });

        return cartItem;
    }

    // Функция для отображения пустой корзины
    function showEmptyCart() {
        const container = document.getElementById('cart-items-container');
        container.innerHTML = `
            <div class="empty-cart">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <p>Ваша корзина пуста</p>
                <a href="/menu/" class="return-to-menu">Вернуться в меню</a>
            </div>
        `;
    }

    // Обработчик для кнопки оформления заказа
    document.getElementById('checkout-btn').addEventListener('click', function() {
        this.classList.add('clicked');
        setTimeout(() => {
            window.location.href = '/checkout/';
        }, 300);
    });

    // Добавляем стили для анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes highlight {
            0% { color: #ffd700; }
            100% { color: inherit; }
        }
        
        @keyframes fadeOut {
            to { 
                opacity: 0;
                transform: translateX(30px);
            }
        }
        
        .quantity-btn.clicked {
            transform: scale(0.9);
        }
        
        .checkout-button.clicked {
            transform: scale(0.98);
        }
        
        .empty-cart {
            text-align: center;
            padding: 40px;
            color: rgba(255, 255, 255, 0.7);
        }
        
        .empty-cart svg {
            margin-bottom: 20px;
            opacity: 0.7;
        }
        
        .empty-cart p {
            font-size: 1.2em;
            margin-bottom: 20px;
        }
        
        .return-to-menu {
            display: inline-block;
            padding: 10px 20px;
            background: #ffd700;
            color: #000;
            text-decoration: none;
            border-radius: 20px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .return-to-menu:hover {
            background: #fff;
            transform: translateY(-2px);
        }
    `;
    document.head.appendChild(style);
});

// Добавляем глобальный обработчик событий для корзины
// Добавляем один обработчик на контейнер корзины
const cartItemsContainer = document.getElementById('cart-items-container');
if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', handleCartActions);
}