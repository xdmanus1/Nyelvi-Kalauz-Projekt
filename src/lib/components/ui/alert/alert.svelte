<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { type Variant, alertVariants } from "./index.js";
	import { cn, flyAndScale } from "$lib/utils.js";
	import { scale } from "svelte/transition";

	type $$Props = HTMLAttributes<HTMLDivElement> & {
		variant?: Variant;
	};

	let className: $$Props["class"] = undefined;

	export let variant: $$Props["variant"] = "default";
	export { className as class };
</script>

<div class={cn(alertVariants({ variant }), className)} {...$$restProps} role="alert"  transition:flyAndScale={{ duration: 600, x: 400, start: 0.2 }}>
	<slot />
</div>
