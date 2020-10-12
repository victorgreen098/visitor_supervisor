// Create express app
var express = require("express")
var app = express()
var db = require("./database.js")

// Server port
var HTTP_PORT = process.env.PORT;
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});

// Insert here other API endpoints
app.get("/data", async (req, res, next) => {
	if(process.env.PAUSEDB != "pause") {
		db.run("UPDATE network SET last_connection=" + Date.now() + " WHERE id=1")

	    var sql = "select * from accounts"
	    var params = []
	    db.all(sql, params, (err, rows) => {
	        if (err) {
	          res.status(400).json({"error":err.message});
	          return;
	        }
	        res.json({
	            "message":"success",
	            "data":rows
	        })
	      });
    }
});

app.get("/status", async (req, res, next) => {
	if(process.env.PAUSEDB != "pause") {
		db.run("UPDATE network SET last_connection=" + Date.now() + " WHERE id=1")

		if (req.query.set == 1) {

		    s = 0;
		    if(req.query.status == "up") s = parseInt(Math.floor(Date.now()/1000));
		    if (req.query.status == "down") s = null;

		    var sql = "update accounts set status=?,down_status=? where name=?";
		    var params = [s, parseInt(req.query.down_status), req.query.name];
		    db.all(sql, params, (err, rows) => {
		        if (err) {
		          res.status(400).json({"error":err.message});
		          return;
		        }
		        res.json({
		            "message":"success"
	       		});
      		});
  		}else {
  			var sql = "select * from accounts where status is not null and name is not ?"
		    var params = [req.query.name];
		    db.all(sql, params, (err, rows) => {
		        if (err) {
		          res.status(400).json({"error":err.message});
		          return;
		        }
		        var now = Math.floor(Date.now()/1000);
		        var oldest = {status:now,name:""};
		        var oldest2 = {status:now,name:""};
		        for(var i = 0; i < rows.length; i++) {
		        	status = rows[i].status;
		        	if (status != null) {
		        		if(status < oldest.status) {
		        			oldest2 = oldest;		
		        			oldest = rows[i];
		        		}
		        		else if(status < oldest2.status) oldest2 = rows[i];
		        	}
		        }
		        var sql = "UPDATE accounts SET status=? where name in (?,?)"
			    var params = [null, oldest.name, oldest2.name]
			    db.run(sql, params, (err, rows) => {
			        if (err) {
			          res.status(400).json({"error":err.message});
			          return;
			        }
				});
		        res.json({
		            "message":"success",
		            "data": [[oldest.name,oldest.down_status], [oldest2.name,oldest2.down_status]]
	       		});
      		});
  		}
    }
});

app.get("/accdata", async (req, res, next) => {
	if(process.env.PAUSEDB != "pause") {
		db.run("UPDATE network SET last_connection=" + Date.now() + " WHERE id=1")
		try {
			if (req.query.get == 1) {
				var sql = "select data from accounts where name=?";
				var params = [req.query.name];
				db.all(sql, params, (err, rows) => {
					if (err) {
						res.status(400).json({"error":err.message});
						return;
					}
					try {
						res.json({
							"message":"success",
							"data":rows[0]['data']
						});
					}finally {}
				});
			}
			else {
				var sql = "select data from accounts where name=?";
				var params = [req.query.name];
				db.all(sql, params, (err, rows) => {
					if (err) {
						res.status(400).json({"error":err.message});
						return;
					}
					try {
						data = JSON.parse(rows[0]['data']);
						data[req.query.key] = req.query.value;
						var sql = "UPDATE accounts set data=? where name=?";
						var params = [JSON.stringify(data), req.query.name];
						db.all(sql, params, (err2, rows2) => {
							if (err2) {
								res.status(400).json({"error":err.message});
								return;
							}
							res.json({
								"message":"success",
								"data":data
							});
						});
					}finally{}	
				});
			}
		}finally {}
	}
});

app.get("/set_parent", async (req, res, next) => {
	if(process.env.PAUSEDB != "pause") {
		db.run("UPDATE network SET last_connection=" + Date.now() + " WHERE id=1")

	    var sql = "UPDATE accounts SET parent_name=? where name=?"
	    var params = [req.query.parent, req.query.name]
	    db.run(sql, params, (err, rows) => {
	        if (err) {
	          res.status(400).json({"error":err.message});
	          return;
	        }
	        res.json({
	            "message":"success"
	        })
		});
    }
});


