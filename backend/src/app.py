import sys
import os
# Añadimos el directorio 'src' al path de búsqueda antes de cualquier import
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request
from flask_cors import CORS
from blueprints.post_controller import posts_bp
from blueprints.settings_controller import settings_bp
from services.db_service import init_db

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Inicializar la base de datos
    with app.app_context():
        init_db()

    # Log de cada petición
    @app.before_request
    def log_request_info():
        # request.method y request.url ahora están disponibles porque importamos 'request'
        print(f"DEBUG: Petición recibida: {request.method} {request.url}")

    # Registrar Blueprints
    app.register_blueprint(posts_bp, url_prefix='/api')
    app.register_blueprint(settings_bp, url_prefix='/api')

    return app

app = create_app()

@app.teardown_appcontext
def close_connection(exception):
    pass

if __name__ == '__main__':
    # host='0.0.0.0' permite que Docker lo exponga correctamente
    app.run(host='0.0.0.0', port=5000, debug=True)