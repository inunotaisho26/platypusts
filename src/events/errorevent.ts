namespace plat.events {
    'use strict';

    /**
     * @name ErrorEvent
     * @memberof plat.events
     * @kind class
     *
     * @extends {plat.events.DispatchEvent}
     *
     * @description
     * Represents an internal Error Event. This is used for any
     * internal errors (both fatal and warnings). All error events are
     * direct events.
     *
     * @typeparam {Error} E The type of Error this event represents.
     */
    export class ErrorEvent<E extends Error> extends DispatchEvent {
        /**
         * @name _EventManager
         * @memberof plat.events.ErrorEvent
         * @kind property
         * @access protected
         * @static
         *
         * @type {plat.events.IEventManagerStatic}
         *
         * @description
         * Reference to the {@link plat.events.IEventManagerStatic|IEventManagerStatic} injectable.
         */
        protected static _EventManager: IEventManagerStatic;

        /**
         * @name error
         * @memberof plat.events.ErrorEvent
         * @kind property
         * @access public
         *
         * @type {E}
         *
         * @description
         * The error being dispatched.
         */
        public error: E;

        /**
         * @name logLevel
         * @memberof plat.events.ErrorEvent
         * @kind property
         * @access public
         *
         * @type {boolean}
         *
         * @description
         * The severity level of the error.
         */
        public logLevel: number;

        /**
         * @name dispatch
         * @memberof plat.events.ErrorEvent
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Creates a new ErrorEvent and fires it.
         *
         * @typeparam {Error} E The type of Error this event represents.
         *
         * @param {string} name The name of the event.
         * @param {any} sender The sender of the event.
         * @param {E} error The error that occurred, resulting in the event.
         * @param {number} logLevel The severity level of the error
         *
         * @returns {plat.events.ErrorEvent<E>} The event instance.
         */
        public static dispatch<E extends Error>(
            name: string,
            sender: any,
            error: E,
            logLevel: number
        ): ErrorEvent<E> {
            const event = <ErrorEvent<E>>acquire(ErrorEvent);

            event.initialize(name, sender, null, error);
            event.logLevel = logLevel;

            ErrorEvent._EventManager.sendEvent(event);

            return event;
        }

        /**
         * @name initialize
         * @memberof plat.events.ErrorEvent
         * @kind function
         * @access public
         *
         * @description
         * Initializes the event, populating its public properties.
         *
         * @param {string} name The name of the event.
         * @param {any} sender The sender of the event.
         * @param {string} direction This is always a direct event.
         * @param {E} error The error that occurred, resulting in the event.
         *
         * @returns {void}
         */
        public initialize(
            name: string,
            sender: any,
            direction?: string | 'direct',
            error?: E
        ): void {
            super.initialize(name, sender, this._EventManager.DIRECT);

            this.error = error;
        }
    }

    /**
     * The Type for referencing the '$ErrorEventStatic' injectable as a dependency.
     */
    export function IErrorEventStatic(
        _EventManager?: IEventManagerStatic
    ): IErrorEventStatic {
        (<any>ErrorEvent)._EventManager = _EventManager;

        return ErrorEvent;
    }

    register.injectable(
        __ErrorEventStatic,
        IErrorEventStatic,
        [__EventManagerStatic],
        __STATIC
    );

    /**
     * @name IErrorEventStatic
     * @memberof plat.events
     * @kind interface
     *
     * @description
     * Dispatches {@link plat.events.ErrorEvent|ErrorEvents}
     */
    export interface IErrorEventStatic {
        /**
         * @name dispatch
         * @memberof plat.events.IErrorEventStatic
         * @kind function
         * @access public
         * @static
         *
         * @description
         * Creates a new ErrorEvent and fires it.
         *
         * @typeparam {Error} E The type of Error this event represents.
         *
         * @param {string} name The name of the event.
         * @param {any} sender The sender of the event.
         * @param {E} error The error that occurred, resulting in the event.
         * @param {number} logLevel The severity level of the error
         *
         * @returns {plat.events.ErrorEvent<E>} The event instance.
         */
        dispatch<E extends Error>(
            name: string,
            sender: any,
            error: E,
            logLevel: number
        ): ErrorEvent<E>;
    }
}
