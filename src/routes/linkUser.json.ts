export async function post(req, res, next) {
    console.log("linking user");
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    var uid;
    let json = req.body;
    try {
      if (json.site=="github.com") {
        let username = json.result.additionalUserInfo.username;
        let token = json.result.credential.oauthAccessToken;
        uid = req.session.slUser.uid || json.result.user.uid;
        // here's where you would save the user's username and OAuth token for subsequent use
        res.end(JSON.stringify({success:true}));
      }
    } catch(error) {
      console.log("linkUser error", error);
      res.end(JSON.stringify({success:false, error:error, uid:uid}));
    }
};

export async function del(req, res, next) {
  console.log("Unlinking user");
  res.writeHead(200, {
    'Content-Type': 'application/json'
  });
  let json = req.body;
  try {
    let idsIdx = req.session.slUser.identities.indexOf(json.site);
    if (idsIdx >= 0) {
      req.session.slUser.identities.splice(idsIdx, 1);
    }
    res.end(JSON.stringify({success:true}));
  } catch(error) {
    console.log("unlinkUser error", error);
    res.end(JSON.stringify({success:false, error:error, input:json}));
  }
};
