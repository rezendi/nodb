const yaml = require('js-yaml');
const fetch = require('node-fetch');
const base64 = require('universal-base64');
const slugify = require ('slugify');

function slugize(str, locale) {
    return slugify (str, { lower: true, strict: true, locale: locale || 'en'} );
}

// args: auth, owner, repo, branch, prefix, title, sha, oldTitle, message, committer, locale='en'
async function save(data, args) {
    try {
        let headers = {
            "Content-Type": "application/json",
            "Accept": "application/vnd.github.v3+json",
            "Authorization": `Basic ${base64.encode(`${args.owner}:${args.auth}`)}`
        };

        let slug = slugize(args.title, args.locale );
        let path = `${args.prefix}/${slug}.yaml`; // hardcode 'examples' out of security paranoia
        let api_url = `https://api.github.com/repos/${args.owner}/${args.repo}/contents/${path}`;

        let yamlData = yaml.safeDump(data, {skipInvalid:true});
        let toPut = {
            message: args.message || "NoDB update",
            content: base64.encode(yamlData),
            branch: args.branch || "main",
            sha: args.sha,
        };

        // Get rid of SHA if we're doing a file rename.
        if (args.originalTitle ) {
            let originalSlug = slugize(args.originalTitle, args.locale );
			doRename = originalSlug != slug;
		}
		if (doRename) {
			delete toPut["sha"];
		}

        // Get a SHA if we're doing what might be an update.
        if (!toPut.sha && !doRename && !args.guaranteedCreate) {
            let getResponse = await fetch(api_url, {
                method: 'GET',
                headers: headers
            });
            let getJson = await getResponse.json();
            if (getJson.sha && getJson.sha.length > 0) {
                toPut.sha = getJson.sha;
            }
        }

        let response = await fetch(api_url, {
            method: 'PUT',
            headers: headers,
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
            let ghd = del({
                auth: args.auth,
                owner: args.owner,
                repo: args.repo,
				branch: args.branch,
                prefix: args.prefix,
                title: args.originalTitle,
				sha: args.sha,
                deleteEntireBranch: false,
                message: "NoDB two-step file rename",
            });
        }

        return { success: success, gh:gh, ghd:ghd };
	} catch(error) {
		return { success:false, args:args, error:error };
	}
}

async function del(args) {
	try {
        let headers = {
            "Content-Type": "application/json",
            "Accept": "application/vnd.github.v3+json",
            "Authorization": `Basic ${base64.encode(`${args.owner}:${args.auth}`)}`
        };

        if (args.branch && args.deleteEntireBranch) {
			let api_url = `https://api.github.com/repos/${args.owner}/${args.repo}/git/refs/${args.branch}`;
			let response = await fetch(api_url, {
				method: 'DELETE',
				headers: headers
			});
			let gh = await response.json();
			return {success:response.status==204, gh:gh};
		}

        // if wer'e here, we're deleting an individual file
        let slug = slugize(args.title, args.locale );
        let path = `${args.prefix}/${slug}.yaml`; // hardcode 'examples' out of security paranoia
        let api_url = `https://api.github.com/repos/${args.owner}/${args.repo}/contents/${path}`;

        let sha = args.sha;
        // get the sha if needed
        if (!sha) {
            let getResponse = await fetch(api_url, {
                method: 'GET',
                headers: headers,
            });
            let getJson = await getResponse.json();
            sha = getJson.sha;
        }

		let toDel = {
			message: args.message,
            branch: args.branch || "main",
			sha: sha,
		};
		let response = await fetch(api_url, {
			method: 'DELETE',
			headers: headers,
			body: JSON.stringify(toDel)
		});
		let gh = await response.json();
        return { success: success, gh:gh };
	} catch(error) {
		return { success:false, args:args, error:error };
	}
}


export default {
    save: save,
    del: del
}