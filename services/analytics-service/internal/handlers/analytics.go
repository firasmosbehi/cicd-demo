package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"analytics-service/internal/models"
)

type AnalyticsHandler struct {
	db *mongo.Database
}

func NewAnalyticsHandler(db *mongo.Database) *AnalyticsHandler {
	return &AnalyticsHandler{db: db}
}

// TrackEvent handles incoming event tracking requests
func (h *AnalyticsHandler) TrackEvent(c *gin.Context) {
	var event models.Event
	
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set defaults
	if event.ID == "" {
		event.ID = uuid.New().String()
	}
	if event.Timestamp.IsZero() {
		event.Timestamp = time.Now()
	}

	// Insert event
	collection := h.db.Collection("events")
	_, err := collection.InsertOne(context.Background(), event)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to track event"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Event tracked successfully",
		"eventId": event.ID,
	})
}

// TrackPageView handles page view tracking
func (h *AnalyticsHandler) TrackPageView(c *gin.Context) {
	var pageView models.PageViewEvent
	
	if err := c.ShouldBindJSON(&pageView); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set defaults
	pageView.Event.EventName = "page_view"
	pageView.Event.Category = "engagement"
	if pageView.Event.ID == "" {
		pageView.Event.ID = uuid.New().String()
	}
	if pageView.Event.Timestamp.IsZero() {
		pageView.Event.Timestamp = time.Now()
	}

	// Insert page view event
	collection := h.db.Collection("events")
	_, err := collection.InsertOne(context.Background(), pageView)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to track page view"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Page view tracked successfully",
		"eventId": pageView.Event.ID,
	})
}

// TrackConversion handles conversion tracking
func (h *AnalyticsHandler) TrackConversion(c *gin.Context) {
	var conversion models.ConversionEvent
	
	if err := c.ShouldBindJSON(&conversion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set defaults
	conversion.Event.EventName = fmt.Sprintf("conversion_%s", conversion.ConversionType)
	conversion.Event.Category = "conversion"
	if conversion.Event.ID == "" {
		conversion.Event.ID = uuid.New().String()
	}
	if conversion.Event.Timestamp.IsZero() {
		conversion.Event.Timestamp = time.Now()
	}

	// Insert conversion event
	collection := h.db.Collection("events")
	_, err := collection.InsertOne(context.Background(), conversion)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to track conversion"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Conversion tracked successfully",
		"eventId": conversion.Event.ID,
		"revenue": conversion.Revenue,
	})
}

// GetDailyStats returns daily analytics statistics
func (h *AnalyticsHandler) GetDailyStats(c *gin.Context) {
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")
	
	var startDate, endDate time.Time
	var err error
	
	if startDateStr != "" {
		startDate, err = time.Parse("2006-01-02", startDateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start_date format"})
			return
		}
	} else {
		startDate = time.Now().AddDate(0, 0, -30) // Last 30 days
	}
	
	if endDateStr != "" {
		endDate, err = time.Parse("2006-01-02", endDateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end_date format"})
			return
		}
	} else {
		endDate = time.Now()
	}

	// Aggregate daily statistics
	pipeline := mongo.Pipeline{
		bson.D{{"$match", bson.D{
			{"timestamp", bson.D{
				{"$gte", startDate},
				{"$lte", endDate},
			}},
		}}},
		bson.D{{"$group", bson.D{
			{"_id", bson.D{{"$dateToString", bson.D{
				{"format", "%Y-%m-%d"},
				{"date", "$timestamp"},
			}}}},
			{"total_events", bson.D{{"$sum", 1}}},
			{"unique_users", bson.D{{"$addToSet", "$user_id"}}},
			{"page_views", bson.D{{"$sum", bson.D{
				{"$cond", bson.A{
					bson.D{{"$eq", bson.A{"$event_name", "page_view"}}},
					1,
					0,
				}},
			}}}},
			{"conversions", bson.D{{"$sum", bson.D{
				{"$cond", bson.A{
					bson.D{{"$regexMatch", bson.D{
						{"input", "$event_name"},
						{"regex", "^conversion_"},
					}}},
					1,
					0,
				}},
			}}}},
			{"revenue", bson.D{{"$sum", "$metadata.revenue"}}},
		}}},
		bson.D{{"$sort", bson.D{{"_id", 1}}}},
	}

	cursor, err := h.db.Collection("events").Aggregate(context.Background(), pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to aggregate stats"})
		return
	}
	defer cursor.Close(context.Background())

	var results []bson.M
	if err = cursor.All(context.Background(), &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode results"})
		return
	}

	c.JSON(http.StatusOK, results)
}

// GetUserSessions returns user session data
func (h *AnalyticsHandler) GetUserSessions(c *gin.Context) {
	userId := c.Query("user_id")
	limit, err := c.GetQueryInt("limit")
	if err != nil || limit <= 0 {
		limit = 50
	}

	filter := bson.M{}
	if userId != "" {
		filter["user_id"] = userId
	}

	opts := options.Find().SetSort(bson.D{{"start_time", -1}}).SetLimit(int64(limit))

	cursor, err := h.db.Collection("sessions").Find(context.Background(), filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sessions"})
		return
	}
	defer cursor.Close(context.Background())

	var sessions []models.UserSession
	if err = cursor.All(context.Background(), &sessions); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode sessions"})
		return
	}

	c.JSON(http.StatusOK, sessions)
}

