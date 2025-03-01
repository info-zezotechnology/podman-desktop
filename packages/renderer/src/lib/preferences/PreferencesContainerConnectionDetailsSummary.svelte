<script lang="ts">
import type { IProviderConnectionConfigurationPropertyRecorded } from './Util';
import type { ProviderContainerConnectionInfo } from '../../../../main/src/plugin/api/provider-info';
import { filesize } from 'filesize';
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import type { ContainerProviderConnection } from '@podman-desktop/api';
import Donut from '/@/lib/donut/Donut.svelte';
import { PeerProperties } from './PeerProperties';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let providerInternalId: string | undefined = undefined;
export let containerConnectionInfo: ProviderContainerConnectionInfo | undefined = undefined;

let tmpProviderContainerConfiguration: IProviderConnectionConfigurationPropertyRecorded[] = [];
$: Promise.all(
  properties.map(async configurationKey => {
    return {
      ...configurationKey,
      value: configurationKey.id
        ? await window.getConfigurationValue(
            configurationKey.id,
            containerConnectionInfo as unknown as ContainerProviderConnection,
          )
        : undefined,
      connection: containerConnectionInfo?.name || '',
      providerId: providerInternalId || '',
    };
  }),
).then(value => (tmpProviderContainerConfiguration = value.flat()));

$: providerContainerConfiguration = tmpProviderContainerConfiguration.filter(
  configurationKey => configurationKey.value !== undefined,
);
</script>

<div class="h-full bg-zinc-900">
  {#if containerConnectionInfo}
    {@const peerProperties = new PeerProperties()}
    <div class="flex pl-8 py-4 flex-col w-full text-sm">
      <div class="flex flex-row mt-5">
        <span class="font-semibold min-w-[150px]">Name</span>
        <span aria-label="{containerConnectionInfo.name}">{containerConnectionInfo.name}</span>
      </div>
      {#each providerContainerConfiguration as connectionSetting}
        <div class="flex flex-row mt-5">
          <span class="font-semibold min-w-[150px]">{connectionSetting.description}</span>
          {#if connectionSetting.format === 'cpu' || connectionSetting.format === 'cpuUsage'}
            {#if !peerProperties.isPeerProperty(connectionSetting.id)}
              {@const peerValue = peerProperties.getPeerProperty(connectionSetting.id, providerContainerConfiguration)}
              <Donut title="{connectionSetting.description}" value="{connectionSetting.value}" percent="{peerValue}" />
            {/if}
          {:else if connectionSetting.format === 'memory' || connectionSetting.format === 'memoryUsage' || connectionSetting.format === 'diskSize' || connectionSetting.format === 'diskSizeUsage'}
            {#if !peerProperties.isPeerProperty(connectionSetting.id)}
              {@const peerValue = peerProperties.getPeerProperty(connectionSetting.id, providerContainerConfiguration)}
              <Donut
                title="{connectionSetting.description}"
                value="{filesize(connectionSetting.value)}"
                percent="{peerValue}" />
            {/if}
          {:else}
            <span>{connectionSetting.value}</span>
          {/if}
        </div>
      {/each}
      <div class="flex flex-row mt-5">
        <span class="font-semibold min-w-[150px]">Endpoint</span>
        <span aria-label="{containerConnectionInfo.endpoint.socketPath}"
          >{containerConnectionInfo.endpoint.socketPath}</span>
      </div>
    </div>
  {/if}
</div>
