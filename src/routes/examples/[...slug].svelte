<script context="module" lang="ts">
	export async function preload( { params }, session ) {

    console.log("slug", params);
    let response;
    if (params.slug.length > 2 && params.slug[0]=="github") {
      console.log("github", params);
      let path = params.slug.splice(1).join("/");
      response = await this.fetch(`/examples/${path}.json`);
    } else {
      response = await this.fetch(`/examples/${params.slug}.json`);
    }
    const data = await response.json();

		if (response.status === 200 && data.success) {
      return { vals:data.example }
		} else {
			this.error(response.status, data.error);
		}
	}
</script>

<script lang="ts">
  export let vals;
</script>

<div class="page">
  <dl>
    <dt><b>Title</b> { vals.title }</dt>
    <dd><b>Text</b> { vals.text }</dd>
  </dl>
</div>
