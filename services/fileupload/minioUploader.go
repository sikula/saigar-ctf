package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/minio/minio-go"
	"github.com/rs/cors"
)

const (
	MINIO_USESSL                   = false
	MINIO_SUBMISSIONBUCKET         = "submissions"
	MINIO_SUBMISSIONBUCKETLOCATION = "us-east-1"
	URL_EXPIRY                     = time.Hour * 24 * 7
)

var (
	MINIO_URL                      = os.Getenv("MINIO_URL")
	MINIO_ACCESSKEY                = os.Getenv("MINIO_ACCESSKEY")
	MINIO_ACCESSSECRET             = os.Getenv("MINIO_ACCESSSECRET")
)

var ALLOWED_CONTENTTYPES = [...]string{"image/jpg", "image/jpeg", "image/png", "image/gif"}
var minioClient *minio.Client

func main() {
	// Initialize minio client object.
	var err error
	minioClient, err = minio.New(MINIO_URL, MINIO_ACCESSKEY, MINIO_ACCESSSECRET, MINIO_USESSL)
	if err != nil {
		log.Fatalln(err)
	}

	//Setup server
	router := http.NewServeMux()
	router.HandleFunc("/upload", UploadFile)
	//router.HandleFunc("/getUrl", GetFileUrl)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:8084", "https://ctf.tracelabs.org"},
		AllowedHeaders:   []string{"Accepts", "Content-Type"},
		AllowCredentials: true,
	})
	handler := c.Handler(router)

	httpServer := &http.Server{
		Addr:              ":8081",
		Handler:           handler,
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

type UploadReturn struct {
	Url    string
	Expiry string
}

func UploadFile(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(32 << 20)
	file, header, err := r.FormFile("file")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	contentType := header.Header.Get("Content-Type")
	allowedContentType := false
	for _, e := range ALLOWED_CONTENTTYPES {
		if contentType == e {
			allowedContentType = true
			break
		}
	}
	if !allowedContentType {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	presignedUrl, err := uploadFileByReader(r.FormValue("uuid"), header.Size, contentType, file)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	ret := UploadReturn{
		Url:    presignedUrl,
		Expiry: time.Now().Add(URL_EXPIRY).Format("2006-01-02T15:04:05"),
	}
	json.NewEncoder(w).Encode(ret)
}

type GetFileUrlBody struct {
	Name string
}

func GetFileUrl(w http.ResponseWriter, r *http.Request) {
	var body GetFileUrlBody
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	presignedUrl, err := minioClient.PresignedGetObject(MINIO_SUBMISSIONBUCKET, body.Name, URL_EXPIRY, nil)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	ret := UploadReturn{
		Url:    presignedUrl.String(),
		Expiry: time.Now().Add(URL_EXPIRY).Format("2006-01-02T15:04:05"),
	}
	json.NewEncoder(w).Encode(ret)
}

func uploadFileByReader(name string, size int64, contentType string, reader io.Reader) (string, error) {
	bktExists, err := minioClient.BucketExists(MINIO_SUBMISSIONBUCKET)
	if err != nil {
		return "", err
	}
	if !bktExists {
		err := minioClient.MakeBucket(MINIO_SUBMISSIONBUCKET, MINIO_SUBMISSIONBUCKETLOCATION)
		if err != nil {
			return "", err
		}
	}

	n, err := minioClient.PutObject(MINIO_SUBMISSIONBUCKET, name, reader, size, minio.PutObjectOptions{ContentType: contentType})
	if err != nil {
		return "", err
	}
	presignedUrl, err := minioClient.PresignedGetObject(MINIO_SUBMISSIONBUCKET, name, URL_EXPIRY, nil)
	if err != nil {
		return "", err
	}
	fmt.Printf("Successfully uploaded %s of size %d with url %s\n", name, n, presignedUrl.String())
	return presignedUrl.String(), nil
}
