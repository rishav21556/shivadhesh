from django.db import models

from django.contrib.auth.models import User
from USERS.models import Product
import datetime

# Create your models here.

class order_addr(models.Model):
    Full_name = models.CharField(max_length=50)
    stree_addr = models.CharField(max_length=100)
    City = models.CharField(max_length=30)
    State = models.CharField(max_length=30)
    Pin_code = models.IntegerField()
    phone_number = models.CharField(max_length=10)
    Country = models.CharField(max_length=30)

    customer_id = models.ForeignKey(User,on_delete=models.CASCADE)


    def __str__(self):
        return self.Full_name + " " + self.phone_number



class order_product_count(models.Model):
    order_id = models.CharField(max_length=300)
    product_id = models.ForeignKey(Product,on_delete=models.DO_NOTHING)
    count = models.IntegerField(default=1)

class ORDER(models.Model):
    order_addr_id = models.ForeignKey(order_addr,on_delete=models.CASCADE)
    payment_id = models.CharField(max_length=300)
    order_id = models.CharField(max_length=300)
    paid = models.BooleanField(default = False)
    amount = models.IntegerField(default=0)
    date_time = models.DateTimeField(null = True)

    def __str__(self):
        return self.order_id