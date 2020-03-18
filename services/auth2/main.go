package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/dgrijalva/jwt-go"
	_ "github.com/lib/pq"
	"github.com/rs/cors"

	"gopkg.in/auth0.v1"
	"gopkg.in/auth0.v1/management"
)

/*
var jwtSecretKey = []byte("NmR6TFIfUQHiEimUjqkYML4SVFuZsSCzAgnW7b7B0tSRTKfmcrV2oApiQjAV9L5SR0Aj2zLstgHiDyp6KFHOgCJa")

var (
	AUTH0_DOMAIN = "sikulatest.auth0.com"
	AUTH0_ID     = "uB0gs971j8jWcYicr9b5Dfy5aSN24Bss"
	AUTH0_SECRET = "7JzhQaxHHIv89yA7p-6Lo9xGiQJvWPQ3q4TIbAPV3S3WE8N4RbhWkinxXmnVOq1L"
)
*/
var (
	jwtSecretKey     = []byte(os.Getenv("JWTSECRETKEY"))
	PORT             = os.Getenv("PORT")
	AUTH0_DOMAIN     = os.Getenv("AUTH0_DOMAIN")
	AUTH0_ID         = os.Getenv("AUTH0_ID")
	AUTH0_SECRET     = os.Getenv("AUTH0_SECRET")
	AUTH0_CONNECTION = os.Getenv("AUTH0_CONNECTION")
)

var auth0m *management.Management

func main() {
	// Auth0 Setup
	var err error
	auth0m, err = management.New(AUTH0_DOMAIN, AUTH0_ID, AUTH0_SECRET)

	if err != nil {
		panic(err)
	}

	// auth0m.User.Create()
	// Database setup
	dbSetup()

	// Setup and configure routes
	router := http.NewServeMux()
	router.HandleFunc("/register", RegisterInAuth0)
	router.HandleFunc("/verify_code", VerifyRegCode)
	router.HandleFunc("/signin", Signin)
	router.HandleFunc("/tokentest", TokenTest)
	router.HandleFunc("/refresh", Refresh)

	// Enable CORS (Cross Origin Request Sharing)
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:8084", "https://ctf.tracelabs.org"},
		AllowedHeaders:   []string{"Accepts", "Content-Type"},
		AllowCredentials: true,
		Debug: true,
	})
	handler := c.Handler(router)

	// Initialize the server
	httpServer := &http.Server{
		Addr:              ":" + PORT,
		Handler:           handler,
		ReadHeaderTimeout: 20 * time.Second,
		ReadTimeout:       20 * time.Second,
		WriteTimeout:      20 * time.Second,
	}
	httpServer.RegisterOnShutdown(func() {
		fmt.Println("Shutting down server")
		db.Close()
	})
	fmt.Println("Server starting on http://localhost:8080")

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

type Claims struct {
	Name           string
	Nickname       string
	Picture        string
	Email          string
	Email_Verified bool
	Role           string
	jwt.StandardClaims
}

// /register
type RegisterBody struct {
	Username string
	Password string
	Email    string
}

type Metadata struct {
	role string
}

