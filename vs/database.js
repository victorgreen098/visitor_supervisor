var sqlite3 = require('sqlite3').verbose()

const fs = require('fs');

let rawdata = fs.readFileSync('accounts.json');
let accounts = JSON.parse(rawdata);

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text, 
            password text,
            firstname,
            lastname,
            parent_name text,
            email_request text,
            email_responce text,
            status,
            down_status INTEGER,
            data
            )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                // Table just created, creating some rows
                for(var i = 0; i < accounts.length; i++) {
                    var insert = 'INSERT INTO accounts (name, password, firstname, lastname, data, down_status) VALUES (?,?,?,?,?,?)'
                    db.run(insert, [accounts[i][0], accounts[i][1], accounts[i][2], accounts[i][3], JSON.stringify({}), 0])
                }
            }
        });

        db.run(`CREATE TABLE network (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            last_connection INTEGER
            )`,
        (err) => {
            if (err) {
            }else{
                // Table just created, creating some rows
                var insert = 'INSERT INTO network (last_connection) VALUES (?)'
                db.run(insert, [Date.now()])
            }
        });  
    }
});


module.exports = db