const yaml = require('js-yaml');
const fetch = require('node-fetch');
const base64 = require('universal-base64');

export async function get(req, res, next) {
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});

	let owner = process.env.GITHUB_ACCOUNT;
	let repo = process.env.GITHUB_REPO;

	let [path, slug] = req.params.slug;
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

	try {
		let email = req.session.sUser ? req.session.sUser.email || '' : '';
		let response = await fetch(`https://api.github.com/repos/${owner}/${repo}/${path}/${slug}.yaml`, {
			method: 'GET',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/vnd.github.v3+json",
				"Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
			},
		});
		let json = await response.json();
		// console.log("json", json);
		let converted = base64.decode(json.content);
		let retval = yaml.safeLoad(converted);
		retval.sha = json.sha;
		res.end(JSON.stringify({success:true, line:retval}));
	} catch(error) {
		res.end(JSON.stringify({success:false, slug:slug, error:error}));
	}
}
