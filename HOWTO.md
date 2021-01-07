# HOWTO get the NoDB template site running

## 1. Add Credentials to .env

Mostly this is straightforward, but you will need Firebase and GitHub credentials.

All credentials should go in a `.env` file in the root directory. There are five variables:

* GOOGLE_APPLICATION_CREDENTIALS, a fully specified path to your Firebase
credentials file, per [Firebase's documentation](https://firebase.google.com/docs/admin/setup)
* GITHUB_TOKEN, a GitHub personal access token, per [GitHub's documentation](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token)
* GITHUB_ACCOUNT and GITHUB_REPO, describing the GitHub owner/repo to be used for data.
* SESSION_SECRET, a random string used for server-side session storage.

So an example `.env` would look like:

```
GITHUB_ACCOUNT=myaccount
GITHUB_REPO=my-repo
GITHUB_TOKEN=0987poiu0987poiu0987poiu0987poiu0987poiu
GOOGLE_APPLICATION_CREDENTIALS=/Home/nodb/firebase.json
SESSION_SECRET=1234zxcv
```

## 2. Build and run

This is a [Sapper](https://sapper.svelte.dev/)/[Svelte](https://svelte.dev/) site. Running it should be as easy as:

```
npm install
npm run dev
```

Alternately, `docker build -t nodb . && docker run -p 3000:3000 -it nodb` will run it in a Docker container,
although note that the fully specified path for GOOGLE_APPLICATION_CREDENTIALS may vary in the container.

Then simply point your browser to [localhost:3000](http://localhost:3000).
