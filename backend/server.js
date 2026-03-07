require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");

connectDB();

app.listen(process.env.PORT, () => {
    console.log(`server started on port ${process.env.PORT}`);
})
