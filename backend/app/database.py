from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = None
db = None

def get_database():
    global client, db
    if client is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.DATABASE_NAME]
    return db

async def close_database_connection():
    global client
    if client:
        client.close()
