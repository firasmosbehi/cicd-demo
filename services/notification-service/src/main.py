from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import redis
import json
import asyncio
from typing import List, Dict
import os
import logging
from src.providers import EnhancedNotificationService

app = FastAPI(title="Notification Service", version="1.0.0")

# Redis connection
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    decode_responses=True
)

class Notification(BaseModel):
    user_id: str
    recipient: str  # email address, phone number, or device token
    message: str
    type: str  # email, sms, push, slack
    priority: str = "normal"  # low, normal, high
    subject: str = None  # For email
    title: str = None    # For push notifications
    html_body: str = None  # For email
    data: Dict = None    # For push notifications
    username: str = None # For Slack

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

# Initialize enhanced notification service
notification_service = EnhancedNotificationService()

async def process_notification(notification_id: str, notification_data: Dict):
    """Process notification using enhanced providers"""
    notification_type = notification_data['type']
    
    try:
        # Prepare content based on notification type
        content = {}
        
        if notification_type == 'email':
            content = {
                "subject": notification_data.get('subject', 'Notification'),
                "body": notification_data['message'],
                "html_body": notification_data.get('html_body')
            }
        elif notification_type == 'sms':
            content = {
                "message": notification_data['message']
            }
        elif notification_type == 'push':
            content = {
                "title": notification_data.get('title', 'Notification'),
                "body": notification_data['message'],
                "data": notification_data.get('data', {})
            }
        elif notification_type == 'slack':
            content = {
                "message": notification_data['message'],
                "username": notification_data.get('username', 'Notification Bot')
            }
        
        # Send notification using enhanced service
        success = await notification_service.send_notification(
            notification_type,
            notification_data['recipient'],  # Assuming we add recipient field
            content
        )
        
        # Update status
        notification_data['status'] = 'sent' if success else 'failed'
        if not success:
            notification_data['error'] = 'Provider failed to send notification'
            
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