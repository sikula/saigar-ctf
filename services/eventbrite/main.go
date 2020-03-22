package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"
	//"github.com/rs/cors"
)

var (
	PORT = os.Getenv("PORT")
)

func main() {
	err := dbSetup()
	if err != nil {
		log.Fatal(err)
		return
	}
	//Setup server
	router := http.NewServeMux()
	router.HandleFunc("/orderplaced", OrderPlaced)
	//c := cors.New(cors.Options{
	//	AllowedOrigins:   []string{"https://www.eventbrite.com/"},
	//	AllowedHeaders:   []string{"Accepts", "Content-Type", "Authorization"},
	//	AllowCredentials: true,
	//	Debug:            true,
	//})
	//handler := c.Handler(router)
	httpServer := &http.Server{
		Addr:              ":" + PORT,
		Handler:           router,
		ReadHeaderTimeout: 20 * time.Second,
		ReadTimeout:       20 * time.Second,
		WriteTimeout:      20 * time.Second,
	}
	go func() {
		if err := httpServer.ListenAndServe(); err != nil {
			log.Fatal(err)
		}
	}()

	waitForShutdown(httpServer)
}

func waitForShutdown(server *http.Server) {
	interruptChan := make(chan os.Signal, 1)
	signal.Notify(interruptChan, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	<-interruptChan

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	server.Shutdown(ctx)

	os.Exit(0)
}

type OrderPlacedBody struct {
	ApiUrl string `json:"api_url"`
}

func OrderPlaced(w http.ResponseWriter, r *http.Request) {
	var body OrderPlacedBody
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	err = dbInsertEventbrite(strings.Split(body.ApiUrl, "/")[5])
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}
