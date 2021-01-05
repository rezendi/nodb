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
		console.log("user", user.email);
		let pathPrefix = user.username ? user.username : util.hash8(user.email)
		let path = `lines/${pathPrefix}/${data.slug}.yaml`;

		let toPut = {
			message: "Scryline update",
			content: base64.encode(yamlData),
		};

		let originalSlug = '';
		let doRename = false;
		if (data.originalTitle) {
			originalSlug = util.slugize(data.originalTitle);
			doRename = originalSlug != data.slug;
			console.log("doRename", originalSlug);
		}
		if (!doRename) {
			if (data.sha && data.sha.length > 0) {
				toPut['sha'] = data.sha;
			}
		}

		// console.log("posting to GH", toPut);
		let response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
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
			doRename = false;
		}

		if (doRename) {
			let toDelete = {
				message: "Scryline file rename",
				sha: data.sha,
			};
			let dPath = `lines/${pathPrefix}/${originalSlug}.yaml`;
			let dResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${dPath}`, {
				method: 'DELETE',
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/vnd.github.v3+json",
					"Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
				},
				body: JSON.stringify(toDelete)
			});
			let dJSON = await dResponse.json();
		}

		json.path = pathPrefix;
		console.log("saved", pathPrefix);
		res.end(JSON.stringify(json));
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
		let path = `lines/${pathPrefix}/${data.slug}.yaml`;
		let toDel = {
			message: "Scryline delete",
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

export async function get(req, res, next) {
	console.log("redirecting to repo");
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	let params = req.query;
	try {
		let owner = process.env.GITHUB_ACCOUNT;
		let repo = process.env.GITHUB_REPO;
		let slug = util.slugize(params.title);
		let path = params.path;
		let url = `https://raw.githubusercontent.com/${owner}/${repo}/main/lines/${path}/${slug}.yaml`
		res.end(JSON.stringify({success:true, url:url}));
	} catch(error) {
		res.end(JSON.stringify({success:false, params:params, error:error}));
	}
}
