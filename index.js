'use strict';

var DiscontinuousRange = require('discontinuous-range');

var headerByteCount = 9;

class DatagramView {

	constructor(message, key, datagramMaxSize) {
		this.message = message;
		this.key = key;
		this.datagramMaxSize = datagramMaxSize;
		this.payloadMaxSize = datagramMaxSize - headerByteCount;
		if (0 === message.length % this.payloadMaxSize) {
			this.numberOfDatagrams = Math.floor(message.length / this.payloadMaxSize);
		} else {
			this.numberOfDatagrams = Math.floor(message.length / this.payloadMaxSize) + 1;
		}
	}

	getDatagram(index) {
		var start = index * this.payloadMaxSize;
		var end = Math.min(start + this.payloadMaxSize, this.message.length);

		var datagram = new Buffer(9 + end - start);

		datagram[0] = this.key;

		var _offset = start;
		var messageLength = this.message.length;
		for (var i = 0; i < 4; i++) {
			// write offset
			datagram[1 + i] = _offset & 255;
			_offset = _offset >> 8;
			// write message length
			datagram[5 + i] = messageLength & 255;
			messageLength = messageLength >> 8;
		}

		this.message.copy(datagram, 9, start, end);

		return datagram;
	}
}

class MessageBuilder {

	constructor(messageLength, messageManager, onComplete) {
		this.remainingIndices = new DiscontinuousRange(0, messageLength);
		this.buffer = new Buffer(messageLength);
		this.messageManager = messageManager;
		this.onComplete = onComplete;
	}

	insert(datagram, bufferOffset) {
		var addedLength = datagram.length - 9;
		var insertedRange = new DiscontinuousRange(bufferOffset, bufferOffset + addedLength);
		this.remainingIndices.subtract(insertedRange);
		datagram.copy(this.buffer, bufferOffset, 9, datagram.length);
		if (0 === this.remainingIndices.ranges.length) {
			this.onComplete(this.messageManager, this.buffer);
		}
	}
}

class MessageManager {
	
	constructor(onMessage) {
		this.builders = {};
		this.onMessage = onMessage;
	}

	getDatagramHeader(datagram) {
		if (datagram.length <= headerByteCount) { return null; }

		var offset = 0;
		var messageLength = 0;

		for (var i = 4; 0 <= i; --i) {
			// read offset
			offset <<= 8;
			offset += datagram[1 + i];
			// read message length
			messageLength <<= 8;
			messageLength += datagram[5 + i];
		}

		return {
			key: datagram[0],
			offset: offset,
			messageLength: messageLength
		}
	}

	processDatagram(datagram) {
		var header = this.getDatagramHeader(datagram);

		if (null === header) {
			throw 'invalid datagram'
		}
		
		var key = header.key;

		if (!(key in this.builders)) {
			var onComplete = function(messageManager, buffer) {
				console.log('Received last message with key ' + header.key);
				messageManager.onMessage(buffer);
				delete messageManager.builders[key];
			}
			console.log('Received first message with key ' + header.key);
			this.builders[key] = new MessageBuilder(header.messageLength, this, onComplete);
		}

		var builder = this.builders[key];

		builder.insert(datagram, header.offset);
	}
}

module.exports = {
	DatagramView: DatagramView,
	MessageManager: MessageManager
};
