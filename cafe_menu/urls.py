from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from menu import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('menu.urls')),
    path('login/phone/', views.phone_login, name='phone_login'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
