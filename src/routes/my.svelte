<script context="module" lang="ts">
	export async function preload( page, session ) {
		let response = await this.fetch('/my.json');
		let examples = await response.json();
        return { examples: examples, session:session }
    }
</script>

<script lang="ts">
	export let examples: [{ [slug: string]: string}];
	export let session;
	let user = session.sUser;

	import firebase from 'firebase/app';
	import 'firebase/auth';

    async function linkGitHub() {
		var provider = new firebase.auth.GithubAuthProvider();
		return linkProvider(provider, "github.com");
	}
	async function linkGoogle() {
		var provider = new firebase.auth.GoogleAuthProvider();
		return linkProvider(provider, "google.com");
	}
	async function linkProvider(provider, site) {
		let result = null;
		try {
			result = await firebase.auth().currentUser.linkWithPopup(provider);
			firebase.auth().currentUser.reload();
		} catch(error) {
			console.log('link error code', error.code);
			console.log('link error message', error.message);
			console.log('link error email', error.email);
			console.log('link error credential', error.credential);
			return alert(`Account link error: ${error.message}`);
		}
		let response =  await fetch('/linkUser.json', {
			method: 'POST',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({result, ...{site:site}})
		});
		let json = await response.json();
		if (json.success === false) {
			alert("Link user error");
		} else {
			location.href = "/";
		}
	}

	async function unlinkGitHub() {
		var provider = new firebase.auth.GithubAuthProvider();
		return unlinkProvider(provider, "github.com");
	}
	async function unlinkGoogle() {
		var provider = new firebase.auth.GoogleAuthProvider();
		return unlinkProvider(provider, "google.com");
	}
	async function unlinkProvider(provider, site) {
		if (!confirm("We have to log you out after unlinking a provider; then you can log back in with the other. That OK?")) {
			return;
		}
		await firebase.auth().currentUser.unlink(provider.providerId);
		firebase.auth().currentUser.reload();
		let response =  await fetch('/linkUser.json', {
			method: 'DELETE',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({site})
		});
		let json = await response.json();
		alert("Unlinked");
		firebase.auth().signOut();
		location.href = "/";
    }
	
	let title, text;
	async function save() {
		document.getElementById("save").innerHTML = "Saving...";
		let response =  await fetch('/save.json', {
			method: 'POST',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({title:title,text:text})
		});
		let json = await response.json();
		console.log("save", json);
		document.getElementById("save").innerHTML = "Save to GitHub";
		if (json.success) {
			alert("saved!");
			window.location.reload();
		} else {
			alert("save error!");
		}
	}

	async function doDelete(event) {
		let response =  await fetch('/save.json', {
			method: 'DELETE',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({slug:event.target.id})
		});
		let json = await response.json();
		console.log("delete", json);
		window.location.reload();
	}

</script>

<svelte:head>
	<title>My NoDB</title>
</svelte:head>

<h2>My Account</h2>

<b>Name</b> {user.name}
<b>Email</b> {user.email}
<b>GitHub</b> {user.github || 'n/a'}

{#if user.identities.includes("google.com")}
	{#if user.identities.includes("github.com")}
		<button style="float:right;" on:click={unlinkGitHub}>Unlink GitHub</button>
	{:else}
		<button style="float:right;" on:click={linkGitHub}>Link GitHub</button>
	{/if}
{/if}

{#if user.identities.includes("github.com")}
	{#if user.identities.includes("google.com")}
		<button style="float:right;" on:click={unlinkGoogle}>Unlink Google</button>
	{:else}
	<button style="float:right;" on:click={linkGoogle}>Link Google</button>
	{/if}
{/if}

<hr/>
<h3>New Example</h3>
<label for="title">Title</label>
<input id="title" bind:value={title}>
<br/>
<textarea id="text" cols=80 rows=8 placeholder="text" bind:value={text}></textarea>
<br/>
<button id="save" on:click={save}>Save to GitHub</button>

<h2>My Examples</h2>
<ul>
{#each examples as example}
	<li><a href="/examples/{example.slug}">{example.slug}</a> <button id={example.slug} style="float:right;" on:click={doDelete}>🗑️</button></li>
{/each}
</ul>
