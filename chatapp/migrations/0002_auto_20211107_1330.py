# Generated by Django 3.1.4 on 2021-11-07 08:00

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('chatapp', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='room',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='room', to='chatapp.room'),
        ),
        migrations.CreateModel(
            name='ChatGroup',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('group_name', models.CharField(max_length=50)),
                ('users', models.ManyToManyField(related_name='chatgroup', to='chatapp.UserProfile')),
            ],
        ),
        migrations.AddField(
            model_name='message',
            name='group',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='chatgroup', to='chatapp.chatgroup'),
        ),
    ]
