var router = new VueRouter()

Vue.use(VueRouter)
Vue.use(VueSocketcluster)

router.map({
    '/session/create': { 
    	component:Vue.extend({
		    template: templatizer.session.create({})
		})
   	}
})

router.redirect({
	'*':'/session/create'
})

router.beforeEach(function(transition) {
	transition.next()
})

router.afterEach(function(transition) {

})

router.start(Vue.extend({
	data() {
		return {

		}
	},
	sockets:{
		connect() {
			console.log('Connected to server!')
		},
		ping() {
			this.$sc.emit('pong')
		}
	}
}), '#app')