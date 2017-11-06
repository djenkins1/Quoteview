var mysql = require('mysql'); 

function getAllQuotes( onFinish )
{
    var con = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "",
        database: "QUOTES"
    });

    con.connect(function(err) 
    {
        if (err) throw err;

        con.query("SELECT * FROM QUOTE ORDER BY SCORE DESC", function (err, result, fields) 
        {
            if (err) throw err;

            onFinish( result ); 
        });
    });
}

exports.getAllQuotes = getAllQuotes;
