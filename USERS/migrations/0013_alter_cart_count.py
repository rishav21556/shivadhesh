# Generated by Django 4.2.1 on 2023-06-10 03:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('USERS', '0012_order_cart'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cart',
            name='count',
            field=models.IntegerField(default=1),
        ),
    ]
