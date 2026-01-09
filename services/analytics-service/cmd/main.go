package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

type AnalyticsService struct {
	router *gin.Engine
}

func NewAnalyticsService() *AnalyticsService {
	service := &AnalyticsService{}
	service.setupRouter()
	return service
}

func (s *AnalyticsService) setupRouter() {
	router := gin.Default()
	
	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "analytics-service",
			"version": "1.0.0",
		})
	})

	// Simple analytics endpoints
	router.POST("/api/v1/analytics/events", s.handleEvent)
	router.GET("/api/v1/analytics/stats", s.getStats)
	
	s.router = router
}

func (s *AnalyticsService) handleEvent(c *gin.Context) {
	var event struct {
		UserID    string `json:"userId" binding:"required"`
		EventType string `json:"eventType" binding:"required"`
		Data      map[string]interface{} `json:"data"`
	}
	
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Simple logging for demo
	log.Printf("Event received: %s from user %s", event.EventType, event.UserID)
	
	c.JSON(http.StatusCreated, gin.H{
		"message": "Event recorded",
		"eventId": event.UserID + "_" + event.EventType + "_" + time.Now().Format("20060102150405"),
	})
}

func (s *AnalyticsService) getStats(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"totalEvents": 0,
		"activeUsers": 0,
		"topEvents":   []string{},
		"message":     "Analytics service running",
	})
}

func (s *AnalyticsService) Run(port string) {
	log.Printf("Analytics service starting on port %s", port)
	log.Fatal(s.router.Run(":" + port))
}

func main() {
	service := NewAnalyticsService()
	port := os.Getenv("PORT")
	if port == "" {
		port = "3003"
	}
	service.Run(port)
}