const express = require("express");
const app = express();
const port = 3000;
const session = require("express-session");
const { ExpressOIDC } = require("@okta/oidc-middleware");
const config = require("./config.json");

app.use(
  session({
    secret: "this should be secure",
    resave: true,
    saveUninitialized: false
  })
);

const oidc = new ExpressOIDC({
  issuer: config.issuer,
  client_id: config.client_id,
  client_secret: config.client_secret,
  redirect_uri: "http://localhost:3000/authorization-code/callback",
  scope: "openid profile"
});

app.use(oidc.router);

app.get("/protected", oidc.ensureAuthenticated(), (req, res) => {
  res.send(JSON.stringify(req.userContext.userinfo));
});

app.get("/", (req, res) => {
  if (req.userContext.userinfo) {
    res.send(`Hi ${req.userContext.userinfo.name}!`);
  } else {
    res.send("Hi!");
  }
});

oidc.on("ready", () => {
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
});

oidc.on("error", err => {
  console.log("Unable to configure ExpressOIDC", err);
});
