package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type AnalyticsService struct {
	router   *gin.Engine
	mongo    *mongo.Client
	redis    *redis.Client
	ctx      context.Context
	requests prometheus.Counter
	latency  prometheus.Histogram
}

func NewAnalyticsService() *AnalyticsService {
	ctx := context.Background()
	
	// MongoDB connection
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}
	
	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	
	// Redis connection
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}
	
	redisClient := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})
	
	// Prometheus metrics
	requests := promauto.NewCounter(prometheus.CounterOpts{
		Name: "analytics_requests_total",
		Help: "Total number of analytics requests",
	})
	
	latency := promauto.NewHistogram(prometheus.HistogramOpts{
		Name:    "analytics_request_duration_seconds",
		Help:    "Analytics request duration in seconds",
		Buckets: prometheus.DefBuckets,
	})
	
	service := &AnalyticsService{
		ctx:      ctx,
		mongo:    mongoClient,
		redis:    redisClient,
		requests: requests,
		latency:  latency,
	}
	
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
		})
	})
	
	// Metrics endpoint
	router.GET("/metrics", gin.WrapH(promhttp.Handler()))
	
	// Analytics endpoints
	v1 := router.Group("/api/v1/analytics")
	{
		v1.POST("/events", s.handleEvent)
		v1.GET("/stats/:userId", s.getUserStats)
		v1.GET("/dashboard", s.getDashboardStats)
	}
	
	s.router = router
}

func (s *AnalyticsService) handleEvent(c *gin.Context) {
	start := time.Now()
	s.requests.Inc()
	
	var event struct {
		UserID    string                 `json:"userId" binding:"required"`
		EventType string                 `json:"eventType" binding:"required"`
		Data      map[string]interface{} `json:"data"`
		Timestamp time.Time              `json:"timestamp"`
	}
	
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if event.Timestamp.IsZero() {
		event.Timestamp = time.Now()
	}
	
	// Store event in MongoDB
	collection := s.mongo.Database("analytics").Collection("events")
	_, err := collection.InsertOne(s.ctx, event)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store event"})
		return
	}
	
	// Cache recent stats in Redis
	cacheKey := "user_stats:" + event.UserID
	s.redis.Incr(s.ctx, cacheKey+"_total_events")
	s.redis.HIncrBy(s.ctx, cacheKey+"_event_types", event.EventType, 1)
	s.redis.Expire(s.ctx, cacheKey, 24*time.Hour)
	
	s.latency.Observe(time.Since(start).Seconds())
	
	c.JSON(http.StatusCreated, gin.H{
		"message": "Event recorded successfully",
		"eventId": event.UserID + "_" + event.EventType,
	})
}

func (s *AnalyticsService) getUserStats(c *gin.Context) {
	userID := c.Param("userId")
	cacheKey := "user_stats:" + userID
	
	// Try to get from cache first
	totalEvents, err := s.redis.Get(s.ctx, cacheKey+"_total_events").Result()
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User stats not found"})
		return
	}
	
	eventTypes, err := s.redis.HGetAll(s.ctx, cacheKey+"_event_types").Result()
	if err != nil {
		eventTypes = make(map[string]string)
	}
	
	c.JSON(http.StatusOK, gin.H{
		"userId":      userID,
		"totalEvents": totalEvents,
		"eventTypes":  eventTypes,
	})
}

func (s *AnalyticsService) getDashboardStats(c *gin.Context) {
	// Simplified dashboard stats
	collection := s.mongo.Database("analytics").Collection("events")
	
	// Count total events
	totalCount, err := collection.CountDocuments(s.ctx, map[string]interface{}{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get stats"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"totalEvents": totalCount,
		"activeUsers": "implement real-time counting",
		"topEvents":   []string{"page_view", "click", "purchase"},
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