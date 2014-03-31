describe('link processing', function() {

    var assert = require('assert');
    var borschik = require('borschik');
    var fs = require('fs');
    var path = require('path');
    var stream = require('stream');
    var yateRuntime = fs.readFileSync( path.join(__dirname, '../node_modules/yate/lib/runtime.js'), 'utf-8' );
    var borschikLinkExternal = fs.readFileSync( path.join(__dirname, '../yate-externals/borschik.js'), 'utf-8' );

    function runYate(cb) {
        var compiltedYate = '';

        var echoStream = new stream.Writable();
        echoStream._write = function (chunk, encoding, done) {
            compiltedYate += chunk.toString();
            done();
        };
        echoStream.on('finish', function() {

            var result = require('vm').runInNewContext([
                yateRuntime,
                borschikLinkExternal,
                compiltedYate,
                'yr.run("main")'
            ].join('\n'), {
                borschik: require('borschik/js/borschik.js'),
                console: console,
                require: require
            });

            cb(result);
        });

        return echoStream;
    }

    afterEach(function(done) {
        var freezePath = path.resolve('test/link-processing/_');

        require('child_process').exec('rm -rf ' + freezePath,function(err,out) {
            done();
        });
    });

    it('simple processing with path', function(done) {

        var echoStream = runYate(function(result) {
            try {
                assert.equal(result, '//yastatic.net/null.gif');
                done();
            } catch (e) {
                done(e);
            }
        });

        borschik
            .api({
                'freeze': false,
                'input': './test/link-processing/1/1.yate',
                'minimize': false,
                'output': echoStream,
                'tech': './index.js'
            })
            .then(function() {
                done();
            })
            .fail(function(e) {
                done(e);
            });
    });

    it('simple processing with freeze', function(done) {

        var echoStream = runYate(function(result) {
            try {
                assert.equal(result, '//yastatic.net/_/La6qi18Z8LwgnZdsAr1qy1GwCwo.gif');
                done();
            } catch (e) {
                done(e);
            }
        });

        borschik
            .api({
                'freeze': true,
                'input': './test/link-processing/1/1.yate',
                'minimize': false,
                'output': echoStream,
                'tech': './index.js'
            })
            .then(function() {
                done();
            })
            .fail(function(e) {
                done(e);
            });
    });

    it('links processing relative to target file', function(done) {
        var echoStream = runYate(function(result) {
            try {
                assert.equal(result, '//yastatic.net/_/La6qi18Z8LwgnZdsAr1qy1GwCwo.gif');
                done();
            } catch (e) {
                done(e);
            }
        });

        borschik
            .api({
                'freeze': true,
                'input': './test/link-processing/2/1.yate',
                'minimize': false,
                'output': echoStream,
                'tech': './index.js'
            })
            .then(function() {
                done();
            })
            .fail(function(e) {
                done(e);
            });
    });

    it("shouldn't process dynamic links", function(done) {
        var echoStream = runYate(function(result) {
            try {
                assert.equal(result, '[borschik] Undefined link "@null.gif"');
                done();
            } catch (e) {
                done(e);
            }
        });

        borschik
            .api({
                'freeze': true,
                'input': './test/link-processing/3/1.yate',
                'minimize': false,
                'output': echoStream,
                'tech': './index.js'
            })
            .then(function() {
                done();
            })
            .fail(function(e) {
                done(e);
            });
    });

    it("shouldn't process links as dynamic vars", function(done) {
        var echoStream = runYate(function(result) {
            try {
                assert.equal(result, '[borschik] Undefined link "@null.gif"');
                done();
            } catch (e) {
                done(e);
            }
        });

        borschik
            .api({
                'freeze': true,
                'input': './test/link-processing/4/1.yate',
                'minimize': false,
                'output': echoStream,
                'tech': './index.js'
            })
            .then(function() {
                done();
            })
            .fail(function(e) {
                done(e);
            });
    });

    it("shouldn't process links as dynamic expression", function(done) {
        var echoStream = runYate(function(result) {
            try {
                assert.equal(result, '[borschik] Undefined link "@icon-test"');
                done();
            } catch (e) {
                done(e);
            }
        });

        borschik
            .api({
                'freeze': true,
                'input': './test/link-processing/5/1.yate',
                'minimize': false,
                'output': echoStream,
                'tech': './index.js'
            })
            .then(function() {
                done();
            })
            .fail(function(e) {
                done(e);
            });
    });

});
