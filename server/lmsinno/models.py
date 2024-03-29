import random
import re
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.http import HttpResponse
from rest_framework import status, exceptions
from rest_framework.authtoken.models import Token
from rest_framework_jwt.settings import api_settings
from django.conf import settings
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

import jwt
import json
import datetime



class Document(models.Model):
    # Type of Documents:
    # 0 - Book; 1 - Journal article; 2 - AV
    DOCUMENT_TYPE_CHOICES = [(0, 'Book'), (1, 'Journal article'), (2, 'AV')]

    title = models.CharField(max_length=255)
    document_id = models.AutoField(primary_key=True, verbose_name=title)
    description = models.TextField(blank=True, max_length=10000)
    publisher = models.CharField(max_length=255)
    year = models.IntegerField(default=datetime.datetime.now().year)
    type = models.IntegerField(choices=DOCUMENT_TYPE_CHOICES)
    price = models.FloatField()
    is_reference = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    copies_available = models.IntegerField(default=0)
    cover = models.CharField(default='empty', max_length=255)
    date_added = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.title


class User(AbstractUser):
    # Type of User:
    # 0 - basic user; 1 - Faculty; 2 - Librarian
    USER_TYPE_CHOICES = [(0, 'Basic user'), (1, 'Faculty'), (2, 'Librarian')]

    role = models.IntegerField(default=0, choices=USER_TYPE_CHOICES)
    address = models.CharField(max_length=100, default='innopolis')
    phone = models.DecimalField(unique=True, default=0, max_digits=11, decimal_places=0)

    def __str__(self):
        return '{0}'.format(self.username)

    def set_role(self, role):
        self.role = role


    def set_address(self, address):
        self.address = address

    def set_phone(self, phone):
        self.phone = phone

    def set_data(self, data):
        self.username = data.get('username') or self.username
        self.password = data.get('password1') or data.get('password') or self.password
        self.email = data.get('email') or self.email
        self.role = data.get('role') or self.role
        self.phone = data.get('phone') or self.phone
        self.address = data.get('address') or self.address
        self.last_name = data.get('last_name') or self.last_name
        self.first_name = data.get('first_name') or self.first_name

    def get_instance(request):
        if 'HTTP_HOST' in request.META:
            try:
                token = re.split(' ', request.META['HTTP_BEARER'])[1]
                payload = jwt.decode(token, settings.SECRET_KEY)
                email = payload['email']
                userid = payload['user_id']

                user = User.objects.get(
                    email=email,
                    id=userid
                )

            except jwt.ExpiredSignature or jwt.DecodeError or jwt.InvalidTokenError:
                return None
            except User.DoesNotExist:
                return None
            except KeyError:
                return None

            return user
        else:
            return None


class Author(models.Model):
    author_id = models.AutoField(primary_key=True)
    name = models.CharField(unique=True, max_length=100)

    def __str__(self):
        return self.name


class DocumentOfAuthor(models.Model):
    class Meta:
        db_table = 'lmsinno_document_of_author'

    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    author = models.ForeignKey(Author, on_delete=models.DO_NOTHING)

    def __str__(self):
        return '{0}: {1}'.format(self.document, self.author)


class Copy(models.Model):
    # Type of Order Status
    # 0 - not ordered; 1 - ordered
    ORDER_STATUS_TYPE_CHOICES = [(i, i) for i in range(2)]

    copy_id = models.AutoField(primary_key=True)
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    status = models.IntegerField(choices=ORDER_STATUS_TYPE_CHOICES, default=0)
    place_hall_number = models.IntegerField(null=False)
    place_shelf_letter = models.CharField(max_length=1, null=False)

    def __str__(self):
        return '{0}: {1}'.format(str(self.copy_id), self.document)


class Order(models.Model):
    # Type of Status:
    # 0 - in queue; 1 - booked; 2 - overdue; 3 - closed
    STATUS_TYPE_CHOICES = [(0, 'In queue'), (1, 'Booked'), (2, 'Overdue'), (3, 'Closed'), (4, 'Extended')]

    order_id = models.AutoField(primary_key=True)
    copy = models.ForeignKey(Copy, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date_created = models.DateField(auto_now_add=True)
    date_accepted = models.DateField(default=None, null=True)
    date_return = models.DateField(default=None, null=True)
    status = models.IntegerField(choices=STATUS_TYPE_CHOICES, default=0)

    def __str__(self):
        return '{0}: {1}'.format(self.user, self.copy)

    @staticmethod
    def overdue_validation():
        orders = Order.objects.all().filter(status=1)

        for order in orders:
            if not order.date_return:
                continue

            if order.date_return < datetime.date.today():
                order.status = 2
                order.save()

        orders = Order.objects.all().filter(status=4)

        for order in orders:
            if not order.date_return:
                continue

            if order.date_return < datetime.date.today():
                order.status = 2
                order.save()


class Tag(models.Model):
    tag_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=32)

    def __str__(self):
        return self.name


class TagOfDocument(models.Model):
    class Meta:
        db_table = 'lmsinno_tag_of_document'

    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)

    def __str__(self):
        return '{0}: {1}'.format(self.document, self.tag)


