import os
from cryptography.fernet import Fernet

# 1. Načteme klíč z prostředí (z .env)
# Klíč je v .env jako text (string), ale Fernet potřebuje byty (bytes).
key_str = os.getenv('ENCRYPTION_KEY')

# Záchranná brzda: Kdybychom zapomněli dát klíč do .env
if not key_str:
    raise ValueError("CHYBA: V .env chybí 'ENCRYPTION_KEY'!")

# 2. Převedeme string na bytes (to je to .encode())
KEY = key_str.encode() 

cipher_suite = Fernet(KEY)

def encrypt_card(card_number):
    """Zašifruje číslo karty"""
    return cipher_suite.encrypt(card_number.encode()).decode()

def decrypt_card(encrypted_card):
    """Rozšifruje řetězec zpět na číslo karty"""
    return cipher_suite.decrypt(encrypted_card.encode()).decode()

def get_last_4(card_number):
    return card_number[-4:]