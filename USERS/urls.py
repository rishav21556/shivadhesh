from django.contrib import admin

from django.urls import path
from . import views

from .views import views_search,Login_Registerations,cart_fun


urlpatterns = [ 
    path('',views_search.Search.getProduct_by_category, name='home'),
    path('home/<category_>/',views_search.Search.getProduct_by_category,name = "home_category"),
    path('home/rishav/product/product_name/',views_search.Search.getProduct,name = "home_search"),
    path('autocomplete/<name>/',views_search.Search.autocomplete,name='autocomplete'),
    
    path('home/product/<int:product_id>/',views_search.Search.product,name = "product"),

    path('home/see/view_cart/',cart_fun.Cart.cart_function_view,name = "cart_view"),
    path('home/cart/<product_id>/',cart_fun.Cart.cart_function_add,name = 'cart_add'),
    path('home/cart-remove/<product_id>/',cart_fun.Cart.cart_function_remove,name = 'cart_remove'),
    path('home/update-cart/<product_id>/',cart_fun.Cart.cart_function_update_count,name = 'update_cart_count'),
    path('home/get-cart-count/<product_id>/',cart_fun.Cart.cart_function_get_count,name = 'get_cart_count'),

    path('getOrders/',views_search.Search.getAllOrders,name = 'view_orders'),
    path('getOrders/<order_id>/',views_search.Search.order_detail,name = 'view_orders'),
    path('getCategories/',views_search.Search.getListofCategories,name = 'get_categories'),
]