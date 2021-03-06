namespace plat.expressions {
    'use strict';

    /**
     * @name Regex
     * @memberof plat.expressions
     * @kind class
     *
     * @description
     * A class for keeping track of commonly used regular expressions.
     */
    export class Regex {
        /**
         * @name markupRegex
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         *
         * @type {RegExp}
         *
         * @description
         * A regular expression for finding markup in a string.
         */
        public markupRegex: RegExp = new RegExp(
            `${__startSymbol}[\\S\\s]*${__endSymbol}`
        );

        /**
         * @name argumentRegex
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         *
         * @type {RegExp}
         *
         * @description
         * Finds the arguments in a method expression.
         *
         * @example
         * // outputs ["('foo', 'bar', 'baz')", "'foo', 'bar', 'baz'"]
         * exec("myFunction('foo', 'bar', 'baz')");
         */
        public argumentRegex: RegExp = /\((.*)\)/;

        /**
         * @name initialUrlRegex
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         *
         * @type {RegExp}
         *
         * @description
         * Finds '/*.html' or '/*.htm' in a url. Useful for removing
         * the html file out of the url.
         *
         * @example
         * // outputs ['/index.html']
         * exec('http://localhost:8080/index.html');
         */
        public initialUrlRegex: RegExp = /\/[^\/]*\.(?:html|htm)/;

        /**
         * @name protocolRegex
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         *
         * @type {RegExp}
         *
         * @description
         * Finds a protocol delimiter in a string (e.g. ://).
         */
        public protocolRegex: RegExp = /:\/\//;

        /**
         * @name invalidVariableRegex
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         *
         * @type {RegExp}
         *
         * @description
         * Looks for any invalid variable syntax.
         */
        public invalidVariableRegex: RegExp = /[^a-zA-Z0-9@_$]/;

        /**
         * @name fileNameRegex
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         *
         * @type {RegExp}
         *
         * @description
         * Grabs the file name from a file path.
         */
        public fileNameRegex: RegExp = /.*(?:\/|\\)/;

        /**
         * @name shiftedKeyRegex
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         *
         * @type {RegExp}
         *
         * @description
         * Determines if a character is correlated with a shifted key code.
         */
        public shiftedKeyRegex: RegExp = /[A-Z!@#$%^&*()_+}{":?><|~]/;

        /**
         * @name fullUrlRegex
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         *
         * @type {RegExp}
         *
         * @description
         * Determines if a url is relative or absolute.
         */
        public fullUrlRegex: RegExp = /^(?:[a-z0-9\-]+:)(?:\/\/)?|(?:\/\/)/i;

        /**
         * @name validateEmail
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         *
         * @type {RegExp}
         *
         * @description
         * Determines if an email address is valid.
         */
        public validateEmail: RegExp = new RegExp(
            '^(([^<>()[\\]\\.,;:\\s@\\"]+(\\.[^<>()[\\]\\.,;:\\s@\\"]+)*)|' +
                '(\\".+\\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|' +
                '(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$'
        );

        /**
         * @name validateTelephone
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         *
         * @type {RegExp}
         *
         * @description
         * Determines if a telephone number is valid.
         */
        public validateTelephone: RegExp = /^\+?[0-9\.\(\)\s-]*$/;

        /**
         * @name splatSegmentRegex
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         *
         * @type {RegExp}
         *
         * @description
         * A regular expression for matching dynamic segments in a route.
         */
        public dynamicSegmentsRegex: RegExp = /^:([^\/]+)$/;

        /**
         * @name splatSegmentRegex
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         *
         * @type {RegExp}
         *
         * @description
         * A regular expression for matching splat segments in a route.
         */
        public splatSegmentRegex: RegExp = /^\*([^\/]+)$/;

        /**
         * @name newLineRegex
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         * @readonly
         *
         * @type {RegExp}
         *
         * @description
         * A regular expression for matching or removing all newline characters.
         */
        get newLineRegex(): RegExp {
            return /\r|\n/g;
        }

        /**
         * @name optionalRouteRegex
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         * @readonly
         *
         * @type {RegExp}
         *
         * @description
         * Finds optional parameters in a route string.
         *
         * @example
         * // outputs ['(/foo)', '/foo']
         * exec('(/foo)/bar');
         *
         * // outputs ['(/foo)', '/foo']
         * exec('(/foo))');
         */
        get optionalRouteRegex(): RegExp {
            return /\((.*?)\)/g;
        }

        /**
         * @name namedParameterRouteRegex
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         * @readonly
         *
         * @type {RegExp}
         *
         * @description
         * Finds named parameters in a route string.
         *
         * @example
         * // outputs [':foo']
         * exec('/:foo/bar')
         *
         * // outputs [':foo']
         * exec('(/:foo)/bar');
         */
        get namedParameterRouteRegex(): RegExp {
            return /(\(\?)?:\w+/g;
        }

        /**
         * @name namedParameterRouteRegex
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         * @readonly
         *
         * @type {RegExp}
         *
         * @description
         * Finds an alphanumeric wildcard match in a route string.
         *
         * @example
         * // outputs ['*bar']
         * exec('/foo/*bar/baz');
         */
        get wildcardRouteRegex(): RegExp {
            return /\*\w*/g;
        }

        /**
         * @name escapeRouteRegex
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         * @readonly
         *
         * @type {RegExp}
         *
         * @description
         * Finds invalid characters in a route string.
         *
         * @example
         * // outputs ['?']
         * exec('/foo/bar?query=baz');
         */
        get escapeRouteRegex(): RegExp {
            return /[\-{}\[\]+?.,\\\^$|#\s]/g;
        }

        /**
         * @name camelCaseRegex
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         * @readonly
         *
         * @type {RegExp}
         *
         * @description
         * Finds delimiters for spinal-case, snake_case, and dot.case.
         * useful for converting to camelCase. Also can turn a string
         * into camelCase with space as a delimiter.
         *
         * @example
         * // outputs ['-o', '-', 'o']
         * exec('plat-options');
         *
         * // outputs ['.c', '.', 'c']
         * exec('plat.config');
         *
         * // outputs ['_v', '_', 'v']
         * exec('plat_var');
         *
         * // outputs [' W', ' ', 'W']
         * exec('Hello World');
         */
        get camelCaseRegex(): RegExp {
            return /([\-_\.\s])(\w+?)/g;
        }

        /**
         * @name capitalCaseRegex
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         * @readonly
         *
         * @type {RegExp}
         *
         * @description
         * Finds all capital letters.
         */
        get capitalCaseRegex(): RegExp {
            return /[A-Z]/g;
        }

        /**
         * @name whiteSpaceRegex
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         * @readonly
         *
         * @type {RegExp}
         *
         * @description
         * Finds all whitespace and newline characters
         * not in string literals. Needs to be combined
         * with string replace function using $1 argument.
         */
        get whiteSpaceRegex(): RegExp {
            return /("[^"]*?"|'[^']*?')|[\s\r\n\t\v]/g;
        }

        /**
         * @name quotationRegex
         * @memberof plat.expressions.Regex
         * @kind property
         * @access public
         * @readonly
         *
         * @type {RegExp}
         *
         * @description
         * Finds all single and double quotes.
         */
        get quotationRegex(): RegExp {
            return /'|"/g;
        }
    }

    register.injectable(__Regex, Regex);
}
