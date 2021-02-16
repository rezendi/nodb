const yaml = require('js-yaml');
const fetch = require('node-fetch');
const base64 = require('universal-base64');
const slugify = require ('slugify');

function slugize(str, locale) {
    return slugify (str, { lower: true, strict: true, locale: locale || 'en'} );
}

async function save(data, args) {
    try {
        // auth, owner, repo, branch, path, title, sha, oldTitle, message, committer, locale='en'
        let slug = slugize(args.title, args.locale );
        let path = `${args.prefix}/${slug}.yaml`; // hardcode 'examples' out of security paranoia
        let api_url = `https://api.github.com/repos/${args.owner}/${args.repo}/contents/${path}`;

        let yamlData = yaml.safeDump(data, {skipInvalid:true});
        let toPut = {
            message: args.message || "NoDB update",
            content: base64.encode(yamlData),
            sha: args.sha,
            branch: args.branch || "main"
        };

        // Get rid of SHA if we're doing a file rename.
        if (args.originalTitle ) {
            let originalSlug = slugize(args.originalTitle, args.locale );
			doRename = originalSlug != slug;
		}

        // Get a SHA if we're doing what might be an update.
        if (!toPut.sha && !doRename && !args.guaranteedCreate) {
            let getResponse = await fetch(api_url, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/vnd.github.v3+json",
                    "Authorization": `Basic ${base64.encode(`${owner}:${args.auth}`)}`
                },
            });
            let getJson = await getResponse.json();
            if (getJson.sha && getJson.sha.length > 0) {
                toPut.sha = getJson.sha;
            }
        }

		if (doRename) {
			delete toPut["sha"];
		}

        let response = await fetch(api_url, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/vnd.github.v3+json",
                "Authorization": `Basic ${base64.encode(`${owner}:${args.auth}`)}`
            },
            body: JSON.stringify(toPut)
        });
        let json = await response.json();
        let success = true;
        if (json.message && json.message.length > 0) {
            success = false;
        }

        // TODO: 1-commit renames https://medium.com/@obodley/renaming-a-file-using-the-git-api-fed1e6f04188
        let ghd = null;
        if (doRename) { 
			let toDelete = {
				message: "NoDB two-step file rename",
				sha: args.sha,
				branch: args.branch
			};
			let dSuffix = `lines/${path}/${originalSlug}.yaml`;
			let dResponse = await fetch(`https://api.github.com/repos/${args.owner}/${args.repo}/contents/${dSuffix}`, {
				method: 'DELETE',
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/vnd.github.v3+json",
                    "Authorization": `Basic ${base64.encode(`${owner}:${args.auth}`)}`
				},
				body: JSON.stringify(toDelete)
			});
			ghd = await dResponse.json();
        }

        return {success: success, gh:gh, ghd:ghd};
	} catch(error) {
		return {success:false, args:args, error:error};
	}
}

async function del(data, args) {

}


export default {
    save: save,
    del: del
}