from django.contrib import admin
from django.utils.safestring import mark_safe  # ZMĚNA: Používáme mark_safe místo format_html
import json

# Import tvých modelů
from .models import Product, Category, Order, OrderItem, UserProfile, Cart, CartItem, SavedCard

# --- 1. DEFINICE ŠABLON (JSON TEMPLATES) ---
PRODUCT_TEMPLATES = {
    "CPU": {
        "series": "Core i5",
        "cores": 6,
        "socket": "LGA1700"
    },
    "GPU": {
        "chip": "RTX 4060",
        "vram": "8GB"
    },
    "Motherboard": {
        "socket": "AM5",
        "chipset": "B650",
        "format": "ATX",
        "ram_type": "DDR5"
    },
    "PC Gaming": {
        "gpu_model": "RTX 4070",
        "cpu_family": "Ryzen 7",
        "ram_size": "32GB",
        "resolution": "1440p Gaming"
    },
    "Laptop": {
        "display": "15.6\"",
        "gpu": "RTX 4060",
        "cpu": "Core i7",
        "ram": "16GB",
        "storage": "1TB SSD"
    },
    "RAM": {
        "type": "DDR5",
        "capacity": "32GB",
        "frequency": "6000 MHz"
    },
    "SSD": {
        "type": "SSD NVMe",
        "capacity": "1TB",
        "interface": "PCIe 4.0"
    },
    "PSU": {
        "power": "750W",
        "certification": "Gold",
        "modular": "Plně modulární"
    }
}

# --- 2. KATEGORIE ---
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent')
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ('parent',)
    search_fields = ('name',)

# --- 3. PRODUKTY (OPRAVENO) ---
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'brand', 'price', 'stock', 'is_available')
    list_filter = ('category', 'brand', 'is_available')
    list_editable = ('stock', 'is_available')
    search_fields = ('name', 'brand')
    prepopulated_fields = {'slug': ('name',)}
    
    # Toto pole musí být v readonly, jinak Django vyhodí chybu, že neexistuje v modelu
    readonly_fields = ('json_templates',) 

    # OPRAVENO: specification (jednotné číslo)
    fields = ('category', 'brand', 'name', 'slug', 'description', 'price', 'stock', 'image', 'is_available', 'json_templates', 'specification')

    def json_templates(self, instance):
        html = '<div style="margin-bottom: 10px;">'
        html += '<strong>Rychlé šablony (vloží data do Specification): </strong><br>'
        
        for label, template in PRODUCT_TEMPLATES.items():
            json_str = json.dumps(template)
            
            # --- OPRAVA ---
            # 1. Používáme \" (escapované dvojité uvozovky) pro ID prvku, aby se to nebilo s HTML atributem onclick='...'
            # 2. Přidali jsme console.log a alert pro případ chyby
            onclick_js = (
                f"var ta = document.getElementById(\"id_specification\"); "
                f"if(ta) {{ ta.value = JSON.stringify({json_str}, null, 4); }} "
                f"else {{ alert(\"Chyba: Pole id_specification nenalezeno! Zkontroluj Inspect Element.\"); console.error(\"Target not found\"); }}"
            )
            
            html += f'''
                <button type="button" onclick='{onclick_js}' style="margin-right: 5px; margin-top: 5px; padding: 5px 10px; cursor: pointer; background: #333; color: white; border: 1px solid #555; border-radius: 4px;">
                    {label}
                </button>
            '''
        
        html += '</div><p style="color: #666; font-size: 11px;">Kliknutím přepíšete obsah JSON pole.</p>'
        
        return mark_safe(html)

    json_templates.short_description = "Nástroje JSON"

# --- 4. OBJEDNÁVKY ---
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ['product']
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at', 'full_name', 'total_amount', 'paid', 'shipping_method', 'status_emoji')
    list_filter = ('paid', 'created_at', 'shipping_method')
    search_fields = ('full_name', 'email', 'id')
    inlines = [OrderItemInline]
    
    def get_readonly_fields(self, request, obj=None):
        if request.user.is_superuser:
            return [] 
        return ['user', 'full_name', 'email', 'address', 'city', 'zip_code', 'total_amount', 'items']

    actions = ['mark_as_paid']

    @admin.action(description='Označit vybrané jako ZAPLACENÉ')
    def mark_as_paid(self, request, queryset):
        updated = queryset.update(paid=True)
        self.message_user(request, f"{updated} objednávek bylo označeno jako zaplacené.")

    def status_emoji(self, obj):
        return "✅" if obj.paid else "❌"
    status_emoji.short_description = "Stav"

# --- 5. UŽIVATELÉ A PROFILY ---
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'city', 'phone')
    search_fields = ('user__username', 'full_name', 'email')

# --- 6. ULOŽENÉ KARTY ---
@admin.register(SavedCard)
class SavedCardAdmin(admin.ModelAdmin):
    list_display = ('user', 'brand', 'last_4', 'expiry')
    list_filter = ('brand',)
    
    def has_add_permission(self, request):
        return False

# --- 7. KOŠÍKY ---
class CartItemInline(admin.TabularInline):
    model = CartItem
    raw_id_fields = ['product']
    extra = 0

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'item_count')
    inlines = [CartItemInline]

    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = "Počet položek"