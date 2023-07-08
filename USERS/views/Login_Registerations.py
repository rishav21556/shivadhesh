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

def Login(request):

    if (request.method =='POST'):
        username = request.POST.get('user_name')
        password = request.POST.get('user_password')

        user = auth.authenticate(username=username,password=password)

        if (user is not None):
            return render(request,'HTML/Home.html')
        else:
            print("invalid credentials")
    
            return render(request,'HTML/index.html')
    return render(request,"HTML/index.html")

def Registeration(request):
    if (request.method == 'POST'):
        username = request.POST.get('user_name')
        email = request.POST.get('email')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        password = request.POST.get('password1')
        confirm_password = request.POST.get('password2')

        if (password != confirm_password):
            return render(request, 'HTML/Registeration.html',{'status': "password_fail"})
        if (User.objects.filter(username=username).exists()):
            return render(request,'HTML/Registeration.html',{'status':"user_name_fail"})
        if (User.objects.filter(email=email).exists()):
            return render(request,'HTML/Registeration.html',{'status':"email_fail"})
        user = User.objects.create(username=username,first_name = first_name,last_name = last_name,email=email)
        user.set_password(password)
        user.save()
        return render(request, 'HTML/Registeration.html',{'status':"user_created"})


    return render(request, 'HTML/Registeration.html',{'status':"OK"})
