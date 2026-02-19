from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='categories'),
    path('products/', views.ProductListView.as_view(), name='product-list'),
    path('products/<slug:slug>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('orders/', views.OrderCreateView.as_view(), name='create-order'),
    path('my-orders/', views.UserOrderListView.as_view(), name='my-orders'),
    path('save-card/', views.SaveCardView.as_view(), name='save-card'),
    path('saved-cards/', views.SavedCardListView.as_view(), name='saved-cards'),
    path('manager/orders/', views.ManagerAllOrdersView.as_view(), name='manager-orders'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('cart/', views.CartAPIView.as_view(), name='cart'),
    path('filters/', views.FilterOptionsView.as_view(), name='product-filters'),
]