func RegisterInAuth0(w http.ResponseWriter, r *http.Request) {
	// user, err := auth0m.User.ListByEmail(strings.ToLower("test@testuser1.com"))

	// fmt.Printf("%+v\n", *user[0].Email)

	var body RegisterBody
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// check if that user already exists
	users, err := dbGetUsers(body.Email, body.Username)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if len(users) != 0 {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	hashedPassword, err := HashPassword(body.Password)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = dbInsertUser(body.Email, body.Username, hashedPassword)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// {
	// 	"authorization": {
	// 	  "groups": [
	// 		"super_admin",
	// 		"ctf_admin"
	// 	  ],
	// 	  "roles": [],
	// 	  "permissions": []
	// 	}
	//   }

	// Create User
	err = auth0m.User.Create(&management.User{
		Username:   auth0.String(body.Username),
		Email:      auth0.String(body.Email),
		Connection: auth0.String(AUTH0_CONNECTION),
		Password:   auth0.String(body.Password),
		AppMetadata: map[string]interface{}{
			"authorization": map[string]interface{}{
				"groups": []string{"contestant"},
			},
		},
	})
	fmt.Println(err)

	// var user = User{
	// 	email:    body.Email,
	// 	username: body.Username,
	// 	role:     "contestant",
	// }

	// token, claims, err := createToken(user)
	// if err != nil {
	// 	w.WriteHeader(http.StatusInternalServerError)
	// 	return
	// }

	// http.SetCookie(w, &http.Cookie{
	// 	Name:    "token",
	// 	Value:   token,
	// 	Expires: time.Unix(claims.ExpiresAt, 0),
	// })

	// Update user
	// err := auth0m.User.Update(&management.User{
	// 	Email:
	// 	Password: auth0.String("iamctfadmin1!"),
	// })

	// if err != nil {
	// 	fmt.Println("error ")
	// 	fmt.Println(err)
	// }
}

func RegisterContestant(w http.ResponseWriter, r *http.Request) {

	var body RegisterBody
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	users, err := dbGetUsers(body.Email, body.Username)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if len(users) != 0 {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	hashedPassword, err := HashPassword(body.Password)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = dbInsertUser(body.Email, body.Username, hashedPassword)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	var user = User{
		email:    body.Email,
		username: body.Username,
		role:     "CONTESTANT",
	}
	token, claims, err := createToken(user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:    "token",
		Value:   token,
		Expires: time.Unix(claims.ExpiresAt, 0),
	})
}

type VerifyRegCodeBody struct {
	EventCode string
}

func VerifyRegCode(w http.ResponseWriter, r *http.Request) {
	var body VerifyRegCodeBody
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	eventbrite, err := dbGetEventbrite(body.EventCode)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if eventbrite == nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if eventbrite.used {
		w.WriteHeader(http.StatusForbidden)
		return
	}
}

// /signin
type SignInBody struct {
	Username string
	Email    string
	Password string
}

func Signin(w http.ResponseWriter, r *http.Request) {
	var body SignInBody
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var user User
	users, err := dbGetUsers(body.Email, body.Username)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	var matched bool = false
	for _, u := range users {
		if ComparePasswords(body.Password, u.password) {
			matched = true
			user = u
		}
	}

	if !matched {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	token, claims, err := createToken(user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:    "token",
		Value:   token,
		Expires: time.Unix(claims.ExpiresAt, 0),
	})
}

func Refresh(w http.ResponseWriter, r *http.Request) {

}

func TokenTest(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("token")
	if err != nil {
		if err == http.ErrNoCookie {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	tokenStr := cookie.Value
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecretKey, nil
	})

	if err != nil {
		if err == jwt.ErrSignatureInvalid {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if !token.Valid {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	//check if the token needs to be refreshed
	rToken, err := refreshToken(claims)
	if err == nil {
		http.SetCookie(w, &http.Cookie{
			Name:    "token",
			Value:   rToken,
			Expires: time.Unix(claims.ExpiresAt, 0),
		})
	}
	//Debugging
	fmt.Println(claims.Name + " " + claims.Nickname + " " + claims.Picture + " " + claims.Email + " " + strconv.FormatBool(claims.Email_Verified))
}

//Private functions
func createToken(user User) (string, *Claims, error) {
	fmt.Println("USER " + user.role)
	expirationTime := time.Now().Add(2 * time.Hour)
	claims := &Claims{
		Name:     user.username,
		Nickname: user.nickname,
		Picture:  user.avatar,
		Email:    user.email,
		Role:     user.role,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}
	tokenSetup := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	token, err := tokenSetup.SignedString(jwtSecretKey)
	if err != nil {
		return "", nil, err
	}
	return token, claims, nil
}

func refreshToken(claims *Claims) (string, error) {
	//check if token is going to expire in the next 30 minutes
	if time.Unix(claims.ExpiresAt, 0).Sub(time.Now()) > 30*time.Minute {
		return "", errors.New("Token not old enough to be refreshed")
	}
	//Debugging
	fmt.Println("Refreshing token for " + claims.Name)
	//create new token w/ updated expiration time
	expirationTime := time.Now().Add(2 * time.Hour)
	claims.ExpiresAt = expirationTime.Unix()
	tokenSetup := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	token, err := tokenSetup.SignedString(jwtSecretKey)
	if err != nil {
		return "", err
	}
	return token, nil
}

//debugging
func printRequestBody(w http.ResponseWriter, r *http.Request) {
	b, e := ioutil.ReadAll(r.Body)
	fmt.Printf("%s", b)
	if e != nil {
		fmt.Println(e.Error())
	}
}
