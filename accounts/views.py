from django.shortcuts import render,redirect
from django.http import HttpResponse

from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth import authenticate,login,logout
from django.urls import reverse
# Create your views here.

def Login(request):
    if (request.method=="POST"):
        username = request.POST.get("UserName")
        password = request.POST.get('password')
        email = request.POST.get('Email')
        user = authenticate(username=username,password=password,email = email)
        if (user == None):
            messages.info(request,"Invalid Credentials")
            return redirect ("/accounts/login")
        
        login(request,user)
        return redirect ("/users/home/All")
        

    return render(request,"HTML/Login.html")

def SignUp(request):
    if (request.method=="POST"):
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        user_name = request.POST.get('user_name')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        email = request.POST.get('Email')

        user = User.objects.filter(username=user_name)
        if (user):
            messages.info(request,'This User Name is not Available !')
            return redirect('/accounts/signup')
        user = User.objects.filter(email = email)
        if (user):
            messages.info(request,'This email already exists')
            return redirect('/accounts/signup')
        if (confirm_password!=password):
            messages.info(request,'Passwords didn\'t match !')
            return redirect('/accounts/signup')
        
        user = User.objects.create(
            first_name = first_name,
            last_name = last_name,
            username = user_name,
            email = email
        )
        user.set_password(password)
        user.save()
        messages.info(request,"New User Created !")
        return redirect("/accounts/login")
    return render(request,"HTML/SignUp.html")

def Logout(request):
    logout(request)
    param = "All"
    return redirect(reverse("home_category",args = ['All']))
