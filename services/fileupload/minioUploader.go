package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"errors"
	"os/signal"
	"syscall"
	"time"

	"github.com/minio/minio-go"
	"github.com/rs/cors"

	// "github.com/auth0-community/go-auth0"
	"github.com/auth0/go-jwt-middleware"
	"github.com/dgrijalva/jwt-go"
	// jose "gopkg.in/square/go-jose.v2"
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
var jwtMiddleware *jwtmiddleware.JWTMiddleware

func main() {
	// Initialize minio client object.
	var err error
	minioClient, err = minio.New(MINIO_URL, MINIO_ACCESSKEY, MINIO_ACCESSSECRET, MINIO_USESSL)
	if err != nil {
		log.Fatalln(err)
	}

	jwtMiddleware = jwtmiddleware.New(jwtmiddleware.Options{
		ValidationKeyGetter: func(token *jwt.Token) (interface{}, error) {
			// aud := "https://tracelabs.auth0.com/api/v2/"
			// checkAud := token.Claims.(jwt.MapClaims).VerifyAudience(aud, false)
			// if !checkAud {
			// 	return token, errors.New("Invalid audience")
			// }

			cert, err := getPemCert(token)
			if err != nil {
				panic(err.Error())
			}

			result, _ := jwt.ParseRSAPublicKeyFromPEM([]byte(cert))
			return result, nil
		},
		SigningMethod: jwt.SigningMethodRS256,
	})

	//Setup server
	router := http.NewServeMux()
	finalHandler := http.HandlerFunc(UploadFile)
	router.Handle("/upload", authMiddleware(finalHandler))
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


type Jwks struct {
	Keys []JSONWebKeys `json:"keys"`
}

type JSONWebKeys struct {
	Kty string `json:"kty"`
	Kid string `json:"kid"`
	Use string `json:"use"`
	N string `json:"n"`
	E string `json:"e"`
	X5c []string `json:"x5c"`
}


func getPemCert(token *jwt.Token) (string, error) {
	cert := ""
	resp, err := http.Get("https://tracelabs.auth0.com/.well-known/jwks.json")

	if err != nil {
		return cert, err
	}
	defer resp.Body.Close()

	var jwks = Jwks{}
	err = json.NewDecoder(resp.Body).Decode(&jwks)

	if err != nil {
		return cert, err
	}

	for k, _ := range jwks.Keys {
		if token.Header["kid"] == jwks.Keys[k].Kid {
			cert = "-----BEGIN CERTIFICATE-----\n" + jwks.Keys[k].X5c[0] + "\n-----END CERTIFICATE-----"
		}
	}

	if cert == "" {
		err := errors.New("Unable to find appropriate key.")
		return cert, err
	}

	return cert, nil
}

func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		err := jwtMiddleware.CheckJWT(w, r)

		if err == nil && next != nil {
			next.ServeHTTP(w, r)
		}
	})
}

// func authMiddleware(next http.Handler) http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		secret := []byte("-FlY26qCmKLI_T53Fxv5gSz-ofV8wUcEHOu9ua_Wf8siQPimO5NuMLfNNB9VbBw5")
// 		secretProvider := auth0.NewKeyProvider(secret)
// 		audience := []string{"https://tracelabs.auth0.com/api/v2/"}

// 		configuration := auth0.NewConfiguration(secretProvider, audience, "https://tracelabs.auth0.com", jose.HS256)
// 		validator := auth0.NewValidator(configuration, nil)

// 		token, err := validator.ValidateRequest(r)

// 		if err != nil {
// 			fmt.Println(err)
// 			fmt.Println("Token is not valid: ", token)
// 			w.WriteHeader(http.StatusUnauthorized)
// 			w.Write([]byte("Unauthorized"))
// 		} else {
// 			next.ServeHTTP(w, r)
// 		}
// 	})
// }

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
