package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"

	"github.com/dgrijalva/jwt-go"
)

func main() {
	http.HandleFunc("/signin", Signin)
	http.HandleFunc("/tokentest", TokenTest)
	http.HandleFunc("/refresh", Refresh)
	fmt.Println("Server starting on http://localhost:8000")
	http.ListenAndServe(":8000", nil)
}

type Claims struct {
	Name           string
	Nickname       string
	Picture        string
	Email          string
	Email_Verified bool
	jwt.StandardClaims
}

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

	claims := &Claims{
		Name:           user.name,
		Nickname:       user.nickname,
		Picture:        user.picture,
		Email:          user.email,
		Email_Verified: user.email_verified,
		//StandardClaims: jwt.StandardClaims {
		//	ExpiresAt: time.Now().Add(5 * time.Minute).Unix(),
		//},
	}
	tokenSetup := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	token, err := tokenSetup.SignedString(jwtSecretKey)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:  "token",
		Value: token,
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
	//Debugging
	fmt.Println(claims.Name + " " + claims.Nickname + " " + claims.Picture + " " + claims.Email + " " + strconv.FormatBool(claims.Email_Verified))
}

//For debugging
func PrintRequestBody(w http.ResponseWriter, r *http.Request) {
	b, e := ioutil.ReadAll(r.Body)
	fmt.Printf("%s", b)
	if e != nil {
		fmt.Println(e.Error())
	}
}
