/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


// Constants
const PROTOCOL = 'serial';
const BAUDRATE = 115200;
const AUTO_PATH = 'auto';
const AUTO_MANUFACTURER = 'CFUSB_HID';


/**
 * SerialListener Class
 * Listens for reel data on a UDP port.
 */
class SerialListener {

  /**
   * SerialListener constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};
    let self = this;
    let path = options.path || AUTO_PATH;

    this.decoder = options.decoder;
    this.decodingOptions = options.decodingOptions || {};

    openSerialPort(path, (err, serialPort, path) => {
      if(err) {
        return console.log('barnowl-chafon: error opening serial port',
                           err.message);
      }
      self.serialPort = serialPort;
      self.path = path;
      handleSerialEvents(self);
    });
  }
}


/**
 * Handle events from the serial port.
 * @param {SerialListener} instance The SerialListener instance.
 */
function handleSerialEvents(instance) {
  instance.serialPort.on('data', (data) => {
    let origin = instance.path;
    let time = new Date().getTime();
    instance.decoder.handleSerialData(data, origin, time,
                                      instance.decodingOptions);
  });
  instance.serialPort.on('close', () => {
    console.log('barnowl-chafon: serial port closed');
  });
  instance.serialPort.on('error', (err) => {
    console.log('barnowl-chafon: serial port error', err.message);
  });
}


/**
 * Open the serial port based on the given path.
 * @param {String} path Path to serial port, ex: /dev/ttyUSB0 or auto.
 * @param {function} callback The function to call on completion.
 */
function openSerialPort(path, callback) {
  const { SerialPort } = require('serialport');
  let serialPort;

  if(path === AUTO_PATH) {
    let detectedPath;
    SerialPort.list().then(ports => {
      ports.forEach(port => {
        if(port.manufacturer === AUTO_MANUFACTURER) {
          serialPort = new SerialPort({ path: port.path, baudRate: BAUDRATE },
                                      (err) => {
            console.log('barnowl-chafon: auto serial path: \"' + port.path +
                        '\" was selected');
            return callback(err, serialPort, port.path);
          });
        }
        else if(port.manufacturer) {
          console.log('barnowl-chafon: alternate serial path: \"' +
                      port.path + '\" is a ' + port.manufacturer +
                      'device.');
        }
      });
      if(!serialPort) {
        return callback( { message: "Can't auto-determine serial port" } );
      }
    });
  }
  else {
    serialPort = new SerialPort({ path: path, baudRate: BAUDRATE }, (err) => {
      return callback(err, serialPort, path);
    });
  }
}


module.exports = SerialListener;
