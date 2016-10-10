<h1 align="center">nodejs-dashboard</h1>

<h4 align="center">
  Telemetry dashboard for node.js apps from the terminal!
</h4>

***

![http://i.imgur.com/FDEsZEC.png](http://i.imgur.com/FDEsZEC.png)

Determine in realtime what's happening inside your node process from the terminal. No need to instrument code to get the deets. Also splits stderr/stdout to help spot errors sooner.

### Install

`npm install nodejs-dashboard --save-dev`

#### Add the reporting module to your code

From within your `index.js` or app entry point simply require the `nodejs-dashboard` module.

```
require("nodejs-dashboard");

```

#### Update your package.json

It's recommended that you create a npm script to launch the dashboard.

```
...
"scripts": {
    "dev": "nodejs-dashboard node index.js"
  }
...
```

#### Launch your app
Once you've completed these steps run from the following from the terminal

```
% npm run dev
```

#### What options does nodejs-dashboard support?

Usage: nodejs-dashboard [options] -- [node] [script] [arguments]
```
Options:

  -h, --help             output usage information
  -V, --version          output the version number
  -p, --port [port]      Socket listener port
  -e, --eventdelay [ms]  Minimum threshold for event loop reporting, default 10ms
```

#####`-port`
Under the hood the dashboard utilizes SocketIO with a default port of `9838`. If this conflicts with an existing service you can optionally change this value.

#####`-eventdelay`
This tunes the minimum threshold for reporting event loop delays. The default value is `10ms`. Any delay below this value will be reported at `0`.
