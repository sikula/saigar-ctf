package main

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

const (
	dbhost     = "ec2-54-235-68-3.compute-1.amazonaws.com"
	dbport     = 5432
	dbuser     = "jwazffnrvcyaht"
	dbpassword = "892dd71a78a36003756dd7c0862db6193176096569b3dbb8797e7365ce9d7b3f"
	dbname     = "d90qblbo4d06m"
)

type User struct {
	email       string
	nickname    string
	avatar      string
	acceptedTos bool
	username    string
	role        string
	password    string
}

var db *sql.DB

func dbSetup() error {
	sqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=require",
		dbhost, dbport, dbuser, dbpassword, dbname)
	var err error
	db, err = sql.Open("postgres", sqlInfo)
	if err != nil {
		return err
	}
	return nil
}

func dbGetUsers(email string, username string) ([]User, error) {
	var users []User
	sqlStmt := `SELECT username, password, COALESCE(nickname, '') as nickname, avatar, email FROM public.user WHERE email=$1 or username=$2`
	rows, err := db.Query(sqlStmt, email, username)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var user User
		err := rows.Scan(&user.username, &user.password, &user.nickname, &user.avatar, &user.email)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	err = rows.Err()
	if err != nil {
		return nil, err
	}

	return users, nil
}

func dbInsertUser(email string, username string, password string) error {
	sqlStmt := `INSERT INTO public.user (email, username, password, avatar) VALUES ($1, $2, $3, $4);`
	_, err := db.Exec(sqlStmt, email, username, password, "default.png")
	if err != nil {
		return err
	}
	return nil
}
