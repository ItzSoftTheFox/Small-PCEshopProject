# backend/Dockerfile

FROM python:3.12-slim

# --- PŘIDAT TENTO ŘÁDEK ---
# Tímto umlčíme ty debconf hlášky
ENV DEBIAN_FRONTEND=noninteractive 

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Teď už to projde, pokud soubor existuje
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]