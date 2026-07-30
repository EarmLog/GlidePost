import os
from flask import Blueprint, request, jsonify
from services.scheduler_service import add_post_job, remove_job
from services.db_service import get_settings, save_log

posts_bp = Blueprint('posts', __name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@posts_bp.route('/schedule', methods=['POST'])
def schedule_post():
    image = request.files.get('image')
    image_path = os.path.join(UPLOAD_FOLDER, image.filename) if image else None
    if image: image.save(image_path)
    
    content = request.form.get('content')
    groups = [g.strip() for g in request.form.get('groups', '').split(',') if g.strip()]
    freq = int(request.form.get('frequency', 1))
    send_now = request.form.get('sendNow') == 'true'
    
    if not content or not groups:
        return jsonify({"message": "Faltan datos"}), 400
        
    job_id = add_post_job(content, groups, image_path, freq, send_now)
    return jsonify({"status": "success", "job_id": job_id})

@posts_bp.route('/cancel', methods=['POST'])
def cancel_post():
    data = request.get_json()
    remove_job(data.get('job_id'))
    return jsonify({"message": "Cancelado"})