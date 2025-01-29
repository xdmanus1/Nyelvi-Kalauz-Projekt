<script lang="ts">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import { User } from "lucide-svelte";
  import LogOut from "lucide-svelte/icons/log-out";
  import { username } from './stores/user';
	import { Button } from "./ui/button";
	import { Avatar } from "./ui/avatar";
	import { AvatarFallback } from "./ui/avatar";
  import { loggedIn } from './stores/loggedInStores';
	import { goto } from "$app/navigation";

  let isusername: string;
	$: $username, isusername = $username; // React to store updates
	
  function getInitials(name: string) {
		if (!name) return '';
		return name
			.split(' ')
			.map((part) => part[0].toUpperCase()) // Take the first letter of each word
			.join(''); // Combine them
	}
	$: initials = getInitials(isusername);

  function logout(){
    loggedIn.set(false);
  }
  function profile(){
    goto("/Profile")
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <div class="border-2 border-black bg-white p-1 rounded-full">
    <Avatar class="z-10 font-bold h-12 relative mx-auto flex items-center justify-center w-full rounded-full 
             bg-white p-4 text-xs uppercase text-black tracking-wide md:p-6 md:text-base 
             transition duration-300 ease-in-out hover:bg-black hover:text-white focus:outline-none">
      <AvatarFallback>
      {initials}
      </AvatarFallback>
    </Avatar>
    </div>
   </DropdownMenu.Trigger>
   <DropdownMenu.Content>
     <DropdownMenu.Group>
    <DropdownMenu.Item on:click={profile} class="cursor-pointer">
      <User class="mr-2 h-6 w-6" />
      <span>Profile</span>
    </DropdownMenu.Item>
    <DropdownMenu.Item on:click={logout} class="cursor-pointer">
      <LogOut class="mr-2 h-6 w-6 text-red-500" />
      <span class="text-red-500">Log Out</span>
    </DropdownMenu.Item>
   </DropdownMenu.Group>
  </DropdownMenu.Content>
 </DropdownMenu.Root>