# Generated by Django 3.1.4 on 2022-01-15 16:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chatapp', '0004_chatgroup_admin'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='iscode',
            field=models.BooleanField(default=False),
        ),
    ]
