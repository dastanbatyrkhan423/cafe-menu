from django.urls import path
from .views import home, menu, cart, dish_detail, drink_detail, checkout

urlpatterns = [
    path('', home, name='home'),
    path('menu/', menu, name='menu'),
    path('menu/<str:menu_type>/', menu, name='menu_type'),  # Передаём menu_type через URL
    path('cart/', cart, name='cart'),
    path('dish/<int:dish_id>/', dish_detail, name='dish_detail'),
    path('drink/<int:drink_id>/', drink_detail, name='drink_detail'),
    path('checkout/', checkout, name='checkout'),
]
