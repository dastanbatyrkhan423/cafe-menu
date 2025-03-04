from django.contrib import admin
from .models import Dish, Category, BarCategory, Drink

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']

@admin.register(Dish)
class DishAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price']
    search_fields = ['name', 'description']
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "category":
            kwargs["queryset"] = Category.objects.order_by('name')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

# Админка для барного меню
@admin.register(BarCategory)
class BarCategoryAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']

@admin.register(Drink)
class DrinkAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price']
    search_fields = ['name', 'description']

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "category":
            kwargs["queryset"] = BarCategory.objects.order_by('name')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

