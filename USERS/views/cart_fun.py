from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib import auth
from django.db.models import Q
from django.http import JsonResponse
from urllib.parse import urlencode
from django.views import View

from USERS.models import Category,Product,cart

# Create your views here.

from USERS.models import Category,Product,cart
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.urls import reverse

class Cart:

    def cart_function_add(request,product_id):
        direct = request.GET.get("direct")
        if (not (cart.objects.filter(customer_id = User.objects.get(id = request.user.id) , product_id = Product.objects.get(id = product_id)))):
            
            obj = cart.objects.create(customer_id = User.objects.get(id = request.user.id) , product_id = Product.objects.get(id = product_id) )
            obj.save()
            return render(request,"HTML/product.html",{'datas':[Product.objects.get(id = product_id)],'cart_data':True,'redirect':"self"})
        else:
            return render(request,"HTML/product.html",{'datas':[Product.objects.get(id = product_id)],'cart_data':True,'redirect':"self",})

    def cart_function_remove(request,product_id):
        direct = request.GET.get('direct')

        
        if ((cart.objects.filter(customer_id = User.objects.get(id = request.user.id) , product_id = Product.objects.get(id = product_id)))):
            record_to_delete = cart.objects.filter(customer_id = User.objects.get(id = request.user.id) , product_id = Product.objects.get(id = product_id) )
            record_to_delete.delete()
            # return redirect(request.get_full_path)
            if (direct=="view_cart"):
                return redirect(reverse("cart_view"))
            return render(request,"HTML/product.html",{'datas':[Product.objects.get(id = product_id)],'cart_data':False,'redirect':"self"})
        else:
            # return redirect(request.path)
            return render(request,"HTML/product.html",{'datas':[Product.objects.get(id = product_id)],'cart_data':False,'redirect':"self"})
    
    def get_cart_product(request):
        cart_obj= cart.objects.filter(customer_id = User.objects.get(id = request.user.id))
        dirs = []
        for carts in cart_obj:
            dirs.append(carts)
        return dirs

    def cart_function_view(request):

        dir = Cart.get_cart_product(request)
        dirs = []
        for carts in dir:
            dirs.append(carts.product_id)
        

        return render(request,"HTML/product.html",{"datas":dirs,'cart_data': True,'redirect':"view_cart"})
    
    def cart_function_update_count(request,product_id):
        value =  request.GET.get('value')

        cart_obj = cart.objects.get(customer_id = User.objects.get(id = request.user.id) , product_id = Product.objects.get(id = product_id))
        cart_obj.count  =  value
        cart_obj.save()
        return redirect(reverse('cart_view'))
    
    def cart_function_get_count(request,product_id):
        cart_obj = cart.objects.get(customer_id = User.objects.get(id = request.user.id) , product_id = Product.objects.get(id = product_id))
        prod_price = Product.objects.get(id = product_id).retail_price
        ans = {
            'res' : cart_obj.count,
            'price': prod_price
        }
        return JsonResponse(ans)
