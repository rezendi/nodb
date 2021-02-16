const yaml = require('js-yaml');
const fetch = require('node-fetch');
const base64 = require('universal-base64');

import util from "../../components/util";
import NoDB from '../../components/NoDB';

export async function get(req, res, next) {
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});

	let owner = process.env.GITHUB_ACCOUNT;
	let repo = process.env.GITHUB_REPO;
	let user = req.session.sUser;
	let path = user.username ? user.username : util.hash8(user.email)
	let slug = req.params.slug;
	if (req.params.slug.length > 2) {
		let params = req.params.slug;
		owner = params.shift();
		repo = params.shift();
		slug = params.pop();
		params.unshift("contents");
		path = params.join("/");
	} else {
		path = "contents/examples/" + path;
	}

	let args = {
		auth: process.env.GITHUB_TOKEN,
		owner: owner,
		repo: repo,
		branch: req.params.branch,
		path: path,
		title: slug,
	}
	let retval = NoDB.get(args);
	res.end(JSON.stringify(retval));
}
