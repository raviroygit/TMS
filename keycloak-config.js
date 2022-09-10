const Keycloak = require('keycloak-connect');
const session = require('express-session');
const { Console } = require('winston/lib/winston/transports');

let keycloak;


const keycloakConfig = {
  "realm": process.env.REALM,
  "bearer-only": true,
  "auth-server-url": process.env.AUTH_URL,
  "ssl-required": "external",
  "resource": "backend",
  "confidential-port": 0
}
function initKeycloak (){
  if(keycloak){
    return keycloak;
  }else{
    const memoryStore = new session.MemoryStore();
    keycloak = new Keycloak({
      store: memoryStore,
      secret:'any_key',
      resave:false,
      saveUninitialized: true
    },keycloakConfig);
    return keycloak;
  }
}

module.exports ={
  initKeycloak
};