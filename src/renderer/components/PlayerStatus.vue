<script setup lang="ts">
import { PlayerStatus } from "../../API";
import "../preloaded.d.ts";
import { computed, ref } from "vue";

const status = ref<PlayerStatus | null>(null);
const show = ref(false);

const progress = computed(() => {
    if (status.value == null) return 0;
    const pos = status.value.progress ?? 0;
    const length = status.value.metadata?.["mpris:length"] ?? 1;

    return (pos / length) * 100;
});

window.API.mpris.onStatusChanged((_, s) => {
    if (s === null) show.value = false;
    else {
        show.value = true;
        status.value = s;
    }
});
</script>

<template>
    <div class="player-status" :class="{ active: show }">
        <img :src="status?.metadata?.['mpris:artUrl']" />
        <div class="meta">
            <div class="title">
                {{ status?.metadata["xesam:title"] ?? "Unknown track" }}
            </div>
            <div>
                {{
                    status?.metadata?.["xesam:artist"].join?.(", ") ??
                    status?.metadata?.["xesam:artist"] ??
                    "Unknown artist"
                }}
                - {{ status?.metadata?.["xesam:album"] ?? "Unknown album" }}
            </div>
        </div>
        <div class="prog">
            <div class="full" :style="{ width: `${progress}%` }"></div>
        </div>
    </div>
</template>

<style lang="less">
@import "@/assets/vars.less";

.player-status {
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto auto;

    box-sizing: border-box;
    padding: 0px;

    &.active {
        height: 120px;
        padding: 10px;
    }

    overflow: hidden;
    height: 0;
    transition: height 0.3s ease, padding 0.3s ease;
    grid-column: 1 / 3;

    img {
        justify-self: end;
        overflow: hidden;
        border-radius: 10px;

        aspect-ratio: 1;
        height: 80px;
    }

    .meta {
        padding: 5px;

        .title {
            font-size: 20px;
            font-weight: 500;
        }
    }

    .prog {
        width: 100%;
        height: 4px;
        background-color: @bgd;
        grid-column: 1 / 3;

        .full {
            height: 100%;
            background-color: @hl;
            transition: width 1s linear;
        }
    }
}
</style>
