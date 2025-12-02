const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 3000

app.use(cors())

app.get("/api/hello", (req, res) => { res.json({message: "Siema dzialam"})})
app.listen(PORT, ()=>{
    console.log("Server is running")
})