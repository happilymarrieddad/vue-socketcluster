# Vue-Socketcluster.io
Socketcluster implementation for VueJS

## Usage

``` html
<body id='app'>

</body>

<script src='vue-socketcluster.js'></script>
```

## Basic Vue
``` js
Vue.use(VueSocketcluster)

var vue = new Vue({
	el:'#app',
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
})
```

## Vue Router
``` js
var router = new VueRouter()

Vue.use(VueRouter)
Vue.use(VueSocketcluster)

router.map({
    '/session/create': { 
    	component:Vue.extend({
		    template: '<p>Session Create</p>'
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

		},
		ping() {
			this.$sc.emit('pong')
			this.$sc.emit('ping-with-response',{message:'Hello server!'},function(err,response) {
				console.log(response)
			})
		}
	}
}), '#app')
```

# Server-side
``` js
scServer.on('connection', function (socket) {
    console.log('   >> Client',socket.id,'connected at',new Date())

    console.log('ping sent to',socket.id)
    socket.emit('ping')

    socket.on('pong',function() {
        console.log('pong received from',socket.id)
    })

    socket.on('ping-with-response',function(data,respond) {
        console.log(data)
        worker.exchange.publish('broadcast',{message:'Hello from broadcast!'})
        respond(null,{message:'responding..'})
    })
})
```

## How to use examples

1) Copy contents of folder to your machine
2) install modules
``` bash
npm i
```
3) Run application
``` bash
node server.js
```
4) Navigate to localhost:3000 in your browser