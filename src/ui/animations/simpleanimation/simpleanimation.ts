/**
 * @name animations
 * @memberof plat.ui
 * @kind namespace
 * @access public
 *
 * @description
 * Holds all the classes and interfaces related to UI animation components for platypus.
 */
namespace plat.ui.animations {
    'use strict';

    /**
     * @name SimpleCssAnimation
     * @memberof plat.ui.animations
     * @kind class
     *
     * @extends {plat.ui.animations.CssAnimation}
     *
     * @description
     * A simple CSS Animation class that places the 'plat-animation' class on an
     * element, checks for animation properties, and waits for the animation to end.
     */
    export class SimpleCssAnimation extends CssAnimation {
        /**
         * @name className
         * @memberof plat.ui.animations.SimpleCssAnimation
         * @kind property
         * @access public
         *
         * @type {string}
         *
         * @description
         * The class name added to the animated element.
         */
        public className: string = __SimpleAnimation;

        /**
         * @name options
         * @memberof plat.ui.animations.SimpleCssAnimation
         * @kind property
         * @access public
         *
         * @type {plat.ui.animations.ISimpleAnimationOptions}
         *
         * @description
         * An optional options object that can denote a pseudo element animation.
         */
        public options: ISimpleCssAnimationOptions;

        /**
         * @name _cancelAnimation
         * @memberof plat.ui.animations.SimpleCssAnimation
         * @kind property
         * @access public
         *
         * @type {plat.IRemoveListener}
         *
         * @description
         * A function for stopping a potential callback in the animation chain.
         */
        protected _cancelAnimation: IRemoveListener = noop;

        /**
         * @name initialize
         * @memberof plat.ui.animations.SimpleCssAnimation
         * @kind function
         * @access public
         *
         * @description
         * Adds the class to initialize the animation.
         *
         * @returns {void}
         */
        public initialize(): void {
            addClass(this.element, this.className + __INIT_SUFFIX);
        }

        /**
         * @name start
         * @memberof plat.ui.animations.SimpleCssAnimation
         * @kind function
         * @access public
         *
         * @description
         * A function denoting the start of the animation.
         *
         * @returns {void}
         */
        public start(): void {
            this._cancelAnimation = requestAnimationFrameGlobal((): void => {
                const element = this.element;
                const className = this.className;

                if (element.offsetParent === null) {
                    this._dispose();
                    this.end();

                    return;
                }

                addClass(element, className);

                const animationId = this._animationEvents.$animation;
                let options = this.options;

                if (!isObject(options)) {
                    options = <any>{};
                }

                const computedStyle = this._window.getComputedStyle(
                    element,
                    options.pseudo
                );
                const animationName = computedStyle[<any>`${animationId}Name`];

                if (
                    animationName === '' ||
                    animationName === 'none' ||
                    computedStyle[<any>`${animationId}PlayState`] === 'paused'
                ) {
                    this._dispose();
                    this.end();

                    return;
                }

                if (!options.preserveInit) {
                    removeClass(element, className + __INIT_SUFFIX);
                }

                this._cancelAnimation = this.animationEnd((): void => {
                    this._cancelAnimation = requestAnimationFrameGlobal(
                        (): void => {
                            this._dispose();
                            this.end();
                        }
                    );
                });
            });
        }

        /**
         * @name pause
         * @memberof plat.ui.animations.BaseAnimation
         * @kind function
         * @access public
         * @virtual
         *
         * @description
         * A function to be called to pause the animation.
         *
         * @returns {plat.async.Promise<void>} A new promise that resolves when the animation has been paused.
         */
        public pause(): async.Promise<void> {
            if (this._cancelAnimation === noop) {
                return this._Promise.resolve();
            }

            const animationEvents = this._compat.animationEvents;

            return new this._Promise<void>((resolve): void => {
                requestAnimationFrameGlobal((): void => {
                    if (this._cancelAnimation !== noop) {
                        this.element.style[
                            <any>`${animationEvents.$animation}PlayState`
                        ] =
                            'paused';
                    }
                    resolve();
                });
            });
        }

        /**
         * @name resume
         * @memberof plat.ui.animations.BaseAnimation
         * @kind function
         * @access public
         * @virtual
         *
         * @description
         * A function to be called to resume a paused animation.
         *
         * @returns {plat.async.Promise<void>} A new promise that resolves when the animation has resumed.
         */
        public resume(): async.Promise<void> {
            if (this._cancelAnimation === noop) {
                return this._Promise.resolve();
            }

            const animationEvents = this._compat.animationEvents;

            return new this._Promise<void>((resolve): void => {
                requestAnimationFrameGlobal((): void => {
                    if (this._cancelAnimation !== noop) {
                        this.element.style[
                            <any>`${animationEvents.$animation}PlayState`
                        ] =
                            'running';
                    }
                    resolve();
                });
            });
        }

