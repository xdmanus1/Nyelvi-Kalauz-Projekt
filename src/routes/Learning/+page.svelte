<script>
  import * as Dialog from "$lib/components/ui/dialog";
  import { fly } from "svelte/transition";

  let isOpen = false;
</script>

<Dialog.Root bind:open={isOpen}>
  <Dialog.Trigger>Open Dialog</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    {#if isOpen}
      <div transition:fly={{ duration: 300, x: -10 }}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Dialog Title</Dialog.Title>
            <Dialog.Description>
              This is a description of the dialog content.
            </Dialog.Description>
          </Dialog.Header>
          <!-- Additional dialog content goes here -->
        </Dialog.Content>
      </div>
    {/if}
  </Dialog.Portal>
</Dialog.Root>
