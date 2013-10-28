var BorschikJS = require('borschik/lib/techs/js');
var UglifyJS = require('borschik/node_modules/uglify-js');

var yateFile = BorschikJS.File.inherit({

    read: function() {
        var yate = require('d2-build-tools/node_modules/yate');

        this.content = yate.compile(this.path).js;

        // удаляем первую строку
        // var yr = yr || require('yate/lib/runtime.js');
        // из-за нее нельзя исполнить JS в new Function
        this.content = this.content.replace(/^.*\n/, '');

        return this;
    },

    parseInclude: function(/** Buffer */content) {
        return content;
    },

    processInclude: function(baseFile) {
        var that = this;

        try {
            var originalAST = UglifyJS.parse(this.content);
        } catch(e) {
            console.error('Cant parse js file');
            throw e;
        }

        var tt = new UglifyJS.TreeTransformer(null, function(node){
            if (itIsCall(node, 'borschik-link')) {
                var args = node.args;
                if (args.length === 1) {
                    if (args[0] instanceof UglifyJS.AST_String) {
                        // freeze images with cssBase.processLink
                        var newLink = JSON.parse(that.child('link-url', args[0].value).process(baseFile));
                        return new UglifyJS.AST_String({value: newLink});
                    }
                }
            }

            return node;
        }.bind(this));

        var newAST = originalAST.transform(tt);

        var printParams = {
            beautify: true,
            comments: 'all'
        };

        return newAST.print_to_string(printParams);
    }

});

var yateTech = BorschikJS.Tech.inherit({

    File: yateFile

});

exports.Tech = yateTech;
exports.File = yateFile;


function itIsCall(node, name) {
    return node instanceof UglifyJS.AST_Call &&
        (
            node.expression.name == name ||
                node.expression.property == name ||
                (node.expression.property && node.expression.property.value == name)
            )
}
