import os
from django.shortcuts import render,redirect
from django.http import HttpResponse

from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth import authenticate,login,logout
from django.urls import reverse
from verify_email.email_handler import send_verification_email
from django.core.mail import EmailMessage
from django.contrib.auth.tokens import default_token_generator
from django.contrib.sites.shortcuts import get_current_site
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import smtplib
from email.mime.text import MIMEText
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

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
        
        if (not user.is_active):
            messages.info(request,"Please verify your Signup on your")
            return redirect ("/accounts/login")
        
        login(request,user)
        return redirect ("/users/home/All")
        

    return render(request,"HTML/Login.html")



def verify_email(request, user_id, token):
    user = User.objects.filter(id=user_id)

    if ( not user):
        messages.info(request,'USER DONOT EXISTS')
        return redirect('/accounts/signup')
    user = user[0]
    if default_token_generator.check_token(user, token):
        # Set a flag or update the user's email_verified field
        user.is_active = True
        user.save()
        messages.info(request,"New User Created !")
        return redirect("/accounts/login")
    else:
        messages.info(request,'COULD NOT VERIFY EMAIL')
        return redirect('/accounts/signup')
def send_verification_email(user,request):
    # token = default_token_generator.make_token(user)
    # current_site = get_current_site(request)
    email_subject = 'Activate your account'
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    current_site = get_current_site(request)
    verification_link = f"http://{current_site.domain}/accounts/verify/{user.id}/{token}/"
    email_body = f'Click the following link to verify your email: {verification_link}'

    # Replace these with your Gmail address and app password
    sender_email = os.getenv('EMAIL_ID')
    sender_password = os.getenv('EMAIL_PW')

    msg = MIMEText(email_body)
    msg['Subject'] = email_subject
    msg['From'] = sender_email
    msg['To'] = user.email

    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(sender_email, sender_password)
    server.send_message(msg)
    server.quit()

def SignUp(request):
    if (request.method=="POST"):
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        user_name = request.POST.get('user_name')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        email = request.POST.get('Email')


        user = User.objects.filter(email = email)
        if user:
            user = user[0]
        if (user):
            if (user.is_active):
                messages.info(request,'This email already exists')
                return redirect('/accounts/signup')
            else:
                send_verification_email(user,request)
                messages.info(request,'A verification mail has been sent')
                return redirect('/accounts/login')

        user = User.objects.filter(username=user_name)
        if (user):
            messages.info(request,'This User Name is not Available !')
            return redirect('/accounts/signup')
        
        if (confirm_password!=password):
            messages.info(request,'Passwords didn\'t match !')
            return redirect('/accounts/signup')
        
        try:
            validate_email(email)
        except ValidationError:
            messages.info(request,'This email address is not valid')
            return redirect('/accounts/signup')
        
        user = User.objects.create(
            first_name = first_name,
            last_name = last_name,
            username = user_name,
            email = email
        )
        user.is_active = False
        user.set_password(password)
        user.save()
        send_verification_email(user,request)

        messages.info(request,'A verification mail has been sent')
        return redirect('/accounts/login')
        
    return render(request,"HTML/SignUp.html")

def Logout(request):
    logout(request)
    param = "All"
    return redirect(reverse("home_category",args = ['All']))
