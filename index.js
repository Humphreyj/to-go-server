const pid = process.disconnect;
const cluster = require('cluster');
const os = require('os');
const cpus = os.cpus.length;

require("dotenv").config();
const server = require('./server');
const PORT = process.env.PORT || 5000;

if(cluster.isMaster) {
    console.log(`The server is running on port ${PORT}`)
    for (let i = 0; i< 1; i++) {
        cluster.fork()
    }
}else {
    server.get('/',(req,res) => {
        res.send(`
        <h1>This is a test!</h1>
        `);
    });
    if (process.env.NODE_ENV != "test") {
        server.listen(PORT, () => {
            console.log(`The server is running on port ${PORT} PID: ${process.pid}`)
        })
    }
}

module.exports = server;