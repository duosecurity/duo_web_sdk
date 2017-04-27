const Duo = require('../index');
const chai = require('chai');
const assert = chai.assert;

describe('Duo Web', function() {
    describe('init', function() {
        var iframe;
         /* Dummy sig_request, passes validation. */
        var sig_request = 'AUTH|duo_sig:app_sig';

        beforeEach(function() {
            /* Create some document elements that doPostBack expects. */
            iframe = document.createElement('iframe');
            var form = document.createElement('duo_form');
            form.id = 'duo_form';
            document.head.appendChild(iframe);
            iframe.appendChild(form);
        });

        it('Should totes work with submitCallback', function() {
            var submitCallbackCalled = false;
            Duo.init({
                host: 'example.com',
                iframe: iframe,
                sig_request: sig_request,
                submit_callback: function() {
                    submitCallbackCalled = true;
                }
            })

            Duo._doPostBack("Great Success!");
            /* Ensure our callback was called :) */
            assert.isTrue(submitCallbackCalled);
        });

        it('should URI encode the parent URL', function() {
            Duo.init({
                host: 'example.com',
                iframe: iframe,
                sig_request: sig_request
            })

            assert.notInclude(
                iframe.src, 'parent=http://',
                'should URI encode the parent href')
            assert.notInclude(
                iframe.src, 'parent=https://',
                'should URI encode the parent href')
        })
    });

    describe('parseSigRequest', function() {
        it('should return undefined if no token is passed', function() {
            assert.isUndefined(Duo._parseSigRequest());
        });

        it('should throw an error if an error message is passed', function() {
            assert.throws(function() {
                Duo._parseSigRequest('ERR|buttercakes');
            }, 'Duo Web SDK error: buttercakes');
        });

        it('should throw an error if the token is invalid', function() {
            assert.throws(function() {
                Duo._parseSigRequest('AUTH|incomplete');
            }, /Duo was given a bad token/);
        });

        it('should return the parsed sig request if the token is valid(ish)', function() {
            assert.deepEqual(Duo._parseSigRequest('AUTH|foo:bar'), {
                sigRequest: 'AUTH|foo:bar',
                duoSig: 'AUTH|foo',
                appSig: 'bar'
            });
        });
    });

    describe('isDuoMessage', function() {
        beforeEach(function() {
            Duo.init({
                host: 'example.com'
            });
        });

        it('should return true for the correct origin and the correct format', function() {
            assert.isTrue(Duo._isDuoMessage({
                origin: 'https://example.com',
                data: 'AUTH|aaabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+==|aaabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+=='
            }), 'did not parse message format correctly');

            assert.isTrue(Duo._isDuoMessage({
                origin: 'https://example.com',
                data: 'ERR|buttercakes'
            }), 'did not parse error format correctly');
        });

        it('should fail messages that aren\'t AUTH or ENROLL', function() {
            assert.isFalse(Duo._isDuoMessage({
                origin: 'https://example.com',
                data: 'buttercakes|foo|bar'
            }));
        });

        it('should fail messages that contain non-base64 symbols', function() {
            assert.isFalse(Duo._isDuoMessage({
                origin: 'https://example.com',
                data: 'AUTH|#$*&|!@#$'
            }));
        });

        it('should fail messages with additional segments', function() {
            assert.isFalse(Duo._isDuoMessage({
                origin: 'https://example.com',
                data: 'AUTH|foo|bar|baz'
            }));
        });

        it('should return false if the origin is bad', function() {
            assert.isFalse(Duo._isDuoMessage({
                origin: 'https://notexample.com'
            }));
        });

        it('should return false if the event data is not a string', function() {
            assert.isFalse(Duo._isDuoMessage({
                origin: 'https://example.com',
                data: {
                    an: 'object'
                }
            }));
        });

        it('should return false if the event data is not properly formatted', function() {
            assert.isFalse(Duo._isDuoMessage({
                origin: 'https://example.com',
                data: 'buttercakes'
            }));
        });
    });
});