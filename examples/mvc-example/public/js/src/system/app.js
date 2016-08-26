var router = new VueRouter()

Vue.use(VueRouter)
Vue.use(VueSocketcluster)

router.map({
    '/session/create': { component : sessionComponent, auth:false },
    '/users/create': { component : usersComponent, auth:false }
})

router.redirect({
	'*':'/session/create'
})

router.beforeEach(function(transition) {
	router.app.loading = true
	if (transition.to.auth && !router.app.authenticated) {
		router.app.loading = false
		transition.redirect('/session/create')
	} else if (router.app.authenticated && !transition.to.auth) {
		router.app.loading = false
		transition.redirect('/')
	} else {
		transition.next()
	}
})

router.afterEach(function(transition) {
	setTimeout(function() {
		router.app.loading = false
	},50)
})

router.start(Vue.extend({
	data() {
		return {
			show_success:false,
			success_msg:'',
			show_error:false,
			error_msg:'',

			loading:true,
			authenticated:false
		}
	},
	methods:{
		alert(msg,type) {
			var vm = this
			try {
				vm[type+'_msg'] = msg
				vm['show_'+type] = true
				setTimeout(function() {
					vm[type+'_msg'] = null
				},3000)
			}catch(err) {}
		}
	},
	sockets:{
		connect() {
			console.log('Connected to server!')
		}
	},
	components:{
		alert:VueStrap.alert
	}
}), '#app')