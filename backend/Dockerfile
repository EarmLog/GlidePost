FROM python:3.11-slim

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos dependencias e instalamos
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copiamos todo el código fuente
COPY . .

# CORRECCIÓN: Apuntamos al archivo en la ubicación real
CMD ["python", "src/app.py"]