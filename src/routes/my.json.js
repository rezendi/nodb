const fetch = require('node-fetch');
const base64 = require('universal-base64');

import util from "../components/util";

export async function get(req, res, next) {
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	let owner = process.env.GITHUB_ACCOUNT;
	let repo = process.env.GITHUB_REPO;
	let user = req.session.sUser;
	let pathPrefix = user.username ? user.username : util.hash8(user.email)
	let path = `examples/${pathPrefix}`; // hardcode 'examples' out of security paranoia

	let response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: 'GET',
        headers: {
			"Content-Type": "application/json",
			"Accept": "application/vnd.github.v3+json",
			"Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
		},
	});
	let json = await response.json();
	var retval = [];
	if (json.message != "Not Found") {
		retval = json.map(entry => { return {
			slug: entry.name.replace(".yaml", ""),
		}});
	}
	res.end(JSON.stringify(retval));
}
