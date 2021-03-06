namespace plat {
    'use strict';

    /**
     * @name Control
     * @memberof plat
     * @kind class
     *
     * @description
     * Used for facilitating data and DOM manipulation. Contains lifecycle events
     * as well as properties for communicating with other controls. This is the base
     * class for all types of controls.
     */
    export class Control {
        /**
         * @name _log
         * @memberof plat.Control
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
         * @name _dom
         * @memberof plat.Control
         * @kind property
         * @access protected
         * @static
         *
         * @type {plat.ui.Dom}
         *
         * @description
         * Reference to the {@link plat.ui.Dom|Dom} injectable.
         */
        protected static _dom: ui.Dom;

        /**
         * @name _parser
         * @memberof plat.Control
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
         * @name _ContextManager
         * @memberof plat.Control
         * @kind property
         * @access protected
         * @static
         *
         * @type {plat.observable.IContextManagerStatic}
         *
         * @description
         * Reference to the {@link plat.observable.IContextManagerStatic|ContextManagerStatic} injectable.
         */
        protected static _ContextManager: observable.IContextManagerStatic;

        /**
         * @name _EventManager
         * @memberof plat.Control
         * @kind property
         * @access protected
         * @static
         *
         * @type {plat.events.IEventManagerStatic}
         *
         * @description
         * Reference to the {@link plat.events.IEventManagerStatic|IEventManagerStatic} injectable.
         */
        protected static _EventManager: events.IEventManagerStatic;

        /**
         * @name _Promise
         * @memberof plat.Control
         * @kind property
         * @access protected
         * @static
         *
         * @type {plat.async.IPromise}
         *
         * @description
         * Reference to the {@link plat.async.IPromise|IPromise} injectable.
         */
        protected static _Promise: async.IPromise;

        /**
         * @name __eventListeners
         * @memberof plat.Control
         * @kind property
         * @access private
         * @static
         *
         * @type {plat.IObject<Array<plat.IRemoveListener>>}
         *
         * @description
         * An object containing all controls' registered event listeners.
         */
        private static __eventListeners: IObject<IRemoveListener[]> = {};

        /**
         * @name uid
         * @memberof plat.Control
         * @kind property
         * @access public
         * @readonly
         *
         * @type {string}
         *
         * @description
         * A unique id, created during instantiation and found on every {@link plat.Control|Control}.
         */
        public uid: string = uniqueId(__Plat);

        /**
         * @name type
         * @memberof plat.Control
         * @kind property
         * @access public
         * @readonly
         *
         * @type {string}
         *
         * @description
         * The type of a {@link plat.Control|Control}.
         */
        public type: string;

        /**
         * @name priority
         * @memberof plat.Control
         * @kind property
         * @access public
         *
         * @type {number}
         *
         * @description
         * Specifies the priority of the control. The purpose of
         * this is so that controls like plat-bind can have a higher
         * priority than plat-tap. The plat-bind will be initialized
         * and loaded before plat-tap, meaning it has the first chance
         * to respond to events.
         */
        public priority: number = 0;

        /**
         * @name parent
         * @memberof plat.Control
         * @kind property
         * @access public
         * @readonly
         *
         * @type {plat.ui.TemplateControl}
         *
         * @description
         * The parent control that created this control.
         */
        public parent: ui.TemplateControl;

        /**
         * @name element
         * @memberof plat.Control
         * @kind property
         * @access public
         *
         * @type {HTMLElement}
         *
         * @description
         * The HTMLElement that represents this {@link plat.Control|Control}. Should only be modified by controls that implement
         * {@link plat.ui.TemplateControl|TemplateControl}. During initialize the control should populate this element with what it wishes
         * to render to the user.
         *
         * @remarks
         * When there is innerHTML in the element prior to instantiating the control:
         *     The element will include the innerHTML
         * When the control implements templateString or templateUrl:
         *     The serialized DOM will be auto-generated and included in the element. Any
         *     innerHTML will be stored in the innerTemplate property on the control.
         * After an {@link plat.Control|Control} is initialized its element will be compiled.
         */
        public element: HTMLElement;

        /**
         * @name attributes
         * @memberof plat.Control
         * @kind property
         * @access public
         *
         * @type {plat.ui.Attributes}
         *
         * @description
         * The attributes object representing all the attributes for a {@link plat.Control|Control's} element. All attributes are
         * converted from dash notation to camelCase.
         */
        public attributes: ui.Attributes;

        /**
         * @name dom
         * @memberof plat.Control
         * @kind property
         * @access public
         * @readonly
         *
         * @type {plat.ui.Dom}
         *
         * @description
         * Contains DOM helper methods for manipulating this control's element.
         */
        public dom: ui.Dom = Control._dom;

        /**
         * @name utils
         * @memberof plat.Control
         * @kind property
         * @access public
         *
         * @type {plat.Utils}
         *
         * @description
         * Contains helper methods for data manipulation.
         */
        public utils: Utils = acquire(__Utils);

        /**
         * @name _log
         * @memberof plat.Control
         * @kind property
         * @access protected
         *
         * @type {plat.debug.Log}
         * @description
         * Reference to the {@link plat.debug.Log|Log} injectable.
         */
        protected _log: debug.Log = Control._log;

        /**
         * @name getRootControl
         * @memberof plat.Control
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Finds the ancestor control for the given control that contains the root
         * context.
         *
         * @param {plat.Control} control The control with which to find the root.
         *
         * @returns {plat.ui.TemplateControl} The root control.
         */
        public static getRootControl(control: Control): ui.TemplateControl;
        public static getRootControl(
            control: ui.TemplateControl
        ): ui.TemplateControl {
            if (isNull(control)) {
                return control;
            } else if (!isNull(control.root)) {
                return control.root;
            }

            while (!(isNull(control.parent) || control.hasOwnContext)) {
                if (!isNull(control.root)) {
                    return control.root;
                }
                control = control.parent;
            }

            if (!control.hasOwnContext && isObject(control.context)) {
                Control._log.debug(
                    `Root control: ${
                        control.type
                    } found that sets its context to an Object but does not set the this.hasOwnContext = true.`
                );
            }

            return control;
        }

        /**
         * @name load
         * @memberof plat.Control
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Given a control, calls the loaded method for the control if it exists.
         *
         * @param {plat.Control} control The control to load.
         *
         * @returns {plat.async.Promise<void>} A Promise that resolves when the control has loaded.
         */
        public static load(control: Control): async.Promise<void> {
            const _Promise = Control._Promise;

            if (isNull(control)) {
                return _Promise.resolve();
            }

            const ctrl = <ui.TemplateControl>control;

            if (isString(ctrl.absoluteContextPath)) {
                if (isFunction(ctrl.contextChanged)) {
                    const contextManager = Control._ContextManager.getManager(
                        ctrl.root
                    );

                    contextManager.observe(ctrl.absoluteContextPath, {
                        uid: control.uid,
                        priority: __CONTEXT_CHANGED_PRIORITY,
                        listener: (newValue, oldValue): void => {
                            ui.TemplateControl.contextChanged(
                                <ui.TemplateControl>control,
                                newValue,
                                oldValue
                            );
                        },
                    });

                    if (isFunction((<any>ctrl).zCC__plat)) {
                        (<any>ctrl).zCC__plat();
                        deleteProperty(ctrl, 'zCC__plat');
                    }
                }

                const element = ctrl.element;
                if (isNode(element) && isFunction(element.removeAttribute)) {
                    element.removeAttribute(__Hide);
                }
            }

            if (isFunction(control.loaded)) {
                return _Promise.resolve((<any>control).loaded());
            }

            return _Promise.resolve();
        }

        /**
         * @name dispose
         * @memberof plat.Control
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Disposes all the necessary memory for a control. Uses specific dispose
         * methods related to a control's constructor if necessary.
         *
         * @param {plat.Control} control The {@link plat.Control|Control} to dispose.
         *
         * @returns {void}
         */
        public static dispose(control: Control): void {
            const ctrl = <any>control;

            if (isNull(ctrl)) {
                return;
            } else if (!isUndefined(ctrl.templateControl)) {
                AttributeControl.dispose(ctrl);

                return;
            } else if (ctrl.hasOwnContext) {
                ui.ViewControl.dispose(ctrl);

                return;
            } else if (ctrl.controls) {
                ui.TemplateControl.dispose(ctrl);

                return;
            }

            if (isFunction(control.dispose)) {
                control.dispose();
            }

            Control.removeEventListeners(control);
            Control._ContextManager.dispose(control);
            control.element = null;
            Control.removeParent(control);

            if ((<IInternal>control).__injectable__type === __STATIC) {
                const injector = controlInjectors[control.type];
                register.control(
                    control.type,
                    (<any>control).constructor,
                    <[string]>injector.dependencies,
                    true
                );
            }
        }

        /**
         * @name removeParent
         * @memberof plat.Control
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Splices a control from its parent's controls list. Sets the control's parent
         * to null.
         *
         * @param {plat.Control} control The control whose parent will be removed.
         *
         * @returns {void}
         */
        public static removeParent(control: Control): void {
            if (isNull(control)) {
                return;
            }

            const parent = control.parent;

            if (isNull(parent)) {
                return;
            }

            let controls = parent.controls;

            if (!isArray(controls)) {
                controls = [];
            }

            const index = controls.indexOf(control);

            if (index !== -1) {
                controls.splice(index, 1);
            }

            control.parent = null;
        }

        /**
         * @name removeEventListeners
         * @memberof plat.Control
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Removes all event listeners for a control with the given uid.
         *
         * @param {plat.Control} control The control having its event listeners removed.
         *
         * @returns {void}
         */
        public static removeEventListeners(control: Control): void {
            if (isNull(control)) {
                return;
            }

            const removeListeners = Control.__eventListeners;
            const uid = control.uid;
            const listeners = removeListeners[uid];

            if (isArray(listeners)) {
                let index = listeners.length;
                while (index > 0) {
                    index -= 1;
                    listeners[index]();
                }

                deleteProperty(removeListeners, uid);
            }
        }

        /**
         * @name getInstance
         * @memberof plat.Control
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Returns a new instance of {@link plat.Control|Control}.
         *
         * @returns {plat.Control} The newly instantiated control.
         */
        public static getInstance(): Control {
            return new Control();
        }

        /**
         * @name __addRemoveListener
         * @memberof plat.Control
         * @kind function
         * @access private
         * @static
         *
         * @description
         * Adds a function to remove an event listener for the control specified
         * by its uid.
         *
         * @param {string} uid The uid of the control associated with the remove function.
         * @param {plat.IRemoveListener} listener The remove function to add.
         *
         * @returns {void}
         */
        private static __addRemoveListener(
            uid: string,
            listener: IRemoveListener
        ): void {
            const removeListeners = Control.__eventListeners;

            if (isArray(removeListeners[uid])) {
                removeListeners[uid].push(listener);

                return;
            }

            removeListeners[uid] = [listener];
        }

        /**
         * @name __spliceRemoveListener
         * @memberof plat.Control
         * @kind function
         * @access private
         * @static
         *
         * @description
         * Removes a {@link plat.IRemoveListener|IRemoveListener} from a control's listeners.
         *
         * @param {string} uid The uid of the control associated with the remove function.
         * @param {plat.IRemoveListener} listener The remove function to add.
         *
         * @returns {void}
         */
        private static __spliceRemoveListener(
            uid: string,
            listener: IRemoveListener
        ): void {
            const removeListeners = Control.__eventListeners;
            const controlListeners = removeListeners[uid];

            if (isArray(controlListeners)) {
                const index = controlListeners.indexOf(listener);
                if (index === -1) {
                    return;
                }

                controlListeners.splice(index, 1);
            }
        }

        /**
         * @name __getControls
         * @memberof plat.Control
         * @kind function
         * @access private
         * @static
         *
         * @description
         * Gets controls that have a specific key/value string pair.
         *
         *
         * @param {plat.Control} control The at which to start searching for key/value pairs.
         * @param {string} key The key to search for on all the controls in the tree.
         * @param {string} value The expected value used to find similar controls.
         *
         * @returns {Array<plat.Control>} The controls matching the input key/value pair.
         */
        private static __getControls<T extends Control>(
            control: Control,
            key: string,
            value: string | (new () => T)
        ): T[] {
            const controls: Control[] = [];
            const root = Control.getRootControl(control);
            let child: Control;

            if (!isNull(root) && (<any>root)[key] === value) {
                controls.push(root);
            }

            const children = root.controls;

            if (isNull(children)) {
                return <T[]>controls;
            }

            let queue = (<Control[]>[]).concat(children);
            while (queue.length > 0) {
                child = queue.shift();

                if ((<any>child)[key] === value) {
                    controls.push(child);
                }

                if (isNull((<ui.TemplateControl>child).controls)) {
                    continue;
                }

                queue = queue.concat((<ui.TemplateControl>child).controls);
            }

            return <T[]>controls;
        }

        /**
         * @name constructor
         * @memberof plat.Control
         * @kind function
         * @access public
         *
         * @description
         * The constructor for a control. Any injectables specified during control registration will be
         * passed into the constructor as arguments as long as the control is instantiated with its associated
         * injector.
         *
         * @returns {plat.Control}
         */
        constructor() {}

        /**
         * @name initialize
         * @memberof plat.Control
         * @kind function
         * @access public
         * @virtual
         *
         * @description
         * The initialize event method for a control. In this method a control should initialize all the necessary
         * variables. This method is typically only necessary for view controls. If a control does not implement
         * {@link plat.ui.IBaseViewControl|IBaseViewControl} then it is not safe to access, observe, or modify
         * the context property in this method. A view control should call services/set context in this method in
         * order to fire the loaded event. No control will be loaded until the view control has specified a context.
         *
         * @returns {void}
         */
        public initialize(): void {}

        /**
         * @name loaded
         * @memberof plat.Control
         * @kind function
         * @access public
         * @virtual
         *
         * @description
         * The loaded event method for a control. This event is fired after a control has been loaded,
         * meaning all of its children have also been loaded and initial DOM has been created and populated. It is now
         * safe for all controls to access, observe, and modify the context property.
         *
         * @returns {void}
         */
        public loaded(): void {}

        /**
         * @name getControlsByName
         * @memberof plat.Control
         * @kind function
         * @access public
         *
         * @description
         * Retrieves all the controls with the specified name.
         *
         * @param {string} name The string name with which to populate the returned controls array.
         *
         * @returns {Array<plat.Control>} The controls that match the input name.
         */
        public getControlsByName(name: string): Control[] {
            return Control.__getControls(this, 'name', name);
        }

        /**
         * @name getControlsByType
         * @memberof plat.Control
         * @kind function
         * @access public
         *
         * @description
         * Retrieves all the controls of the specified type.
         *
         * @typeparam {plat.Control} T The type of control to be returned in an Array.
         *
         * @param {new () => T} Constructor The constructor used to find controls.
         *
         * @returns {Array<T>} The controls matching the input type.
         */
        public getControlsByType<T extends Control>(
            type: string | (new () => T)
        ): T[] {
            if (isString(type)) {
                return Control.__getControls(this, 'type', type);
            }

            return Control.__getControls(this, 'constructor', type);
        }

        /**
         * @name addEventListener
         * @memberof plat.Control
         * @kind function
         * @access public
         *
         * @description
         * Adds an event listener of the specified type to the specified element. Removal of the
         * event is handled automatically upon disposal.
         *
         * @param {EventTarget} element The element to add the event listener to.
         * @param {string}  type The type of event to listen to.
         * @param {EventListener} listener The listener to fire when the event occurs.
         * @param {boolean} useCapture? Whether to fire the event on the capture or the bubble phase
         * of event propagation.
         *
         * @returns {plat.IRemoveListener} A function to call in order to stop listening to the event.
         */
        public addEventListener(
            element: EventTarget,
            type: string,
            listener: ui.IGestureListener | EventListener,
            useCapture?: boolean
        ): IRemoveListener {
            if (!isFunction(listener)) {
                this._log.warn(
                    '"Control.addEventListener" must take a function as the third argument.'
                );

                return noop;
            }

            listener = listener.bind(this);
            const removeListener = this.dom.addEventListener(
                <Element>element,
                type,
                listener,
                useCapture
            );
            const uid = this.uid;

            Control.__addRemoveListener(uid, removeListener);

            return (): void => {
                removeListener();
                Control.__spliceRemoveListener(uid, removeListener);
            };
        }

        /**
         * @name observe
         * @memberof plat.Control
         * @kind function
         * @access public\
         *
         * @description
         * Allows a {@link plat.Control|Control} to observe any property on its context and receive updates when
         * the property is changed.
         *
         * @typeparam {any} T The type of object to observe.
         *
         * @param {plat.IIdentifierChangedListener<T>} listener The method called when the property is changed. This method
         * will have its 'this' context set to the control instance.
         * @param {number} index? The index that denotes the item in the context if the context is an Array.
         *
         * @returns {plat.IRemoveListener} A function to call in order to stop observing the property.
         */
        public observe<T>(
            listener: (
                value: T,
                oldValue: T,
                identifier: number | string
            ) => void,
            identifier?: number | string
        ): IRemoveListener {
            const control: ui.TemplateControl = isObject((<any>this).context)
                ? <any>this
                : this.parent;
            const root = Control.getRootControl(control);

            if (isNull(control)) {
                return noop;
            } else if (isNull(control.absoluteContextPath)) {
                this._log.warn(
                    'Should not call plat.Control.observe prior to the control being loaded'
                );

                return noop;
            }

            let absoluteIdentifier: string;
            let _parser = Control._parser;

            if (!isObject(_parser)) {
                _parser = <expressions.Parser>acquire(__Parser);
            }

            if (isEmpty(identifier)) {
                absoluteIdentifier = control.absoluteContextPath;
            } else if (isString(identifier)) {
                const identifierExpression = _parser.parse(<string>identifier);
                const identifiers = identifierExpression.identifiers;

                if (identifiers.length > 1) {
                    this._log.warn(
                        'Only a single identifier can be observed when calling the function plat.Control.observe'
                    );
                }

                const expression = identifierExpression.identifiers[0];
                if (expression[0] === '@') {
                    const split: string[] = expression.split('.');
                    const start = split.shift().slice(1);
                    const join = split.length > 0 ? `.${split.join('.')}` : '';

                    if (start === __ROOT_CONTEXT_RESOURCE) {
                        absoluteIdentifier = __CONTEXT + join;
                    } else if (start === __CONTEXT_RESOURCE) {
                        absoluteIdentifier = control.absoluteContextPath + join;
                    } else {
                        absoluteIdentifier = `${
                            control.absoluteContextPath
                        }.${expression}`;
                    }
                } else {
                    absoluteIdentifier = `${
                        control.absoluteContextPath
                    }.${expression}`;
                }
            } else {
                absoluteIdentifier = `${
                    control.absoluteContextPath
                }.${identifier}`;
            }

            let _ContextManager: observable.IContextManagerStatic =
                Control._ContextManager;

            if (!isObject(_ContextManager)) {
                _ContextManager = acquire(__ContextManagerStatic);
            }

            const contextManager = _ContextManager.getManager(root);

            return contextManager.observe(absoluteIdentifier, {
                listener: (newValue: any, oldValue: any): void => {
                    listener.call(this, newValue, oldValue, identifier);
                },
                uid: this.uid,
            });
        }

        /**
         * @name observeArray
         * @memberof plat.Control
         * @kind function
         * @access public
         * @variation 0
         *
         * @description
         * Allows a {@link plat.Control|Control} to observe an array and receive updates when certain array-changing methods are called.
         * The methods watched are push, pop, shift, sort, splice, reverse, and unshift. This method currently does not watch
         * every item in the array.
         *
         * @typeparam {any} T The type of the Array to observe.
         *
         * @param {(changes: Array<plat.observable.IArrayChanges<any>>, identifier: string) => void} listener The method called
         * after an array-changing method is called. This method will have its 'this' context set to the control instance.
         * @param {string} identifier? The property string that denotes the array in the context.
         *
         * @returns {plat.IRemoveListener} A function to call in order to stop observing the array.
         */
        public observeArray<T>(
            listener: (
                changes: observable.IArrayChanges<T>[],
                identifier: string
            ) => void,
            identifier?: string
        ): IRemoveListener;
        /**
         * @name observeArray
         * @memberof plat.Control
         * @kind function
         * @access public
         * @variation 1
         *
         * @description
         * Allows a {@link plat.Control|Control} to observe an array and receive updates when certain array-changing methods are called.
         * The methods watched are push, pop, shift, sort, splice, reverse, and unshift. This method currently does not watch
         * every item in the array.
         *
         * @typeparam {any} T The type of the Array to observe.
         *
         * @param {(changes: Array<plat.observable.IArrayChanges<T>>, identifier: number) => void} listener The method called
         * after an array-changing method is called. This method will have its 'this' context set to the control instance.
         * @param {number} identifier? The index that denotes the array in the context if the context is an Array.
         *
         * @returns {plat.IRemoveListener} A function to call in order to stop observing the array.
         */
        public observeArray<T>(
            listener: (
                changes: observable.IArrayChanges<T>[],
                identifier: number
            ) => void,
            identifier?: number
        ): IRemoveListener;
        public observeArray<T>(
            listener: (
                changes: observable.IArrayChanges<T>[],
                identifier: any
            ) => void,
            identifier?: any
        ): IRemoveListener {
            const control: ui.TemplateControl = isObject((<any>this).context)
                ? <any>this
                : this.parent;
            const context = control.context;

            if (isNull(control) || !isObject(context)) {
                return noop;
            }

            let array: any[];
            let absoluteIdentifier: string;
            let _parser = Control._parser;

            if (!isObject(_parser)) {
                _parser = <expressions.Parser>acquire(__Parser);
            }

            if (isEmpty(identifier)) {
                array = context;
                absoluteIdentifier = control.absoluteContextPath;
            } else if (isString(identifier)) {
                const identifierExpression = _parser.parse(identifier);
                array = identifierExpression.evaluate(context);
                absoluteIdentifier = `${control.absoluteContextPath}.${
                    identifierExpression.identifiers[0]
                }`;
            } else {
                array = context[identifier];
                absoluteIdentifier = `${
                    control.absoluteContextPath
                }.${identifier}`;
            }

            if (!isArray(array)) {
                return noop;
            }

            const listenerIsFunction = isFunction(listener);
            if (!listenerIsFunction) {
                return noop;
            }

            listener = listener.bind(this);

            let _ContextManager: observable.IContextManagerStatic =
                Control._ContextManager;

            if (!isObject(_ContextManager)) {
                _ContextManager = acquire(__ContextManagerStatic);
            }

            const contextManager = _ContextManager.getManager(
                Control.getRootControl(control)
            );
            const uid = this.uid;
            const callback = (
                changes: observable.IArrayChanges<any>[]
            ): void => {
                listener(changes, identifier);
            };
            let removeListener = contextManager.observeArrayMutation(
                uid,
                callback,
                absoluteIdentifier,
                array,
                null
            );
            const removeCallback = contextManager.observe(absoluteIdentifier, {
                listener: (newValue: any[], oldValue: any[]): void => {
                    removeListener();
                    removeListener = contextManager.observeArrayMutation(
                        uid,
                        callback,
                        absoluteIdentifier,
                        newValue,
                        oldValue
                    );
                },
                uid: uid,
            });

            return (): void => {
                removeListener();
                removeCallback();
            };
        }

        /**
         * @name observeExpression
         * @memberof plat.Control
         * @kind function
         * @access public
         *
         * @description
         * Using a {@link plat.expressions.IParsedExpression|IParsedExpression} observes any associated identifiers. When an identifier
         * value changes, the listener will be called.
         *
         * @typeparam {any} T The type of value the expression will evaluate out to.
         *
         * @param {plat.IIdentifierChangedListener<T>} listener The listener to call when the expression identifer values change.
         * @param {plat.expressions.IParsedExpression} expression The expression string to watch for changes.
         *
         * @returns {plat.IRemoveListener} A function to call in order to stop observing the expression.
         */
        public observeExpression<T>(
            listener: (
                value: T,
                oldValue: T,
                expression: expressions.IParsedExpression | string
            ) => void,
            expression: expressions.IParsedExpression | string
        ): IRemoveListener {
            if (isEmpty(expression)) {
                return noop;
            }

            let _parser = Control._parser;

            if (!isObject(_parser)) {
                _parser = <expressions.Parser>acquire(__Parser);
            }

            if (isString(expression)) {
                expression = _parser.parse(<string>expression);
            } else if (
                !isFunction(
                    (<expressions.IParsedExpression>expression).evaluate
                )
            ) {
                return noop;
            }

            const control: ui.TemplateControl = !isNull(
                (<ui.TemplateControl>(<any>this)).resources
            )
                ? <ui.TemplateControl>(<any>this)
                : this.parent;

            if (isNull(control) || !isString(control.absoluteContextPath)) {
                return noop;
            }

            let _ContextManager: observable.IContextManagerStatic =
                Control._ContextManager;

            if (!isObject(_ContextManager)) {
                _ContextManager = acquire(__ContextManagerStatic);
            }

            const aliases = (<expressions.IParsedExpression>expression).aliases;
            const resources: IObject<observable.ContextManager> = {};
            const getManager = _ContextManager.getManager;
            const TemplateControl = ui.TemplateControl;
            const findResource = TemplateControl.findResource;
            const evaluateExpression = TemplateControl.evaluateExpression;
            let alias: string;
            let length = aliases.length;
            let resourceObj: {
                resource: ui.IResource;
                control: ui.TemplateControl;
            };
            let type: string;
            let i: number;

            for (i = 0; i < length; i += 1) {
                alias = aliases[i];
                resourceObj = findResource(control, alias);

                if (!isNull(resourceObj)) {
                    type = resourceObj.resource.type;
                    if (
                        type === __OBSERVABLE_RESOURCE ||
                        type === __LITERAL_RESOURCE
                    ) {
                        resources[alias] = getManager(resourceObj.control);
                    }
                }
            }

            const contextManager = getManager(Control.getRootControl(control));
            const absoluteContextPath = control.absoluteContextPath;
            const absolutePath = `${absoluteContextPath}.`;
            const managers: IObject<observable.ContextManager> = {};
            let identifiers = (<expressions.IParsedExpression>expression)
                .identifiers;
            let identifier: string;
            let split: string[] = [];
            let topIdentifier: string;

            length = identifiers.length;

            for (i = 0; i < length; i += 1) {
                identifier = identifiers[i];
                split = identifier.split('.');
                topIdentifier = split[0];

                if (identifier[0] === '@') {
                    alias = topIdentifier.slice(1);

                    if (alias === __CONTEXT_RESOURCE) {
                        managers[
                            absoluteContextPath +
                                identifier.replace(topIdentifier, '')
                        ] = contextManager;
                    } else if (alias === __ROOT_CONTEXT_RESOURCE) {
                        managers[
                            identifier.replace(topIdentifier, 'context')
                        ] = contextManager;
                    } else {
                        identifier = identifier.replace(
                            topIdentifier,
                            `resources.${alias}.value`
                        );

                        if (!isNull(resources[alias])) {
                            managers[identifier] = resources[alias];
                        }
                    }

                    continue;
                }

                managers[absolutePath + identifier] = contextManager;
            }

            identifiers = Object.keys(managers);
            length = identifiers.length;

            let oldValue = evaluateExpression(expression, control);
            const listeners: IRemoveListener[] = [];
            const uid = this.uid;
            const observableListener = (): void => {
                const value = evaluateExpression(expression, control);
                listener.call(
                    this,
                    value,
                    oldValue,
                    (<expressions.IParsedExpression>expression).expression
                );
                oldValue = value;
            };

            for (i = 0; i < length; i += 1) {
                identifier = identifiers[i];

                listeners.push(
                    managers[identifier].observe(identifier, {
                        uid: uid,
                        listener: observableListener,
                    })
                );
            }

            return (): void => {
                const len = listeners.length;

                for (let j = 0; j < len; j += 1) {
                    listeners[j]();
                }
            };
        }

        /**
         * @name evaluateExpression
         * @memberof plat.Control
         * @kind function
         * @access public
         *
         * @description
         * Evaluates an {@link plat.expressions.IParsedExpression|IParsedExpression} using the control.parent.context.
         *
         * @param {string} expression The expression string to evaluate.
         * @param {IObject<any>} aliases Optional alias values to parse with the expression
         *
         * @returns {any} The evaluated expression
         */
        public evaluateExpression(
            expression: string | expressions.IParsedExpression,
            aliases?: IObject<any>
        ): any {
            return ui.TemplateControl.evaluateExpression(
                expression,
                this.parent,
                aliases
            );
        }

        /**
         * @name findProperty
         * @memberof plat.Control
         * @kind function
         * @access public
         *
         * @description
         * Finds the first instance of the specified property
         * in the parent control chain. Returns undefined if not found.
         *
         * @param {string} property The property identifer
         * @param {plat.Control} control? An optional control to use as a starting point to find the property.
         * If nothing is passed in, then the control calling the method will be the starting point.
         *
         * @returns {plat.IControlProperty} An object containing the property's parsed expression, the
         * evaluated property value, and the control that it's on.
         */
        public findProperty(
            property: string,
            control?: Control
        ): IControlProperty {
            let _parser = Control._parser;

            if (!isObject(_parser)) {
                _parser = <expressions.Parser>acquire(__Parser);
            }

            const expression = _parser.parse(property);
            let value: any;

            if (isNull(control)) {
                control = <Control>this;
            }

            while (!isNull(control)) {
                value = expression.evaluate(control);

                if (!isNull(value)) {
                    return {
                        expression: expression,
                        control: control,
                        value: value,
                    };
                }

                control = <Control>control.parent;
            }
        }

        /**
         * @name dispatchEvent
         * @memberof plat.Control
         * @kind function
         * @access public
         *
         * @description
         * Creates a new {@link plat.events.DispatchEvent|DispatchEvent} and propagates it to controls based on the
         * provided direction mechanism. Controls in the propagation chain that registered
         * the event using the control.on() method will receive the event. Propagation will
         * always start with the sender, so the sender can both produce and consume the same
         * event.
         *
         * @param {string} name The name of the event to send, coincides with the name used in the
         * control.on() method.
         * @param {string} direction The direction in which to send the event.
         * @param {Array<any>} ...args Any number of arguments to send to all the listeners.
         *
         * @returns {void}
         */
        public dispatchEvent(
            name: string,
            direction?: 'up' | 'down' | 'direct' | string,
            ...args: any[]
        ): void {
            let _EventManager = Control._EventManager;

            if (!isObject(_EventManager)) {
                _EventManager = acquire(__EventManagerStatic);
            }

            if (!_EventManager.hasDirection(direction)) {
                if (!isUndefined(direction)) {
                    args.unshift(direction);
                }
                direction = _EventManager.UP;
            }
            // tslint:disable-next-line
            let sender: any = this;

            if (!isNull(sender.templateControl)) {
                sender = sender.templateControl;
            }

            _EventManager.dispatch(name, sender, direction, args);
        }

        /**
         * @name on
         * @memberof plat.Control
         * @kind function
         * @access public
         *
         * @description
         * Registers a listener for a {@link plat.events.DispatchEvent|DispatchEvent}. The listener will be called when a
         * {@link plat.events.DispatchEvent|DispatchEvent} is propagating over the control. Any number of listeners can exist
         * for a single event name.
         *
         * @param {string} name The name of the event, coinciding with the {@link plat.events.DispatchEvent|DispatchEvent} name.
         * @param {(ev: plat.events.DispatchEvent, ...args: Array<any>) => void} listener The method called when the
         * {@link plat.events.DispatchEvent|DispatchEvent} is fired.
         *
         * @returns {plat.IRemoveListener} A function to call in order to stop listening for this event.
         */
        public on(
            name: string,
            listener: (ev: events.DispatchEvent, ...args: any[]) => void
        ): IRemoveListener {
            let _EventManager = Control._EventManager;

            if (!isObject(_EventManager)) {
                _EventManager = acquire(__EventManagerStatic);
            }

            return _EventManager.on(this.uid, name, listener, this);
        }

        /**
         * @name dispose
         * @memberof plat.Control
         * @kind function
         * @access public
         * @virtual
         *
         * @description
         * The dispose event is called when a control is being removed from memory. A control should release
         * all of the memory it is using, including DOM event and property listeners.
         *
         * @returns {void}
         */
        public dispose(): void {}
    }

    /**
     * The Type for referencing the '_ControlFactory' injectable as a dependency.
     */
    export function IControlFactory(
        _parser?: expressions.Parser,
        _ContextManager?: observable.IContextManagerStatic,
        _EventManager?: events.IEventManagerStatic,
        _Promise?: async.IPromise,
        _dom?: ui.Dom,
        _log?: debug.Log
    ): IControlFactory {
        (<any>Control)._parser = _parser;
        (<any>Control)._ContextManager = _ContextManager;
        (<any>Control)._EventManager = _EventManager;
        (<any>Control)._Promise = _Promise;
        (<any>Control)._dom = _dom;
        (<any>Control)._log = _log;

        return Control;
    }

    register.injectable(
        __ControlFactory,
        IControlFactory,
        [
            __Parser,
            __ContextManagerStatic,
            __EventManagerStatic,
            __Promise,
            __Dom,
            __Log,
        ],
        __FACTORY
    );

    /**
     * @name IControlFactory
     * @memberof plat
     * @kind interface
     *
     * @description
     * Creates and manages instances of {@link plat.Control|Control}.
     */
    export interface IControlFactory {
        /**
         * @name getRootControl
         * @memberof plat.IControlFactory
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Finds the ancestor control for the given control that contains the root
         * context.
         *
         * @param {plat.Control} control The control with which to find the root.
         *
         * @returns {plat.ui.TemplateControl} The root control.
         */
        getRootControl(control: Control): ui.TemplateControl;

        /**
         * @name load
         * @memberof plat.IControlFactory
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Given a control, calls the loaded method for the control if it exists.
         *
         * @param {plat.Control} control The control to load.
         *
         * @returns {plat.async.Promise<void>} A promise that resolves when the control has loaded.
         */
        load(control: Control): async.Promise<void>;

        /**
         * @name dispose
         * @memberof plat.IControlFactory
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Disposes all the necessary memory for a control. Uses specific dispose
         * methods related to a control's constructor if necessary.
         *
         * @param {plat.Control} control The {@link plat.Control|Control} to dispose.
         *
         * @returns {void}
         */
        dispose(control: Control): void;

        /**
         * @name removeParent
         * @memberof plat.IControlFactory
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Splices a control from its parent's controls list. Sets the control's parent
         * to null.
         *
         * @param {plat.Control} control The control whose parent will be removed.
         *
         * @returns {void}
         */
        removeParent(control: Control): void;

        /**
         * @name removeEventListeners
         * @memberof plat.IControlFactory
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Removes all event listeners for a control with the given uid.
         *
         * @param {plat.Control} control The control having its event listeners removed.
         *
         * @returns {void}
         */
        removeEventListeners(control: Control): void;

        /**
         * @name getInstance
         * @memberof plat.IControlFactory
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Returns a new instance of {@link plat.Control|Control}.
         *
         * @returns {plat.Control} The newly instantiated control.
         */
        getInstance(): Control;
    }

    /**
     * @name IControlProperty
     * @memberof plat
     * @kind interface
     *
     * @description
     * An object that links a property to a control.
     */
    export interface IControlProperty {
        /**
         * @name expression
         * @memberof plat.IControlProperty
         * @kind property
         * @access public
         *
         * @type {plat.expressions.IParsedExpression}
         *
         * @description
         * The parsed expression of the control property.
         */
        expression: expressions.IParsedExpression;

        /**
         * @name value
         * @memberof plat.IControlProperty
         * @kind property
         * @access public
         *
         * @type {any}
         *
         * @description
         * The value of the property.
         */
        value: any;

        /**
         * @name control
         * @memberof plat.IControlProperty
         * @kind property
         * @access public
         *
         * @type {plat.Control}
         *
         * @description
         * The control on which the property is found.
         */
        control: Control;
    }

    export module observable {
        /**
         * @name IObservableProperty
         * @memberof plat.observable
         * @access public
         * @kind interface
         *
         * @description
         * Defines the object added to a template control when its element
         * has an attribute control that extends {@link plat.controls.ObservableAttributeControl|ObservableAttributeControl}.
         *
         * This will contain the value of the expression as well as a way to observe the
         * attribute value for changes.
         *
         * @remarks
         * {@link plat.controls.Option|plat-options} is a control that implements this interface, and puts an 'options'
         * property on its associated template control.
         *
         * The generic type corresponds to the type of object created when the attribute
         * expression is evaluated.
         *
         * @typeparam {any} T The type of the value obtained from the attribute's expression.
         */
        export interface IObservableProperty<T> {
            /**
             * @name value
             * @memberof plat.observable.IObservableProperty
             * @access public
             * @kind property
             *
             * @type {T}
             *
             * @description
             * The value obtained from evaluating the attribute's expression.
             */
            value: T;

            /**
             * @name observe
             * @memberof plat.observable.IObservableProperty
             * @access public
             * @kind function
             *
             * @description
             * A method for observing the attribute for changes.
             *
             * @param {(newValue: T, oldValue: T) => void} listener The listener callback which will be pre-bound to the
             * template control.
             *
             * @returns {plat.IRemoveListener} A method for removing the listener.
             */
            observe(
                listener: (newValue: T, oldValue: T) => void
            ): IRemoveListener;
        }

        /**
         * @name ISupportTwoWayBinding
         * @memberof plat.observable
         * @kind interface
         *
         * @description
         * Defines methods that interact with a control that implements {@link plat.observable.IImplementTwoWayBinding|IImplementTwoWayBinding}
         * (e.g. {@link plat.controls.Bind|Bind}.
         */
        export interface ISupportTwoWayBinding {
            /**
             * @name observeProperty
             * @memberof plat.observable.ISupportTwoWayBinding
             * @kind function
             * @access public
             *
             * @description
             * Adds a listener to be called when the bindable property changes.
             *
             * @param {plat.IPropertyChangedListener<any>} listener The function that acts as a listener.
             *
             * @returns {plat.IRemoveListener} A function to stop listening for property changes.
             */
            onInput(
                listener: (newValue: any, oldValue: any) => void
            ): IRemoveListener;

            /**
             * @name observeProperties
             * @memberof plat.observable.ISupportTwoWayBinding
             * @kind function
             * @access public
             *
             * @description
             * A function that allows this control to observe both the bound property itself as well as
             * potential child properties if being bound to an object.
             *
             * @param {plat.observable.IImplementTwoWayBinding} binder The control that facilitates the
             * data-binding.
             *
             * @returns {void}
             */
            observeProperties(binder: IImplementTwoWayBinding): void;
        }

        /**
         * @name IImplementTwoWayBinding
         * @memberof plat.observable
         * @kind interface
         *
         * @description
         * Defines methods that interact with a control that implements {@link plat.observable.ISupportTwoWayBinding|ISupportTwoWayBinding}
         * (e.g. any control that extends {@link plat.ui.BindControl|BindControl}.
         */
        export interface IImplementTwoWayBinding {
            /**
             * @name observeProperty
             * @memberof plat.observable.IImplementTwoWayBinding
             * @kind function
             * @access public
             *
             * @description
             * A function that allows a {@link plat.observable.ISupportTwoWayBinding|ISupportTwoWayBinding} to observe both the
             * bound property itself as well as potential child properties if being bound to an object.
             *
             * @typeparam {any} T The type of item being observed.
             *
             * @param {plat.observable.IBoundPropertyChangedListener<T>} listener The listener function.
             * @param {number | string} identifier? The path off of the bound object to listen to for changes if the bound object is an Array.
             * If undefined or empty the listener will listen for changes to the bound Array itself.
             * @param {boolean} autocast? Will cast a primitive value to whatever it was set to in code.
             *
             * @returns {plat.IRemoveListener} A function to stop listening for changes.
             */
            observeProperty<T>(
                listener: IBoundPropertyChangedListener<T>,
                identifier?: number | string,
                autocast?: boolean
            ): IRemoveListener;

            /**
             * @name observeArrayChange
             * @memberof plat.observable.IImplementTwoWayBinding
             * @kind function
             * @access public
             * @variation 0
             *
             * @description
             * A function that allows a {@link plat.observable.ISupportTwoWayBinding|ISupportTwoWayBinding} to observe array mutations of the
             * bound property.
             *
             * @typeparam {any} T The type of items in the Array.
             *
             * @param {(changes: Array<plat.observable.IArrayChanges<T>>, identifier: string) => void} listener The listener function.
             * @param {string} identifier? The identifier off of the bound object to listen to for changes. If undefined or empty
             * the listener will listen for changes to the bound item itself.
             *
             * @returns {plat.IRemoveListener} A function to stop listening for changes.
             */
            observeArrayChange<T>(
                listener: (
                    changes: IArrayChanges<T>[],
                    identifier: string
                ) => void,
                identifier?: string
            ): IRemoveListener;
            /**
             * @name observeArrayChange
             * @memberof plat.observable.IImplementTwoWayBinding
             * @kind function
             * @access public
             * @variation 1
             *
             * @description
             * A function that allows a {@link plat.observable.ISupportTwoWayBinding|ISupportTwoWayBinding} to observe array mutations of the
             * bound property.
             *
             * @typeparam {any} T The type of items in the Array.
             *
             * @param {(changes: Array<plat.observable.IArrayChanges<T>>, identifier: number) => void} listener The listener function.
             * @param {number} index? The index off of the bound object to listen to for changes if the bound object is an Array.
             * If undefined or empty the listener will listen for changes to the bound Array itself.
             *
             * @returns {plat.IRemoveListener} A function to stop listening for changes.
             */
            observeArrayChange<T>(
                listener: (
                    changes: IArrayChanges<T>[],
                    identifier: number
                ) => void,
                index?: number
            ): IRemoveListener;

            /**
             * @name evaluate
             * @memberof plat.observable.IImplementTwoWayBinding
             * @kind function
             * @access public
             *
             * @description
             * Gets the current value of the bound property.
             *
             * @returns {any} The current value of the bound property.
             */
            evaluate(): any;
        }

        /**
         * @name IBoundPropertyChangedListener
         * @memberof plat.observable
         * @kind interface
         *
         * @description
         * Defines a function that will be called whenever a bound property specified by a given identifier has changed.
         *
         * @typeparam {any} T The type of each value changing.
         */
        export type IBoundPropertyChangedListener<T> = (
            newValue: T,
            oldValue: T,
            identifier: any,
            firstTime?: boolean
        ) => void;
    }
}
