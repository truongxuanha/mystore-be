const path = require("path");
const express = require("express");
// const morgan = require('morgan')
const cors = require("cors");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const app = express();
const PORT = 5000;

const route = require("./routes");

cors({ credentials: true, origin: true });

app.use(cookieParser());
// app.use(morgan('combined'))
app.use(methodOverride("_method"));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(
  express.urlencoded({
    extended: true
  })
);

//Route init
route(app);

app.listen(PORT, () => {
  console.log(`Server is listening on port http://localhost:${PORT}/v1`);
});
