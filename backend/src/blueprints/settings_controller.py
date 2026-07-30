from flask import Blueprint, request, jsonify
from services.db_service import get_settings, save_setting

settings_bp = Blueprint('settings_controller', __name__)

@settings_bp.route('/settings', methods=['GET'])
def get_all_settings():
    """Retorna todas las configuraciones guardadas."""
    try:
        data = get_settings()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@settings_bp.route('/settings', methods=['POST'])
def update_settings():
    """Recibe un JSON con las credenciales y las guarda/actualiza."""
    try:
        data = request.json
        if not data:
            return jsonify({"message": "No se enviaron datos"}), 400
            
        for key, value in data.items():
            save_setting(key, value)
            
        return jsonify({"message": "Configuración guardada exitosamente"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500