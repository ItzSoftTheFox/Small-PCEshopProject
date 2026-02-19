import re
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Product, Order, OrderItem, SavedCard, SavedCard, Category, Cart, CartItem, UserProfile
from django.contrib.auth.models import User # <--- Import modelu uživatele

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent_id']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'category', 'name', 'slug', 'description', 'price', 'stock', 'image', 'is_available'] # Pošle všechny sloupce (název, cena, obrázek...)

# Nový Serializer pro registraci
class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="Tento email je již registrován.")]
    )
    username = serializers.CharField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="Toto uživatelské jméno je již obsazeno.")]
    )
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'},
        min_length=8
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        # Tady se děje ta magie - create_user heslo zahashuje!
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=False)

    class Meta:
        model = UserProfile
        fields = ['full_name', 'email', 'address', 'city', 'zip_code', 'phone']

    # --- VALIDACE PSČ ---
    def validate_zip_code(self, value):
        # Odstraníme mezery (kdyby napsal 110 00)
        clean_zip = value.replace(" ", "")
        # Kontrola: Musí to být 5 číslic
        if not re.match(r'^\d{5}$', clean_zip):
            raise serializers.ValidationError("PSČ musí obsahovat přesně 5 číslic.")
        return clean_zip # Uložíme to vyčištěné

    # --- VALIDACE TELEFONU ---
    def validate_phone(self, value):
        # Může začínat +, pak už jen číslice, délka 9-15
        if not re.match(r'^\+?\d{9,15}$', value):
            raise serializers.ValidationError("Zadejte platné telefonní číslo (např. +420123456789).")
        return value

    def update(self, instance, validated_data):
        # ... (tvoje update logika zůstává stejná) ...
        user_data = validated_data.pop('user', {})
        email = user_data.get('email')
        if email:
            instance.user.email = email
            instance.user.save()
        return super().update(instance, validated_data)

    def create(self, validated_data):
        # Vytvoření uživatele s bezpečným (hashovaným) heslem
        user = User.objects.create_user(**validated_data)
        return user
    
class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['full_name', 'email', 'address', 'city', 'zip_code', 'phone']

    def update(self, instance, validated_data):
        # 1. Vytáhneme data pro Usera (email)
        user_data = validated_data.pop('user', {})
        email = user_data.get('email')

        # 2. Pokud přišel email, aktualizujeme ho v Userovi
        if email:
            instance.user.email = email
            instance.user.save()

        # 3. Zbytek (adresu atd.) uložíme normálně do Profilu
        return super().update(instance, validated_data)

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = OrderItem
        fields = ['product', 'product_name', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True) # Objednávka obsahuje seznam položek

    class Meta:
        model = Order
        fields = ['id', 'full_name', 'email', 'address', 'city', 'zip_code', 'total_amount','shipping_method', 'payment_method', 'items', 'created_at', 'paid']

    def create(self, validated_data):
        # Vytáhneme položky z dat
        items_data = validated_data.pop('items')
        
        # 1. Vytvoříme samotnou objednávku
        order = Order.objects.create(**validated_data)

        # 2. Vytvoříme položky a odečteme ze skladu
        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            
            # Kontrola skladu (backend validation)
            if product.stock < quantity:
                raise serializers.ValidationError(f"Produkt {product.name} není skladem v požadovaném množství.")
            
            # Odečtení ze skladu
            product.stock -= quantity
            product.save()

            # Vytvoření položky
            OrderItem.objects.create(order=order, **item_data)

        return order
    
class SavedCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedCard
        # DŮLEŽITÉ: Posíláme ven jen bezpečné věci (poslední 4 čísla), ne to zašifrované smetí!
        fields = ['id', 'last_4', 'brand', 'expiry']

class CartItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source='product.id')
    name = serializers.ReadOnlyField(source='product.name')
    price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=0, read_only=True)
    image = serializers.ImageField(source='product.image', read_only=True)
    slug = serializers.SlugField(source='product.slug', read_only=True)
    stock = serializers.IntegerField(source='product.stock', read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product_id', 'name', 'price', 'quantity', 'image', 'slug', 'stock', ]
        
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'items']