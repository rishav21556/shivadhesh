from django.shortcuts import render,redirect
from django.http import HttpResponse ,HttpResponseBadRequest

from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth import authenticate,login,logout
from django.urls import reverse
from orders.models import *

from USERS.views import Cart
from USERS.models import cart

from django.contrib import messages

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

import razorpay
from django.conf import settings
from datetime import timezone
from dotenv import load_dotenv
import os
load_dotenv()
# Create your views here.


Meta_dict = {}

class order_metadata:
    def __init__(self,cart_dir,address_id,cost,order_id):
        self.address_id = address_id
        self.cost =  cost
        self.order_id  = order_id
        self.cart_dir = cart_dir


class OrderPlacement:

    def addr_selection(request,product):
        
        user_id = request.user.id
        addr = order_addr.objects.filter(customer_id = user_id)

        CART_OBJ = Cart.get_cart_product(request)

        if (CART_OBJ == [] and product == 'cart'):
            messages.info(request,"NOTHING IN CART")
            return redirect ('cart_view')

        dirs = []
        request.session['Prev_Status'] = product
        for address in addr : 
            dirs.append(address)
        if (dirs==[]):
            return redirect(reverse('adding_address',args=['new']))
        return render(request,"HTML/select_shipping_addr.html",{'addr' : dirs,'PRODUCT':product})
    def add_address(request,status):
        if (request.method=="POST"):
            if status=='new':
                return OrderPlacement.save_address(request)
            else:
                return OrderPlacement.update_address(request,status)
        return render(request,"HTML/new_add.html",{'STATUS' : status})
    

    def save_address(request):
        country = request.POST.get("country")
        fullName = request.POST.get("fullName")
        streetAddr = request.POST.get("streetAddr")
        city = request.POST.get("city")
        state = request.POST.get("state")
        pincode = request.POST.get("pincode")
        phoneNumber = request.POST.get("phoneNumber")

        pincode = int(pincode)
        order = order_addr.objects.create(Country = country, Full_name = fullName,stree_addr = streetAddr,City = city,State = state,Pin_code = pincode,phone_number = phoneNumber,customer_id = User.objects.get(id = request.user.id))
        order.save()
        return redirect(reverse('addr_sel',args=[request.session['Prev_Status']]))
    def update_address(request,status):
        address_id = status
        address = order_addr.objects.get(id = address_id)
        country = request.POST.get("country")
        fullName = request.POST.get("fullName")
        streetAddr = request.POST.get("streetAddr")
        city = request.POST.get("city")
        state = request.POST.get("state")
        pincode = request.POST.get("pincode")
        phoneNumber = request.POST.get("phoneNumber")

        address.Country = country
        address.Full_name = fullName
        address.stree_addr = streetAddr
        address.City = city
        address.State = state
        address.Pin_code = pincode
        address.phone_number = phoneNumber

        address.save()
        return redirect(reverse('addr_sel',args=[request.session['Prev_Status']]))

    def view_addr (request,address_id):
        address = order_addr.objects.get(id=address_id)
        return render(request,"HTML/view_base.html",{'addr' : address})
    

    def proceed (request,PRODUCT):
        if (request.method == "POST"):
            address_id = request.POST.get("radio-addr-sel")
            address = order_addr.objects.get(id=address_id)
            customer_id = request.user.id 
            tot_item  = 0
            tot_cost = 0
            cart_product_dir = []
            if (PRODUCT=='cart'):
                cart_product_dir = Cart.get_cart_product(request)
                count = []

                for cart_record in cart_product_dir:
                    tot_item += cart_record.count
                    tot_cost += cart_record.count * (cart_record.product_id.retail_price - cart_record.product_id.retail_price * cart_record.product_id.discount/100)
                    count.append((cart_record.product_id,cart_record.count))
                
                cart_product_dir = count
            else:
                PRODUCT = Product.objects.get(id = PRODUCT)
                tot_item = 1
                tot_cost = (PRODUCT.retail_price - PRODUCT.retail_price * PRODUCT.discount/100)
                cart_product_dir = [(PRODUCT,1)]
                
            client = razorpay.Client(auth=(settings.RAZOR_KEY,settings.RAZOR_SECRET_KEY))
            
            order = client.order.create({'amount' : tot_cost*100,'currency' : 'INR','payment_capture':'1'})
            
            
            new_order_id = order['id']
            API_BASE_URL = os.getenv('API_BASE_URL', '')
            callbackUrl = f'{API_BASE_URL}/orders/complete-payment/'
            # callbackUrl = "{%url 'payment' cart_dir=${cart_product_dir}%}"
            # http://127.0.0.1:8000/orders/proceed-to-payment/cart/
            context = {
                'addr':address,
                'cart':cart_product_dir,
                'tot_item':tot_item,
                'tot_cost':tot_cost,
                'order_id' : new_order_id,
                'razor_pub_key' : settings.RAZOR_KEY,
                'amount': tot_cost*100,
                'currency' : 'INR',
                'callback_url' : callbackUrl
            }
            Meta_dict[new_order_id] = order_metadata(cart_product_dir,address_id,tot_cost,new_order_id)
            return render(request,"HTML/final_order_view.html",context=context)
        
    
    @csrf_exempt
    def complete(request):
        if (request.method=="POST"):
            a = request.POST
            if ('razorpay_payment_id' in a):
                payment_id = a['razorpay_payment_id']
                order_id = a['razorpay_order_id']

                meta_data = Meta_dict[order_id]
                order = ORDER.objects.create(order_addr_id = order_addr.objects.get(id = meta_data.address_id))

                order.order_id = order_id
                order.amount =  meta_data.cost
                
                
                for order_ in meta_data.cart_dir:
                    order_product_count.objects.create(product_id = order_[0],order_id = order_id,count = order_[1])
                
                order.payment_id = payment_id
                order.paid = True
                order.date_time = datetime.datetime.now(timezone.utc)
                ist_offset = datetime.timedelta(hours=5, minutes=30)
                ist_time = order.date_time.replace(tzinfo=timezone.utc) + ist_offset

                # Format the IST time in ISO format
                ist_iso_format = ist_time.isoformat()

                # Assign the formatted IST time to the desired field
                order.date_time = ist_iso_format
                order.save()
                Meta_dict.pop(order_id)
                messages.info(request,"PAYMENT SUCCESSFULL")
                return redirect(f"{os.getenv('API_BASE_URL', '')}/users/home/see/view_cart/")
            else:
                messages.info(request,"PAYMENT UNSUCESSFULL")
                return redirect(f"{os.getenv('API_BASE_URL', '')}/users/home/see/view_cart/")
