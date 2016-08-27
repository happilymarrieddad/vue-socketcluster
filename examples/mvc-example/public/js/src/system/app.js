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
			if (val) { 
				this.setUserData()
				router.go({ path:'/dashboard' })
			} else { router.go({ path:'/session/create' }) }
		}
	},
	methods:{
		setUserData() {
			var vm = this
			var authToken = vm.$sc.getAuthToken()
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
				vm.$root.authenticated = false
				//router.go({ path:'/session/create' })
			})
		}
	},
	sockets:{
		connect(status) {
			var vm = this
			console.log('Connected to server!')
			if (vm.$sc.authState == 'authenticated') {
				vm.authenticated = true
				vm.setUserData()
			} else {
				vm.authenticated = false
			}
		},
		authenticate() { this.authenticated = true },
		deauthenticate() { this.authenticated = false }
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