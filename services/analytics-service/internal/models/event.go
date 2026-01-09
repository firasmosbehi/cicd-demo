package models

import (
	"time"
)

// Event represents a tracked user event
type Event struct {
	ID        string                 `bson:"_id,omitempty" json:"id"`
	UserID    string                 `bson:"user_id" json:"userId" validate:"required"`
	SessionID string                 `bson:"session_id" json:"sessionId"`
	EventName string                 `bson:"event_name" json:"eventName" validate:"required"`
	Category  string                 `bson:"category" json:"category"`
	Action    string                 `bson:"action" json:"action"`
	Label     string                 `bson:"label" json:"label"`
	Value     float64                `bson:"value" json:"value"`
	Metadata  map[string]interface{} `bson:"metadata" json:"metadata"`
	URL       string                 `bson:"url" json:"url"`
	UserAgent string                 `bson:"user_agent" json:"userAgent"`
	IPAddress string                 `bson:"ip_address" json:"ipAddress"`
	Timestamp time.Time              `bson:"timestamp" json:"timestamp"`
	Duration  int64                  `bson:"duration" json:"duration"` // in milliseconds
}

// PageViewEvent represents a page view event
type PageViewEvent struct {
	Event
	PageTitle   string `bson:"page_title" json:"pageTitle"`
	PageURL     string `bson:"page_url" json:"pageUrl" validate:"required"`
	Referrer    string `bson:"referrer" json:"referrer"`
	ScreenWidth int    `bson:"screen_width" json:"screenWidth"`
	ScreenHeight int   `bson:"screen_height" json:"screenHeight"`
}

// ConversionEvent represents a conversion event (purchase, signup, etc.)
type ConversionEvent struct {
	Event
	ConversionType string  `bson:"conversion_type" json:"conversionType" validate:"required"`
	Revenue        float64 `bson:"revenue" json:"revenue"`
	Currency       string  `bson:"currency" json:"currency"`
	TransactionID  string  `bson:"transaction_id" json:"transactionId"`
	Products       []ProductInfo `bson:"products" json:"products"`
}

// ProductInfo represents product information in events
type ProductInfo struct {
	ProductID string  `bson:"product_id" json:"productId"`
	Name      string  `bson:"name" json:"name"`
	Category  string  `bson:"category" json:"category"`
	Price     float64 `bson:"price" json:"price"`
	Quantity  int     `bson:"quantity" json:"quantity"`
}

// UserSession represents a user session
type UserSession struct {
	ID           string    `bson:"_id,omitempty" json:"id"`
	UserID       string    `bson:"user_id" json:"userId"`
	SessionID    string    `bson:"session_id" json:"sessionId" validate:"required"`
	StartTime    time.Time `bson:"start_time" json:"startTime"`
	EndTime      time.Time `bson:"end_time" json:"endTime"`
	Duration     int64     `bson:"duration" json:"duration"` // in seconds
	PageViews    int       `bson:"page_views" json:"pageViews"`
	Events       int       `bson:"events" json:"events"`
	DeviceType   string    `bson:"device_type" json:"deviceType"`
	Browser      string    `bson:"browser" json:"browser"`
	OperatingSystem string  `bson:"operating_system" json:"operatingSystem"`
	IsBounce     bool      `bson:"is_bounce" json:"isBounce"`
}

// DailyStats represents aggregated daily statistics
type DailyStats struct {
	Date             time.Time `bson:"date" json:"date"`
	TotalEvents      int64     `bson:"total_events" json:"totalEvents"`
	UniqueUsers      int64     `bson:"unique_users" json:"uniqueUsers"`
	PageViews        int64     `bson:"page_views" json:"pageViews"`
	Sessions         int64     `bson:"sessions" json:"sessions"`
	AverageSessionDuration int64 `bson:"avg_session_duration" json:"avgSessionDuration"`
	BounceRate       float64   `bson:"bounce_rate" json:"bounceRate"`
	TopPages         []PageStat `bson:"top_pages" json:"topPages"`
	TopEvents        []EventStat `bson:"top_events" json:"topEvents"`
	Conversions      int64     `bson:"conversions" json:"conversions"`
	ConversionRate   float64   `bson:"conversion_rate" json:"conversionRate"`
	Revenue          float64   `bson:"revenue" json:"revenue"`
}

// PageStat represents page statistics
type PageStat struct {
	PageURL string `bson:"page_url" json:"pageUrl"`
	Views   int64  `bson:"views" json:"views"`
	Exits   int64  `bson:"exits" json:"exits"`
}

// EventStat represents event statistics
type EventStat struct {
	EventName string `bson:"event_name" json:"eventName"`
	Count     int64  `bson:"count" json:"count"`
}

// CohortAnalysis represents cohort analysis data
type CohortAnalysis struct {
	CohortDate   time.Time `bson:"cohort_date" json:"cohortDate"`
	CohortSize   int64     `bson:"cohort_size" json:"cohortSize"`
	Retention    map[int]float64 `bson:"retention" json:"retention"` // day -> percentage
	RevenuePerUser map[int]float64 `bson:"revenue_per_user" json:"revenuePerUser"` // day -> revenue
}

// FunnelStep represents a step in a conversion funnel
type FunnelStep struct {
	StepName string `bson:"step_name" json:"stepName" validate:"required"`
	EventName string `bson:"event_name" json:"eventName" validate:"required"`
	Order    int    `bson:"order" json:"order" validate:"required"`
}

// Funnel represents a conversion funnel
type Funnel struct {
	ID          string       `bson:"_id,omitempty" json:"id"`
	Name        string       `bson:"name" json:"name" validate:"required"`
	Description string       `bson:"description" json:"description"`
	Steps       []FunnelStep `bson:"steps" json:"steps" validate:"required,dive"`
	CreatedAt   time.Time    `bson:"created_at" json:"createdAt"`
	UpdatedAt   time.Time    `bson:"updated_at" json:"updatedAt"`
}

// FunnelResult represents funnel analysis results
type FunnelResult struct {
	FunnelID    string              `bson:"funnel_id" json:"funnelId"`
	FunnelName  string              `bson:"funnel_name" json:"funnelName"`
	DateRange   string              `bson:"date_range" json:"dateRange"`
	StepResults []FunnelStepResult  `bson:"step_results" json:"stepResults"`
	ConversionRate float64          `bson:"conversion_rate" json:"conversionRate"`
	DropOffs    map[string]int64    `bson:"drop_offs" json:"dropOffs"`
}

// FunnelStepResult represents results for a funnel step
type FunnelStepResult struct {
	StepName    string  `bson:"step_name" json:"stepName"`
	EventName   string  `bson:"event_name" json:"eventName"`
	Users       int64   `bson:"users" json:"users"`
	CompletionRate float64 `bson:"completion_rate" json:"completionRate"`
	DropOff     int64   `bson:"drop_off" json:"dropOff"`
}