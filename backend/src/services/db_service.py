import sqlite3
import os

# Ruta absoluta al archivo de base de datos
DB_PATH = os.path.join(os.getcwd(), 'GlidePost.db')

def init_db():
    """Inicializa las tablas necesarias."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS settings 
                       (key TEXT PRIMARY KEY, value TEXT)''')
        conn.execute('''CREATE TABLE IF NOT EXISTS logs 
                       (id INTEGER PRIMARY KEY, target TEXT, status TEXT, 
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
        conn.commit()

def get_connection():
    """Retorna una conexión configurada."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_settings():
    """Obtiene todas las configuraciones como un diccionario."""
    conn = get_connection()
    try:
        rows = conn.execute("SELECT key, value FROM settings").fetchall()
        return {row['key']: row['value'] for row in rows}
    finally:
        conn.close()

def save_setting(key, value):
    """Guarda o actualiza una configuración."""
    conn = get_connection()
    conn.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, value))
    conn.commit()
    conn.close()

def save_log(target, status):
    """Guarda un log de ejecución."""
    conn = get_connection()
    conn.execute("INSERT INTO logs (target, status) VALUES (?, ?)", (target, status))
    conn.commit()
    conn.close()