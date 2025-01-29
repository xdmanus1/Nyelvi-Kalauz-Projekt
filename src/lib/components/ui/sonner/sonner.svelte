<script lang="ts">
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";
	import { mode } from "mode-watcher";

	type $$Props = SonnerProps;
</script>

<Sonner
	theme={$mode}
	class="toaster group"
	toastOptions={{
		classes: {
			toast: `
				group toast
				group-[.toaster]:bg-background
				group-[.toaster]:text-foreground
				group-[.toaster]:border-border
				group-[.toaster]:shadow-lg
				[--success-bg:hsl(138_76%_97%)]
				[--success-border:hsl(139_65%_92%)]
				[--success-text:hsl(140_62%_26%)]
				[--error-bg:hsl(0_100%_97%)]
				[--error-border:hsl(0_93%_94%)]
				[--error-text:hsl(0_84%_31%)]
			`,
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
		},
	}}
	{...$$restProps}
/>