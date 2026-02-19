from django.db import models
from django.contrib.auth.models import User
from .utils import encrypt_card

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True) # "pc-komponenty" (pro hezké URL)

    parent = models.ForeignKey('self', null=True, blank=True, related_name='children', on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Categories"

class Product(models.Model):
    # on_delete=models.SET_NULL znamená: když smažeš kategorii, produkt zůstane (bez kategorie)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True) 
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=0)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    stock = models.IntegerField(default=1)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    specification = models.JSONField(default=dict, null=True) # Pro uložení technických detailů jako JSON
    brand = models.CharField(max_length=50, blank=True, null=True) # Značka produktu (např. "ASUS", "Intel")
    
    class Meta:
        ordering = ('-created_at',) # Nejnovější produkty nahoře

    def __str__(self):
        return self.name
    
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    address = models.CharField(max_length=250)
    city = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    paid = models.BooleanField(default=False)
    total_amount = models.DecimalField(max_digits=10, decimal_places=0, default=0)

    shipping_method = models.CharField(max_length=50, default="Standard") 
    payment_method = models.CharField(max_length=50, default="Card")      

    def __str__(self):
        return f"Objednávka {self.id} - {self.full_name}"
    
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=0)
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.id}"
    
class SavedCard(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_cards')
    # Tady bude uložená ta "rozsypaná" šifra, ne číslo
    encrypted_number = models.CharField(max_length=255) 
    last_4 = models.CharField(max_length=4) # Tohle ukážeme uživateli (**** 1234)
    brand = models.CharField(max_length=20, default="Visa") # Visa/Mastercard
    expiry = models.CharField(max_length=5) # MM/YY
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Karta {self.last_4} ({self.user.username})"

    # Metoda pro bezpečné uložení
    def save_card_number(self, raw_number):
        self.encrypted_number = encrypt_card(raw_number)
        self.last_4 = raw_number[-4:]
        self.save()

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=100, blank=True)
    address = models.CharField(max_length=250, blank=True)
    city = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    phone = models.CharField(max_length=20, blank=True) # Hodí se pro kurýra

    def __str__(self):
        return f"Profil uživatele {self.user.username}"

# 1. Košík (vázaný na User)
class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Košík uživatele {self.user.username}"

# 2. Položka v košíku
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"