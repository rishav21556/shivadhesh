from typing import Any
from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Category(models.Model):
    Category_name = models.CharField(max_length=30)
    category_description = models.TextField(max_length=1000)

    def __str__(self) :
        return self.Category_name


class Product (models.Model):
    # declaring fields
    retail_price = models.FloatField(null=False)
    Name = models.CharField(max_length=30 ,null=False)
    whole_sale_price = models.FloatField(null=False)
    ratings = models.IntegerField(null=False)
    description = models.TextField(null=False)
    discount = models.FloatField(null=False)
    stock_count = models.IntegerField(null=False)
    prod_img = models.ImageField(null = True)
    prod_category = models.ManyToManyField(Category)

    def __str__(self) :
        return self.Name
    


class cart(models.Model):
    product_id = models.ForeignKey(Product,on_delete=models.CASCADE)
    customer_id = models.ForeignKey(User,on_delete=models.CASCADE)
    count = models.IntegerField(default  = 1)

    




    