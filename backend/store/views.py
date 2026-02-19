from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from .permissions import IsEmployee
from .models import Product, Order, OrderItem, SavedCard, Category, CartItem, Cart, UserProfile
from .serializers import OrderSerializer, SavedCardSerializer, ProductSerializer, UserSerializer, CategorySerializer, CartSerializer, CartItemSerializer, UserProfileSerializer
from django.contrib.auth.models import User
from django.db.models import Q, Count
import re


# 1. NOVÉ VIEW PRO SEZNAM KATEGORIÍ
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny] # Kategorie může vidět každý

# 2. UPRAVENÉ VIEW PRO PRODUKTY (FILTROVÁNÍ)
class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

    def get_queryset(self):
        queryset = Product.objects.filter(is_available=True) # Zobrazujeme jen dostupné

        # 1. Kategorie (včetně podkategorií)
        category_id = self.request.query_params.get('category')
        if category_id:
            try:
                category = Category.objects.get(id=category_id)
                queryset = queryset.filter(
                    Q(category=category) | Q(category__parent=category)
                )
            except Category.DoesNotExist:
                return Product.objects.none()
        
        # 2. Značka (Brand) - Samostatný sloupec
        brand = self.request.query_params.get('brand')
        if brand:
            queryset = queryset.filter(brand__iexact=brand)

        # 3. Cena (Min & Max)
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # 4. Specifikace (JSON Field: specification)
        specs_param = self.request.query_params.get('specs')
        if specs_param:
            try:
                filters_list = specs_param.split(',')
                for f in filters_list:
                    if ':' not in f:
                        continue
                        
                    key, value = f.split(':', 1)
                    
                    # OPRAVA: Používáme 'specification' (jednotné číslo)
                    # A řešíme problém String vs Integer (Frontend posílá "8", DB má 8)
                    
                    if value.isdigit():
                        # Pokud je hodnota číslo (např. "8"), hledáme v JSONu buď číslo 8, nebo text "8"
                        queryset = queryset.filter(
                            Q(**{f"specification__{key}": int(value)}) | 
                            Q(**{f"specification__{key}": value})
                        )
                    else:
                        # Pokud je to text (např. "AM5"), hledáme case-insensitive shodu
                        queryset = queryset.filter(**{f"specification__{key}__icontains": value})
                        
            except Exception as e:
                print(f"Chyba při filtrování specs: {e}")
                pass

        return queryset

# Endpoint pro detail jednoho produktu (podle slugu - hezké URL)
class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'slug'

class OrderCreateView(generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def perform_create(self, serializer):
        # Pokud je uživatel přihlášený, uložíme ho k objednávce. Jinak None.
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)

# View pro výpis objednávek přihlášeného uživatele
class UserOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated] # Musí být přihlášen

    def get_queryset(self):
        # Vrátí jen objednávky toho, kdo o ně žádá
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Magie: Najde profil přihlášeného usera, nebo ho vytvoří, když chybí
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    # --- SEKCE PRO ZAMĚSTNANCE ---

class ManagerAllOrdersView(generics.ListAPIView):
    # Vrátí VŠECHNY objednávky seřazené od nejnovějších
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    
    # Tady nasadíme našeho "vyhazovače"
    permission_classes = [IsEmployee]

# 1. API pro uložení karty (POST)
class SaveCardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        card_number = request.data.get('cardNumber')
        expiry = request.data.get('expiry')
        
        # 1. Validace Karty
        if not card_number or len(str(card_number).replace(" ", "")) < 12:
             return Response({"error": "Neplatné číslo karty"}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Validace Expirace (MM/YY) - NOVÉ
        if not expiry or not re.match(r'^(0[1-9]|1[0-2])\/\d{2}$', expiry):
            return Response({"error": "Neplatná expirace. Použijte formát MM/YY"}, status=status.HTTP_400_BAD_REQUEST)

        # ... (zbytek ukládání) ...
        card = SavedCard(user=user, expiry=expiry, brand="Visa")
        card.save_card_number(card_number) 
        
        return Response({"message": "Karta bezpečně uložena"}, status=status.HTTP_201_CREATED)
    
# 2. API pro výpis uložených karet (GET) - aby si ji příště mohl vybrat
class SavedCardListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SavedCardSerializer
    
    def get_queryset(self):
        # Vrátí jen karty přihlášeného uživatele
        return SavedCard.objects.filter(user=self.request.user)

# 3. API pro správu košíku
class CartAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated] # Jen pro přihlášené

    def get(self, request):
        # Najde nebo vytvoří košík pro uživatele
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        # Přidání zboží
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Produkt nenalezen"}, status=status.HTTP_404_NOT_FOUND)

        # Pokud už tam produkt je, zvýšíme množství
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        
        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
            
        cart_item.save()

        # Vrátíme celý aktualizovaný košík
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def delete(self, request):
        # Odebrání zboží (podle ID produktu)
        product_id = request.data.get('product_id')
        cart = Cart.objects.get(user=request.user)
        
        # Smažeme položku
        CartItem.objects.filter(cart=cart, product_id=product_id).delete()
        
        return Response({"message": "Položka odebrána"})
    
class FilterOptionsView(APIView):
    def get(self, request):
        category_id = request.query_params.get('category')
        
        if not category_id:
            return Response({"error": "Category ID required"}, status=400)

        # 1. Získáme produkty v kategorii (včetně podkategorií)
        try:
            category = Category.objects.get(id=category_id)
            products = Product.objects.filter(
                Q(category=category) | Q(category__parent=category)
            ).filter(is_available=True)
        except Category.DoesNotExist:
            return Response({"filters": []})

        filters = []

        # 2. FILTR: BRAND (Výrobce)
        # Získáme unikátní brandy, které mají alespoň 1 produkt
        brands = products.values_list('brand', flat=True).distinct().order_by('brand')
        # Odstraníme None/Prázdné hodnoty
        brands = [b for b in brands if b]
        
        if brands:
            filters.append({
                "id": "brand",
                "label": "Výrobce",
                "options": brands
            })

        # 3. FILTR: DYNAMICKÉ SPECIFIKACE (JSON)
        # Projdeme všechny produkty a sesbíráme klíče a hodnoty
        # POZNÁMKA: Toto může být pomalé, pokud máš miliony produktů, ale pro tisíce je to OK.
        specs_map = {}

        for product in products:
            if not product.specification:
                continue
            
            for key, value in product.specification.items():
                if key not in specs_map:
                    specs_map[key] = set()
                specs_map[key].add(str(value)) # Převedeme na string pro jistotu

        # Převedeme mapu na seznam filtrů
        for key, values in specs_map.items():
            # Hezký název (např. "cpu_family" -> "Cpu Family")
            label = key.replace("_", " ").title()
            
            # Seřadíme možnosti
            sorted_options = sorted(list(values))

            filters.append({
                "id": key,
                "label": label,
                "options": sorted_options
            })

        return Response(filters)