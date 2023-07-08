from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from . import views

urlpatterns = [
    path('addr_selection/<product>/',views.OrderPlacement.addr_selection,name = 'addr_sel'),
    path('add_address/<status>/',views.OrderPlacement.add_address,name = 'adding_address'),
    path('save_addr/',views.OrderPlacement.save_address,name = 'addr_save'),
    path('view_addr/<int:address_id>/',views.OrderPlacement.view_addr,name = 'view_addr'),
    path('proceed-to-payment/<PRODUCT>/',views.OrderPlacement.proceed,name = 'proceed-payment'),
    path('complete-payment/',views.OrderPlacement.complete,name = "payment")
]