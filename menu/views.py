from django.shortcuts import render, get_object_or_404  
from .models import Dish, Category, Drink, BarCategory

def home(request):
    return render(request, 'menu/home.html')

def menu(request, menu_type='main'):  # Добавляем menu_type как аргумент
    if menu_type == 'bar':
        categories = BarCategory.objects.all()
        menu_data = {category: Drink.objects.filter(category=category) for category in categories}
    else:
        categories = Category.objects.all()
        menu_data = {category: Dish.objects.filter(category=category) for category in categories}

    return render(request, 'menu/menu.html', {
        'menu_data': menu_data,
        'categories': categories,
        'menu_type': menu_type
    })


def cart(request):
    return render(request, 'menu/cart.html')

def phone_login(request):
    if request.method == 'POST':
        # Логика обработки входа через телефон
        pass
    return render(request, 'menu/phone_login.html')

def dish_detail(request, dish_id):
    dish = get_object_or_404(Dish, id=dish_id)
    return render(request, 'menu/dish_detail.html', {'dish': dish})

def drink_detail(request, drink_id):
    drink = get_object_or_404(Drink, id=drink_id)
    return render(request, 'menu/drink_detail.html', {'drink': drink})


def checkout(request):
    return render(request, 'menu/checkout.html')
