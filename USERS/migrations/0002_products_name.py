# Generated by Django 4.2.1 on 2023-05-29 12:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('USERS', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='products',
            name='Name',
            field=models.CharField(default='shivadhes_prod', max_length=30),
        ),
    ]
