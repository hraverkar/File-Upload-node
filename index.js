require("dotenv").config();
const express = require("express");
const app = express();
const connection = require("./db");
const upload = require("./routes/upload");
const Grid = require("gridfs-stream");
const mongoose = require("mongoose");

app.use("/file", upload);

let gfs;
connection();

const con = mongoose.connection;

con.once("open", function () {
    gfs = Grid(con.db, mongoose.mongo);
    gfs.collection("photos");
})

app.use("/file", upload);

app.get("/file/:filename", async (req, res) => {
    try {
        const file = await gfs.files.findOne({ filename: req.params.filename });
        const readStream = gfs.createReadStream(file.filename);
        readStream.pipe(res);
    } catch (error) {
        res.send("not found");
    }
})

app.delete("/file/:filename", async (req, res) => {
    try {
        await gfs.files.deleteOne({
            filename: req.params.filename
        });
        res.send("success");
    } catch (error) {
        res.send("an error occured");
    }
})
const port = process.env.PORT || 8080;
app.listen(port, console.log(`Listening on port ${port}...`));
