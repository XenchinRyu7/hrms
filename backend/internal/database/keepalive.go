package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"sync"
	"time"
)

type KeepAliveStatus struct {
	Active       bool      `json:"active"`
	DatabaseHost string    `json:"database_host"`
	LastPing     time.Time `json:"last_ping"`
	LatencyMs    int64     `json:"latency_ms"`
	TotalPings   int64     `json:"total_pings"`
	Interval     string    `json:"interval"`
	LastError    string    `json:"last_error,omitempty"`
	Status       string    `json:"status"` // "connected", "warning", "disconnected"
}

type KeepAliveWorker struct {
	db       *sql.DB
	interval time.Duration
	stopCh   chan struct{}
	mu       sync.RWMutex
	status   KeepAliveStatus
}

var globalKeepAlive *KeepAliveWorker

func StartKeepAliveWorker(db *sql.DB, host string, interval time.Duration) *KeepAliveWorker {
	if interval <= 0 {
		interval = 6 * time.Hour
	}

	w := &KeepAliveWorker{
		db:       db,
		interval: interval,
		stopCh:   make(chan struct{}),
		status: KeepAliveStatus{
			Active:       true,
			DatabaseHost: host,
			Interval:     interval.String(),
			Status:       "initializing",
		},
	}

	// Run initial ping immediately
	go func() {
		w.Ping()

		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				w.Ping()
			case <-w.stopCh:
				log.Println("[KeepAlive] Worker stopped.")
				return
			}
		}
	}()

	globalKeepAlive = w
	return w
}

func (w *KeepAliveWorker) Ping() (*KeepAliveStatus, error) {
	if w.db == nil {
		return nil, fmt.Errorf("database connection is nil")
	}

	start := time.Now()
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var one int
	err := w.db.QueryRowContext(ctx, "SELECT 1;").Scan(&one)
	latency := time.Since(start).Milliseconds()

	w.mu.Lock()
	defer w.mu.Unlock()

	w.status.LastPing = time.Now()
	w.status.LatencyMs = latency
	w.status.TotalPings++

	if err != nil {
		w.status.LastError = err.Error()
		w.status.Status = "error"
		log.Printf("[KeepAlive] ⚠️ Supabase ping failed: %v (latency: %dms)", err, latency)
		return &w.status, err
	}

	w.status.LastError = ""
	w.status.Status = "connected"
	log.Printf("[KeepAlive] ⚡ Supabase ping success! Latency: %dms (Total pings: %d) - Project kept active", latency, w.status.TotalPings)
	return &w.status, nil
}

func (w *KeepAliveWorker) Stop() {
	if w.stopCh != nil {
		close(w.stopCh)
	}
}

func GetKeepAliveStatus() KeepAliveStatus {
	if globalKeepAlive == nil {
		return KeepAliveStatus{
			Active: false,
			Status: "inactive",
		}
	}
	globalKeepAlive.mu.RLock()
	defer globalKeepAlive.mu.RUnlock()
	return globalKeepAlive.status
}

func TriggerKeepAlivePing() (*KeepAliveStatus, error) {
	if globalKeepAlive == nil {
		return nil, fmt.Errorf("keepalive worker not initialized (no active database connection)")
	}
	return globalKeepAlive.Ping()
}
