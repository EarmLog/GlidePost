import asyncio
import os
from telethon import TelegramClient
from globals import telegram_code

async def send_telegram(api_id, api_hash, phone, target, message, image_path=None):
    session_path = os.path.join(os.getcwd(), 'anon')
    client = TelegramClient(session_path, int(api_id), api_hash)
    
    async def code_callback():
        while telegram_code["value"] is None:
            await asyncio.sleep(0.5)
        code = telegram_code["value"]
        telegram_code["value"] = None
        return code

    try:
        if not client.is_connected():
            await client.start(phone=phone, code_callback=code_callback)
        
        # Resolución de entidad
        try:
            entity = await client.get_input_entity(target)
        except:
            entity = await client.get_input_entity(int(target))

        if image_path and os.path.exists(image_path):
            await client.send_file(entity, image_path, caption=message)
        else:
            await client.send_message(entity, message)
            
        print(f"DEBUG: Mensaje enviado exitosamente a {target}")
        return True
    except Exception as e:
        print(f"DEBUG: Error en telegram_service para {target}: {str(e)}")
        raise e
    finally:
        await client.disconnect()