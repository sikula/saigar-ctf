package main

var jwtSecretKey = []byte("randomsecretkeythatwegenerate")

type User struct {
	name           string
	password       string
	nickname       string
	picture        string
	updated_at     string
	email          string
	email_verified bool
}

var testusers = []User{
	{
		name:           "tester1",
		password:       "password1",
		nickname:       "first tester",
		picture:        "avatar.png",
		updated_at:     "some date",
		email:          "test1@email.com",
		email_verified: true,
	},
}
