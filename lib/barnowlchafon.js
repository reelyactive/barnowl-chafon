/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const EventEmitter = require('events').EventEmitter;
const ChafonDecoder = require('./chafondecoder.js');
const SerialListener = require('./seriallistener.js');
const TestListener = require('./testlistener.js');


/**
 * BarnowlChafon Class
 * Converts Chafon reader data into standard raddec events.
 * @param {Object} options The options as a JSON object.
 */
class BarnowlChafon extends EventEmitter {

  /**
   * BarnowlChafon constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    super();
    options = options || {};
    options.barnowl = this;

    this.listeners = [];
    this.chafonDecoder = new ChafonDecoder({ barnowl: this });
  }

  /**
   * Add a listener to the given hardware interface.
   * @param {Class} ListenerClass The (uninstantiated) listener class.
   * @param {Object} options The options as a JSON object.
   */
  addListener(ListenerClass, options) {
    options = options || {};
    options.decoder = this.chafonDecoder;

    let listener = new ListenerClass(options);
    this.listeners.push(listener);
  }

  /**
   * Handle and emit the given raddec.
   * @param {Raddec} raddec The given Raddec instance.
   */
  handleRaddec(raddec) {
    // TODO: observe options to normalise raddec
    this.emit("raddec", raddec);
  }

  /**
   * Handle and emit the given infrastructure message.
   * @param {Object} message The given infrastructure message.
   */
  handleInfrastructureMessage(message) {
    this.emit("infrastructureMessage", message);
  }
}


module.exports = BarnowlChafon;
module.exports.SerialListener = SerialListener;
module.exports.TestListener = TestListener;
