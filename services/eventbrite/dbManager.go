package main

import (
	"database/sql"
	"fmt"
	"os"
	"strconv"

	_ "github.com/lib/pq"
)

var db *sql.DB

func dbSetup() error {
	dbhost := os.Getenv("DBHOST")
	dbport, err := strconv.Atoi(os.Getenv("DBPORT"))
	dbuser := os.Getenv("DBUSER")
	dbpassword := os.Getenv("DBPASSWORD")
	dbname := os.Getenv("DBNAME")
	sqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		dbhost, dbport, dbuser, dbpassword, dbname)
	db, err = sql.Open("postgres", sqlInfo)
	if err != nil {
		return err
	}
	return nil
}

func dbInsertEventbrite(order_number string) error {
	sqlStmt := `INSERT INTO public.eventbrite (order_number, used) VALUES ($1, false)`
	_, err := db.Exec(sqlStmt, order_number)
	if err != nil {
		return err
	}
	return nil
}
