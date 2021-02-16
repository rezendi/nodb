const yaml = require('js-yaml');
const fetch = require('node-fetch');
const base64 = require('universal-base64');

import NoDB from '../components/NoDB';
import util from "../components/util";

// Save file to GitHub
export async function post(req, res, next) {
	console.log("saving");
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	let user = req.session.sUser;
	// Hardcode "examples" in he path out of mild security paranoia.
	let prefix = "examples/" + user.username ? user.username : util.hash8(user.email);
	let data = req.body;
	let args = {
		auth: process.env.GITHUB_TOKEN,
		owner: process.env.GITHUB_ACCOUNT,
		repo: process.env.GITHUB_REPO,
		branch: data.branch,
		prefix: prefix,
		title: data.title,
		sha: data.sha,
		message: "NoDB update",
	};
	let retval = NoDB.save(data, args);
	res.end(JSON.stringify(retval));
}

// Delete file from GitHub
export async function del(req, res, next) {
	console.log("deleting");
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	let user = req.session.sUser;
	// Hardcode "examples" in he path out of mild security paranoia.
	let prefix = "examples/" + user.username ? user.username : util.hash8(user.email);
	let data = req.body;
	let args = {
		auth: process.env.GITHUB_TOKEN,
		owner: process.env.GITHUB_ACCOUNT,
		repo: process.env.GITHUB_REPO,
		branch: data.branch,
		prefix: prefix,
		title: data.title,
		sha: data.sha,
		message: "NoDB delete",
	};
	let retval = NoDB.del(args);
	res.end(JSON.stringify(retval));
}