        /**
         * @name cancel
         * @memberof plat.ui.animations.SimpleCssAnimation
         * @kind function
         * @access public
         *
         * @description
         * A function to be called to let it be known the animation is being cancelled.
         * Removes the animation class and the animation "-init" class.
         *
         * @returns {void}
         */
        public cancel(): void {
            this._cancelAnimation();
            this._dispose();
            this.end();
        }

        /**
         * @name _dispose
         * @memberof plat.ui.animations.SimpleCssAnimation
         * @kind function
         * @access public
         *
         * @description
         * Removes the animation class and the animation "-init" class.
         *
         * @returns {void}
         */
        protected _dispose(): void {
            const className = this.className;
            removeClass(
                this.element,
                `${className} ${className}${__INIT_SUFFIX}`
            );
            this._cancelAnimation = noop;
        }
    }

    register.animation(__SimpleAnimation, SimpleCssAnimation);

    /**
     * @name ISimpleCssAnimationOptions
     * @memberof plat.ui.animations
     * @kind interface
     *
     * @description
     * An interface describing the options for {@link plat.ui.animations.SimpleCssAnimation|SimpleCssAnimation}.
     */
    export interface ISimpleCssAnimationOptions {
        /**
         * @name pseudo
         * @memberof plat.ui.animations.ISimpleCssAnimationOptions
         * @kind property
         * @access public
         *
         * @type {string}
         *
         * @description
         * The pseudo element identifier (i.e. '::before' if defined as .red::before).
         */
        pseudo?: string;

        /**
         * @name preserveInit
         * @memberof plat.ui.animations.ISimpleCssAnimationOptions
         * @kind property
         * @access public
         *
         * @type {boolean}
         *
         * @description
         * A boolean specifying whether or not to leave the '*-init' class on the element
         * after the animation has started. Defaults to false as we want to remove
         * any initial state after an animation has kicked off.
         */
        preserveInit?: boolean;
    }

    /**
     * @name FadeIn
     * @memberof plat.ui.animations
     * @kind class
     *
     * @extends {plat.ui.animations.SimpleCssAnimation}
     *
     * @description
     * An animation control that fades in an element as defined by the included CSS.
     */
    export class FadeIn extends SimpleCssAnimation {
        /**
         * @name className
         * @memberof plat.ui.animations.FadeIn
         * @kind property
         * @access public
         *
         * @type {string}
         *
         * @description
         * The class name added to the element fading in.
         */
        public className: string = __FadeIn;
    }

    register.animation(__FadeIn, FadeIn);

    /**
     * @name FadeOut
     * @memberof plat.ui.animations
     * @kind class
     *
     * @extends {plat.ui.animations.SimpleCssAnimation}
     *
     * @description
     * An animation control that fades out an element as defined by the included CSS.
     */
    export class FadeOut extends SimpleCssAnimation {
        /**
         * @name className
         * @memberof plat.ui.animations.FadeOut
         * @kind property
         * @access public
         *
         * @type {string}
         *
         * @description
         * The class name added to the element fading out.
         */
        public className: string = __FadeOut;
    }

    register.animation(__FadeOut, FadeOut);

    /**
     * @name Enter
     * @memberof plat.ui.animations
     * @kind class
     *
     * @extends {plat.ui.animations.SimpleCssAnimation}
     *
     * @description
     * An animation control that causes an element to enter as defined by the included CSS.
     */
    export class Enter extends SimpleCssAnimation {
        /**
         * @name className
         * @memberof plat.ui.animations.Enter
         * @kind property
         * @access public
         *
         * @type {string}
         *
         * @description
         * The class name added to the entering element.
         */
        public className: string = __Enter;
    }

    register.animation(__Enter, Enter);

    /**
     * @name Leave
     * @memberof plat.ui.animations
     * @kind class
     *
     * @extends {plat.ui.animations.SimpleCssAnimation}
     *
     * @description
     * An animation control that causes an element to leave as defined by the included CSS.
     */
    export class Leave extends SimpleCssAnimation {
        /**
         * @name className
         * @memberof plat.ui.animations.Leave
         * @kind property
         * @access public
         *
         * @type {string}
         *
         * @description
         * The class name added to the leaving element.
         */
        public className: string = __Leave;
    }

    register.animation(__Leave, Leave);

    /**
     * @name Move
     * @memberof plat.ui.animations
     * @kind class
     *
     * @extends {plat.ui.animations.SimpleCssAnimation}
     *
     * @description
     * An animation control that causes an element to move as defined by the included CSS.
     */
    export class Move extends SimpleCssAnimation {
        /**
         * @name className
         * @memberof plat.ui.animations.Move
         * @kind property
         * @access public
         *
         * @type {string}
         *
         * @description
         * The class name added to the leaving element.
         */
        public className: string = __Move;
    }

    register.animation(__Move, Move);
}
