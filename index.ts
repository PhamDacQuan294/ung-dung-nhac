import express, { Express,  Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import * as database from "./config/database";
import clientRoutes from "./routes/client/index.route";
import adminRoutes from "./routes/admin/index.route";
import path from "path";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "express-flash";
import { systemConfig } from "./config/config";
import moment = require("moment");

dotenv.config();

database.connect();

const app: Express = express();
const port: number | string = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.use(express.static(`${__dirname}/public`));

app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

// Flash
app.use(cookieParser('KSOSAOQWPQWPQW'));
app.use(session({ cookie: { maxAge: 60000 }}));
app.use(flash());
// End Flash

// TinyMCE
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
// End TinyMCE

// App Local Variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.locals.moment = moment;

// Client Routes
clientRoutes(app);

// Admin Routes
adminRoutes(app);

// Middleware 404
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).render("client/pages/errors/404", {
    pageTitle: "404 Not Found",
  });
});


app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});