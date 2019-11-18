package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"

	"github.com/dgrijalva/jwt-go"
	_ "github.com/lib/pq"
)

const (
	dbhost     = "ec2-54-235-68-3.compute-1.amazonaws.com"
	dbport     = 5432
	dbuser     = "jwazffnrvcyaht"
	dbpassword = "892dd71a78a36003756dd7c0862db6193176096569b3dbb8797e7365ce9d7b3f"
	dbname     = "d90qblbo4d06m"
)

var db *sql.DB

func main() {
	//Database setup
	sqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=require",
		dbhost, dbport, dbuser, dbpassword, dbname)
	db, err := sql.Open("postgres", sqlInfo)
	if err != nil {
		panic(err)
	}

	//Server setup
	router := http.NewServeMux()
	router.HandleFunc("/register", Register)
	router.HandleFunc("/signin", Signin)
	router.HandleFunc("/tokentest", TokenTest)
	router.HandleFunc("/refresh", Refresh)
	httpServer := &http.Server{
		Addr:         ":8000",
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}
	httpServer.RegisterOnShutdown(func() {
		fmt.Println("Shutting down server")
		db.Close()
	})
	fmt.Println("Server starting on http://localhost:8000")
	httpErr := httpServer.ListenAndServe()
	if httpErr != nil {
		panic(httpErr)
	}
}

type Claims struct {
	Name           string
	Nickname       string
	Picture        string
	Email          string
	Email_Verified bool
	jwt.StandardClaims
}

// /register
type RegisterBody struct {
	Username string
	Password string
	Email    string
}

func Register(w http.ResponseWriter, r *http.Request) {

	var body RegisterBody
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	/*
		var user User
		sqlStmt := `SELECT * FROM user WHERE email=$1 OR username=$2`
		row := db.QueryRow(sqlStmt, body.Email, body.Username)
		err := row.Scan(&user.ID, &user.Age, &user.FirstName, &user.LastName, &user.Email)
	*/
	//issue a token to the registered user
}

// /signin
type SignInBody struct {
	Username string
	Password string
}

func Signin(w http.ResponseWriter, r *http.Request) {
	var body SignInBody
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		fmt.Println(err.Error())
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	pw := ""
	var user User
	for _, u := range testusers {
		if body.Username == u.name {
			pw = u.password
			user = u
		}
	}
	if body.Password != pw {
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
	//Debugging
	fmt.Println(claims.Name + " " + claims.Nickname + " " + claims.Picture + " " + claims.Email + " " + strconv.FormatBool(claims.Email_Verified))
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
	expirationTime := time.Now().Add(2 * time.Hour)
	claims := &Claims{
		Name:           user.name,
		Nickname:       user.nickname,
		Picture:        user.picture,
		Email:          user.email,
		Email_Verified: user.email_verified,
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
