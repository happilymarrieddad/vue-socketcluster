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

### 1) Copy contents of folder to your machine
### 2) install modules
``` bash
npm i
```
### 3) Run application
``` bash
node server.js
```
### 4) Navigate to localhost:3000 in your browser


## Vue-Socketcluster - Config
``` js
Vue.use(VueSocketcluster,{
	hostname: String - Defaults to the current host (ready from the URL).
	secure: Boolean - Defaults to false
	port: Number - Defaults to 80 if !secure otherwise defaults to 443.
	path: String - The URL which SC uses to make the initial handshake for the WebSocket. Defaults to '/socketcluster/'.
	query: Object - A map of key-value pairs which will be used as query parameters for the initial HTTP handshake which will initiate the WebSocket connection.
	ackTimeout: Number (milliseconds) - This is the timeout for getting a response to a SCSocket emit event (when a callback is provided).
	autoReconnect: Boolean - Whether or not to automatically reconnect the socket when it loses the connection.
	autoReconnectOptions: Object - Valid properties are: initialDelay (milliseconds), randomness (milliseconds), multiplier (decimal; default is 1.5) and maxDelay (milliseconds).
	multiplex: Boolean - Defaults to true; multiplexing allows you to reuse a socket instead of creating a second socket to the same address.
	timestampRequests: Boolean - Whether or not to add a timestamp to the WebSocket handshake request.
	timestampParam: String - The query parameter name to use to hold the timestamp.
	authEngine: Object - A custom engine to use for storing and loading JWT auth tokens on the client side.
	authTokenName: String - The name of the JWT auth token (provided to the authEngine - By default this is the localStorage variable name); defaults to 'socketCluster.authToken'.
	binaryType: String - The type to use to represent binary on the client. Defaults to 'arraybuffer'.
	rejectUnauthorized: Boolean - Set this to false during debugging - Otherwise client connection will fail when using self-signed certificates.
})
```
### Example
``` js
Vue.use(VueSocketcluster,{
	hostname: 'securedomain.com',
	secure: true,
	port: 443,
	rejectUnauthorized: false // Only necessary during debug if using a self-signed certificate
})
```

## Vue-Socketcluster - Sockets attribute
The sockets attributes are essentially channels. If you name an attribute test and then emit to test, the function associated with test will fire.

## Calling from a component
``` js
Vue.component('my-component',Vue.extend({
	data() {
		return {

		}
	},
	ready() {
		this.$root.$sc.emit('pong')
	}
}
}))
```