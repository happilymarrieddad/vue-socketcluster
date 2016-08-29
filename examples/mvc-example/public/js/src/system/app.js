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
	if (transition.to.auth && router.app.$sc.authState != 'authenticated') {
		router.app.loading = false
		transition.redirect('/session/create')
	} else if (router.app.$sc.authState == 'authenticated' && !transition.to.auth) {
		router.app.loading = false
		transition.redirect('/dashboard')
	} else {
		transition.next()
	}
})

router.afterEach(function(transition) {
	setTimeout(function() {
		router.app.loading = false
	},router.app.loading_delay)
})

router.start(Vue.extend({
	data() {
		return {
			loading_delay:20,
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
			this.setUserData()
			if (val) { router.go({ path:'/dashboard' }) }
			else { router.go({ path:'/session/create' }) }
		}
	},
	methods:{
		setUserData() {
			var vm = this
			var authToken = vm.$sc.getAuthToken() || {}
			vm.first = authToken.first
			vm.last = authToken.last
			vm.email = authToken.email
		},
		alert(msg,type) {
			var vm = this
			try {
				vm[type+'_msg'] = msg
				vm['show_'+type] = true
				setTimeout(function() {
					vm[type+'_msg'] = null
				},3000)
			}catch(err) { console.log(err) }
		},
		logout() {
			var vm = this
			vm.$root.$sc.emit('session',{
				method:'destroy'
			},function(err) {
				if (err) { console.log(err);return vm.$root.alert(err,'error') }
			})
		}
	},
	sockets:{
		connect(status) {
			var vm = this

			console.log('Connected to server!')
			vm.$sc.on('authStateChange',function(status) {
				if (status.newState == 'authenticated') {
					vm.authenticated = true
				} else {
					vm.authenticated = false
				}
			})
		}
	},
	components:{
		alert:VueStrap.alert,
		navbar:VueStrap.navbar
	},
	ready() {
		var vm = this
		vm.started = true
	}
}), '#app')