<script context="module" lang="ts">
	export async function preload( { params }, session ) {

    let response, path, slug;
    if (params.slug.length > 2 && params.slug[0]=="github") {
      console.log("github", params);
      path = params.slug.splice(1).join("/");
      response = await this.fetch(`${path}.json`);
    } else {
      [path, slug] = params.slug;
      response = await this.fetch(`${path}/${slug}.json`);
    }
    const data = await response.json();

		if (response.status === 200 && data.success) {
      return { vals:data, path:path}
		} else {
			this.error(response.status, data.error);
		}
	}
</script>

<script lang="ts">
  export let path, vals;
</script>

<div class="page">
  {JSON.stringify(vals)}
</div>
