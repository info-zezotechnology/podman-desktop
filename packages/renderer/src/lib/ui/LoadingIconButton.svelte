<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type { IConnectionStatus } from '../preferences/Util';
import LoadingIcon from './LoadingIcon.svelte';
import Tooltip from './Tooltip.svelte';
import { capitalize } from './Util';

export let action: string;
export let icon: IconDefinition;
export let state: IConnectionStatus | undefined;
export let leftPosition: string;
export let clickAction: () => Promise<void> | void;

$: disable =
  state?.inProgress ||
  (action === 'start' && state?.status !== 'stopped') ||
  (action === 'restart' && state?.status !== 'started') ||
  (action === 'stop' && state?.status !== 'started') ||
  (action === 'delete' && state?.status !== 'stopped' && state?.status !== 'unknown');

$: loading = state?.inProgress && action === state?.action;

function getStyleByState(state: IConnectionStatus | undefined, action: string) {
  if (
    (action === 'start' && (state?.inProgress || state?.status !== 'stopped')) ||
    ((action === 'stop' || action === 'restart') && (state?.inProgress || state?.status !== 'started')) ||
    (action === 'delete' && (state?.inProgress || (state?.status !== 'stopped' && state?.status !== 'unknown')))
  ) {
    return 'text-gray-900 cursor-not-allowed';
  } else {
    return 'hover:text-gray-700';
  }
}
</script>

<Tooltip tip="{capitalize(action)}" bottom>
  <button
    aria-label="{capitalize(action)}"
    class="mx-2.5 my-2 {getStyleByState(state, action)}"
    on:click="{clickAction}"
    disabled="{disable}">
    <LoadingIcon
      icon="{icon}"
      loadingWidthClass="w-6"
      loadingHeightClass="h-6"
      positionTopClass="top-1"
      positionLeftClass="{leftPosition}"
      loading="{loading}" />
  </button>
</Tooltip>
