# Generated by Django 4.2.1 on 2023-05-29 12:52

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('USERS', '0003_delete_products'),
    ]

    operations = [
        migrations.CreateModel(
            name='Products',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('retail_price', models.FloatField()),
                ('Name', models.CharField(default='shivadhes_prod', max_length=30)),
                ('whole_sale_price', models.FloatField()),
                ('ratings', models.IntegerField()),
                ('description', models.TextField()),
                ('discount', models.FloatField()),
                ('stock_count', models.IntegerField()),
            ],
        ),
    ]
