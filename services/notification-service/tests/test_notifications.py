import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "notification-service"}

def test_send_notification():
    notification_data = {
        "user_id": "test_user_123",
        "message": "Test notification message",
        "type": "email",
        "priority": "normal"
    }
    
    response = client.post("/notifications", json=notification_data)
    assert response.status_code == 200
    
    response_data = response.json()
    assert "id" in response_data
    assert response_data["status"] == "queued"
    assert "timestamp" in response_data

def test_invalid_notification_type():
    notification_data = {
        "user_id": "test_user_123",
        "message": "Test message",
        "type": "invalid_type"  # Invalid notification type
    }
    
    response = client.post("/notifications", json=notification_data)
    # Should still accept it but process will fail
    assert response.status_code == 200

def test_get_notification_status():
    # First create a notification
    notification_data = {
        "user_id": "test_user_456",
        "message": "Status test message",
        "type": "sms"
    }
    
    create_response = client.post("/notifications", json=notification_data)
    notification_id = create_response.json()["id"]
    
    # Then check its status
    response = client.get(f"/notifications/{notification_id}")
    assert response.status_code == 200
    assert "status" in response.json()