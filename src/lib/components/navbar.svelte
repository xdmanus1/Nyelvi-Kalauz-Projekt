<script lang="ts">
	import { AppBar, AppShell, LightSwitch, Avatar } from '@skeletonlabs/skeleton';

	let isOpen = false;

	function toggleMenu() {
		isOpen = !isOpen;
	}

	// This would typically come from your auth state
	const isLoggedIn = false;
	const userAvatar = '/path/to/user/avatar.jpg';
</script>

<AppShell>
	<svelte:fragment slot="header">
		<AppBar>
			<svelte:fragment slot="lead">
				<strong class="text-xl uppercase">Logo</strong>
			</svelte:fragment>
			<svelte:fragment slot="default">
				<nav class="hidden md:block">
					<ul class="flex justify-center space-x-4">
						<li><a href="/" class="variant-ghost-surface btn btn-sm">Home</a></li>
						<li><a href="/products" class="variant-ghost-surface btn btn-sm">Products</a></li>
						<li><a href="/about" class="variant-ghost-surface btn btn-sm">About</a></li>
					</ul>
				</nav>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<LightSwitch />
				{#if isLoggedIn}
					<Avatar src={userAvatar} width="w-10" rounded="rounded-full" />
				{:else}
					<button class="variant-ghost-surface btn btn-sm"> asd2 </button>
				{/if}
				<button class="variant-ghost-surface btn btn-sm md:hidden" on:click={toggleMenu}>
					asd
				</button>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
</AppShell>

{#if isOpen}
	<nav class="bg-surface-100-800-token fixed inset-0 z-50 flex items-center justify-center">
		<div class="flex flex-col space-y-4">
			<a href="/" class="variant-ghost-surface btn btn-lg" on:click={toggleMenu}>Home</a>
			<a href="/products" class="variant-ghost-surface btn btn-lg" on:click={toggleMenu}>Products</a
			>
			<a href="/about" class="variant-ghost-surface btn btn-lg" on:click={toggleMenu}>About</a>
			{#if isLoggedIn}
				<button class="variant-ghost-surface btn btn-lg" on:click={toggleMenu}>Profile</button>
			{:else}
				<button class="variant-ghost-surface btn btn-lg" on:click={toggleMenu}>Login</button>
			{/if}
		</div>
	</nav>
{/if}
