package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/ethereal-hrms/backend/internal/database"
)

type AuditHandler struct {
	store database.Store
}

func NewAuditHandler(store database.Store) *AuditHandler {
	return &AuditHandler{store: store}
}

func (h *AuditHandler) ListAuditLogs(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "50")
	limit, _ := strconv.Atoi(limitStr)

	logs, err := h.store.ListAuditLogs(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, logs)
}
