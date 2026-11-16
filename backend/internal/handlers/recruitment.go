package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/ethereal-hrms/backend/internal/database"
	"github.com/ethereal-hrms/backend/internal/models"
)

type RecruitmentHandler struct {
	store database.Store
}

func NewRecruitmentHandler(store database.Store) *RecruitmentHandler {
	return &RecruitmentHandler{store: store}
}

func (h *RecruitmentHandler) ListJobs(c *gin.Context) {
	jobs, err := h.store.ListJobPostings()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, jobs)
}

func (h *RecruitmentHandler) CreateJob(c *gin.Context) {
	var job models.JobPosting
	if err := c.ShouldBindJSON(&job); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.store.CreateJobPosting(&job); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, job)
}

func (h *RecruitmentHandler) ListApplicants(c *gin.Context) {
	jobID := c.Query("job_id")
	stage := c.Query("stage")

	apps, err := h.store.ListApplicants(jobID, stage)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, apps)
}

func (h *RecruitmentHandler) CreateApplicant(c *gin.Context) {
	var app models.Applicant
	if err := c.ShouldBindJSON(&app); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.store.CreateApplicant(&app); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, app)
}

type UpdateStageInput struct {
	Stage string `json:"stage" binding:"required"`
}

func (h *RecruitmentHandler) UpdateStage(c *gin.Context) {
	id := c.Param("id")
	var input UpdateStageInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.store.UpdateApplicantStage(id, input.Stage); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Candidate stage updated successfully", "stage": input.Stage})
}
