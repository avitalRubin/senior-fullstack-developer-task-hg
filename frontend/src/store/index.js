import { createStore } from "vuex"
import axios from "axios"
import router from '../router'

export default createStore({
	state: {
		user: null
	},
	getters: {
		user: (state) => state.user,
	},
	mutations: {
		SetUser(state, user) {
        	state.user = user;
        },
	},
	actions: {
		async UserLogin({ getters, commit }, data) {
			try {
				 const user_id = data.user_id;
            const result = await axios.post(
                `/api/users/login/${user_id}`,
                data
            );
            commit('SetUser', result.data);
			router.push({
				path: "/home",
				query: { username: user_id }
				})
			} catch (error) {
				console.log('66')
				console.log(error)
				commit('SetUser', null);
				throw error
			}
        },
	},
	modules: {
		// Define your modules here
	},
})
