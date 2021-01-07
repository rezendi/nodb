# HOWTO get the NoDB template site running

## 1. Set up Firebase and GitHub authentication

* Create a Firebase project and enable Google and GitHub authentication.
* Populate the firebaseConfig object in [components/Nav.svelte](./src/components/Nav.svelte), per [Firebase's documentation](https://firebase.google.com/docs/web/setup?authuser=0)
* Register your app as [a new GitHub OAuth applicationn](https://github.com/settings/applications/new)
* Configure Firebase for your GitHub app per [Firebase's documentation](https://firebase.google.com/docs/auth/web/github-auth?authuser=0)

## 2. Add credentials to .env

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

## 3. Build and run

This is a [Sapper](https://sapper.svelte.dev/)/[Svelte](https://svelte.dev/) site. Running it should be as easy as:

```
npm install
npm run dev
```

Alternately, `docker build -t nodb . && docker run -p 3000:3000 -it nodb` will run it in a Docker container,
although note that the fully specified path for GOOGLE_APPLICATION_CREDENTIALS may vary in the container.

Then simply point your browser to [localhost:3000](http://localhost:3000).

## 4. Profit!

Well, use, anyhow. Out of the box, you can use it to log in; link / unlink GitHub / Google accounts;
and then, on the "My NoDB" page, store two data fields, title and text, to a YAML file in the configured
git repo. Subsequent CRUD functionality for such files is also built in.

In particular, before you even create a file yourself, you can read an existing one, because, again,
_any_ public git repo can be a data source. For instance, you can point your browser to
http://localhost:3000/examples/github/scryline/scrylines/examples/a25bddcd/first-test
to view the contents of
https://github.com/scryline/scrylines/blob/main/examples/a25bddcd/first-test.yaml
as rendered through your own local web app.

Further usage and expansion is up to the user, but the author is using it for [Scryline](https://scryline.com/).

