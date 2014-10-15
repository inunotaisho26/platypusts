﻿module plat.ui.animations {
    /**
     * @name Animator
     * @memberof plat.ui.animations
     * @kind class
     * 
     * @implements {plat.ui.animations.IAnimator}
     * 
     * @description
     * A class used for animating elements.
     */
    export class Animator implements IAnimator {
        /**
         * @name $Compat
         * @memberof plat.ui.animations.Animator
         * @kind property
         * @access public
         * 
         * @type {plat.ICompat}
         * 
         * @description
         * Reference to the {@link plat.ICompat|ICompat} injectable.
         */
        $Compat: ICompat = acquire(__Compat);

        /**
         * @name _elements
         * @memberof plat.ui.animations.Animator
         * @kind property
         * @access protected
         * 
         * @type {plat.IObject<plat.ui.animations.IAnimatedElement>}
         * 
         * @description
         * All elements currently being animated.
         */
        _elements: IObject<IAnimatedElement> = {};
        
        /**
         * @name __cssWarning
         * @memberof plat.ui.animations.Animator
         * @kind property
         * @access private
         * 
         * @type {boolean}
         * 
         * @description
         * Indicates if a warning regarding our CSS was previously fired.
         */
        private __cssWarning = false;
        
        /**
         * @name animate
         * @memberof plat.ui.animations.Animator
         * @kind function
         * @access public
         * 
         * @description
         * Animates the element with the defined animation denoted by the key.
         * 
         * @param {Element} element The Element to be animated.
         * @param {string} key The identifier specifying the type of animation.
         * @param {any} options? Specified options for the animation.
         * 
         * @returns {plat.ui.animations.IAnimationPromise} A promise that resolves when the animation is finished.
         */
        animate(element: Element, key: string, options?: any): IAnimationPromise {
            if (!isNode(element) || element.nodeType !== Node.ELEMENT_NODE) {
                return this.resolve();
            }

            var $compat = this.$Compat,
                animation = animationInjectors[key],
                jsAnimation = jsAnimationInjectors[key],
                animationInstance: IBaseAnimation;

            if (!$compat.animationSupported || isUndefined(animation)) {
                if (isUndefined(jsAnimation)) {
                    return this.resolve();
                }

                animationInstance = jsAnimation.inject();
            } else {
                if (!(this.__cssWarning || $compat.platCss)) {
                    var $exception: IExceptionStatic = acquire(__ExceptionStatic);
                    $exception.warn('CSS animation occurring and platypus.css was not found prior to platypus.js. If you ' +
                        'intend to use platypus.css, please move it before platypus.js inside your head or body declaration.',
                        $exception.ANIMATION);
                    this.__cssWarning = true;
                }

                animationInstance = animation.inject();
            }

            var parentAnimating = this.__parentIsAnimating(element),
                id = this.__setAnimationId(element, animationInstance),
                animatedElement = this._elements[id],
                animationPromise: IAnimationThenable<void> = (<BaseAnimation>animationInstance)._init(element, options);

            if (parentAnimating) {
                animatedElement.animationEnd(true);
            } else {
                this.__stopChildAnimations(element);
                animationPromise = animationPromise.then(() => {
                    animatedElement.promise = null;
                    animatedElement.animationEnd();
                });
            }

            if (!isNull(animatedElement.promise)) {
                return animatedElement.promise.then(() => {
                    return animationPromise;
                });
            }

            return (animatedElement.promise = animationPromise);
        }

        /**
         * @name resolve
         * @memberof plat.ui.animations.Animator
         * @kind function
         * @access public
         * 
         * @description
         * Immediately resolves an empty {@link plat.ui.animations.AnimationPromise|AnimationPromise}.
         * 
         * @returns {plat.ui.animations.IAnimationThenable<void>} The immediately resolved 
         * {@link plat.ui.animations.AnimationPromise|AnimationPromise}.
         */
        resolve(): IAnimationThenable<void> {
            return new AnimationPromise((resolve) => {
                resolve();
            });
        }
        
        /**
         * @name __parentIsAnimating
         * @memberof plat.ui.animations.Animator
         * @kind function
         * @access private
         * 
         * @description
         * Checks whether or not any parent elements are animating.
         * 
         * @param {Node} element The element whose parents we need to check.
         * 
         * @returns {boolean} Whether or not animating parents were found.
         */
        private __parentIsAnimating(element: Node): boolean {
            while (!isDocument(element = element.parentNode) && element.nodeType === Node.ELEMENT_NODE) {
                if (hasClass(<HTMLElement>element, __Animating)) {
                    return true;
                }
            }

            return false;
        }
        
        /**
         * @name __setAnimationId
         * @memberof plat.ui.animations.Animator
         * @kind function
         * @access private
         * 
         * @description
         * Sets an new, unique animation ID and denotes the element as currently being animated.
         * 
         * @param {Node} element The element being animated.
         * @param {plat.ui.animations.IBaseAnimation} animationInstance The animation instance doing the animating.
         * 
         * @returns {string} The new animation ID.
         */
        private __setAnimationId(element: Node, animationInstance: IBaseAnimation): string {
            var elements = this._elements,
                plat = (<ICustomElement>element).__plat,
                id: string;

            if (isUndefined(plat)) {
                (<ICustomElement>element).__plat = plat = {};
            }

            if (isUndefined(plat.animation)) {
                plat.animation = id = uniqueId('animation_');
            } else {
                id = plat.animation;
            }

            var animatedElement = elements[id],
                removeListener = (cancel?: boolean, reanimating?: boolean) => {
                if (cancel === true) {
                    animationInstance.cancel();
                    if (reanimating === true) {
                        return;
                    }
                    animationInstance.done();
                }

                removeClass(<HTMLElement>element, __Animating);
                deleteProperty(elements, id);
                deleteProperty(plat, 'animation');
                if (isEmpty(plat)) {
                    deleteProperty(element, '__plat');
                }
            };

            if (isUndefined(animatedElement)) {
                addClass(<HTMLElement>element, __Animating);
                elements[id] = {
                    animationEnd: removeListener
                };
            } else {
                animatedElement.animationEnd(true, true);
                animatedElement.animationEnd = removeListener;
            }

            return id;
        }
        
        /**
         * @name __stopChildAnimations
         * @memberof plat.ui.animations.Animator
         * @kind function
         * @access private
         * 
         * @description
         * Forces child nodes of an animating element to stop animating.
         * 
         * @param {Element} element The element being animated.
         * 
         * @returns {void}
         */
        private __stopChildAnimations(element: Element): void {
            var elements = this._elements,
                customAnimationElements = Array.prototype.slice.call(element.querySelectorAll('.' + __Animating)),
                customAnimationElement: ICustomElement,
                animatedElement: IAnimatedElement,
                plat: ICustomElementProperty,
                id: string;

            while (customAnimationElements.length > 0) {
                customAnimationElement = customAnimationElements.pop();
                plat = customAnimationElement.__plat || <ICustomElementProperty>{};
                id = plat.animation;
                if (isNull(id)) {
                    continue;
                }

                animatedElement = elements[id] || <IAnimatedElement>{};
                if (isFunction(animatedElement.animationEnd)) {
                    animatedElement.animationEnd(true);
                }
            }
        }
    }

    /**
     * The Type for referencing the '$Animator' injectable as a dependency.
     */
    export function IAnimator(): IAnimator {
        return new Animator();
    }

    register.injectable('$Animator', IAnimator);

    /**
     * @name IAnimator
     * @memberof plat.ui.animations
     * @kind interface
     * 
     * @description
     * Describes an object used for animating elements.
     */
    export interface IAnimator {
        /**
         * @name animate
         * @memberof plat.ui.animations.IAnimator
         * @kind function
         * @access public
         * 
         * @description
         * Animates the element with the defined animation denoted by the key.
         * 
         * @param {Element} element The Element to be animated.
         * @param {string} key The identifier specifying the type of animation.
         * @param {any} options Specified options for the animation.
         * 
         * @returns {plat.ui.animations.IAnimationPromise} A promise that resolves when the animation is finished.
         */
        animate(element: Element, key: string, options?: any): IAnimationPromise;

        /**
         * @name resolve
         * @memberof plat.ui.animations.Animator
         * @kind function
         * @access public
         * 
         * @description
         * Immediately resolves an empty {@link plat.ui.animations.AnimationPromise|AnimationPromise}.
         * 
         * @returns {plat.ui.animations.IAnimationThenable<void>} The immediately resolved 
         * {@link plat.ui.animations.AnimationPromise|AnimationPromise}.
         */
        resolve(): IAnimationThenable<void>;
    }
    
    /**
     * @name IAnimatedElement
     * @memberof plat.ui.animations
     * @kind interface
     * 
     * @description
     * Describes an object representing a currenlty animated element.
     */
    export interface IAnimatedElement {
        /**
         * @name animationEnd
         * @memberof plat.ui.animations.IAnimatedElement
         * @kind function
         * @access public
         * 
         * @description
         * The function called at the conclusion of the animation.
         * 
         * @param {boolean} cancel? Specifies whether the animation is being cancelled.
         * @param {boolean} reanimating? Specifies whether the element is being reanimated while 
         * in a current animation. Cancel must be set to true for reanimation to take effect.
         * 
         * @returns {void}
         */
        animationEnd: (cancel?: boolean, reanimating?: boolean) => void;

        /**
         * @name promise
         * @memberof plat.ui.animations.IAnimatedElement
         * @kind property
         * @access public
         * 
         * @type {plat.ui.animations.IAnimationThenable<any>}
         * 
         * @description
         * A promise representing an element's current state of animation.
         */
        promise?: IAnimationThenable<any>;
    }
    
    /**
     * @name AnimationPromise
     * @memberof plat.ui.animations
     * @kind class
     * 
     * @extends {plat.async.Promise<void>}
     * @implements {plat.ui.animations.IAnimationPromise}
     * 
     * @description
     * Describes a type of {@link plat.async.Promise|Promise} that can be optionally cancelled.
     */
    export class AnimationPromise extends async.Promise<void> implements IAnimationPromise {
        /**
         * @name __animationInstance
         * @memberof plat.ui.animations.AnimationPromise
         * @kind property
         * @access private
         * 
         * @type {plat.ui.animations.IBaseAnimation}
         * 
         * @description
         * The animation instance to cancel if needed.
         */
        private __animationInstance: IBaseAnimation;

        /**
         * @name constructor
         * @memberof plat.ui.animations.AnimationPromise
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * The constructor method for the {@link plat.async.AjaxPromise}.
         * 
         * @param {(resolve: (value?: void) => any) => void} resolveFunction A resolve function 
         * that only allows for a resolve of void and no reject.
         * 
         * @returns {plat.ui.animations.AnimationPromise}
         */
        constructor(resolveFunction: (resolve: (value?: void) => any) => void);
        /**
         * @name constructor
         * @memberof plat.ui.animations.AnimationPromise
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * The constructor method for the {@link plat.async.AjaxPromise}.
         * 
         * @param {(resolve: (value?: void) => any) => void} resolveFunction A resolve function 
         * that only allows for a resolve of void and no reject.
         * @param {any} promise The promise object to allow for cancelling the {@link plat.ui.animations.AnimationPromise}.
         * 
         * @returns {plat.ui.animations.AnimationPromise}
         */
        constructor(resolveFunction: (resolve: (value?: void) => any) => void, promise: any);
        constructor(resolveFunction: (resolve: (value?: void) => any) => void, promise?: any) {
            super(resolveFunction);
            if (!isNull(promise)) {
                this.__animationInstance = promise.__animationInstance;
            }
        }

        /**
         * @name cancel
         * @memberof plat.ui.animations.AnimationPromise
         * @kind function
         * @access public
         * 
         * @description
         * A method to cancel the associated animation.
         * 
         * @returns {plat.ui.animations.AnimationPromise} This promise instance.
         */
        cancel(): IAnimationPromise {
            if (!isNull(this.__animationInstance)) {
                this.__animationInstance.cancel();
                this.__animationInstance.done();
            }

            return this;
        }

        /**
         * @name then
         * @memberof plat.ui.animations.AnimationPromise
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * Takes in two methods, called when/if the promise fulfills.
         * 
         * @typeparam {any} U The type of the object returned from the fulfill callbacks, which will be carried to the 
         * next then method in the promise chain.
         * 
         * @param {(success: void) => U} onFulfilled A method called when/if the promise fulfills. 
         * If undefined the next onFulfilled method in the promise chain will be called.
         * 
         * @returns {plat.ui.animations.IAnimationThenable<U>}
         */
        then<U>(onFulfilled: (success: void) => U): IAnimationThenable<U>;
        /**
         * @name then
         * @memberof plat.ui.animations.AnimationPromise
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * Takes in two methods, called when/if the promise fulfills.
         * 
         * @typeparam {any} U The type of the object returned from the fulfill callbacks, which will be carried to the 
         * next then method in the promise chain.
         * 
         * @param {(success: void) => plat.ui.animations.IAnimationThenable<U>} onFulfilled A method called when/if the promise fulfills. 
         * If undefined the next onFulfilled method in the promise chain will be called.
         * 
         * @returns {plat.ui.animations.IAnimationThenable<U>}
         */
        then<U>(onFulfilled: (success: void) => IAnimationThenable<U>): IAnimationThenable<U>;
        /**
         * @name then
         * @memberof plat.ui.animations.AnimationPromise
         * @kind function
         * @access public
         * @variation 2
         * 
         * @description
         * Takes in two methods, called when/if the promise fulfills.
         * 
         * @typeparam {any} U The type of the object returned from the fulfill callbacks, which will be carried to the 
         * next then method in the promise chain.
         * 
         * @param {(success: void) => plat.async.IThenable<U>} onFulfilled A method called when/if the promise fulfills. 
         * If undefined the next onFulfilled method in the promise chain will be called.
         * 
         * @returns {plat.ui.animations.IAnimationThenable<U>}
         */
        then<U>(onFulfilled: (success: void) => async.IThenable<U>): IAnimationThenable<U>;
        then<U>(onFulfilled: (success: void) => any): IAnimationThenable<U>  {
            return <IAnimationThenable<U>><any>super.then<U>(onFulfilled);
        }

        /**
         * @name catch
         * @memberof plat.ui.animations.AnimationPromise
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * A wrapper method for {@link plat.async.Promise|Promise.then(undefined, onRejected);}
         * 
         * @typeparam {any} U The return type of the returned promise.
         * 
         * @param {(error: any) => plat.ui.animations.IAnimationThenable<U>} onRejected A method called when/if the promise rejects. 
         * If undefined the next onRejected method in the promise chain will be called.
         * 
         * @returns {plat.ui.animations.IAnimationThenable<U>} A promise that resolves with the input type parameter U.
         */
        catch<U>(onRejected: (error: any) => IAnimationThenable<U>): IAnimationThenable<U>;
        /**
         * @name catch
         * @memberof plat.ui.animations.AnimationPromise
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * A wrapper method for {@link plat.async.Promise|Promise.then(undefined, onRejected);}
         * 
         * @typeparam {any} U The return type of the returned promise.
         * 
         * @param {(error: any) => U} onRejected A method called when/if the promise rejects. If undefined the next
         * onRejected method in the promise chain will be called.
         * 
         * @returns {plat.ui.animations.IAnimationThenable<U>} A promise that resolves with the input type parameter U.
         */
        catch<U>(onRejected: (error: any) => U): IAnimationThenable<U>;
        catch<U>(onRejected: (error: any) => any): IAnimationThenable<U> {
            return <IAnimationThenable<U>><any>super.catch<U>(onRejected);
        }
    }

    /**
     * @name IAnimationThenable
     * @memberof plat.ui.animations
     * @kind interface
     * 
     * @extends {plat.async.IThenable<R>}
     * 
     * @description
     * Describes a chaining function that fulfills when the previous link is complete and is 
     * able to be caught in the case of an error.
     * 
     * @typeparam {any} R The return type of the thenable.
     */
    export interface IAnimationThenable<R> extends async.IThenable<R> {
        /**
         * @name cancel
         * @memberof plat.ui.animations.IAnimationThenable
         * @kind function
         * @access public
         * 
         * @description
         * A method to cancel the associated animation.
         * 
         * @returns {plat.ui.animations.AnimationPromise} This promise instance.
         */
        cancel(): IAnimationPromise;

        /**
         * @name then
         * @memberof plat.ui.animations.IAnimationThenable
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * Takes in two methods, called when/if the promise fulfills/rejects.
         * 
         * @typeparam {any} U The return type of the returned promise.
         * 
         * @param {(success: R) => plat.ui.animations.IAnimationThenable<U>} onFulfilled A method called when/if the promise fulills. 
         * If undefined the next onFulfilled method in the promise chain will be called.
         * @param {(error: any) => plat.ui.animations.IAnimationThenable<U>} onRejected? A method called when/if the promise rejects. 
         * If undefined the next onRejected method in the promise chain will be called.
         * 
         * @returns {plat.ui.animations.IAnimationThenable<U>} A promise that resolves with the input type parameter U.
         */
        then<U>(onFulfilled: (success: R) => IAnimationThenable<U>,
            onRejected?: (error: any) => IAnimationThenable<U>): IAnimationThenable<U>;
        /**
         * @name then
         * @memberof plat.ui.animations.IAnimationThenable
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * Takes in two methods, called when/if the promise fulfills/rejects.
         * 
         * @typeparam {any} U The return type of the returned promise.
         * 
         * @param {(success: R) => plat.ui.animations.IAnimationThenable<U>} onFulfilled A method called when/if the promise fulills. 
         * If undefined the next onFulfilled method in the promise chain will be called.
         * @param {(error: any) => U} onRejected? A method called when/if the promise rejects. 
         * If undefined the next onRejected method in the promise chain will be called.
         * 
         * @returns {plat.ui.animations.IAnimationThenable<U>} A promise that resolves with the input type parameter U.
         */
        then<U>(onFulfilled: (success: R) => IAnimationThenable<U>, onRejected?: (error: any) => U): IAnimationThenable<U>;
        /**
         * @name then
         * @memberof plat.ui.animations.IAnimationThenable
         * @kind function
         * @access public
         * @variation 2
         * 
         * @description
         * Takes in two methods, called when/if the promise fulfills/rejects.
         * 
         * @typeparam {any} U The return type of the returned promise.
         * 
         * @param {(success: R) => U} onFulfilled A method called when/if the promise fulills. 
         * If undefined the next onFulfilled method in the promise chain will be called.
         * @param {(error: any) => plat.ui.animations.IAnimationThenable<U>} onRejected? A method called when/if the promise rejects. 
         * If undefined the next onRejected method in the promise chain will be called.
         * 
         * @returns {plat.ui.animations.IAnimationThenable<U>} A promise that resolves with the input type parameter U.
         */
        then<U>(onFulfilled: (success: R) => U, onRejected?: (error: any) => IAnimationThenable<U>): IAnimationThenable<U>;
        /**
         * @name then
         * @memberof plat.ui.animations.IAnimationThenable
         * @kind function
         * @access public
         * @variation 3
         * 
         * @description
         * Takes in two methods, called when/if the promise fulfills/rejects.
         * 
         * @typeparam {any} U The return type of the returned promise.
         * 
         * @param {(success: R) => U} onFulfilled A method called when/if the promise fulills. 
         * If undefined the next onFulfilled method in the promise chain will be called.
         * @param {(error: any) => U} onRejected? A method called when/if the promise rejects. 
         * If undefined the next onRejected method in the promise chain will be called.
         * 
         * @returns {plat.ui.animations.IAnimationThenable<U>} A promise that resolves with the input type parameter U.
         */
        then<U>(onFulfilled: (success: R) => U, onRejected?: (error: any) => U): IAnimationThenable<U>;

        /**
         * @name catch
         * @memberof plat.ui.animations.IAnimationThenable
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * A wrapper method for {@link plat.async.Promise|Promise.then(undefined, onRejected);}
         * 
         * @typeparam {any} U The return type of the returned promise.
         * 
         * @param {(error: any) => plat.ui.animations.IAnimationThenable<U>} onRejected A method called when/if the promise rejects. 
         * If undefined the next onRejected method in the promise chain will be called.
         * 
         * @returns {plat.ui.animations.IAnimationThenable<U>} A promise that resolves with the input type parameter U.
         */
        catch<U>(onRejected: (error: any) => IAnimationThenable<U>): IAnimationThenable<U>;
        /**
         * @name catch
         * @memberof plat.ui.animations.AnimationPromise
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * A wrapper method for {@link plat.async.Promise|Promise.then(undefined, onRejected);}
         * 
         * @typeparam {any} U The return type of the returned promise.
         * 
         * @param {(error: any) => U} onRejected A method called when/if the promise rejects. If undefined the next
         * onRejected method in the promise chain will be called.
         * 
         * @returns {plat.ui.animations.IAnimationThenable<U>} A promise that resolves with the input type parameter U.
         */
        catch<U>(onRejected: (error: any) => U): IAnimationThenable<U>;
    }
    
    /**
     * @name IAnimationPromise
     * @memberof plat.ui.animations
     * @kind interface
     * 
     * @extends {plat.ui.animations.IAnimationThenable<void>}
     * 
     * @description
     * Describes a type of {@link plat.async.IPromise|IPromise} that fulfills when an animation is 
     * finished and can be optionally cancelled.
     */
    export interface IAnimationPromise extends IAnimationThenable<void> {
        /**
         * @name cancel
         * @memberof plat.ui.animations.IAnimationPromise
         * @kind function
         * @access public
         * 
         * @description
         * A method to cancel the associated animation.
         * 
         * @returns {plat.ui.animations.AnimationPromise} This promise instance.
         */
        cancel(): IAnimationPromise;

        /**
         * @name then
         * @memberof plat.ui.animations.IAnimationPromise
         * @kind function
         * @access public
         * @variation 0
         * 
         * @description
         * Takes in two methods, called when/if the promise fulfills.
         * 
         * @typeparam {any} U The type of the object returned from the fulfill callbacks, which will be carried to the 
         * next then method in the promise chain.
         * 
         * @param {(success: void) => U} onFulfilled A method called when/if the promise fulfills. 
         * If undefined the next onFulfilled method in the promise chain will be called.
         * 
         * @returns {plat.ui.animations.IAnimationThenable<U>}
         */
        then<U>(onFulfilled: (success: void) => U): IAnimationThenable<U>;
        /**
         * @name then
         * @memberof plat.ui.animations.AnimationPromise
         * @kind function
         * @access public
         * @variation 1
         * 
         * @description
         * Takes in two methods, called when/if the promise fulfills.
         * 
         * @typeparam {any} U The type of the object returned from the fulfill callbacks, which will be carried to the 
         * next then method in the promise chain.
         * 
         * @param {(success: void) => plat.ui.animations.IAnimationThenable<U>} onFulfilled A method called when/if the promise fulfills. 
         * If undefined the next onFulfilled method in the promise chain will be called.
         * 
         * @returns {plat.ui.animations.IAnimationThenable<U>}
         */
        then<U>(onFulfilled: (success: void) => IAnimationThenable<U>): IAnimationThenable<U>;
        /**
         * @name then
         * @memberof plat.ui.animations.AnimationPromise
         * @kind function
         * @access public
         * @variation 2
         * 
         * @description
         * Takes in two methods, called when/if the promise fulfills.
         * 
         * @typeparam {any} U The type of the object returned from the fulfill callbacks, which will be carried to the 
         * next then method in the promise chain.
         * 
         * @param {(success: void) => plat.async.IThenable<U>} onFulfilled A method called when/if the promise fulfills. 
         * If undefined the next onFulfilled method in the promise chain will be called.
         * 
         * @returns {plat.ui.animations.IAnimationThenable<U>}
         */
        then<U>(onFulfilled: (success: void) => async.IThenable<U>): IAnimationThenable<U>;
    }
}
