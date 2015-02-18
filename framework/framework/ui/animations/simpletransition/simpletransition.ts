﻿module plat.ui.animations {
    'use strict';

    /**
     * @name SimpleCssTransition
     * @memberof plat.ui.animations
     * @kind class
     * 
     * @extends {plat.ui.animations.CssAnimation}
     * 
     * @description
     * A simple CSS Animation class that places the 'plat-transition' class on an 
     * element, checks for transition properties, and waits for the transition to end.
     */
    export class SimpleCssTransition extends CssAnimation {
        /**
         * @name options
         * @memberof plat.ui.animations.SimpleCssTransition
         * @kind property
         * @access public
         * 
         * @type {plat.ui.animations.ISimpleCssTransitionOptions}
         * 
         * @description
         * An optional options object that can denote a pseudo element animation and specify 
         * properties to modify during the transition.
         */
        options: ISimpleCssTransitionOptions;

        /**
         * @name className
         * @memberof plat.ui.animations.SimpleCssTransition
         * @kind property
         * @access public
         * 
         * @type {string}
         * 
         * @description
         * The class name added to the animated element.
         */
        className = __SimpleTransition;

        /**
         * @name _modifiedProperties
         * @memberof plat.ui.animations.SimpleCssTransition
         * @kind property
         * @access protected
         * 
         * @type {plat.IObject<string>}
         * 
         * @description
         * A JavaScript object containing all modified properties as a result 
         * of this animation. Used in the case of a disposal to reset the changed 
         * properties.
         */
        protected _modifiedProperties: IObject<string> = {};

        /**
         * @name _normalizeRegex
         * @memberof plat.ui.animations.SimpleCssTransition
         * @kind property
         * @access protected
         * 
         * @type {RegExp}
         * 
         * @description
         * A regular expression to normalize modified property keys.
         */
        protected _normalizeRegex = /-/g;

        /**
         * @name _normalizedKeys
         * @memberof plat.ui.animations.SimpleCssTransition
         * @kind property
         * @access protected
         * 
         * @type {Array<string>}
         * 
         * @description
         * An Array of the normalized keys of modified properties.
         */
        protected _normalizedKeys: Array<string> = [];

        /**
         * @name _transitionCount
         * @memberof plat.ui.animations.SimpleCssTransition
         * @kind property
         * @access protected
         * 
         * @type {number}
         * 
         * @description
         * The "transitionend" event handler call count.
         */
        protected _transitionCount = 0;

        /**
         * @name _started
         * @memberof plat.ui.animations.SimpleCssTransition
         * @kind property
         * @access protected
         * 
         * @type {boolean}
         * 
         * @description
         * Denotes whether or not the animation was ever started.
         */
        protected _started = false;

        /**
         * @name initialize
         * @memberof plat.ui.animations.SimpleCssTransition
         * @kind function
         * @access public
         * 
         * @description
         * Adds the class to enable the transition.
         * 
         * @returns {void}
         */
        initialize(): void {
            addClass(this.element, this.className + __INIT_SUFFIX);
        }

        /**
         * @name start
         * @memberof plat.ui.animations.SimpleCssTransition
         * @kind function
         * @access public
         * 
         * @description
         * A function denoting the start of the animation.
         * 
         * @returns {void}
         */
        start(): void {
            requestAnimationFrameGlobal((): void => {
                var element = this.element;

                if (this._canceled) {
                    return;
                } else if (element.offsetParent === null) {
                    this._animate();
                    this._dispose();
                    this.end();
                }

                addClass(element, this.className);

                var transitionId = this._animationEvents.$transition,
                    computedStyle = this._window.getComputedStyle(element, (this.options || <ISimpleCssTransitionOptions>{}).pseudo),
                    transitionProperty = computedStyle[<any>(transitionId + 'Property')],
                    transitionDuration = computedStyle[<any>(transitionId + 'Duration')];

                this._started = true;

                if (transitionProperty === '' || transitionProperty === 'none' ||
                    transitionDuration === '' || transitionDuration === '0s') {
                    requestAnimationFrameGlobal((): void => {
                        this._animate();
                        this._dispose();
                        this.end();
                    });
                    return;
                }

                this.transitionEnd(this._done);

                if (this._animate()) {
                    return;
                }

                this._dispose();
                this.end();
            });
        }

        /**
         * @name cancel
         * @memberof plat.ui.animations.SimpleCssTransition
         * @kind function
         * @access public
         * 
         * @description
         * A function to be called to let it be known the animation is being cancelled.
         * 
         * @returns {void}
         */
        cancel(): void {
            super.cancel();

            requestAnimationFrameGlobal((): void => {
                if (!this._started) {
                    this._animate();
                }

                this._dispose();
            });
        }

        /**
         * @name _dispose
         * @memberof plat.ui.animations.SimpleCssTransition
         * @kind function
         * @access public
         * 
         * @description
         * Removes the animation class and the animation "-init" class.
         * 
         * @returns {void}
         */
        protected _dispose(): void {
            var className = this.className;
            removeClass(this.element, className + ' ' + className + __INIT_SUFFIX);
        }

        /**
         * @name _done
         * @memberof plat.ui.animations.SimpleCssTransition
         * @kind function
         * @access protected
         * 
         * @description
         * A handler for the "transitionend" event. Will clean up the class and resolve the 
         * promise when necessary based on the options that were input.
         * 
         * @param {TransitionEvent} ev? The transition event object.
         * @param {boolean} immediate? Whether clean up should be immediate or conditional.
         * 
         * @returns {void}
         */
        protected _done(ev: TransitionEvent): void {
            var keys = Object.keys(this._modifiedProperties),
                propertyName = ev.propertyName;
            if (isString(propertyName)) {
                propertyName = propertyName.replace(this._normalizeRegex, '').toLowerCase();
                if (this._normalizedKeys.indexOf(propertyName) !== -1 && ++this._transitionCount < keys.length) {
                    return;
                }
            }

            this.end();
            requestAnimationFrameGlobal((): void => {
                this._dispose();
            });
        }

        /**
         * @name _animate
         * @memberof plat.ui.animations.SimpleCssTransition
         * @kind function
         * @access protected
         * 
         * @description
         * Animate the element based on the options passed in.
         * 
         * @returns {boolean} Whether or not the element is going to animate with the options passed in. 
         * If false, the control should begin cleaning up.
         */
        protected _animate(): boolean {
            var style = this.element.style || {},
                properties = (this.options || <ISimpleCssTransitionOptions>{}).properties || {},
                keys = Object.keys(properties),
                length = keys.length,
                key: any,
                modifiedProperties = this._modifiedProperties,
                currentProperty: string,
                newProperty: string,
                unchanged = 0;

            while (keys.length > 0) {
                key = keys.shift();
                currentProperty = style[key];
                newProperty = properties[key];
                if (!isString(newProperty)) {
                    unchanged++;
                    continue;
                }

                style[key] = newProperty;
                if (currentProperty === style[key]) {
                    unchanged++;
                } else {
                    modifiedProperties[key] = currentProperty;
                    this._normalizedKeys.push(key.replace(this._normalizeRegex, '').toLowerCase());
                }
            }

            return unchanged < length;
        }
    }

    register.animation(__SimpleTransition, SimpleCssTransition);

    /**
     * @name ISimpleCssTransitionOptions
     * @memberof plat.ui.animations
     * @kind interface
     * 
     * @extends {plat.ui.animations.ISimpleCssAnimationOptions}
     * 
     * @description
     * An interface describing the options for {@link plat.ui.animations.SimpleCssTransition|SimpleCssTransition}.
     */
    export interface ISimpleCssTransitionOptions extends ISimpleCssAnimationOptions {
        /**
         * @name properties
         * @memberof plat.ui.animations.ISimpleCssTransitionOptions
         * @kind property
         * @access public
         * 
         * @type {plat.IObject<string>}
         * 
         * @description
         * A JavaScript object with key value pairs for adjusting transition values. 
         * (e.g. { width: '800px' } would set the element's width to 800px.
         */
        properties: IObject<string>;
    }
}
