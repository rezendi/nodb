# HOWTO get the NoDB template site running

1. Add Credentials to .env
--------------------------

Mostly this is straightforward, but, as it ises Firebase for auth and GitHub
for data, you will need to add Firebase and GitHub credentials.

All credentials should go in a .env file in the root directory. There are five:

* GOOGLE_APPLICATION_CREDENTIALS is a fully specified path to your Firebase
credentials file, as described in [Firebase's documentation](https://firebase.google.com/docs/admin/setup)
* GITHUB_TOKEN is a GitHub personal access token, as described in [GitHub's documentation](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token)
* GITHUB_ACCOUNT and GITHUB_REPO describe the owner and repo for data storage.
To use https://github.com/myacount/my-repo, set GITHUB_ACCOUNT to "myaccount"
and GITHUB_REPO to "my-repo". Obviously the token above must be for an account
with write privileges for that repo.
* SESSION_SECRET is a random string used for server-side session storage.

So an example .env file would look like:

GITHUB_ACCOUNT=scryline
GITHUB_REPO=scrylines
GITHUB_TOKEN=0987poiu0987poiu0987poiu0987poiu0987poiu
GOOGLE_APPLICATION_CREDENTIALS=/Home/scryline/firebase.json
SESSION_SECRET=1234zxcv

2. Build and run
----------------

This is a [Sapper](https://sapper.svelte.dev/)/[Svelte](https://svelte.dev/) site. Running it should be as easy as:

`npm install`
`npm run dev`

Alternately, `docker build -t nodb . && docker run -p 3000:3000 -it nodb` will run it in a Docker container,
although note that the fully specified path for GOOGLE_APPLICATION_CREDENTIALS may vary in the container.

Then point your browser to [localhost:3000](http://localhost:3000)