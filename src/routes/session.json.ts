import firebase from "firebase";

require('dotenv').config();

let admin = require('firebase-admin');
let app = admin.initializeApp();

export async function post(req, res, next) {
    console.log("setting session");
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    let json = req.body;
    try {
      let decoded = await admin.auth().verifyIdToken(json.token);
      let identities = Object.keys(decoded.firebase.identities);
      req.session.sUser = {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        identities: identities,
      };
      res.end(JSON.stringify({success:true, slUser:req.session.slUser}));
    } catch(error) {
      console.log("error", error);
      res.end(JSON.stringify({success:false, error:error}));
    }
};

export function del(req, res, next) {
  console.log("deleting session");
  req.session.sUser = { email: ''};
  res.end(JSON.stringify({success:true}));
}
