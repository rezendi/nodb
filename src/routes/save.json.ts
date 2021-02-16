const yaml = require('js-yaml');
const fetch = require('node-fetch');
const base64 = require('universal-base64');

import NoDB from '../components/NoDB';
import util from "../components/util";

// Save file to GitHub
export async function post(req, res, next) {
	console.log("saving");
	let user = req.session.sUser;
	// Hardcode "examples" in he path out of mild security paranoia.
	let prefix = "examples/" + user.username ? user.username : util.hash8(user.email);
	let data = req.body;
	let args = {
		auth: process.env.GITHUB_TOKEN,
		owner: process.env.GITHUB_ACCOUNT,
		repo: process.env.GITHUB_REPO,
		prefix: prefix,
		branch: data.branch,
		sha: data.sha,
		message: "NoDB update",
		title: data.title,
	};
	let retval = NoDB.save(data, args);
	res.end(JSON.stringify(retval));
}

export async function del(req, res, next) {
	console.log("deleting");
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	let data = req.body;
	try {
		let owner = process.env.GITHUB_ACCOUNT;
		let repo = process.env.GITHUB_REPO;
		let user = req.session.sUser;
		let pathPrefix = user.username ? user.username : util.hash8(user.email)
		let path = `examples/${pathPrefix}/${data.slug}.yaml`;
		let api_url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

		// get the sha
		let getResponse = await fetch(api_url, {
			method: 'GET',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/vnd.github.v3+json",
				"Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
			},
		});
		let getJson = await getResponse.json();
		data.sha = getJson.sha;

		let toDel = {
			message: "NoDB delete",
			sha: data.sha,
		};
		let response = await fetch(api_url, {
			method: 'DELETE',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/vnd.github.v3+json",
				"Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
			},
			body: JSON.stringify(toDel)
		});
		let json = await response.json();
		console.log("deleted", json);
		res.end(JSON.stringify({json, ...{ success: true}}));
	} catch(error) {
		console.log("save error", error);
		res.end(JSON.stringify({success:false, data:data, error:error}));
	}
}
