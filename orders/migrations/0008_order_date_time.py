# Generated by Django 4.2.1 on 2023-06-25 10:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0007_order_amount'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='date_time',
            field=models.DateTimeField(default='2023-06-25T14:30:00'),
        ),
    ]