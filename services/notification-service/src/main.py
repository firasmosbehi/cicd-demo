from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import redis
import json
import asyncio
from typing import List, Dict
import os

app = FastAPI(title="Notification Service", version="1.0.0")

# Redis connection
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    decode_responses=True
)

class Notification(BaseModel):
    user_id: str
    message: str
    type: str  # email, sms, push
    priority: str = "normal"  # low, normal, high

class NotificationResponse(BaseModel):
    id: str
    status: str
    timestamp: str

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "notification-service"}

@app.post("/notifications", response_model=NotificationResponse)
async def send_notification(notification: Notification, background_tasks: BackgroundTasks):
    """Send notification and queue for processing"""
    notification_id = f"notif_{hash(str(notification))}"
    
    # Store notification in Redis
    notification_data = notification.dict()
    notification_data['id'] = notification_id
    notification_data['status'] = 'queued'
    
    redis_client.setex(
        f"notification:{notification_id}",
        3600,  # 1 hour expiry
        json.dumps(notification_data)
    )
    
    # Process notification in background
    background_tasks.add_task(process_notification, notification_id, notification_data)
    
    return NotificationResponse(
        id=notification_id,
        status="queued",
        timestamp=str(asyncio.get_event_loop().time())
    )

async def process_notification(notification_id: str, notification_data: Dict):
    """Process notification based on type"""
    notification_type = notification_data['type']
    
    try:
        if notification_type == 'email':
            await send_email(notification_data)
        elif notification_type == 'sms':
            await send_sms(notification_data)
        elif notification_type == 'push':
            await send_push_notification(notification_data)
        
        # Update status
        notification_data['status'] = 'sent'
        redis_client.setex(
            f"notification:{notification_id}",
            3600,
            json.dumps(notification_data)
        )
        
    except Exception as e:
        notification_data['status'] = 'failed'
        notification_data['error'] = str(e)
        redis_client.setex(
            f"notification:{notification_id}",
            3600,
            json.dumps(notification_data)
        )

async def send_email(notification_data: Dict):
    """Simulate email sending"""
    await asyncio.sleep(1)  # Simulate network delay
    print(f"Email sent to user {notification_data['user_id']}: {notification_data['message']}")

async def send_sms(notification_data: Dict):
    """Simulate SMS sending"""
    await asyncio.sleep(0.5)  # Simulate network delay
    print(f"SMS sent to user {notification_data['user_id']}: {notification_data['message']}")

async def send_push_notification(notification_data: Dict):
    """Simulate push notification"""
    await asyncio.sleep(0.1)  # Simulate network delay
    print(f"Push notification sent to user {notification_data['user_id']}: {notification_data['message']}")

@app.get("/notifications/{notification_id}")
async def get_notification_status(notification_id: str):
    """Get notification status"""
    notification_data = redis_client.get(f"notification:{notification_id}")
    if not notification_data:
        return {"error": "Notification not found"}
    
    return json.loads(notification_data)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3002)