# GlidePost 🚀

**GlidePost** es una plataforma de automatización social autohospedada diseñada para programar, gestionar y ejecutar publicaciones masivas en múltiples redes sociales de manera segura, eficiente y con comportamiento humano.

## 🛠 Stack Tecnológico

*   **Backend:** Python 3.11, Flask (API RESTful), Telethon (Telegram Userbot), APScheduler.
*   **Frontend:** React 18 (Vite), Tailwind CSS, React Router.
*   **Infraestructura:** Docker & Docker Compose.
*   **Base de Datos:** SQLite con servicio centralizado.

## 🚀 Características Principales

*   **Arquitectura Modular:** Sistema desacoplado con controladores y servicios independientes para cada red social.
*   **Seguridad y Anti-Ban:** Implementación de pausas aleatorias (humana) para evitar detecciones de spam.
*   **Gestión Dinámica:** Interfaz intuitiva para manejar múltiples grupos y destinos simultáneamente.
*   **Persistencia:** Estado guardado en `localStorage` y configuración persistente en base de datos local.
*   **Dockerizado:** Despliegue sencillo y consistente en cualquier entorno.

## 🏗 Estructura del Proyecto

```text
/backend
  ├── src/
  │   ├── blueprints/    # Controladores de la API (post, settings)
  │   ├── services/      # Lógica de negocio (telegram, db, scheduler)
  │   └── app.py         # Punto de entrada de la aplicación
/frontend
  ├── src/
  │   ├── components/    # UI Reutilizable (Layout)
  │   └── pages/         # Vistas individuales por red social
```

## ⚙️ Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/EarmLog/GlidePost.git
   cd GlidePost
   ```

2. Levanta los contenedores:
   ```bash
   sudo docker-compose up --build
   ```

3. Accede a la interfaz:
   * **Frontend:** `http://localhost:5173`
   * **Backend:** `http://localhost:5000`

## 🛡 Consideraciones de Seguridad
GlidePost implementa pausas aleatorias en sus tareas automatizadas. Se recomienda no exceder límites de envíos para mantener la integridad de las cuentas. El uso de la plataforma es responsabilidad del usuario final.

---
*Desarrollado con arquitectura profesional enfocada en escalabilidad.*