// GetRealtimeStats returns current realtime statistics
func (h *AnalyticsHandler) GetRealtimeStats(c *gin.Context) {
	// Get stats for last 5 minutes
	fiveMinutesAgo := time.Now().Add(-5 * time.Minute)
	
	matchStage := bson.D{{"$match", bson.D{{"timestamp", bson.D{{"$gte", fiveMinutesAgo}}}}}}
	countStage := bson.D{{"$count", "active_users"}}
	
	cursor, err := h.db.Collection("events").Aggregate(context.Background(), mongo.Pipeline{matchStage, countStage})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get realtime stats"})
		return
	}
	defer cursor.Close(context.Background())

	var results []bson.M
	if err = cursor.All(context.Background(), &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode results"})
		return
	}

	activeUsers := 0
	if len(results) > 0 {
		if count, ok := results[0]["active_users"].(int32); ok {
			activeUsers = int(count)
		}
	}

	// Get recent events count
	eventCount, err := h.db.Collection("events").CountDocuments(
		context.Background(),
		bson.M{"timestamp": bson.D{{"$gte", fiveMinutesAgo}}},
	)
	if err != nil {
		eventCount = 0
	}

	c.JSON(http.StatusOK, gin.H{
		"active_users": activeUsers,
		"events_last_5_minutes": eventCount,
		"timestamp": time.Now(),
	})
}

// CreateFunnel creates a new conversion funnel
func (h *AnalyticsHandler) CreateFunnel(c *gin.Context) {
	var funnel models.Funnel
	
	if err := c.ShouldBindJSON(&funnel); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	funnel.ID = uuid.New().String()
	funnel.CreatedAt = time.Now()
	funnel.UpdatedAt = time.Now()

	_, err := h.db.Collection("funnels").InsertOne(context.Background(), funnel)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create funnel"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Funnel created successfully",
		"funnel": funnel,
	})
}

// AnalyzeFunnel performs funnel analysis
func (h *AnalyticsHandler) AnalyzeFunnel(c *gin.Context) {
	funnelId := c.Param("id")
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")
	
	// Get funnel definition
	var funnel models.Funnel
	err := h.db.Collection("funnels").FindOne(context.Background(), bson.M{"_id": funnelId}).Decode(&funnel)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Funnel not found"})
		return
	}

	// Parse dates
	startDate, endDate := time.Now().AddDate(0, 0, -30), time.Now()
	if startDateStr != "" {
		startDate, _ = time.Parse("2006-01-02", startDateStr)
	}
	if endDateStr != "" {
		endDate, _ = time.Parse("2006-01-02", endDateStr)
	}

	// Perform funnel analysis
	result := h.performFunnelAnalysis(funnel, startDate, endDate)
	
	c.JSON(http.StatusOK, result)
}

// Helper method for funnel analysis
func (h *AnalyticsHandler) performFunnelAnalysis(funnel models.Funnel, startDate, endDate time.Time) *models.FunnelResult {
	result := &models.FunnelResult{
		FunnelID:   funnel.ID,
		FunnelName: funnel.Name,
		DateRange:  fmt.Sprintf("%s to %s", startDate.Format("2006-01-02"), endDate.Format("2006-01-02")),
		StepResults: make([]models.FunnelStepResult, len(funnel.Steps)),
		DropOffs:   make(map[string]int64),
	}

	// Analyze each step
	for i, step := range funnel.Steps {
		// Count users who completed this step
		count, _ := h.db.Collection("events").CountDocuments(context.Background(), bson.M{
			"event_name": step.EventName,
			"timestamp": bson.D{
				{"$gte", startDate},
				{"$lte", endDate},
			},
		})

		result.StepResults[i] = models.FunnelStepResult{
			StepName: step.StepName,
			EventName: step.EventName,
			Users: count,
		}

		// Calculate drop-off (simplified)
		if i > 0 {
			prevCount := result.StepResults[i-1].Users
			dropOff := prevCount - count
			result.DropOffs[step.StepName] = dropOff
			
			if prevCount > 0 {
				result.StepResults[i].CompletionRate = float64(count) / float64(prevCount) * 100
				result.StepResults[i].DropOff = dropOff
			}
		} else {
			result.StepResults[i].CompletionRate = 100 // First step
		}
	}

	// Calculate overall conversion rate
	if len(result.StepResults) > 0 {
		firstStepUsers := result.StepResults[0].Users
		lastStepUsers := result.StepResults[len(result.StepResults)-1].Users
		
		if firstStepUsers > 0 {
			result.ConversionRate = float64(lastStepUsers) / float64(firstStepUsers) * 100
		}
	}

	return result
}