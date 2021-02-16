const fetch = require('node-fetch');
const base64 = require('universal-base64');

import util from "../components/util";

export async function get(req, res, next) {
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	let user = req.session.sUser;
	let pathPrefix = user.username ? user.username : util.hash8(user.email)
	let path = `contents/examples/${pathPrefix}`; // hardcode 'examples' out of security paranoia

	let args = {
		auth: process.env.GITHUB_TOKEN,
		owner: process.env.GITHUB_ACCOUNT,
		repo: process.env.GITHUB_REPO,
		branch: req.params.branch,
		path: path,
		title: slug,
	}
	let json = NoDB.get(args);
	if (json.message != "Not Found") {
		retval = json.map(entry => { return {
			slug: entry.name.replace(".yaml", ""),
		}});
	}
	res.end(JSON.stringify(retval));
}
