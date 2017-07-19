'use strict';

var sdp = require('../index.js');
var assert = require('chai').assert;

var generateBuffer = function(length) {
    var buffer = Buffer.alloc(length);

    for (var i = 0; i < length; i++) {
        buffer[i] = i % 255;
    }

    return buffer
}

describe('Datagram serialization tests', function() {

    it('should reconstruct tiny message', function() {
        var message = generateBuffer(1);

        var reconstructed = null;

        var manager = new sdp.MessageManager(function (message) {
            reconstructed = message;
        })

        var datagramView = new sdp.DatagramView(message, 0, 20);
        for (var i = 0; i < datagramView.numberOfDatagrams; i++) {
            var datagram = datagramView.getDatagram(i);
            try {
                manager.processDatagram(datagram);
            } catch(error) {
                assert(false, 'should not throw');
            }
        }

        assert.equal(0, Buffer.compare(reconstructed, message), 'reconstructed should be identical to original')
    })

    it('should reconstruct small message', function() {
        var message = generateBuffer(11);

        var reconstructed = null;

        var manager = new sdp.MessageManager(function (message) {
            reconstructed = message;
        })

        var datagramView = new sdp.DatagramView(message, 0, 20);

        assert.equal(1, datagramView.numberOfDatagrams, 'there should not be datagrams that consist of a header');

        for (var i = 0; i < datagramView.numberOfDatagrams; i++) {
            var datagram = datagramView.getDatagram(i);
            try {
                manager.processDatagram(datagram);
            } catch(error) {
                assert(false, 'should not throw');
            }
        }

        assert.equal(0, Buffer.compare(reconstructed, message), 'reconstructed should be identical to original')
    })

    it('should reconstruct medium message', function() {
        var message = generateBuffer(100);

        var reconstructed = null;

        var manager = new sdp.MessageManager(function (message) {
            reconstructed = message;
        })

        var datagramView = new sdp.DatagramView(message, 0, 20);

        for (var i = 0; i < datagramView.numberOfDatagrams; i++) {
            var datagram = datagramView.getDatagram(i);
            try {
                manager.processDatagram(datagram);
            } catch(error) {
                assert(false, 'should not throw');
            }
        }

        assert.equal(0, Buffer.compare(reconstructed, message), 'reconstructed should be identical to original')
    })

    it('should reconstruct large message', function() {
        var message = generateBuffer(5000);

        var reconstructed = null;

        var manager = new sdp.MessageManager(function (message) {
            reconstructed = message;
        })

        var datagramView = new sdp.DatagramView(message, 0, 20);

        for (var i = 0; i < datagramView.numberOfDatagrams; i++) {
            var datagram = datagramView.getDatagram(i);
            try {
                manager.processDatagram(datagram);
            } catch(error) {
                assert(false, 'should not throw');
            }
        }

        assert.equal(0, Buffer.compare(reconstructed, message), 'reconstructed should be identical to original')
    })

    it('should reconstruct large message', function() {
        var message = generateBuffer(5000);

        var reconstructed = null;

        var manager = new sdp.MessageManager(function (message) {
            reconstructed = message;
        })

        var datagramView = new sdp.DatagramView(message, 0, 20);

        for (var i = 0; i < datagramView.numberOfDatagrams; i++) {
            var datagram = datagramView.getDatagram(i);
            try {
                manager.processDatagram(datagram);
            } catch(error) {
                assert(false, 'should not throw');
            }
        }

        message[10] = 1;
        assert.notEqual(0, Buffer.compare(reconstructed, message), 'reconstructed should be identical to original')
    })

    it('should throw on empty datagram', function() {
        var manager = new sdp.MessageManager(function (message) {})
        try {
            manager.processDatagram(generateBuffer(0));
        } catch(error) {
            assert.equal('invalid datagram', error, 'throws correctly on empty datagram');
            return;
        }

        assert(false, 'did not throw on empty datagram')
    })

    it('should throw on datagram smaller than header', function() {
        var manager = new sdp.MessageManager(function (message) {})
        try {
            manager.processDatagram(generateBuffer(8));
        } catch(error) {
            assert.equal('invalid datagram', error, 'throws correctly on datagram smaller than header');
            return;
        }

        assert(false, 'did not throw on datagram smaller than header')
    })

    it('should throw on datagram only header', function() {
        var manager = new sdp.MessageManager(function (message) {})
        try {
            manager.processDatagram(generateBuffer(8));
        } catch(error) {
            assert.equal('invalid datagram', error, 'throws correctly on datagram only header');
            return;
        }

        assert(false, 'did not throw on datagram only header')
    })
})
