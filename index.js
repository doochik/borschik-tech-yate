var BorschikJSBase = require('borschik/lib/techs/js');
var PATH = require('path');

var yateFile = BorschikJSBase.File.inherit({

    read: function() {
        var FS = require('fs');
        var yate = require('yate');
        yate.modules = {};

        // import modules support
        var imports = this.tech.opts.techOptions.import;
        if (imports) {
            for (var i = 0, l = imports.length; i < l; i++) {
                var filename = imports[i];
                var obj = JSON.parse( FS.readFileSync(filename, 'utf-8') );
                yate.modules[ obj.name ] = obj;
            }
        }

        var compiled = yate.compile(this.path);

        var that = this;

        compiled.ast.walkdo(function(ast, params, pKey, pObject) {
            // find borschik-link calls
            if (ast.is('inline_function') && ast.p.Name === 'borschik-link') {
                // callargs
                var callArgs = ast.p.Args;
                if (callArgs.p.Items.length === 1) {
                    // callarg
                    var arg0 = callArgs.p.Items[0];
                    if (arg0.getType() === 'scalar') {

                        var argExprValue = arg0.p.Expr.p.Value;
                        if (argExprValue) {
                            var item = argExprValue.p.Items[0];
                            var baseFile = item.where.input.filename;

                            var linkPathRelative = item.p.Value;
                            // skip dynamic links
                            if (linkPathRelative.charAt(0) !== '@') {
                                // resolve link to absolute path
                                var linkPathAbsolute = PATH.resolve(PATH.dirname(baseFile), linkPathRelative);

                                // create fake file to link
                                var linkFile = that.tech.createFile(linkPathAbsolute, 'link-url', {
                                    path: baseFile,
                                    parent: that
                                });

                                // freeze link
                                var newLink = JSON.parse(linkFile.process(baseFile));
                                pObject[pKey] = yate.factory.make('string_literal', {}, newLink);
                            }
                        }
                    }
                }
            }
        });

        this.content = compiled.ast.js();
        if (!this.tech.opts.techOptions.node) {
            // удаляем первую строку
            // var yr = yr || require('yate/lib/runtime.js');
            // из-за нее нельзя исполнить JS в new Function
            this.content = this.content.replace(/^.*\n/, '');
        }

        return this;
    },

    // redefine process to drop js-tech behaviour
    processInclude: function() {
        return this.content;
    }

});

var yateTech = BorschikJSBase.Tech.inherit({

    File: yateFile

});

exports.Tech = yateTech;
exports.File = yateFile;
