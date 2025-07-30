<template>
	<nav class="navbar">
		<router-link to="/" class="hover:text-gray-300">Login</router-link>
		<router-link to="/home" class="hover:text-gray-300">Home</router-link>
		<router-link to="/admin" v-if="canAccess(['Admin'])" class="hover:text-gray-300">Admin</router-link>
		<router-link to="/editor" v-if="canAccess(['Admin', 'Editor'])" class="hover:text-gray-300">Editor</router-link>
	</nav>
</template>
<script setup>
import { useStore } from 'vuex'
import { computed} from 'vue'


const store = useStore()

const user = computed(() => store.getters.user)

const canAccess = (requiredRoles) => {
	return user.value.roles.some(role => requiredRoles.includes(role))
}
</script>
<style scoped>
.navbar {
	display: flex;
	justify-content: space-between;
	width: 250px;
	margin: 0 auto;
}
</style>
