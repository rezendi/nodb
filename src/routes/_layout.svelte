<script lang="ts">
	import Nav from '../components/Nav.svelte';
	export let segment: string;
</script>

<style>
	main {
		position: relative;
		max-width: 56em;
		background-color: #f0f0f0;
		padding: 1rem;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>

<Nav {segment}/>

<main>
	<slot></slot>
</main>