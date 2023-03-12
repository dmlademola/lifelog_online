# Generated by Django 4.1 on 2023-01-05 06:54

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Error",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("error_str", models.TextField()),
                ("user_id", models.TextField(blank=True)),
                ("referer", models.CharField(max_length=1000)),
                ("more", models.TextField(blank=True)),
                ("resolved", models.BooleanField(default=False)),
                ("time_gen", models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name="Event",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("owner", models.PositiveIntegerField()),
                ("upload_ids", models.CharField(blank=True, max_length=100000)),
                ("brief", models.CharField(max_length=150)),
                ("details", models.TextField()),
                ("date_of_event", models.DateField()),
                ("happy_moment", models.BooleanField(default=True)),
                ("time_added", models.DateTimeField(auto_now_add=True)),
                ("last_modified", models.DateTimeField(auto_now=True, null=True)),
                ("trashed_on", models.DateTimeField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name="Password",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("psw", models.CharField(max_length=50)),
                ("time_gen", models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name="Upload",
            fields=[
                (
                    "id",
                    models.CharField(max_length=50, primary_key=True, serialize=False),
                ),
                ("path", models.CharField(max_length=1000)),
                ("caption", models.CharField(blank=True, max_length=100)),
                ("file_type", models.CharField(default="pend", max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name="User",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("img", models.ImageField(blank=True, upload_to="profile_pics/")),
                ("fullname", models.CharField(max_length=100)),
                (
                    "gender",
                    models.CharField(
                        choices=[
                            ("m", "Male"),
                            ("f", "Female"),
                            ("r", "Rather not say"),
                        ],
                        max_length=1,
                    ),
                ),
                ("dob", models.DateField()),
                ("phone_no", models.CharField(blank=True, max_length=50)),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("username", models.CharField(max_length=300, unique=True)),
                ("password", models.CharField(max_length=300)),
                ("theme", models.CharField(default="light", max_length=50)),
                ("super_user", models.BooleanField(default=False)),
                (
                    "last_active",
                    models.DateTimeField(blank=True, default=django.utils.timezone.now),
                ),
                ("date_joined", models.DateTimeField(auto_now_add=True)),
                ("date_joied", models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
