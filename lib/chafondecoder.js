/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const Raddec = require('raddec');


/**
 * ChafonDecoder Class
 * Decodes serial data streams from one or more Chafon readers.
 */
class ChafonDecoder {

  /**
   * ChafonDecoder constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    this.barnowl = options.barnowl;
  }

  /**
   * Handle data from a given reader, specified by the origin
   * @param {String} data The serial data as a hexadecimal string.
   * @param {String} origin The unique origin identifier of the reader.
   * @param {Number} time The time of the data capture.
   * @param {Object} decodingOptions The packet decoding options.
   */
  handleSerialData(data, origin, time, decodingOptions) { // TODO: use constants
    let self = this;

    let isInventory = ((data.length === 25) &&
                       (data.readUInt8() === 0xcf) &&
                       (data.readUInt8(1) !== 0xff) &&
                       (data.readUInt16BE(2) === 0x0001));

    if(isInventory) {
      let length = data.readUInt8(4);
      let isStatusSuccess = (data.readUInt8(5) === 0x00);

      if(isStatusSuccess) {
        let rssi = (data.readInt16BE(6) - 0x3ff) / 10; // TODO: check!?!
        let epcLength = data.readUInt8(10);
        let epc = data.toString('hex', 11, 11 + epcLength);

        let raddec = new Raddec({ transmitterId: epc,
                                  transmitterIdType: 5 });
        raddec.addDecoding({ receiverId: "cfcfcfcfcfcf", // TODO: reader id?
                             receiverIdType: 3,
                             rssi: rssi });

        self.barnowl.handleRaddec(raddec);
      }
    }
  }
}


module.exports = ChafonDecoder;
