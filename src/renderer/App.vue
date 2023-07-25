<script setup lang="ts">
import PlayerStatus from "./components/PlayerStatus.vue";
</script>

<template>
    <nav class="menu">
        <router-link to="/">Recently scrobbled</router-link>
        <router-link to="/pending">Pending</router-link>
        <router-link to="/settings">Settings</router-link>
    </nav>
    <main>
        <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
                <!-- <div class="component-wrapper"> -->
                <component :is="Component" />
                <!-- </div> -->
            </transition>
        </router-view>
    </main>

    <PlayerStatus />
</template>

<style lang="less">
@import "@/assets/vars.less";

div#app {
    box-sizing: border-box;
    padding: 10px;
    padding-bottom: 0;

    display: grid;
    flex-direction: row;
    height: 100vh;
    width: 100vw;

    grid-template-columns: auto 1fr;
    grid-template-rows: 1fr auto;

    // align-items: stretch;
    gap: 10px;

    background-color: @bgd;
    & > * {
        background-color: @bg;
        border-radius: 10px;
    }
}

nav {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    overflow: hidden;
    font-weight: 500;
    font-size: 18px;

    a {
        display: flex;
        padding: 10px;
        text-decoration: none;
        color: @text;
        transition: all 0.3s ease;

        &:hover {
            background-color: @bgl;
        }

        &.router-link-active {
            background-color: @hl;
            color: @bgl;
        }
    }
}

main {
    position: relative;

    .component-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter-from {
    transform: translate(0, -50%);
    opacity: 0;
}

.fade-leave-to {
    transform: translate(0, 50%);
    opacity: 0;
}
</style>
