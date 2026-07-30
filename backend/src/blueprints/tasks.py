import sqlite3
import asyncio
import os
import time
import traceback
from flask import Blueprint, request, g, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
from globals import telegram_code
# IMPORTANTE: Cambiamos la importación al nuevo servicio modular
from services.telegram_service import send_telegram

tasks_bp = Blueprint('tasks', __name__)
scheduler = BackgroundScheduler()
scheduler.start()

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
DB_PATH = os.path.join(os.getcwd(), 'GlidePost.db')

def log_to_db(target, status):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute("INSERT INTO logs (target, status) VALUES (?, ?)", (target, status))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error guardando log: {e}")

def job_send_post(content, target_list, image_path):
    print(f"DEBUG: Job iniciado.")
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        settings = {row[0]: row[1] for row in cursor.execute("SELECT key, value FROM settings").fetchall()}
        conn.close()
        
        if all(k in settings for k in ('api_id', 'api_hash', 'phone')):
            for target in target_list:
                try:
                    # Usamos el nuevo servicio modular
                    asyncio.run(send_telegram(
                        settings['api_id'], settings['api_hash'], settings['phone'], 
                        target, content, image_path
                    ))
                    log_to_db(target, "Éxito")
                except Exception as e:
                    log_to_db(target, f"Error: {str(e)}")
        else:
            print("Error: Faltan credenciales en settings.")
    except Exception as e:
        print(f"DEBUG CRITICAL: {traceback.format_exc()}")

@tasks_bp.route('/schedule', methods=['POST'])
def schedule_post():
    try:
        image = request.files.get('image')
        image_path = os.path.join(UPLOAD_FOLDER, image.filename) if image and image.filename else None
        if image: image.save(image_path)
        
        content = request.form.get('content')
        groups = [g.strip() for g in request.form.get('groups', '').split(',') if g.strip()]
        freq = int(request.form.get('frequency', 1))
        
        if not content or not groups:
            return jsonify({"message": "Faltan datos"}), 400
            
        job_id = f"job_{int(time.time())}"
        if request.form.get('sendNow') == 'true':
            job_send_post(content, groups, image_path)
            
        scheduler.add_job(job_send_post, 'interval', hours=freq, args=[content, groups, image_path], id=job_id)
        return jsonify({"status": "success", "message": "Programado"})
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@tasks_bp.route('/cancel', methods=['POST'])
def cancel_post():
    job_id = request.get_json().get('job_id')
    try:
        scheduler.remove_job(job_id)
        return jsonify({"message": "Cancelado"}), 200
    except:
        return jsonify({"message": "No encontrado"}), 404

@tasks_bp.route('/settings', methods=['GET', 'POST'])
def handle_settings():
    if request.method == 'GET':
        return jsonify({row[0]: row[1] for row in g.db.execute("SELECT key, value FROM settings").fetchall()}), 200
    for k, v in request.json.items():
        g.db.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (k, v))
    g.db.commit()
    return jsonify({"message": "Guardado"}), 200

@tasks_bp.route('/submit-code', methods=['POST'])
def submit_code():
    telegram_code["value"] = request.json.get("code")
    return jsonify({"message": "Código recibido"})

@tasks_bp.route('/logs', methods=['GET'])
def get_logs():
    data = g.db.execute("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 20").fetchall()
    return jsonify({"logs": [dict(zip(['id', 'target', 'status', 'time'], row)) for row in data]})