import express, { Express } from "express";
import dotenv from "dotenv";
import * as database from "./config/database";
import clientRoutes from "./routes/client/index.route";
import adminRoutes from "./routes/admin/index.route";
import path from "path";
import methodOverride from "method-override";
import { systemConfig } from "./config/config";

dotenv.config();

database.connect();

const app: Express = express();
const port: number | string = process.env.PORT || 3000;

app.use(methodOverride('_method'))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.use(express.static(`${__dirname}/public`));

app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

// TinyMCE
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
// End TinyMCE


// App Local Variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;

// Client Routes
clientRoutes(app);

// Admin Routes
adminRoutes(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});