import time
import asyncio
import random
from apscheduler.schedulers.background import BackgroundScheduler
from services.db_service import get_settings, save_log
from services.telegram_service import send_telegram

# Inicializamos el scheduler
scheduler = BackgroundScheduler()
scheduler.start()

def run_job(content, target_list, image_path):
    print("DEBUG: Entrando en run_job")
    settings = get_settings()
    print(f"DEBUG: Configuración obtenida: {settings}")
    
    # Validamos que las claves existan
    required = ['tg_api_id', 'tg_api_hash', 'tg_phone']
    if not all(k in settings for k in required):
        print(f"DEBUG: ERROR - Faltan credenciales. Necesitamos: {required}")
        return

    for target in target_list:
        try:
            # SEGURIDAD: Pausa aleatoria (3 a 8 segundos) para comportamiento humano
            delay = random.uniform(3, 8)
            print(f"DEBUG: Esperando {delay:.2f}s antes de enviar a {target}...")
            time.sleep(delay)
            
            print(f"DEBUG: Intentando enviar a {target}")
            
            # Nota: Aseguramos que image_path sea None si está vacío
            path = image_path if image_path and image_path != "None" else None
            
            # Ejecutamos el envío
            asyncio.run(send_telegram(
                settings['tg_api_id'], 
                settings['tg_api_hash'], 
                settings['tg_phone'], 
                target, 
                content, 
                path
            ))
            
            save_log(target, "Éxito")
            print(f"DEBUG: Éxito en {target}")
            
        except Exception as e:
            print(f"DEBUG: ERROR CRÍTICO AL ENVIAR a {target}: {e}")
            save_log(target, f"Error: {str(e)}")

def add_post_job(content, groups, image_path, frequency, send_now):
    job_id = f"job_{int(time.time())}"
    
    if send_now:
        print("DEBUG: Ejecución inmediata solicitada")
        run_job(content, groups, image_path)
    
    # Programamos para el futuro
    scheduler.add_job(
        run_job, 
        'interval', 
        hours=float(frequency), 
        args=[content, groups, image_path], 
        id=job_id
    )
    return job_id

def remove_job(job_id):
    try:
        scheduler.remove_job(job_id)
        print(f"DEBUG: Job {job_id} cancelado correctamente.")
    except Exception as e:
        print(f"DEBUG: No se pudo cancelar el job {job_id}: {e}")