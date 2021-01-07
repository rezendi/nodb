<script lang="ts">
	import { stores } from '@sapper/app';
	const { session } = stores();

	export let segment: string;

	import firebase from 'firebase/app';
	import 'firebase/auth';

	import Overlay from 'svelte-overlay';

	let loggedIn;
	import { onMount } from 'svelte';
	onMount(async () => {
		var firebaseConfig = {
			// TODO: Firebase config goes here
			apiKey: "",
			authDomain: "",
			databaseURL: "",
			projectId: "",
			storageBucket: "",
			messagingSenderId: "",
			appId: "",
			measurementId: ""
		};
		firebase.initializeApp(firebaseConfig);

		firebase.auth().onAuthStateChanged(async (user) => {
			console.log("auth state change");
			if (user) {
				console.log("logging in server");
				let token = await user.getIdToken(false)
				let response =  await fetch('/session.json', {
					method: 'POST',
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ token })
				});
				let json = await response.json();
				if (json.success) {
					$session.sUser = json.sUser;
				} else {
					alert("Login error");
				}
				loggedIn = true;
			} else {
				console.log("logout state change");
				if ($session.test_mode) {
					return;
				}
				let response =  await fetch('/session.json', {
					method: 'DELETE',
					headers: { "Content-Type": "application/json" },
				});
				let json = await response.json();
				if (json.success) {
					$session.sUser = {};
				} else {
					alert("Logout error");
				}
				loggedIn = false;
			}
		});
	});

	async function loginWithGoogle() {
		var provider = new firebase.auth.GoogleAuthProvider();
		return login(provider, "google.com");
	}
	async function loginWithGitHub() {
		var provider = new firebase.auth.GithubAuthProvider();
		provider.addScope('public_repo');
		return login(provider, "github.com");
	}
	async function login(provider, site) {
		let result = null;
		try {
			result = await firebase.auth().signInWithPopup(provider);
			if (site=="github.com") {
				let response =  await fetch('/linkUser.json', {
					method: 'POST',
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({result, ...{site:site}})
				});
				let json = await response.json();
				if (json.success === false) {
					alert("GitHub credential add error");
				}
			}
		} catch(error) {
			console.log('auth error code', error.code);
			console.log('auth error message', error.message);
			console.log('auth error email', error.email);
			console.log('auth error credential', error.credential);
			if (error.code=="auth/account-exists-with-different-credential") {
				alert(`An account already exists with the email address ${error.email} -- log in the other way and then link your ${site} account from My Scrylines`);
			} else {
				alert(`Signin error: ${error.message}`);
			}
		}
	}

	async function loginTestMode() {
		let response =  await fetch('/test.json', {
			method: 'POST',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ login:true })
		});
		loggedIn=true;
		console.log("login with test mode");
	}

	function goToMy() {
		location.href = "/my";
	}

	function logout() {
		firebase.auth().signOut();
		location.href = "/";
	}

	function newLine() {
		window.location.href="/lines/new";
	}

</script>

<style>
	nav {
		border-bottom: 1px solid rgba(255,62,0,0.1);
		font-weight: 300;
		padding: 0 1em;
	}

	ul {
		margin: 0;
		padding: 0;
		display:flex;
	}

	/* clearfix */
	ul::after {
		content: '';
		display: block;
		clear: both;
	}

	li {
		display: block;
		float: left;
	}

	button {
		padding:10px;
		width:5rem;
		align-items: center;
		margin:10px 0px 10px 0px;
	}

	.loginButtons button {
		border: 0px;
		margin:0px;
	}

	[aria-current] {
		position: relative;
		display: inline-block;
	}

	[aria-current]::after {
		position: absolute;
		content: '';
		width: calc(100% - 1em);
		height: 2px;
		background-color: #4557bb;
		display: block;
		bottom: -1px;
	}

	a {
		text-decoration: none;
		padding: 1em 0.5em;
		display: block;
	}
</style>

<nav>
	<ul>
		<li><a aria-current="{segment === undefined ? 'page' : undefined}" href="/">Home</a></li>
		<li><a aria-current="{segment === 'about' ? 'page' : undefined}" href="about">About</a></li>
		<li class="spacer">&nbsp;</li>
		<li>
			{#if loggedIn}
				<Overlay closeOnClickOutside>
					<button slot="parent" class="defaultButton" let:toggle on:click={toggle}>My &#x25BC;</button>
					<div slot="content" class="loginButtons" let:close>
						<button on:click={goToMy}>NoDB</button>
						<button class="defaultButton" on:click={logout}>Logout</button>
					</div>
				</Overlay>
				<button id="new_line" class="defaultButton" on:click={goToMy}>New</button>
			{:else}
				<Overlay closeOnClickOutside>
					<button slot="parent" class="defaultButton" let:toggle on:click={toggle}>Login &#x25BC;</button>
					<div slot="content" class="loginButtons" let:close>
						<button on:click={loginWithGoogle}>Google</button>
						<button on:click={loginWithGitHub}>GitHub</button>
					</div>
				</Overlay>
			{/if}
		</li>
	</ul>
</nav>
