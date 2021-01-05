<script lang="ts">
    import { stores } from '@sapper/app';
	const { session } = stores();

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
			location.href = "/";
			// console.log("result", result);
		} catch(error) {
			console.log('link error code', error.code);
			console.log('link error message', error.message);
			console.log('link error email', error.email);
			console.log('link error credential', error.credential);
			return alert(`Account link error: ${error.message}`);
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
    
	let lines = [];
    let identities = [];
    import { onMount } from 'svelte';
    onMount(async () => {
		if (!$session.sUser.uid) {
			return location.href = "/";
		}
		identities = $session.sUser.identities || [];
		// console.log("identities", identities);
		let response = await fetch('/lines/all/my.json');
		let json = await response.json();
		lines = json.lines;
	});
</script>

<svelte:head>
	<title>My NoDB</title>
</svelte:head>

<h2>My Account</h2>

<b>Name</b> {$session.sUser.name}
<b>Email</b> {$session.sUser.email}
<b>GitHub</b> {$session.sUser.github || 'n/a'}

{#if identities.includes("google.com")}
	{#if identities.includes("github.com")}
		<button style="float:right;" on:click={unlinkGitHub}>Unlink GitHub</button>
	{:else}
		<button style="float:right;" on:click={linkGitHub}>Link GitHub</button>
	{/if}
{/if}

{#if identities.includes("github.com")}
	{#if identities.includes("google.com")}
		<button style="float:right;" on:click={unlinkGoogle}>Unlink Google</button>
	{:else}
		<button style="float:right;" on:click={linkGoogle}>Link Google</button>
	{/if}
{/if}

<hr/>

<h2>My NoDB</h2>

<ul>
</ul>
