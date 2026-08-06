package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"sync"
	"time"

	_ "github.com/lib/pq"
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
	db            *sql.DB
	inquiries     []Inquiry
	mutex         sync.Mutex
	dbFile        = "inquiries.json"
	adminDataFile = "admin_data.json"

	adminClients   = make(map[chan []byte]bool)
	adminClientsMu sync.Mutex
)

func initPostgres() {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = os.Getenv("POSTGRES_URL")
	}
	if connStr == "" {
		connStr = os.Getenv("DATABASE_PRIVATE_URL")
	}
	if connStr == "" && os.Getenv("PGHOST") != "" {
		port := os.Getenv("PGPORT")
		if port == "" {
			port = "5432"
		}
		user := os.Getenv("PGUSER")
		pass := os.Getenv("PGPASSWORD")
		dbname := os.Getenv("PGDATABASE")
		host := os.Getenv("PGHOST")
		connStr = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host, port, user, pass, dbname)
	}

	if connStr == "" {
		log.Println("No PostgreSQL connection environment variables found. Operating in file fallback mode.")
		return
	}

	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Printf("Warning: failed to open PostgreSQL database connection: %v", err)
		db = nil
		return
	}

	if err = db.Ping(); err != nil {
		log.Printf("Warning: failed to ping PostgreSQL database: %v", err)
		db = nil
		return
	}

	log.Println("✅ Successfully connected to PostgreSQL database!")

	// Create tables if they do not exist
	createTablesQuery := `
	CREATE TABLE IF NOT EXISTS inquiries (
		id BIGINT PRIMARY KEY,
		name TEXT NOT NULL,
		phone TEXT NOT NULL,
		service_type TEXT,
		message TEXT,
		created_at TIMESTAMPTZ NOT NULL
	);
	CREATE TABLE IF NOT EXISTS admin_data (
		id INT PRIMARY KEY DEFAULT 1,
		data JSONB NOT NULL,
		updated_at TIMESTAMPTZ NOT NULL
	);
	`
	if _, err := db.Exec(createTablesQuery); err != nil {
		log.Printf("Warning: failed to create database tables: %v", err)
	} else {
		log.Println("✅ Database schema initialized successfully (inquiries & admin_data tables).")
	}
}

func main() {
	// Initialize PostgreSQL connection if DATABASE_URL or PGHOST is present
	initPostgres()

	// Load existing inquiries
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
	mux.HandleFunc("GET /api/admin/data/events", handleAdminDataEvents)

	// File upload endpoint
	mux.HandleFunc("POST /api/upload", handleFileUpload)

	// Serve uploads directory
	os.MkdirAll("./uploads", 0755)
	mux.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads"))))

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
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

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
		jsonBytes, _ := json.Marshal(inquiries)
		w.Write(jsonBytes)
	}
}

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
	inquiries = append([]Inquiry{inq}, inquiries...)

	if db != nil {
		_, err := db.Exec("INSERT INTO inquiries (id, name, phone, service_type, message, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
			inq.ID, inq.Name, inq.Phone, inq.ServiceType, inq.Message, inq.CreatedAt)
		if err != nil {
			log.Printf("Error inserting inquiry to PostgreSQL: %v", err)
		}
	}

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

	if db != nil {
		_, err := db.Exec("DELETE FROM inquiries WHERE id = $1", id)
		if err != nil {
			log.Printf("Error deleting inquiry from PostgreSQL: %v", err)
		}
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
	if db != nil {
		rows, err := db.Query("SELECT id, name, phone, service_type, message, created_at FROM inquiries ORDER BY created_at DESC")
		if err == nil {
			defer rows.Close()
			var loaded []Inquiry
			for rows.Next() {
				var inq Inquiry
				if err := rows.Scan(&inq.ID, &inq.Name, &inq.Phone, &inq.ServiceType, &inq.Message, &inq.CreatedAt); err == nil {
					loaded = append(loaded, inq)
				}
			}
			inquiries = loaded
			return nil
		}
		log.Printf("Warning: failed to query inquiries from DB: %v", err)
	}

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

	if db != nil {
		var jsonData []byte
		err := db.QueryRow("SELECT data FROM admin_data WHERE id = 1").Scan(&jsonData)
		if err == nil && len(jsonData) > 0 {
			w.Header().Set("Content-Type", "application/json")
			w.Write(jsonData)
			return
		}
	}

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

	// 1. Save to PostgreSQL DB if connected
	if db != nil {
		_, err := db.Exec(`
			INSERT INTO admin_data (id, data, updated_at)
			VALUES (1, $1, NOW())
			ON CONFLICT (id) DO UPDATE
			SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
		`, formatted)
		if err != nil {
			log.Printf("Error saving admin data to Postgres: %v", err)
		} else {
			log.Println("✅ Admin data successfully saved to PostgreSQL database.")
		}
	}

	// 2. Backup to local JSON file
	if err := os.WriteFile(adminDataFile, formatted, 0644); err != nil {
		log.Printf("Warning: failed to write admin_data.json backup: %v", err)
	}

	// 3. Broadcast update to all connected SSE clients
	adminClientsMu.Lock()
	for client := range adminClients {
		select {
		case client <- formatted:
		default:
		}
	}
	adminClientsMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success":true,"message":"Admin data successfully saved"}`))
}

// GET /api/admin/data/events Handler (Server-Sent Events)
func handleAdminDataEvents(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported!", http.StatusInternalServerError)
		return
	}

	ch := make(chan []byte, 10)

	adminClientsMu.Lock()
	adminClients[ch] = true
	adminClientsMu.Unlock()

	defer func() {
		adminClientsMu.Lock()
		delete(adminClients, ch)
		adminClientsMu.Unlock()
		close(ch)
	}()

	fmt.Fprintf(w, ": connected\n\n")
	flusher.Flush()

	for {
		select {
		case data := <-ch:
			fmt.Fprintf(w, "data: %s\n\n", data)
			flusher.Flush()
		case <-r.Context().Done():
			return
		}
	}
}

// POST /api/upload Handler
func handleFileUpload(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(500 << 20)
	if err != nil {
		http.Error(w, "Bad Request: unable to parse form", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Bad Request: missing file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	filePath := filepath.Join("uploads", filename)

	dst, err := os.Create(filePath)
	if err != nil {
		http.Error(w, "Internal Server Error: unable to save file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Internal Server Error: failed to write file", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf(`{"url": "/uploads/%s"}`, filename)))
}
