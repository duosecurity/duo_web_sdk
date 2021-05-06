const Duo = require('../index');
const chai = require('chai');
const sinon = require('sinon');
const assert = chai.assert;

suite('Duo Web', function() {
    suite('init using an iframe', function() {
        var iframe;
         /* Dummy sig_request, passes validation. */
        var sig_request = 'AUTH|duo_sig:app_sig';

        function addIframe() {
            /* Create some document elements that doPostBack expects. */
            iframe = document.createElement('iframe');
            var form = document.createElement('duo_form');
            form.id = 'duo_form';
            document.head.appendChild(iframe);
            iframe.appendChild(form);
        }

        setup(function() {
            addIframe();
        });

        test('Errors if you give it a non-iframe', function() {
            var div = document.createElement('div');
            document.head.appendChild(div);

            assert.throws(
                function() { Duo.init({host: 'example.com', iframe: div}); },
                '`iframe` only accepts an iframe element'
            );
        });

        test('Errors if you set iframe and iframeContainer', function() {
            var div = document.createElement('div');
            document.head.appendChild(div);

            assert.throws(
                function() {
                    Duo.init({
                        host: 'example.com',
                        iframeContainer: div,
                        iframe: iframe
                    });
                },
                'Passing both `iframe` and `iframeContainer` arguments at the' +
                ' same time is not allowed.'
            );
        });

        test('Should totes work with submitCallback', function() {
            var submitCallbackCalled = false;
            Duo.init({
                host: 'example.com',
                iframe: iframe,
                sig_request: sig_request,
                submit_callback: function() {
                    submitCallbackCalled = true;
                }
            });

            Duo._doPostBack("Great Success!");
            /* Ensure our callback was called :) */
            assert.isTrue(submitCallbackCalled);
        });

        test('should include the host in the src', function() {
            var host = 'this-is-a-host.example';

            Duo.init({
                host: host,
                iframe: iframe,
                sig_request: sig_request
            });

            assert.include(iframe.src, host);
        });

        test('should URI encode the parent URL', function() {
            Duo.init({
                host: 'example.com',
                iframe: iframe,
                sig_request: sig_request
            });

            assert.notInclude(
                iframe.src, 'parent=http://',
                'should URI encode the parent href');
            assert.notInclude(
                iframe.src, 'parent=https://',
                'should URI encode the parent href');
        });

        test('should URI encode the duoSig', function() {
            Duo.init({
                host: 'example.com',
                iframe: iframe,
                sig_request: 'AUTH|duo+sig:app_sig'
            });

            assert.notInclude(
                iframe.src, 'duo+sig',
                'should URI encode the duoSig href');
        });

        suite('Calling init() a second time', function() {
            test('Should overwrite the old callback', function() {
                var firstSubmitCallbackCalled = false;
                var secondSubmitCallbackCalled = false;

                Duo.init({
                    host: 'example.com',
                    iframe: iframe,
                    sig_request: sig_request,
                    submit_callback: function() {
                        firstSubmitCallbackCalled = true;
                    }
                });

                Duo.init({
                    host: 'example.com',
                    iframe: iframe,
                    sig_request: sig_request,
                    submit_callback: function() {
                        secondSubmitCallbackCalled = true;
                    }
                });

                Duo._doPostBack("Great Success!");

                assert.isFalse(
                    firstSubmitCallbackCalled,
                    'did not overwrite the previous callback'
                );
                assert.isTrue(
                    secondSubmitCallbackCalled,
                    'did not call the new callback'
                );
            });

            test('Should overwrite the iframe src', function() {
                const firstHostName = 'first-host.example';
                const secondHostName = 'second-host.example';
                const thirdHostName = 'third-host.example';

                // Initialize with one host
                Duo.init({
                    host: firstHostName,
                    iframe: iframe,
                    sig_request: sig_request
                });

                // Initialize with a different host
                Duo.init({
                    host: secondHostName,
                    iframe: iframe,
                    sig_request: sig_request
                });

                assert.include(
                    iframe.src, secondHostName,
                    'did not change the src on the second init'
                );


                // Create a new iframe and initialze again to make sure the new
                // iframe is targeted.
                addIframe();
                Duo.init({
                    host: thirdHostName,
                    iframe: iframe,
                    sig_request: sig_request
                });

                assert.include(
                    iframe.src, thirdHostName,
                    'did not change the src on the third init'
                );
            });
        });
    });

    suite('init using another element', function() {
        var wrapper;
         /* Dummy sig_request, passes validation. */
        var sig_request = 'AUTH|duo_sig:app_sig';

        function addIframeWrapper(wrapperTagName) {
            /* Create some document elements that doPostBack expects. */
            wrapper = document.createElement(wrapperTagName);
            const form = document.createElement('duo_form');
            form.id = 'duo_form';
            document.head.appendChild(wrapper);
            wrapper.appendChild(form);
        }

        setup(function() {
            addIframeWrapper('div');
        });


        test('Errors if you give it an iframe', function() {
            var iframe = document.createElement('iframe');
            document.head.appendChild(iframe);

            assert.throws(
                function() { Duo.init({host: 'example.com', iframeContainer: iframe}); },
                '`iframeContainer` only accepts a non-iframe element'
            );
        });

        test('Should totes work with submitCallback', function() {
            var submitCallbackCalled = false;
            Duo.init({
                host: 'example.com',
                iframeContainer: wrapper,
                sig_request: sig_request,
                submit_callback: function() {
                    submitCallbackCalled = true;
                }
            });

            Duo._doPostBack("Great Success!");
            /* Ensure our callback was called :) */
            assert.isTrue(submitCallbackCalled);
        });

        test('should include the host in the src of the iframe that was added', function() {
            const host = 'this-is-a-host.example';

            Duo.init({
                host: host,
                iframeContainer: wrapper,
                sig_request: sig_request
            });

            const iframe = wrapper.querySelector("iframe");

            assert.include(iframe.src, host);
        });

        test('should allow setting iframeAttributes', function() {
            const givenTitle = "Example New Duo Prompt Title";
            const givenAllows = "stuff and more stuff";
            const givenWidth = "400";
            const givenHeight = "600";

            Duo.init({
                host: "example.com",
                sig_request: sig_request,
                iframeContainer: wrapper,
                iframeAttributes: {
                    title: givenTitle,
                    allows: givenAllows,
                    width: givenWidth,
                    height: givenHeight
                }
            });

            const iframe = wrapper.querySelector("iframe");

            assert.equal(iframe.getAttribute('title'), givenTitle);
            assert.equal(iframe.getAttribute('allows'), givenAllows);
            assert.equal(iframe.getAttribute('width'), givenWidth);
            assert.equal(iframe.getAttribute('height'), givenHeight);
        });

        test('should URI encode the parent URL', function() {
            Duo.init({
                host: 'example.com',
                iframeContainer: wrapper,
                sig_request: sig_request
            });

            const iframe = wrapper.querySelector("iframe");

            assert.notInclude(
                iframe.src, 'parent=http://',
                'should URI encode the parent href');
            assert.notInclude(
                iframe.src, 'parent=https://',
                'should URI encode the parent href');
        });

        suite('Calling init() a second time', function() {
            test('Should overwrite the old callback', function() {
                var firstSubmitCallbackCalled = false;
                var secondSubmitCallbackCalled = false;

                Duo.init({
                    host: 'example.com',
                    iframeContainer: wrapper,
                    sig_request: sig_request,
                    submit_callback: function() {
                        firstSubmitCallbackCalled = true;
                    }
                });

                Duo.init({
                    host: 'example.com',
                    iframeContainer: wrapper,
                    sig_request: sig_request,
                    submit_callback: function() {
                        secondSubmitCallbackCalled = true;
                    }
                });

                Duo._doPostBack("Great Success!");

                assert.isFalse(
                    firstSubmitCallbackCalled,
                    'did not overwrite the previous callback'
                );
                assert.isTrue(
                    secondSubmitCallbackCalled,
                    'did not call the new callback'
                );
            });

            test('Should replace the iframe with a new one', function() {
                const firstHostName = 'first-host.example';
                const secondHostName = 'second-host.example';
                const thirdHostName = 'third-host.example';

                // Initialize with one host
                Duo.init({
                    host: firstHostName,
                    iframeContainer: wrapper,
                    sig_request: sig_request
                });

                const firstIframe = wrapper.querySelector("iframe");

                // Initialize with a different host
                Duo.init({
                    host: secondHostName,
                    iframeContainer: wrapper,
                    sig_request: sig_request
                });

                // Make sure we aren't just appending new iframes every time
                assert.equal(wrapper.querySelectorAll("iframe").length, 1);

                const secondIframe = wrapper.querySelector("iframe");

                // Make sure we added a new iframe and didn't mutate the old one.
                assert.notEqual(firstIframe, secondIframe);

                // Create a new wrapper and initialze again to make sure the new
                // wrapper is targeted.
                addIframeWrapper();
                Duo.init({
                    host: thirdHostName,
                    iframeContainer: wrapper,
                    sig_request: sig_request
                });

                const thirdIframe = wrapper.querySelector("iframe");

                assert.notEqual(secondIframe, thirdIframe);
            });
        });
    });

    suite('parseSigRequest', function() {
        test('should return undefined if no token is passed', function() {
            assert.isUndefined(Duo._parseSigRequest());
        });

        test('should throw an error if an error message is passed', function() {
            assert.throws(function() {
                Duo._parseSigRequest('ERR|buttercakes');
            }, 'Duo Web SDK error: buttercakes');
        });

        test('should throw an error if the token is invalid', function() {
            assert.throws(function() {
                Duo._parseSigRequest('AUTH|incomplete');
            }, /Duo was given a bad token/);
        });

        test('should return the parsed sig request if the token is valid(ish)', function() {
            assert.deepEqual(Duo._parseSigRequest('AUTH|foo:bar'), {
                sigRequest: 'AUTH|foo:bar',
                duoSig: 'AUTH|foo',
                appSig: 'bar'
            });
        });
    });

    suite('isDuoMessage', function() {
        setup(function() {
            Duo.init({
                host: 'example.com'
            });
        });

        test('should return true for the correct origin and the correct format', function() {
            assert.isTrue(Duo._isDuoMessage({
                origin: 'https://example.com',
                data: 'AUTH|aaabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+==|aaabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+=='
            }), 'did not parse message format correctly');

            assert.isTrue(Duo._isDuoMessage({
                origin: 'https://example.com',
                data: 'ERR|buttercakes'
            }), 'did not parse error format correctly');
        });

        test('should fail messages that aren\'t AUTH or ENROLL', function() {
            assert.isFalse(Duo._isDuoMessage({
                origin: 'https://example.com',
                data: 'buttercakes|foo|bar'
            }));
        });

        test('should fail messages that contain non-base64 symbols', function() {
            assert.isFalse(Duo._isDuoMessage({
                origin: 'https://example.com',
                data: 'AUTH|#$*&|!@#$'
            }));
        });

        test('should fail messages with additional segments', function() {
            assert.isFalse(Duo._isDuoMessage({
                origin: 'https://example.com',
                data: 'AUTH|foo|bar|baz'
            }));
        });

        test('should return false if the origin is bad', function() {
            assert.isFalse(Duo._isDuoMessage({
                origin: 'https://notexample.com'
            }));
        });

        test('should return false if the event data is not a string', function() {
            assert.isFalse(Duo._isDuoMessage({
                origin: 'https://example.com',
                data: {
                    an: 'object'
                }
            }));
        });

        test('should return false if the event data is not properly formatted', function() {
            assert.isFalse(Duo._isDuoMessage({
                origin: 'https://example.com',
                data: 'buttercakes'
            }));
        });
    });

    suite('open Duo window', function() {
        setup(function() {
            Duo.init({
                host: 'example.com',
            });

             const OriginalMessageEvent = window.MessageEvent;
             sinon.stub(window, "MessageEvent", function(type, args) {
                 if (type === "message") {
                     args.origin = 'https://example.com';
                 }

                 return new OriginalMessageEvent(type, args);
             });

            sinon.stub(window, "open");
        });

        teardown(function() {
            window.MessageEvent.restore();
            window.open.restore();
        });

        /**
         * Checks if window.open has been called with a URL.
         * @param  {String}     expectedUrl
         * @param  {Boolean}   didOpen: did it open or not?
         * @param  {Function}  done: `done` callback provided by Mocha
         */
        function _checkWindowOpenness(expectedUrl, didOpen, done) {
            window.postMessage('DUO_OPEN_WINDOW|' + expectedUrl, '*');

            // We need to setTimeout here to allow the window.message handlers
            // the ability to gain control of the thread and do their work.
            // window.postMessage is async in the JSDOM lib we are using
            setTimeout(function() {
                if (didOpen) {
                    const [url, target] = window.open.getCall(0).args;
                    assert.equal(url, expectedUrl);
                    assert.equal(target, '_self');
                } else {
                    assert.notOk(window.open.called);
                }
                done();
            }, 0);
        }

        /**
         * Custom assertion if window has been opened with URL.
         * @param  {String}     expectedUrl
         */
        function assertWindowDidOpen(expectedUrl, done) {
            _checkWindowOpenness(expectedUrl, true, done);
        }

        /**
         * Custom assertion if window has been opend with URL.
         * @param  {String}     expectedUrl
         * @param  {Boolean}   didOpen: did it open or not?
         */
        function assertWindowDidNotOpen(expectedUrl, done) {
            _checkWindowOpenness(expectedUrl, false, done);
        }

        test('should attempt window open for duotrustedendpoints://', function(done) {
            assertWindowDidOpen('duotrustedendpoints://duo.com?x=1&y=2', done);
        });

        test('should allow https://duo.com', function(done) {
            assertWindowDidOpen("https://duo.com", done);
        });
        test('should allow https://something.duo.com', function(done) {
            assertWindowDidOpen("https://something.duo.com", done);
        });
        test('should allow https://something.duo.com/', function(done) {
            assertWindowDidOpen("https://something.duo.com/", done);
        });
        test('should allow https://something.duo.com/?akey=123', function(done) {
            assertWindowDidOpen("https://something.duo.com/?akey=123", done);
        });
        test('should allow https://something.duo.com?akey=123', function(done) {
            assertWindowDidOpen("https://something.duo.com?akey=123", done);
        });
        test('should allow https://abc-123.something.else.duo.com?akey=123', function(done) {
            assertWindowDidOpen("https://abc-123.something.else.duo.com?akey=123", done);
        });

        test('should allow valid https://duosecurity.com', function(done) {
            assertWindowDidOpen("https://duosecurity.com", done);
        });
        test('should allow https://something.duosecurity.com', function(done) {
            assertWindowDidOpen("https://something.duosecurity.com", done);
        });
        test('should allow https://something.duosecurity.com/', function(done) {
            assertWindowDidOpen("https://something.duosecurity.com/", done);
        });
        test('should allow https://something.duosecurity.com/?akey=123', function(done) {
            assertWindowDidOpen("https://something.duosecurity.com/?akey=123", done);
        });
        test('should allow https://something.duosecurity.com?akey=123', function(done) {
            assertWindowDidOpen("https://something.duosecurity.com?akey=123", done);
        });
        test('should allow https://abc-123.something.else.duosecurity.com?akey=123', function(done) {
            assertWindowDidOpen("https://abc-123.something.else.duosecurity.com?akey=123", done);
        });

        test('should allow https://duomobile.s3-us-west-1.amazonaws.com', function(done) {
            assertWindowDidOpen("https://duomobile.s3-us-west-1.amazonaws.com", done);
        });
        test('should allow https://something.duomobile.s3-us-west-1.amazonaws.com', function(done) {
            assertWindowDidOpen("https://something.duomobile.s3-us-west-1.amazonaws.com", done);
        });
        test('should allow https://something.duomobile.s3-us-west-1.amazonaws.com/', function(done) {
            assertWindowDidOpen("https://something.duomobile.s3-us-west-1.amazonaws.com/", done);
        });
        test('should allow https://something.duomobile.s3-us-west-1.amazonaws.com/?akey=123', function(done) {
            assertWindowDidOpen("https://something.duomobile.s3-us-west-1.amazonaws.com/?akey=123", done);
        });
        test('should allow https://something.duomobile.s3-us-west-1.amazonaws.com?akey=123', function(done) {
            assertWindowDidOpen("https://something.duomobile.s3-us-west-1.amazonaws.com?akey=123", done);
        });
        test('should allow https://abc-123.something.else.duomobile.s3-us-west-1.amazonaws.com?akey=123', function(done) {
            assertWindowDidOpen("https://abc-123.something.else.duomobile.s3-us-west-1.amazonaws.com?akey=123", done);
        });

        test('should prevent javascript:alert(1)', function(done) {
            assertWindowDidNotOpen("javascript:alert(1)", done);
        });
        test('should prevent http://duo.com', function(done) {
            assertWindowDidNotOpen("http://duo.com/", done);
        });
        test('should prevent https://attackers.site/?fake=duo.com', function(done) {
            assertWindowDidNotOpen("https://attackers.site/?fake=duo.com", done);
        });
        test('should prevent https://duo.co/', function(done) {
            assertWindowDidNotOpen("https://duo.co/", done);
        });
        test('should prevent https://duo.com.attack.io/', function(done) {
            assertWindowDidNotOpen("https://duo.com.attack.io/", done);
        });
        test('should prevent https://attack.io/duo.com', function(done) {
            assertWindowDidNotOpen("https://attack.io/duo.com", done);
        });
        test('should prevent https://attack.io?maybe=duo.com', function(done) {
            assertWindowDidNotOpen("https://attack.io?maybe=duo.com", done);
        });
        test('should prevent https://iamnotduo.com/', function(done) {
            assertWindowDidNotOpen("https://iamnotduo.com/", done);
        });
        test('should prevent https://i.totally.am.notduo.com/', function(done) {
            assertWindowDidNotOpen("https://i.totally.am.notduo.com/", done);
        });

    });
});