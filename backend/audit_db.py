import sqlite3
import os

# Ruta a tu base de datos
DB_PATH = 'GlidePost.db'

def audit_db():
    if not os.path.exists(DB_PATH):
        print(f"Error: El archivo {DB_PATH} no existe en esta ruta.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("--- Auditoría de Tabla 'settings' ---")
    # Detectar duplicados (aunque la columna key es PRIMARY KEY, esto ayuda a ver si hay inconsistencias)
    cursor.execute("SELECT key, COUNT(*) as count FROM settings GROUP BY key HAVING count > 1")
    duplicates = cursor.fetchall()
    
    if duplicates:
        print(f"¡ALERTA! Se encontraron claves duplicadas: {duplicates}")
    else:
        print("Tabla 'settings' limpia (no hay claves duplicadas).")

    # Mostrar contenido actual
    cursor.execute("SELECT key, value FROM settings")
    rows = cursor.fetchall()
    print(f"\nTotal de configuraciones encontradas: {len(rows)}")
    for row in rows:
        # Ocultar parte del token por seguridad si es muy largo
        val = row[1][:10] + "..." if row[1] and len(row[1]) > 10 else row[1]
        print(f"  {row[0]}: {val}")

    print("\n--- Auditoría de Tabla 'logs' ---")
    cursor.execute("SELECT COUNT(*) FROM logs")
    print(f"Total de registros de logs: {cursor.fetchone()[0]}")
    
    conn.close()

if __name__ == "__main__":
    audit_db()