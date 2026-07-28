package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"
)

// Inquiry represents a contact request from the frontend
type Inquiry struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Phone       string    `json:"phone"`
	ServiceType string    `json:"service_type"`
	Message     string    `json:"message"`
	CreatedAt   time.Time `json:"created_at"`
}

var (
	inquiries []Inquiry
	mutex     sync.Mutex
	dbFile    = "inquiries.json"
	adminDataFile = "admin_data.json"
)

func main() {
	// Load existing inquiries from JSON database file
	if err := loadDatabase(); err != nil {
		log.Printf("Warning: could not load database: %v. Starting fresh.", err)
	}

	// Create a new ServeMux for routing
	mux := http.NewServeMux()

	// Register API endpoints using Go 1.22+ structured path patterns
	mux.HandleFunc("GET /api/inquiries", handleGetInquiries)
	mux.HandleFunc("POST /api/inquiries", handlePostInquiry)
	mux.HandleFunc("DELETE /api/inquiries/{id}", handleDeleteInquiry)

	// Admin data endpoints
	mux.HandleFunc("GET /api/admin/data", handleGetAdminData)
	mux.HandleFunc("POST /api/admin/data", handlePostAdminData)

	// Serve static SPA frontend from dist directory if present
	if _, err := os.Stat("./dist"); err == nil {
		fs := http.FileServer(http.Dir("./dist"))
		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			if len(r.URL.Path) >= 4 && r.URL.Path[:4] == "/api" {
				http.NotFound(w, r)
				return
			}
			filePath := "./dist" + r.URL.Path
			if r.URL.Path != "/" {
				if stat, err := os.Stat(filePath); os.IsNotExist(err) || stat.IsDir() {
					http.ServeFile(w, r, "./dist/index.html")
					return
				}
			}
			fs.ServeHTTP(w, r)
		})
	}

	// Wrap mux with CORS middleware
	handler := enableCORS(mux)

	port := 8083
	if envPort := os.Getenv("PORT"); envPort != "" {
		if p, err := strconv.Atoi(envPort); err == nil {
			port = p
		}
	}
	fmt.Printf("ТОО «СпецИнжГео» Go Backend listening on port %d...\n", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), handler))
}

// CORS Middleware
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow React frontend origin (default Vite is http://localhost:5173)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight OPTIONS request
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// GET /api/inquiries Handler
func handleGetInquiries(w http.ResponseWriter, r *http.Request) {
	mutex.Lock()
	defer mutex.Unlock()

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(inquiries); err != nil {
		// Fallback standard encoding
		jsonBytes, _ := json.Marshal(inquiries)
		w.Write(jsonBytes)
	}
}

// custom encoder wrapper helper for safety
func (i Inquiry) MarshalJSON() ([]byte, error) {
	type Alias Inquiry
	return json.Marshal(&struct {
		Alias
		CreatedAt string `json:"created_at"`
	}{
		Alias:     Alias(i),
		CreatedAt: i.CreatedAt.Format(time.RFC3339),
	})
}

// POST /api/inquiries Handler
func handlePostInquiry(w http.ResponseWriter, r *http.Request) {
	var inq Inquiry
	if err := json.NewDecoder(r.Body).Decode(&inq); err != nil {
		http.Error(w, "Bad Request: invalid JSON", http.StatusBadRequest)
		return
	}

	if inq.Name == "" || inq.Phone == "" {
		http.Error(w, "Bad Request: name and phone are required fields", http.StatusBadRequest)
		return
	}

	mutex.Lock()
	inq.ID = time.Now().UnixNano()
	inq.CreatedAt = time.Now()
	inquiries = append([]Inquiry{inq}, inquiries...) // Prepend new inquiry
	err := saveDatabase()
	mutex.Unlock()

	if err != nil {
		http.Error(w, "Internal Server Error: failed to save entry", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(inq)
}

// DELETE /api/inquiries/{id} Handler
func handleDeleteInquiry(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Bad Request: invalid ID format", http.StatusBadRequest)
		return
	}

	mutex.Lock()
	defer mutex.Unlock()

	found := false
	for i, inq := range inquiries {
		if inq.ID == id {
			inquiries = append(inquiries[:i], inquiries[i+1:]...)
			found = true
			break
		}
	}

	if !found {
		http.Error(w, "Not Found: inquiry not found", http.StatusNotFound)
		return
	}

	if err := saveDatabase(); err != nil {
		http.Error(w, "Internal Server Error: failed to update database", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"success":true}`))
}

// Database Helpers
func loadDatabase() error {
	file, err := os.Open(dbFile)
	if err != nil {
		if os.IsNotExist(err) {
			inquiries = []Inquiry{}
			return nil
		}
		return err
	}
	defer file.Close()

	return json.NewDecoder(file).Decode(&inquiries)
}

func saveDatabase() error {
	file, err := os.Create(dbFile)
	if err != nil {
		return err
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	return encoder.Encode(inquiries)
}

// GET /api/admin/data Handler
func handleGetAdminData(w http.ResponseWriter, r *http.Request) {
	mutex.Lock()
	defer mutex.Unlock()

	data, err := os.ReadFile(adminDataFile)
	if err != nil {
		if os.IsNotExist(err) {
			http.Error(w, "Not Found: admin data not initialized", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal Server Error: failed to read admin data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

// POST /api/admin/data Handler
func handlePostAdminData(w http.ResponseWriter, r *http.Request) {
	var raw json.RawMessage
	if err := json.NewDecoder(r.Body).Decode(&raw); err != nil {
		http.Error(w, "Bad Request: invalid JSON body", http.StatusBadRequest)
		return
	}

	mutex.Lock()
	defer mutex.Unlock()

	formatted, err := json.MarshalIndent(raw, "", "  ")
	if err != nil {
		formatted = raw
	}

	if err := os.WriteFile(adminDataFile, formatted, 0644); err != nil {
		http.Error(w, "Internal Server Error: failed to save admin data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success":true,"message":"Admin data successfully saved"}`))
}
