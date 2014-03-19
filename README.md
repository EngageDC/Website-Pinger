# Engage Website Pinger

This little node.js app will ping a list of websites and alert you when any of them are down.

The app will alert using two communication channels:

* Verbally using the built-in `say` command on OS X
* Outputted via a simple serial protocol

We use the serial this to power a walk/stop LED sign through a relay hooked up to a microcontroller. The sign will blink "stop" when any server is down and lighten up "walk" when all websites are up.

## Using

Just take a copy of the `hosts-sample.json` and call the new file `hosts.json`. Here you can add a list of hosts that you want to be monitored.

Now, install node dependencies with `node install` and then run `node server.js` to start the website pinger app.