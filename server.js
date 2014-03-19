var spawn = require('child_process').spawn,
	http = require('http'),
	colors = require('colors'),
	fs = require('fs'),
	SerialPort = require('serialport').SerialPort;

var hosts = {
	list: [],
	sitesDown: [],

	add: function(hostname, title) {
		hosts.list.push({
			hostname: hostname,
			title: title,
			isUp: null
		});
	},

	checkIfUp: function () {
		for (var index in hosts.list) {
			(function(host) {
				var request = http.request({
					host: host.hostname,
					headers: {'user-agent': 'Engage Web Pinger 1.0 (http://enga.ge)'},
					method: 'HEAD',
					port: 80,
					path: '/',
					agent: false
				}, function(response) {
					var statusCodeFirstChar = (typeof(response) != 'undefined') ? response.statusCode.toString().charAt(0) : null;
					if (statusCodeFirstChar != '2' && statusCodeFirstChar != '3') {
						console.log(('!!' + host.hostname + ' is down').red);
						console.log("\t" + 'Status code: ' + response.statusCode);

						if (host.isUp == true || host.isUp === null) {
							hosts.siteDown(host);
						}
						host.isUp = false;
					} else {
						console.log(host.hostname + ' is up');
						console.log("\t" + 'Status code: ' + response.statusCode);

						if (host.isUp == false || host.isUp === null) {
							hosts.siteUp(host);
						}
						host.isUp = true;
					};
				}).on('error', function (error) {
					console.log(host.hostname + ' is down');
					console.log("\t" + error);

					if (host.isUp == true || host.isUp === null) {
						hosts.siteDown(host);
					}
					host.isUp = false;
				});
				request.end();
			})(hosts.list[index]);
		}

		setTimeout(hosts.checkIfUp, 15000);
	},

	siteUp: function (host) {
		// Remove item from array
		for (var i = 0; i < hosts.sitesDown.length; i++) {
			if (hosts.sitesDown[i].hostname == host.hostname) {
				hosts.sitesDown.splice(i, 1);
				break;
			}
		}

		if (hosts.sitesDown.length == 0 && host.isUp != null) {
			say('Wooop! Everything\'s good! Just sit back and relax.');
			sign.stop(false);
			sign.walk(true);
		}
	},

	siteDown: function (host) {
		say('Warning! ' + host.title + ' is down!');

		if (hosts.sitesDown.length <= 0) {
			hosts.sitesDown.push(host);
			sign.blinkStopSign();
			sign.walk(false);
		} else {
			hosts.sitesDown.push(host);
		}
	}
}

var sign = {
	stopStatus: null,
	walkStatus: null,

	blinkStopSign: function() {
		if (sign.stopStatus === null) {
			sign.stopStatus = false;
		}

		if (hosts.sitesDown.length > 0) {
			sign.stop(!sign.stopStatus);
			setTimeout(sign.blinkStopSign, 500);
		} else {
			sign.stop(false);
		}
	},

	stop: function(turnOn) {
		console.log('Turning stop sign ' + (turnOn ? 'on' : 'off'));
		serialPort.write((turnOn ? 1 : 2) + "\n");
		sign.stopStatus = turnOn;
	},

	walk: function(turnOn) {
		console.log('Turning walk sign ' + (turnOn ? 'on' : 'off'));
		serialPort.write((turnOn ? 3 : 4) + "\n");
		sign.walkStatus = turnOn;
	},
};

function say(str) {
	console.log('Say: ' + str);
	spawn('say', ['-v', 'Zarvox', '-r', 170, str]);
}

// Initialize serial port
var serialPort = new SerialPort('/dev/tty.usbserial-A800fcje', {
	baudrate: 9600,
}).on('open', function () {
	hosts.checkIfUp();
});
hosts.checkIfUp();

// Add hosts
fs.exists('./hosts.json', function (exists) {
	if (!exists) {
		console.log('!! Please rename hosts-sample.json to hosts.json and add the hosts that you want to monitor'.red);
		process.exit(1);
	} else {
		var hostsList = require('./hosts.json');

		for (var index in hostsList) {
			var host = hostsList[index];
			hosts.add(host.hostname, host.title);
		}
	}
});