# Generated by Django 4.2.1 on 2023-05-29 12:51

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('USERS', '0002_products_name'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Products',
        ),
    ]