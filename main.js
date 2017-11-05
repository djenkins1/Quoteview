var http = require("http");
var mysql = require('mysql'); 

var con = mysql.createConnection(
{
    host: "localhost",
    user: "root",
    password: "",
    database: "JobSim"
});

con.connect(function(err) 
{
    if (err) throw err;
    console.log("Connected!");
    con.query("SELECT * FROM Jobs", function (err, result, fields) 
    {
        if (err) throw err;
        for ( var i = 0; i < result.length; i++ )
        {
            console.log( result[ i ].title );
        }

        process.exit();
    });
});

