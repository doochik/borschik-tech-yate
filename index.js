var BorschikCSSBase = require('borschik/lib/techs/css-base');
var PATH = require('path');

var yateFile = BorschikCSSBase.File.inherit({

    read: function() {
        var FS = require('fs');
        var yate = require('yate');

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
                        var item = arg0.p.Expr.p.Value.p.Items[0];
                        var baseFile = item.where.input.filename;

                        // resolve link to absolute path
                        var absLinkPath = PATH.resolve(PATH.dirname(baseFile), item.p.Value);

                        // create fake file to link
                        var linkFile = that.tech.createFile(absLinkPath, 'link-url', this);

                        // freeze link
                        var newLink = JSON.parse(linkFile.process(baseFile));
                        pObject[pKey] = yate.factory.make('string_literal', {}, newLink);
                    }
                }
            }
        });

        // удаляем первую строку
        // var yr = yr || require('yate/lib/runtime.js');
        // из-за нее нельзя исполнить JS в new Function
        this.content = compiled.ast.js().replace(/^.*\n/, '');

        return this;
    }

});

var yateTech = BorschikCSSBase.Tech.inherit({

    File: yateFile

});

exports.Tech = yateTech;
exports.File = yateFile;
