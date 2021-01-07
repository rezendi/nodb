const yaml = require('js-yaml');
const fetch = require('node-fetch');
const base64 = require('universal-base64');

import util from "../components/util";

export async function post(req, res, next) {
	console.log("saving");
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	let data = req.body;
	try {
		data.slug = util.slugize(data.title);
		let yamlData = yaml.safeDump(data, {skipInvalid:true});

		let owner = process.env.GITHUB_ACCOUNT;
		let repo = process.env.GITHUB_REPO;
		let user = req.session.sUser;
		let pathPrefix = user.username ? user.username : util.hash8(user.email)
		let path = `examples/${pathPrefix}/${data.slug}.yaml`; // hardcode 'examples' out of security paranoia
		let api_url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

		let toPut = {
			message: "NoDB update",
			content: base64.encode(yamlData),
		};

		// do a GET to see if a sha exists, in which case this is an update
		let getResponse = await fetch(api_url, {
			method: 'GET',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/vnd.github.v3+json",
				"Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
			},
		});
		let getJson = await getResponse.json();
		if (getJson.sha && getJson.sha.length > 0) {
			toPut['sha'] = getJson.sha;
		}

		// console.log("posting to GH", toPut);
		let response = await fetch(api_url, {
			method: 'PUT',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/vnd.github.v3+json",
				"Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
			},
			body: JSON.stringify(toPut)
		});
		let json = await response.json();
		if (json.message && json.message.length > 0) {
			console.log("gh json", json);
			json.success = false;
			json.error = "GH: " + json.message;
		}

		json.path = pathPrefix;
		console.log("saved", pathPrefix);
		res.end(JSON.stringify({json, ...{ success: true}}));
	} catch(error) {
		res.end(JSON.stringify({success:false, data:data, error:error}));
	}
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
		data.slug = util.slugize(data.title);
		let user = req.session.sUser;
		let pathPrefix = user.username ? user.username : util.hash8(user.email)
		let path = `examples/${pathPrefix}/${data.slug}.yaml`;
		let toDel = {
			message: "NoDB delete",
			sha: data.sha,
		};
		let response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
			method: 'DELETE',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/vnd.github.v3+json",
				"Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
			},
			body: JSON.stringify(toDel)
		});
		let json = await response.json();
		console.log("deleted");
		res.end(JSON.stringify({json, ...{ success: true}}));
	} catch(error) {
		console.log("save error", error);
		res.end(JSON.stringify({success:false, data:data, error:error}));
	}
}
