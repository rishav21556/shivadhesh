from USERS.models import Category,Product,cart
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib import auth
from django.db.models import Q
from django.http import JsonResponse
from urllib.parse import urlencode
from django.views import View

from USERS.models import Category,Product,cart
from orders.models import ORDER,order_product_count


class Search:
    def getAllProduct(request):
            return Product.objects.all()
    def getProduct(request):
        if (request.method=="POST"):
            products = request.POST.get("search")
            products = Product.objects.filter(Name__icontains=products)
            dirs = []
            for product in products:
                dirs.append(product)
            return render(request,'HTML/home.html',{'results':dirs})
    def getProduct_by_category(request,category_='All'):
        if (category_=='All'):
            dirs = Search.getAllProduct(request)
        else:
            products = Product.objects.filter(prod_category__Category_name = category_)
            dirs = []
            for product in products:
                dirs.append(product)
        return render(request,'HTML/home.html',{'results':dirs})
    def autocomplete(request,name):
        product_id = []
        product = []
        prd = Product.objects.filter(Name__istartswith = name)
        for p in prd : 
            product_id.append(p.id)
            product.append(p.Name)
        
        return JsonResponse({'product_name' : product, 'product_id':product_id})
    def product(request,product_id):
        prd = Product.objects.get(id = product_id)
        if(not request.user.is_authenticated):
            is_already_in_cart = False
        else:
            is_already_in_cart = cart.objects.filter(customer_id = User.objects.get(id = request.user.id),product_id = prd)
            if (is_already_in_cart):
                is_already_in_cart = True
            else:
                is_already_in_cart = False
        dirs = [prd]
        return render(request,"HTML/product.html",{'datas':dirs,'cart_data':is_already_in_cart})
    
    def getAllOrders(request):
        all_orders = ORDER.objects.filter(order_addr_id__customer_id = (request.user.id))

        dirs = []

        for order in all_orders:
            dirs.append(order)

        return render(request,"HTML/view_orders.html",{'orders':dirs})
    def order_detail(request,order_id):
        order = ORDER.objects.get(id = order_id)

        
        addr  = order.order_addr_id 
        payment_id = order.payment_id
        razorpay_order_id = order.order_id
        paid = order.paid
        amount = order.amount
        



        product = order_product_count.objects.filter(order_id = razorpay_order_id)
        product_dir = []
        for prod in product:
            product_dir.append((prod.product_id,prod.count))

        return render(request,"HTML/order.html",{'payment_id':payment_id,'razorpay_order_id':razorpay_order_id,'paid':paid,'addr':addr,'products':product_dir,'amount':amount})
    
    def getAllCategories(request):
        categories = Category.objects.all()
        return categories
    
    def getListofCategories(request):
        categories = Search.getAllCategories(request)
        return JsonResponse({'categories': [category.Category_name for category in categories]})

    def getCategories(request):
        categories = Search.getAllCategories(request)
        return render(request,"HTML/categories.html",{'categories':categories})

        




        


    



        
    

