define("ace/mode/upwriter_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var UpwriterHighlightRules = function() {

    // regexp must not have capturing parentheses. Use (?:) instead.
    // regexps are ordered -> the first match is used

    this.$rules = 
        {
    "start": [
        {
            "token" : "suffix",
            "regex" : "['’][a-zA-Z]+"
        },
        {
            "token" : "allowed",
            "regex" : "\\b(?:" + window.__WORDS + ")\\b",
            "caseInsensitive": true
        },
        {
            "token" : "disallowed",
            "regex" : "[a-zA-Z]+"
        }
    ]
}

};

oop.inherits(UpwriterHighlightRules, TextHighlightRules);

exports.UpwriterHighlightRules = UpwriterHighlightRules;
});


define("ace/mode/upwriter",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/upwriter_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var UpwriterHighlightRules = require("./upwriter_highlight_rules").UpwriterHighlightRules;

var Mode = function() {
    this.HighlightRules = UpwriterHighlightRules;
};
oop.inherits(Mode, TextMode);

Mode.prototype.$id = "ace/mode/upwriter";

// // optimized, hence ugly for loops
// Mode.prototype.getFirstDisallowed = function(editor) {
//   var session = editor.getSession();
//   var i, j, line, first, lines = session.doc.getAllLines();
//   outer: for (i = 0; i < lines.length; i++) {
//     line = session.getTokens(i);
//     for (j = 0; j < line.length; j++) {
//       if (line[j].type === "disallowed") {
//         first = line[j].value;
//         break outer;
//       }
//     }
//   }
//   return first;
// };

Mode.prototype.getDisallowed = function (editor) {
  var session = editor.getSession();
  return Object.keys(Array.apply(this, Array(session.doc.getAllLines().length)).reduce(function(m, _nil, i) {
    session.getTokens(i).forEach(function(token) {
      if (token.type === "disallowed") m[token.value] = true;
    });
    return m;
  }, {}));
}


Mode.prototype.onRecalculateAllowed = function(editor, cb) {
  var self = this;
  editor.getSession().on('change', debounce(function() {
    cb(self.getDisallowed(editor));
  }, 500));
};

exports.Mode = Mode;

function debounce(fn, delay) {
  return function() {
    fn.args = arguments;
    fn.timeout_id && clearTimeout(fn.timeout_id);
    fn.timeout_id = setTimeout(function() { return fn.apply(fn, fn.args); }, delay);
  };
}

});