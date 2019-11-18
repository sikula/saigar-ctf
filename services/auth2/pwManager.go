package main

import (
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(pw string) (string, error) {
	hashedPw, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPw), nil
}

func ComparePasswords(pw string, hashedPw string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPw), []byte(pw))
	if err != nil {
		return false
	}
	return true
}
