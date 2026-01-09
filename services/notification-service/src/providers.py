import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
import asyncio
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class EmailProvider:
    """Email notification provider using SMTP"""
    
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"  # Would be configurable
        self.smtp_port = 587
        self.sender_email = "noreply@example.com"  # Would be configurable
        self.sender_password = "app_password"  # Would be from env vars
    
    async def send_email(self, to_email: str, subject: str, body: str, html_body: str = None) -> bool:
        """Send email notification"""
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.sender_email
            message["To"] = to_email
            
            # Create text and HTML versions
            text_part = MIMEText(body, "plain")
            message.attach(text_part)
            
            if html_body:
                html_part = MIMEText(html_body, "html")
                message.attach(html_part)
            
            # Send email
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, to_email, message.as_string())
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

class SMSProvider:
    """SMS notification provider using Twilio API"""
    
    def __init__(self):
        self.account_sid = "your_twilio_account_sid"  # From env vars
        self.auth_token = "your_twilio_auth_token"    # From env vars
        self.from_phone = "+1234567890"               # Your Twilio number
    
    async def send_sms(self, to_phone: str, message: str) -> bool:
        """Send SMS notification"""
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"
            
            data = {
                "From": self.from_phone,
                "To": to_phone,
                "Body": message
            }
            
            response = requests.post(
                url,
                data=data,
                auth=(self.account_sid, self.auth_token)
            )
            
            if response.status_code == 201:
                logger.info(f"SMS sent successfully to {to_phone}")
                return True
            else:
                logger.error(f"Failed to send SMS: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send SMS to {to_phone}: {str(e)}")
            return False

class PushNotificationProvider:
    """Push notification provider using Firebase Cloud Messaging"""
    
    def __init__(self):
        self.fcm_server_key = "your_fcm_server_key"  # From env vars
        self.fcm_url = "https://fcm.googleapis.com/fcm/send"
    
    async def send_push_notification(self, device_token: str, title: str, body: str, data: Dict[str, Any] = None) -> bool:
        """Send push notification"""
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"key={self.fcm_server_key}"
            }
            
            payload = {
                "to": device_token,
                "notification": {
                    "title": title,
                    "body": body,
                    "sound": "default"
                }
            }
            
            if data:
                payload["data"] = data
            
            response = requests.post(self.fcm_url, json=payload, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success", 0) > 0:
                    logger.info(f"Push notification sent successfully to device {device_token[:10]}...")
                    return True
                else:
                    logger.error(f"Push notification failed: {result}")
                    return False
            else:
                logger.error(f"FCM API error: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send push notification: {str(e)}")
            return False

class SlackProvider:
    """Slack webhook provider for team notifications"""
    
    def __init__(self):
        self.webhook_url = "your_slack_webhook_url"  # From env vars
    
    async def send_slack_message(self, channel: str, message: str, username: str = "Notification Bot") -> bool:
        """Send message to Slack channel"""
        try:
            payload = {
                "channel": channel,
                "text": message,
                "username": username
            }
            
            response = requests.post(self.webhook_url, json=payload)
            
            if response.status_code == 200:
                logger.info(f"Slack message sent to {channel}")
                return True
            else:
                logger.error(f"Failed to send Slack message: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send Slack message: {str(e)}")
            return False

# Provider factory
class NotificationProviderFactory:
    """Factory to get appropriate notification provider"""
    
    @staticmethod
    def get_provider(provider_type: str):
        providers = {
            "email": EmailProvider(),
            "sms": SMSProvider(),
            "push": PushNotificationProvider(),
            "slack": SlackProvider()
        }
        return providers.get(provider_type.lower())

# Enhanced notification service
class EnhancedNotificationService:
    """Enhanced notification service with multiple providers"""
    
    def __init__(self):
        self.providers = {
            "email": EmailProvider(),
            "sms": SMSProvider(),
            "push": PushNotificationProvider(),
            "slack": SlackProvider()
        }
    
    async def send_notification(self, notification_type: str, recipient: str, content: Dict[str, Any]) -> bool:
        """Send notification using appropriate provider"""
        try:
            if notification_type == "email":
                return await self.providers["email"].send_email(
                    recipient,
                    content.get("subject", "Notification"),
                    content.get("body", ""),
                    content.get("html_body")
                )
            
            elif notification_type == "sms":
                return await self.providers["sms"].send_sms(
                    recipient,
                    content.get("message", "")
                )
            
            elif notification_type == "push":
                return await self.providers["push"].send_push_notification(
                    recipient,
                    content.get("title", "Notification"),
                    content.get("body", ""),
                    content.get("data")
                )
            
            elif notification_type == "slack":
                return await self.providers["slack"].send_slack_message(
                    recipient,
                    content.get("message", ""),
                    content.get("username", "Notification Bot")
                )
            
            else:
                logger.error(f"Unknown notification type: {notification_type}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending {notification_type} notification: {str(e)}")
            return False
    
    async def send_bulk_notifications(self, notifications: list) -> Dict[str, int]:
        """Send multiple notifications concurrently"""
        results = {"success": 0, "failed": 0}
        tasks = []
        
        for notification in notifications:
            task = self.send_notification(
                notification["type"],
                notification["recipient"],
                notification["content"]
            )
            tasks.append(task)
        
        # Execute all tasks concurrently
        task_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in task_results:
            if isinstance(result, Exception) or not result:
                results["failed"] += 1
            else:
                results["success"] += 1
        
        return results