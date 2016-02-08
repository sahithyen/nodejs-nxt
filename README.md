# nodejs-nxt

nodejs-nxt is a Node.js package to control the LEGO MINDSTORMS NXT with an USB cable or a Bluethooth connection.

## How I did it

I used the official communication protocol, which communicates with the nxt over its serial port. You can find the documentation  [here](http://www.lego.com/en-us/mindstorms/downloads).

## How to install

Nodejs-nxt could be installed with a simple

```sh
$ npm install nodejs-nxt
```

## Usage example

The following example code connects with the NXT through the serial port '/dev/tty.NXT-DevB', plays a tone with 1000 Hz for 2 seconds and then disconnects.

```javascript
var nxt = require('nodejs-nxt');
var nxt0 = new nxt.NXT('/dev/tty.NXT-DevB', true);

nxt0.Connect(function (error) {
    if (error) {
        console.log('Could not connect to the device!');
        return;
    }
    
    nxt0.PlayTone(1000, 2000, function (error) {
        if (error) {
            console.log('Could not play the tone!');
            return;
        }
        
        nxt0.Disconnect();
    });
});
```

## Dependancy

Nodejs-nxt needs the package [node-serialport](https://www.npmjs.com/package/serialport) to communicate with the nxt.

## Known bugs

 - The ultrasonic-sensor doesn't work yet
 - Not waiting for the previous command to be finished is critical

## To do

 - Fix bugs (see above)
 - API documentation
 - Add system commands
 - Add another layer of functions for ease of use

## License

GPLv3
