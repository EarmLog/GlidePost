import asyncio
from telethon import TelegramClient

async def test():
    # Asegúrate de usar tus datos reales aquí
    client = TelegramClient('anon', 37297167, 'de11c2f8246eec9255937030f3cf121b')
    await client.start(phone='+584243447402')
    await client.send_message('me', 'Prueba de conexión directa desde el contenedor!')
    print("Mensaje enviado a 'me' exitosamente.")
    await client.disconnect()

asyncio.run(test())