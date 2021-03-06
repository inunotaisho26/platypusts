namespace plat.processing {
    'use strict';

    /**
     * @name NodeManager
     * @memberof plat.processing
     * @kind class
     *
     * @description
     * Responsible for data binding a data context to a Node.
     */
    export class NodeManager {
        /**
         * @name _ContextManager
         * @memberof plat.processing.NodeManager
         * @kind property
         * @access protected
         * @static
         *
         * @type {plat.observable.IContextManagerStatic}
         *
         * @description
         * Reference to the {@link plat.observable.IContextManagerStatic|IContextManagerStatic} injectable.
         */
        protected static _ContextManager: observable.IContextManagerStatic;

        /**
         * @name _parser
         * @memberof plat.processing.NodeManager
         * @kind property
         * @access protected
         * @static
         *
         * @type {plat.expressions.Parser}
         *
         * @description
         * Reference to the {@link plat.expressions.Parser|Parser} injectable.
         */
        protected static _parser: expressions.Parser;

        /**
         * @name _TemplateControlFactory
         * @memberof plat.processing.NodeManager
         * @kind property
         * @access protected
         * @static
         *
         * @type {plat.ui.ITemplateControlFactory}
         *
         * @description
         * Reference to the {@link plat.ui.ITemplateControlFactory|ITemplateControlFactory} injectable.
         */
        protected static _TemplateControlFactory: ui.ITemplateControlFactory;

        /**
         * @name _log
         * @memberof plat.processing.NodeManager
         * @kind property
         * @access protected
         * @static
         *
         * @type {plat.debug.Log}
         * @description
         * Reference to the {@link plat.debug.Log|Log} injectable.
         */
        protected static _log: debug.Log;

        /**
         * @name _markupRegex
         * @memberof plat.processing.NodeManager
         * @kind property
         * @access protected
         * @static
         *
         * @type {RegExp}
         *
         * @description
         * A regular expression for finding markup
         */
        protected static _markupRegex: RegExp;

        /**
         * @name _newLineRegex
         * @memberof plat.processing.NodeManager
         * @kind property
         * @access protected
         * @static
         *
         * @type {RegExp}
         *
         * @description
         * A regular expression for finding newline characters.
         */
        protected static _newLineRegex: RegExp;

        /**
         * @name type
         * @memberof plat.processing.NodeManager
         * @kind property
         * @access public
         *
         * @type {string}
         *
         * @description
         * The type of {@link plat.processing.NodeManager|NodeManager}.
         */
        public type: string;

        /**
         * @name nodeMap
         * @memberof plat.processing.NodeManager
         * @kind property
         * @access public
         *
         * @type {plat.processing.INodeMap}
         *
         * @description
         * The {@link plat.processing.INodeMap|INodeMap} for this {@link plat.processing.NodeManager|NodeManager}.
         * Contains the compiled Node.
         */
        public nodeMap: INodeMap;

        /**
         * @name parent
         * @memberof plat.processing.NodeManager
         * @kind property
         * @access public
         *
         * @type {plat.processing.ElementManager}
         *
         * @description
         * The parent {@link plat.processing.ElementManager|ElementManager}.
         */
        public parent: ElementManager;

        /**
         * @name isClone
         * @memberof plat.processing.NodeManager
         * @kind property
         * @access public
         *
         * @type {boolean}
         *
         * @description
         * Whether or not this {@link plat.processing.NodeManager|NodeManager} is a clone.
         */
        public isClone: boolean = false;

        /**
         * @name hasMarkup
         * @memberof plat.processing.NodeManager
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Determines if a string has the markup notation.
         *
         * @param {string} text The text string in which to search for markup.
         *
         * @returns {boolean} Indicates whether or not there is markup.
         */
        public static hasMarkup(text: string): boolean {
            return NodeManager._markupRegex.test(text);
        }

        /**
         * @name findMarkup
         * @memberof plat.processing.NodeManager
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Given a string, finds markup in the string and creates an array of
         * {@link plat.expressions.IParsedExpression|IParsedExpression}.
         *
         * @param {string} text The text string in which to search for markup.
         *
         * @returns {Array<plat.expressions.IParsedExpression>} An array of parsed expressions that
         * composes the output given a proper context.
         */
        public static findMarkup(
            text: string
        ): expressions.IParsedExpression[] {
            const startLength = __startSymbol.length;
            const endLength = __endSymbol.length;
            const endChar = __endSymbol[endLength - 1];
            const parsedExpressions: expressions.IParsedExpression[] = [];
            const wrapExpression = NodeManager._wrapExpression;
            const _parser = NodeManager._parser;
            let start: number;
            let end: number;
            let substring: string;
            let expression: expressions.IParsedExpression;

            text = text.replace(NodeManager._newLineRegex, '');

            start = text.indexOf(__startSymbol);
            end = text.indexOf(__endSymbol);
            while (start !== -1 && end !== -1) {
                if (start !== 0) {
                    parsedExpressions.push(
                        wrapExpression(text.slice(0, start))
                    );
                }

                // increment with while loop instead of just += 2 for nested object literal case.
                while (text[end] !== endChar || text[end + 1] === endChar) {
                    end += 1;
                }
                end += 1;

                substring = text.slice(start + startLength, end - endLength);

                // check for one-time data-binding
                if (substring[0] === '=') {
                    expression = _parser.parse(substring.slice(1).trim());
                    expression.oneTime = true;
                    parsedExpressions.push(expression);
                } else {
                    parsedExpressions.push(_parser.parse(substring.trim()));
                }

                text = text.slice(end);
                start = text.indexOf(__startSymbol);
                end = text.indexOf(__endSymbol);
            }

            if (start >= 0 && end >= 0) {
                parsedExpressions.push(wrapExpression(text.slice(end)));
            } else if (text !== '') {
                parsedExpressions.push(wrapExpression(text));
            }

            return parsedExpressions;
        }

        /**
         * @name build
         * @memberof plat.processing.NodeManager
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Takes in a control with a data context and an array of {@link plat.expressions.IParsedExpression|IParsedExpression}
         * and outputs a string of the evaluated expressions.
         *
         * @param {Array<plat.expressions.IParsedExpression>} expressions The composition array to evaluate.
         * @param {plat.ui.TemplateControl} control? The {@link plat.ui.TemplateControl|TemplateControl} used to parse
         * the expressions.
         *
         * @returns {string} The output text with all markup bound.
         */
        public static build(
            expressions: expressions.IParsedExpression[],
            control?: ui.TemplateControl
        ): string {
            const length = expressions.length;
            const resources = <IObject<any>>{};
            const evaluateExpression =
                NodeManager._TemplateControlFactory.evaluateExpression;
            let text = '';
            let expression: expressions.IParsedExpression;
            let value: any;

            for (let i = 0; i < length; i += 1) {
                expression = expressions[i];
                value = evaluateExpression(expression, control, resources);

                if (isObject(value)) {
                    try {
                        text += JSON.stringify(value, null, 4);
                    } catch (e) {
                        if (!isNull(e.description)) {
                            e.description = `Cannot stringify object: ${
                                e.description
                            }`;
                        }
                        e.message = `Cannot stringify object: ${e.message}`;

                        NodeManager._log.warn(e);
                    }
                } else if (!isNull(value)) {
                    text += value;
                }
            }

            return text;
        }

        /**
         * @name observeExpressions
         * @memberof plat.processing.NodeManager
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Registers a listener to be notified of a change in any associated identifier.
         *
         * @param {Array<plat.expressions.IParsedExpression>} expressions An Array of
         * {@link plat.expressions.IParsedExpression|IParsedExpressions} to observe.
         * @param {plat.ui.TemplateControl} control The {@link plat.ui.TemplateControl|TemplateControl} associated
         * to the identifiers.
         * @param {(...args: Array<any>) => void} listener The listener to call when any identifier property changes.
         *
         * @returns {void}
         */
        public static observeExpressions(
            expressions: expressions.IParsedExpression[],
            control: ui.TemplateControl,
            listener: (...args: any[]) => void
        ): void {
            const uniqueIdentifiers = NodeManager.__findUniqueIdentifiers(
                expressions
            );
            const identifiers = uniqueIdentifiers.identifiers;
            const oneTimeIdentifiers = uniqueIdentifiers.oneTimeIdentifiers;
            const observableCallback = {
                listener: listener,
                uid: control.uid,
            };
            let oneTimeIdentifier: string;
            let observationDetails: IObservationDetails;
            let manager: observable.ContextManager;
            let absoluteIdentifier: string;

            while (identifiers.length > 0) {
                observationDetails = NodeManager.__getObservationDetails(
                    identifiers.pop(),
                    control
                );
                manager = observationDetails.manager;
                if (!isNull(manager)) {
                    manager.observe(
                        observationDetails.absoluteIdentifier,
                        observableCallback
                    );
                }
            }

            while (oneTimeIdentifiers.length > 0) {
                oneTimeIdentifier = oneTimeIdentifiers.pop();
                observationDetails = NodeManager.__getObservationDetails(
                    oneTimeIdentifier,
                    control
                );
                manager = observationDetails.manager;
                if (!(isNull(manager) || observationDetails.isDefined)) {
                    absoluteIdentifier = observationDetails.absoluteIdentifier;
                    const stopObserving = manager.observe(
                        absoluteIdentifier,
                        observableCallback
                    );
                    const stopListening = manager.observe(absoluteIdentifier, {
                        uid: control.uid,
                        listener: (): void => {
                            stopObserving();
                            stopListening();
                        },
                    });
                }
            }
        }

        /**
         * @name _wrapExpression
         * @memberof plat.processing.NodeManager
         * @kind function
         * @access protected
         * @static
         *
         * @description
         * Wraps constant text as a static {@link plat.expressions.IParsedExpression|IParsedExpression}.
         *
         * @param text The text to wrap into a static expression.
         *
         * @returns {plat.expressions.IParsedExpression} The wrapped, static expression.
         */
        protected static _wrapExpression(
            text: string
        ): expressions.IParsedExpression {
            return {
                evaluate: (): string => text,
                identifiers: [],
                aliases: [],
                expression: text,
            };
        }

        /**
         * @name __findUniqueIdentifiers
         * @memberof plat.processing.NodeManager
         * @kind function
         * @access private
         * @static
         *
         * @description
         * Given an {@link plat.expressions.IParsedExpression|IParsedExpression} array, creates an array of unique identifers
         * to use with binding. This allows us to avoid creating multiple listeners for the identifier and node.
         *
         * @param {Array<plat.expressions.IParsedExpression>} expressions An array of parsed expressions to search for identifiers.
         *
         * @returns {plat.processing.IUniqueIdentifiers} An object containing both an array of unique identifiers for
         * one way binding as well as an array of unique identifiers for one time binding.
         */
        private static __findUniqueIdentifiers(
            expressions: expressions.IParsedExpression[]
        ): IUniqueIdentifiers {
            const length = expressions.length;
            let expression: expressions.IParsedExpression;

            if (length === 1) {
                expression = expressions[0];
                if (expression.oneTime === true) {
                    return {
                        identifiers: [],
                        oneTimeIdentifiers: expression.identifiers.slice(0),
                    };
                }

                return {
                    identifiers: expression.identifiers.slice(0),
                    oneTimeIdentifiers: [],
                };
            }

            const uniqueIdentifierObject: IObject<boolean> = {};
            const oneTimeIdentifierObject: IObject<boolean> = {};
            const uniqueIdentifiers: string[] = [];
            const oneTimeIdentifiers: string[] = [];
            let identifiers: string[];
            let identifier: string;
            let j: number;
            let jLength: number;
            let oneTime: boolean;

            for (let i = 0; i < length; i += 1) {
                expression = expressions[i];
                oneTime = expression.oneTime;
                identifiers = expression.identifiers;
                jLength = identifiers.length;

                for (j = 0; j < jLength; j += 1) {
                    identifier = identifiers[j];
                    if (oneTime) {
                        if (uniqueIdentifierObject[identifier] === true) {
                            continue;
                        }

                        if (!oneTimeIdentifierObject[identifier]) {
                            oneTimeIdentifierObject[identifier] = true;
                            oneTimeIdentifiers.push(identifier);
                        }
                    } else {
                        if (!uniqueIdentifierObject[identifier]) {
                            uniqueIdentifierObject[identifier] = true;
                            uniqueIdentifiers.push(identifier);
                        }

                        if (oneTimeIdentifierObject[identifier] === true) {
                            oneTimeIdentifierObject[identifier] = false;
                            oneTimeIdentifiers.splice(
                                oneTimeIdentifiers.indexOf(identifier),
                                1
                            );
                        }
                    }
                }
            }

            return {
                identifiers: uniqueIdentifiers,
                oneTimeIdentifiers: oneTimeIdentifiers,
            };
        }

        /**
         * @name __getObservationDetails
         * @memberof plat.processing.NodeManager
         * @kind function
         * @access private
         * @static
         *
         * @description
         * Takes in an identifier and returns an object containing both its converted absolute path and the
         * {@link plat.observable.ContextManager|ContextManager} needed to observe it.
         *
         * @param {string} identifier The identifier looking to be observed.
         * @param {plat.ui.TemplateControl} control The {@link plat.ui.TemplateControl|TemplateControl} associated
         * to the identifiers.
         *
         * @returns {plat.processing.IObservationDetails} An object containing information needed for observing a the given
         * identifier.
         */
        private static __getObservationDetails(
            identifier: string,
            control: ui.TemplateControl
        ): IObservationDetails {
            const _ContextManager = NodeManager._ContextManager;
            const split = identifier.split('.');
            let manager: observable.ContextManager;
            let absoluteIdentifier = '';
            let isDefined = false;

            if (identifier[0] === '@') {
                // we found an alias
                const resources: IObject<{
                    resource: ui.IResource;
                    control: ui.TemplateControl;
                }> = {};
                const topIdentifier = split.shift();
                const alias = topIdentifier.slice(1);
                let resourceObj: {
                    resource: ui.IResource;
                    control: ui.TemplateControl;
                };

                if (split.length > 0) {
                    absoluteIdentifier = `.${split.join('.')}`;
                }

                resourceObj = resources[alias];

                if (isNull(resourceObj)) {
                    resourceObj = resources[alias] = control.findResource(
                        alias
                    );
                }

                if (!isNull(resourceObj) && !isNull(resourceObj.resource)) {
                    const type = resourceObj.resource.type;
                    if (alias === __CONTEXT_RESOURCE) {
                        manager = _ContextManager.getManager(
                            Control.getRootControl(control)
                        );
                        absoluteIdentifier =
                            control.absoluteContextPath + absoluteIdentifier;
                    } else if (alias === __ROOT_CONTEXT_RESOURCE) {
                        manager = _ContextManager.getManager(
                            resources[alias].control
                        );
                        absoluteIdentifier = `context${absoluteIdentifier}`;
                    } else if (
                        type === __OBSERVABLE_RESOURCE ||
                        type === __LITERAL_RESOURCE
                    ) {
                        manager = _ContextManager.getManager(
                            resources[alias].control
                        );
                        absoluteIdentifier = `resources.${alias}.value${absoluteIdentifier}`;
                    }
                }
            } else {
                // look on the control.context
                isDefined = !isUndefined(
                    _ContextManager.getContext(control.context, split)
                );

                if (
                    isDefined ||
                    isUndefined(_ContextManager.getContext(control, split))
                ) {
                    manager = _ContextManager.getManager(
                        Control.getRootControl(control)
                    );
                    absoluteIdentifier = `${
                        control.absoluteContextPath
                    }.${identifier}`;
                } else {
                    manager = null;
                }
            }

            return {
                absoluteIdentifier: absoluteIdentifier,
                manager: manager,
                isDefined: isDefined,
            };
        }

        /**
         * @name initialize
         * @memberof plat.processing.NodeManager
         * @kind function
         * @access public
         *
         * @description
         * Initializes the manager's properties.
         *
         * @param {plat.processing.INodeMap} nodeMap The mapping associated with this manager. We have to use an
         * Used to treat all {@link plat.processing.NodeManager|NodeManagers} the same.
         * @param {plat.processing.ElementManager} parent The parent {@link plat.processing.ElementManager|ElementManager}.
         *
         * @returns {void}
         */
        public initialize(nodeMap: INodeMap, parent: ElementManager): void {
            this.nodeMap = nodeMap;
            this.parent = parent;

            if (!isNull(parent)) {
                this.isClone = parent.isClone;
                parent.children.push(this);
            }
        }

        /**
         * @name getParentControl
         * @memberof plat.processing.NodeManager
         * @kind function
         * @access public
         *
         * @description
         * Retrieves the parent control associated with the parent manager.
         *
         * @returns {plat.ui.TemplateControl} The parent {@link plat.ui.TemplateControl|TemplateControl}.
         */
        public getParentControl(): ui.TemplateControl {
            let parent = this.parent;
            let control: ui.TemplateControl;

            while (isNull(control)) {
                if (isNull(parent)) {
                    break;
                }

                control = parent.getUiControl();
                parent = parent.parent;
            }

            return control;
        }

        /**
         * @name clone
         * @memberof plat.processing.NodeManager
         * @kind function
         * @access public
         *
         * @description
         * Clones this {@link plat.processing.NodeManager|NodeManager} with the new node.
         *
         * @param {Node} newNode The new node associated with the new manager.
         * @param {plat.processing.ElementManager} parentManager The parent
         * {@link plat.processing.ElementManager|ElementManager} for the clone.
         *
         * @returns {number} The number of nodes to advance while node traversal is in progress.
         */
        public clone(newNode: Node, parentManager: ElementManager): number {
            return 1;
        }

        /**
         * @name bind
         * @memberof plat.processing.NodeManager
         * @kind function
         * @access public
         *
         * @description
         * The function used for data-binding a data context to the DOM.
         *
         * @returns {void}
         */
        public bind(): void {}
    }

    /**
     * The Type for referencing the '_NodeManager' injectable as a dependency.
     */
    export function INodeManagerStatic(
        _regex?: expressions.Regex,
        _ContextManager?: observable.IContextManagerStatic,
        _parser?: expressions.Parser,
        _TemplateControlFactory?: ui.ITemplateControlFactory,
        _log?: debug.Log
    ): INodeManagerStatic {
        // NOTE: This is not advised by TypeScript, but we want to do this.
        (<any>NodeManager)._markupRegex = _regex.markupRegex;
        (<any>NodeManager)._newLineRegex = _regex.newLineRegex;
        (<any>NodeManager)._ContextManager = _ContextManager;
        (<any>NodeManager)._parser = _parser;
        (<any>NodeManager)._TemplateControlFactory = _TemplateControlFactory;
        (<any>NodeManager)._log = _log;

        return NodeManager;
    }

    register.injectable(
        __NodeManagerStatic,
        INodeManagerStatic,
        [
            __Regex,
            __ContextManagerStatic,
            __Parser,
            __TemplateControlFactory,
            __Log,
        ],
        __STATIC
    );

    /**
     * @name INodeManagerStatic
     * @memberof plat.processing
     * @kind interface
     *
     * @description
     * Performs essential Node management and binding functions.
     */
    export interface INodeManagerStatic {
        /**
         * @name hasMarkup
         * @memberof plat.processing.INodeManagerStatic
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Determines if a string has the markup notation.
         *
         * @param {string} text The text string in which to search for markup.
         *
         * @returns {boolean} Indicates whether or not there is markup.
         */
        hasMarkup(text: string): boolean;

        /**
         * @name findMarkup
         * @memberof plat.processing.INodeManagerStatic
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Given a string, finds markup in the string and creates an array of
         * {@link plat.expressions.IParsedExpression|IParsedExpression}.
         *
         * @param {string} text The text string in which to search for markup.
         *
         * @returns {Array<plat.expressions.IParsedExpression>} An array of parsed expressions that
         * composes the output given a proper context.
         */
        findMarkup(text: string): expressions.IParsedExpression[];

        /**
         * @name build
         * @memberof plat.processing.INodeManagerStatic
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Takes in a control with a data context and an array of {@link plat.expressions.IParsedExpression|IParsedExpression}
         * and outputs a string of the evaluated expressions.
         *
         * @param {Array<plat.expressions.IParsedExpression>} expressions The composition array to evaluate.
         * @param {plat.ui.TemplateControl} control? The {@link plat.ui.TemplateControl|TemplateControl} used to parse
         * the expressions.
         *
         * @returns {string} The output text with all markup bound.
         */
        build(
            expressions: expressions.IParsedExpression[],
            control?: ui.TemplateControl
        ): string;

        /**
         * @name observeExpressions
         * @memberof plat.processing.INodeManagerStatic
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Registers a listener to be notified of a change in any associated identifier.
         *
         * @param {Array<plat.expressions.IParsedExpression>} expressions An Array of
         * {@link plat.expressions.IParsedExpression|IParsedExpressions} to observe.
         * @param {plat.ui.TemplateControl} control The {@link plat.ui.TemplateControl|TemplateControl} associated
         * to the identifiers.
         * @param {(...args: Array<any>) => void} listener The listener to call when any identifier property changes.
         *
         * @returns {void}
         */
        observeExpressions(
            expressions: expressions.IParsedExpression[],
            control: ui.TemplateControl,
            listener: (...args: any[]) => void
        ): void;
    }

    /**
     * @name INode
     * @memberof plat.processing
     * @kind interface
     *
     * @description
     * Describes a compiled Node.
     */
    export interface INode {
        /**
         * @name control
         * @memberof plat.processing.INode
         * @kind property
         * @access public
         *
         * @type {plat.Control}
         *
         * @description
         * The control associated with the Node, if one exists.
         */
        control?: Control;

        /**
         * @name node
         * @memberof plat.processing.INode
         * @kind property
         * @access public
         *
         * @type {Node}
         *
         * @description
         * The Node that is compiled.
         */
        node?: Node;

        /**
         * @name nodeName
         * @memberof plat.processing.INode
         * @kind property
         * @access public
         *
         * @type {string}
         *
         * @description
         * The name of the Node.
         */
        nodeName?: string;

        /**
         * @name expressions
         * @memberof plat.processing.INode
         * @kind property
         * @access public
         *
         * @type {Array<plat.expressions.IParsedExpression>}
         *
         * @description
         * Any {@link plat.expressions.IParsedExpression|IParsedExpressions} contained in the Node.
         */
        expressions?: expressions.IParsedExpression[];

        /**
         * @name injector
         * @memberof plat.processing.INode
         * @kind property
         * @access public
         *
         * @type {plat.dependency.Injector<plat.Control>}
         *
         * @description
         * The injector for a control associated with the Node, if one exists.
         */
        injector?: dependency.Injector<Control>;
    }

    /**
     * @name IUiControlNode
     * @memberof plat.processing
     * @kind interface
     *
     * @extends {plat.processing.INode}
     *
     * @description
     * Defines the interface for a compiled Element.
     */
    export interface IUiControlNode extends INode {
        /**
         * @name control
         * @memberof plat.processing.IUiControlNode
         * @kind property
         * @access public
         *
         * @type {plat.ui.TemplateControl}
         *
         * @description
         * The control associated with the Element, if one exists.
         */
        control: ui.TemplateControl;

        /**
         * @name resourceElement
         * @memberof plat.processing.IUiControlNode
         * @kind property
         * @access public
         *
         * @type {HTMLElement}
         *
         * @description
         * The resources element, if one exists, defined as the control element's first
         * element child.
         */
        resourceElement?: HTMLElement;
    }

    /**
     * @name INodeMap
     * @memberof plat.processing
     * @kind interface
     *
     * @description
     * Describes a compiled Element with all
     * associated nodes contained within its tag.
     */
    export interface INodeMap {
        /**
         * @name element
         * @memberof plat.processing.INodeMap
         * @kind property
         * @access public
         *
         * @type {HTMLElement}
         *
         * @description
         * The Element that is compiled.
         */
        element?: HTMLElement;

        /**
         * @name nodes
         * @memberof plat.processing.INodeMap
         * @kind property
         * @access public
         *
         * @type {Array<plat.processing.INode>}
         *
         * @description
         * The compiled attribute Nodes for the Element.
         */
        nodes: INode[];

        /**
         * @name attributes
         * @memberof plat.processing.INodeMap
         * @kind property
         * @access public
         *
         * @type {plat.IObject<string>}
         *
         * @description
         * An object of key/value attribute pairs.
         */
        attributes?: IObject<string>;

        /**
         * @name childContext
         * @memberof plat.processing.INodeMap
         * @kind property
         * @access public
         *
         * @type {string}
         *
         * @description
         * The relative context path for the node's corresponding
         * {@link plat.ui.TemplateControl|TemplateControl}, if specified.
         */
        childContext?: string | number;

        /**
         * @name hasControl
         * @memberof plat.processing.INodeMap
         * @kind property
         * @access public
         *
         * @type {boolean}
         *
         * @description
         * Indicates whether or not an {@link plat.Control|Control} was found on the Element.
         */
        hasControl?: boolean;

        /**
         * @name uiControlNode
         * @memberof plat.processing.INodeMap
         * @kind property
         * @access public
         *
         * @type {plat.processing.IUiControlNode}
         *
         * @description
         * A type of {@link plat.processing.INode|INode} for a node that contains a {@link plat.ui.TemplateControl|TemplateControl},
         * if one was found for the Element.
         */
        uiControlNode?: IUiControlNode;
    }

    /**
     * @name IUniqueIdentifiers
     * @memberof plat.processing
     * @kind interface
     * @exported false
     *
     * @description
     * Holds an array of identifiers for one way bindings and an
     * array of identifiers for one time bindings.
     */
    interface IUniqueIdentifiers {
        /**
         * @name identifiers
         * @memberof plat.processing.IUniqueIdentifiers
         * @kind property
         * @access public
         *
         * @type {Array<string>}
         *
         * @description
         * An array of identifiers used for one way bindings.
         */
        identifiers: string[];
        /**
         * @name oneTimeIdentifiers
         * @memberof plat.processing.IUniqueIdentifiers
         * @kind property
         * @access public
         *
         * @type {Array<string>}
         *
         * @description
         * An array of identifiers used for one time bindings.
         */
        oneTimeIdentifiers: string[];
    }

    /**
     * @name IObservationDetails
     * @memberof plat.processing
     * @kind interface
     * @exported false
     *
     * @description
     * Contains information needed for observing properties.
     */
    interface IObservationDetails {
        /**
         * @name absoluteIdentifier
         * @memberof plat.processing.IObservationDetails
         * @kind property
         * @access public
         *
         * @type {string}
         *
         * @description
         * The absolute identifier to be observed.
         */
        absoluteIdentifier: string;
        /**
         * @name manager
         * @memberof plat.processing.IObservationDetails
         * @kind property
         * @access public
         *
         * @type {plat.observable.ContextManager}
         *
         * @description
         * The {@link plat.observable.ContextManager|ContextManager} that will
         * be doing the observing.
         */
        manager: observable.ContextManager;
        /**
         * @name isDefined
         * @memberof plat.processing.IObservationDetails
         * @kind property
         * @access public
         *
         * @type {boolean}
         *
         * @description
         * Signifies that a context value is defined for one time data binding.
         */
        isDefined: boolean;
    }
}
