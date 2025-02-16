<script>
    export let data;
    const app = decodeURIComponent(data.params.slug);
  </script>
  
  <div class="app absolute bg-white text-black w-full h-full items-center justify-center flex flex-col gap-2">
    <h1>Hello Devs {app}</h1>
    <a href="/" class="button">Back</a>
  </div>