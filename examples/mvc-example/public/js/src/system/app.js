Vue.use(VueRouter)
Vue.use(VueSocketcluster)

router.map({
	'/dashboard' : { component:dashboardComponent, auth:true },
	'/about' : { component:aboutComponent, auth:true },
    '/session/create': { component : sessionComponent, auth:false },
    '/users/create': { component : usersComponent, auth:false }
})

router.redirect({
	'/':'/dashboard',
	'*':'/dashboard'
})

router.beforeEach(function(transition) {
	router.app.loading = true
	console.log(transition.to.auth)
	console.log(router.app.authenticated)
	if (transition.to.auth && !router.app.authenticated) {
		router.app.loading = false
		transition.redirect('/session/create')
	} else if (router.app.authenticated && !transition.to.auth) {
		router.app.loading = false
		transition.redirect('/dashboard')
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

			started:false,
			loading:true,
			authenticated:false,

			first:'',
			last:'',
			email:''
		}
	},
	watch:{
		authenticated:function(val,oldVal) {
			if (val) { router.go({ path:'/dashboard' }) }
			else { router.go({ path:'/session/create' }) }
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
			}catch(err) { console.log(err) }
		}
	},
	sockets:{
		connect(status) {
			var vm = this
			console.log('Connected to server!')
			if (status.isAuthenticated) {
				vm.authenticated = true
				var authToken = vm.socket.getAuthToken()
				vm.first = authToken.user.first
				vm.last = authToken.user.last
				vm.email = authToken.user.email
			} else {
				vm.authenticated = false
			}
		},
		authenticate() {
			console.log('authenticated')
			this.authenticated = true
		},
		deauthenticate() {
			console.log('deauthenticate')
			this.authenticated = false
		}
	},
	components:{
		alert:VueStrap.alert
	},
	ready() {
		var vm = this
		vm.started = true
	}
}), '#app')