app.get("/account", async (req, res, next) => {
	if(process.env.PAUSEDB != "pause") {
		db.run("UPDATE network SET last_connection=" + Date.now() + " WHERE id=1")

		name = req.query.name
		if(name == null) name = "";

	 	var sql = "select * from accounts where parent_name='"+name+"'";
	    var params = [];
	    db.all(sql, params, (err, rows) => {
	        if (err) {
	          res.status(400).json({"error":err.message});
	          return;
	        }


	        var sql = "select * from accounts where name='"+name+"'";
		    var params = [];
		    db.all(sql, params, (err, named) => {
		        if (err) {
		          res.status(400).json({"error":err.message});
		          return;
		        }

	        	if(named.length == 1) {
					var sql = "select * from accounts where parent_name is null";
					var params = [];
					db.all(sql, params, (err, accounts) => {
					    if (err) {
					      res.status(400).json({"error":err.message});
					      return;
					    }
		        		if(rows.length < 2) {
		        			if(accounts.length != 0){
					    		db.run("UPDATE accounts SET parent_name='" + name + "' WHERE id="+accounts[0].id)
		        			}
					   	}

					    var sql = "select * from accounts where parent_name='"+name+"'";
					    var params = [];
					    db.all(sql, params, (err, final) => {
					        if (err) {
					          res.status(400).json({"error":err.message});
					          return;
					        }
		       				outaccs = []
					        for(var i = 0; i < final.length; i++) {
						        outaccs.push([final[i].name, final[i].password, final[i].firstname, final[i].lastname])
						    }
						    res.json({
					            "message":"success",
					            "data":outaccs
	       					})
					    });
					});
				}
				else {
					res.json({
			            "message":"unavailable",
			            "data":""
	   				});
	   				return
				}
				
			});
		});
	}
});


app.get("/email", async (req, res, next) => {
	if(process.env.PAUSEDB != "pause") {
		db.run("UPDATE network SET last_connection=" + Date.now() + " WHERE id=1")

		name = req.query.name;
		email_subject = req.query.email_subject;

	    var sql = "select * from accounts where name='"+name+"'";
	    var params = []
	    db.all(sql, params, (err, account) => {
	        if (err) {
	          res.status(400).json({"error":err});
	          return;
	        }
	        if(account.length == 1) {
		        db.run("UPDATE accounts SET email_request='" + email_subject + "' WHERE id="+account[0].id);
		        if(account[0].email_responce != null && account[0].email_request == email_subject) {
		        	res.json({
			            "message":"success",
			            "data":account[0].email_responce
		       		});
		       		db.run("UPDATE accounts SET email_request=null WHERE id="+account[0].id);
		       		db.run("UPDATE accounts SET email_responce=null WHERE id="+account[0].id);
		        }else {
		        	res.json({
			            "message":"not received",
			            "data":""
		       		})
		        }
	        }else {
	        	res.json({
		            "message":"unavailable",
		            "data":""
	       		})
	        }
	        
	      });
    }
});

app.use(express.json());
app.post("/incoming", (req, res, next) => {
	if(process.env.PAUSEDB != "pause") {
		db.run("UPDATE network SET last_connection=" + Date.now() + " WHERE id=1");
		email_domain = "princesslay.ml";
		try {
			let to = req.body.headers.to;
			let subject = req.body.headers.subject;
			let messageBody = req.body.plain;

			var toemail = to.split('<').pop().split('>')[0];

			console.log(toemail)
			console.log(subject)

			var sql = "select * from accounts where email_request is not null";
			var params = []
			db.all(sql, params, async (err, accounts) => {
				if (err) {
					console.log(err)
					return;
				}
				for(var i = 0; i < accounts.length; i++) {
					var accemail = accounts[i].name + "@" + email_domain;
					if (accounts[i].email_request == subject) {
						if (accemail == toemail) {
							console.log("logging");
							db.run("UPDATE accounts SET email_responce=? WHERE id=?",[messageBody, accounts[i].id]);
						}
					}
				}
			});
		}catch(e) {
			console.log("error")
			res.json({"message":"error"})
			return
		}
		res.json({"message":"success"})
	}
});


// Default response for any other request
app.use(function(req, res){
    res.status(404);
});
