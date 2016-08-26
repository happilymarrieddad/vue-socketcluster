var router = new VueRouter()

Vue.use(VueRouter)
Vue.use(VueSocketcluster)

router.map({
    '/session/create': { 
    	component:Vue.extend({
		    template: templatizer.session.create({})
		}),auth:false
   	}
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
	},20)
})

router.start(Vue.extend({
	data() {
		return {
			loading:true,
			authenticated:false
		}
	},
	sockets:{
		connect() {
			console.log('Connected to server!')

			var watcher = this.$sc.subscribe('broadcast')
			watcher.watch(function(data) {
				console.log(data)
			})

			this.$sc.emit('session',{method:'index',id:5},function(err,response) {
				console.log(err)
				console.log(response)
			})
		},
		ping() {
			this.$sc.emit('pong')
			this.$sc.emit('ping-with-response',{message:'Hello server!'},function(err,response) {
				console.log(response)
			})
		}
	}
}), '#app')