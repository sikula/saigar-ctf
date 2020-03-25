package main

import (
	"database/sql"
	"fmt"
	"os"
	"strconv"

	_ "github.com/lib/pq"
)

/*
var (
	dbhost     = "ec2-54-235-68-3.compute-1.amazonaws.com"
	dbport     = "5432"
	dbuser     = "jwazffnrvcyaht"
	dbpassword = "892dd71a78a36003756dd7c0862db6193176096569b3dbb8797e7365ce9d7b3f"
	dbname     = "d90qblbo4d06m"
)
*/

var (
	dbhost     = os.Getenv("DBHOST")
	dbport     = os.Getenv("DBPORT")
	dbuser     = os.Getenv("DBUSER")
	dbpassword = os.Getenv("DBPASSWORD")
	dbname     = os.Getenv("DBNAME")
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

type Eventbrite struct {
	order_number string
	used         bool
}

var db *sql.DB

func dbSetup() error {

	convDbPort, err := strconv.Atoi(dbport)
	if err != nil {
		return err
	}
	sqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		dbhost, convDbPort, dbuser, dbpassword, dbname)
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

func dbGetEventbrite(order_number string) (*Eventbrite, error) {
	var eventbrite Eventbrite
	sqlStmt := `SELECT order_number, used FROM public.eventbrite WHERE order_number=$1`
	row := db.QueryRow(sqlStmt, order_number)
	err := row.Scan(&eventbrite.order_number, &eventbrite.used)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &eventbrite, nil
}
