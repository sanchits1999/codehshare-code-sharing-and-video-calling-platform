const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://sanchits1999:E67SP2lXUDFtivsA@cluster0-qdyic.mongodb.net/movie-web?retryWrites=true&w=majority",{
    useNewUrlParser : true,
    useCreateIndex : true,
    useUnifiedTopology : true
})