module plat {
    /**
     * Class for every app. This class contains hooks for Application Lifecycle Events 
     * as well as error handling.
     */
    export class App implements IApp {
        static $Compat: ICompat;
        static $EventManagerStatic: events.IEventManagerStatic;
        static $Document: Document;
        static $Compiler: processing.ICompiler;
        static $LifecycleEventStatic: events.ILifecycleEventStatic;

        /**
         * A static method for initiating the app startup.
         */
        static start(): void {
            if (!App.$Compat.isCompatible) {
                var $exception: IExceptionStatic = acquire(__ExceptionStatic);
                $exception.fatal('PlatypusTS only supports modern browsers where ' +
                    'Object.defineProperty is defined', $exception.COMPAT);
                return;
            }

            App.__addPlatCss();

            var $EventManagerStatic = App.$EventManagerStatic;

            $EventManagerStatic.dispose('__app__');
            $EventManagerStatic.on('__app__', 'ready', App.__ready);
            $EventManagerStatic.on('__app__', 'shutdown', App.__shutdown);
            $EventManagerStatic.initialize();
        }

        /**
         * A static methods called upon app registration. Primarily used 
         * to initiate a ready state in the case that amd is being used.
         */
        static registerApp(app: any): void {
            if (!isNull(App.app) && isString(App.app.uid)) {
                App.$EventManagerStatic.dispose(App.app.uid);
            }

            App.app = app;

            if (App.$Compat.amd) {
                var $LifecycleEventStatic = App.$LifecycleEventStatic,
                    dispatch = $LifecycleEventStatic.dispatch;

                postpone(() => {
                    dispatch('ready', $LifecycleEventStatic);
                });
            }
        }

        /**
         * Kicks off compilation of the DOM from the specified node. If no node is specified, 
         * the default start node is document.body.
         * 
         * @param node The node at which DOM compilation begins.
         */
        static load(node?: Node): void {
            var $LifecycleEventStatic = App.$LifecycleEventStatic,
                $compiler = App.$Compiler,
                body = App.$Document.body,
                head = App.$Document.head;

            $LifecycleEventStatic.dispatch('beforeLoad', App);

            if (isNull(node)) {
                $compiler.compile(head);
                body.setAttribute(__Hide, '');
                $compiler.compile(body);
                body.removeAttribute(__Hide);
                return;
            }

            if (isFunction((<Element>node).setAttribute)) {
                (<Element>node).setAttribute(__Hide, '');
                $compiler.compile(node);
                (<Element>node).removeAttribute(__Hide);
            } else {
                $compiler.compile(node);
            }
        }

        /**
         * The instance of the registered IApp.
         */
        static app: IApp = null;

        /**
         * A static method called when the application is ready. It calls the app instance's 
         * ready function as well as checks for the presence of a module loader. If one exists, 
         * loading the DOM falls back to the app developer. If it doesn't, the DOM is loaded from 
         * document.body.
         */
        private static __ready(ev: events.ILifecycleEvent): void {
            dependency.Injector.initialize();

            if (!isNull(App.app)) {
                App.__registerAppEvents(ev);
            }

            if (!App.$Compat.amd) {
                App.load();
            }
        }

        private static __shutdown(): void {
            var app = (<any>navigator).app;

            if (!isNull(app) && isFunction(app.exitApp)) {
                app.exitApp();
            }
        }

        private static __registerAppEvents(ev: events.ILifecycleEvent): void {
            var app = App.app;

            if (isFunction((<dependency.IInjector<any>>(<any>app)).inject)) {
                App.app = app = (<dependency.IInjector<any>>(<any>app)).inject();
            }

            app.on('suspend', app.suspend);
            app.on('resume', app.resume);
            app.on('online', app.online);
            app.on('offline', app.offline);
            app.on('error', app.error);

            if (isFunction(app.ready)) {
                app.ready(ev);
            }
        }
        
        /**
         * We need to add [plat-hide] as a css property if platypus.css doesn't exist so we can use it to temporarily 
         * hide elements.
         */
        private static __addPlatCss(): void {
            var $document = App.$Document;
            if (App.$Compat.platCss) {
                return;
            } else if (!isNull($document.styleSheets) && $document.styleSheets.length > 0) {
                (<CSSStyleSheet>$document.styleSheets[0]).insertRule('[plat-hide] { display: none; }', 0);
                return;
            } 

            var style = <HTMLStyleElement>document.createElement('style');

            style.textContent = '[plat-hide] { display: none; }';
            document.head.appendChild(style);
        }

        /**
         * A unique id, created during instantiation.
         */
        uid: string;

        /**
         * Class for every app. This class contains hooks for Application Lifecycle Management (ALM)
         * as well as error handling and navigation events.
         */
        constructor() {
            var ContextManager: observable.IContextManagerStatic = acquire(__ContextManagerStatic);
            ContextManager.defineGetter(this, 'uid', uniqueId('plat_'));
        }

        /**
         * Event fired when the app is suspended.
         * 
         * @param ev The ILifecycleEvent object.
         */
        suspend(ev: events.ILifecycleEvent): void { }

        /**
         * Event fired when the app resumes from the suspended state.
         * 
         * @param ev The ILifecycleEvent object.
         */
        resume(ev: events.ILifecycleEvent): void { }

        /**
         * Event fired when an internal error occures.
         * 
         * @param ev The IErrorEvent object.
         */
        error(ev: events.IErrorEvent<Error>): void { }

        /**
         * Event fired when the app is ready.
         * 
         * @param ev The ILifecycleEvent object.
         */
        ready(ev: events.ILifecycleEvent): void { }

        /**
         * Event fired when the app regains connectivity and is now in an online state.
         * 
         * @param ev The ILifecycleEvent object.
         */
        online(ev: events.ILifecycleEvent): void { }

        /**
         * Event fired when the app loses connectivity and is now in an offline state.
         * 
         * @param ev The ILifecycleEvent object.
         */
        offline(ev: events.ILifecycleEvent): void { }

        /**
         * Creates a new DispatchEvent and propagates it to all listeners based on the 
         * events.EventManager.DIRECT method. Propagation will always start with the sender, 
         * so the sender can both produce and consume the same event.
         * 
         * @param name The name of the event to send, cooincides with the name used in the
         * app.on() method.
         * @param ...args Any number of arguments to send to all the listeners.
         */
        dispatchEvent(name: string, ...args: any[]): void {
            App.$EventManagerStatic.dispatch(name, this, App.$EventManagerStatic.DIRECT, args);
        }

        /**
         * Registers a listener for a beforeNavigate event. The listener will be called when a beforeNavigate 
         * event is propagating over the app. Any number of listeners can exist for a single event name. 
         * This event is cancelable using the ev.cancel() method, and thereby preventing the navigation.
         * 
         * @param name='beforeNavigate' The name of the event, cooinciding with the beforeNavigate event.
         * @param listener The method called when the beforeNavigate event is fired.
         * @return {IRemoveListener} A method for removing the listener. 
         */
        on(name: 'beforeNavigate', listener: (ev: events.INavigationEvent<any>) => void): IRemoveListener;
        /**
         * Registers a listener for a navigating event. The listener will be called when a navigating 
         * event is propagating over the app. Any number of listeners can exist for a single event name. 
         * This event is cancelable using the ev.cancel() method, and thereby preventing the navigation.
         * 
         * @param name='navigating' The name of the event, cooinciding with the navigating event.
         * @param listener The method called when the navigating event is fired.
         * @return {IRemoveListener} A method for removing the listener. 
         */
        on(name: 'navigating', listener: (ev: events.INavigationEvent<any>) => void): IRemoveListener;
        /**
         * Registers a listener for a navigated event. The listener will be called when a navigated 
         * event is propagating over the app. Any number of listeners can exist for a single event name. 
         * This event is not cancelable.
         * 
         * @param name='navigated' The name of the event, cooinciding with the navigated event.
         * @param listener The method called when the navigated event is fired.
         * @return {IRemoveListener} A method for removing the listener. 
         */
        on(name: 'navigated', listener: (ev: events.INavigationEvent<any>) => void): IRemoveListener;
        /**
         * Registers a listener for a routeChanged event. The listener will be called when a routeChange event 
         * is propagating over the app. Any number of listeners can exist for a single event name.
         *
         * @param eventName='routeChange' This specifies that the listener is for a routeChange event.
         * @param listener The method called when the routeChange is fired. The route argument will contain 
         * a parsed route.
         * @return {IRemoveListener} A method for removing the listener.
         */
        on(name: 'routeChanged', listener: (ev: events.INavigationEvent<web.IRoute<any>>) => void): IRemoveListener;
        /**
         * Registers a listener for a NavigationEvent. The listener will be called when a NavigationEvent is 
         * propagating over the app. Any number of listeners can exist for a single event name.
         * 
         * @param name The name of the event, cooinciding with the NavigationEvent name.
         * @param listener The method called when the NavigationEvent is fired.
         * @return {IRemoveListener} A method for removing the listener.
         */
        on(name: string, listener: (ev: events.INavigationEvent<any>) => void): IRemoveListener;
        /**
         * Registers a listener for a DispatchEvent. The listener will be called when a DispatchEvent is 
         * propagating over the app. Any number of listeners can exist for a single event name.
         * 
         * @param name The name of the event, cooinciding with the DispatchEvent name.
         * @param listener The method called when the DispatchEvent is fired.
         * @return {IRemoveListener} A method for removing the listener.
         */
        on(name: string, listener: (ev: events.IDispatchEventInstance, ...args: any[]) => void): IRemoveListener {
            return App.$EventManagerStatic.on(this.uid, name, listener, this);
        }

        /**
         * Kicks off compilation of the DOM from the specified node. If no node is specified, 
         * the default start node is document.body. This method should be called from the app when 
         * using module loaders. If a module loader is in use, the app will delay loading until 
         * this method is called.
         * 
         * @param node The node where at which DOM compilation begins.
         */
        load(node?: Node): void {
            App.load(node);
        }
    }

    /**
     * The Type for referencing the '$AppStatic' injectable as a dependency.
     */
    export function IAppStatic(
        $Compat?: ICompat,
        $EventManagerStatic?: events.IEventManagerStatic,
        $Document?: Document,
        $Compiler?: processing.ICompiler,
        $LifecycleEventStatic?: events.ILifecycleEventStatic): IAppStatic {
            App.$Compat = $Compat;
            App.$EventManagerStatic = $EventManagerStatic;
            App.$Document = $Document;
            App.$Compiler = $Compiler;
            App.$LifecycleEventStatic = $LifecycleEventStatic;
            return App;
    }

    register.injectable(__AppStatic, IAppStatic, [
        __Compat,
        __EventManagerStatic,
        __Document,
        __Compiler,
        __LifecycleEventStatic
    ], register.STATIC);

    /**
     * The Type for referencing the '$App' injectable as a dependency.
     */
    export function IApp($AppStatic?: IAppStatic): IApp {
        return $AppStatic.app;
    }

    register.injectable(__App, IApp, [__AppStatic], register.INSTANCE);

    /**
     * The external interface for the '$AppStatic' interface.
     */
    export interface IAppStatic {
        /**
         * A static method for initiating the app startup.
         */
        start(): void;

        /**
         * A static methods called upon app registration. Primarily used 
         * to initiate a ready state in the case that amd is being used.
         */
        registerApp(app: dependency.IInjector<IApp>): void;

        /**
         * Kicks off compilation of the DOM from the specified node. If no node is specified,
         * the default start node is document.body.
         *
         * @param node The node at which DOM compilation begins.
         */
        load(node?: Node): void;

        /**
         * The instance of the registered IApp.
         */
        app: IApp;
    }

    /**
     * An object implementing IApp implements the methods called by the framework to support 
     * Application Lifecycle Management (ALM) as well as error handling and navigation events.
     */
    export interface IApp {
        /**
         * A unique id, created during instantiation.
         */
        uid: string;

        /**
         * Event fired when the app is suspended.
         * 
         * @param ev The ILifecycleEvent object.
         */
        suspend? (ev: events.ILifecycleEvent): void;

        /**
         * Event fired when the app resumes from the suspended state.
         * 
         * @param ev The ILifecycleEvent object.
         */
        resume? (ev: events.ILifecycleEvent): void;

        /**
         * Event fired when an internal error occures.
         * 
         * @param ev The IErrorEvent object.
         */
        error? (ev: events.IErrorEvent<Error>): void;

        /**
         * Event fired when the app is ready.
         * 
         * @param ev The ILifecycleEvent object.
         */
        ready? (ev: events.ILifecycleEvent): void;

        /**
         * Event fired when the app regains connectivity and is now in an online state.
         * 
         * @param ev The ILifecycleEvent object.
         */
        online? (ev: events.ILifecycleEvent): void;

        /**
         * Event fired when the app loses connectivity and is now in an offline state.
         * 
         * @param ev The ILifecycleEvent object.
         */
        offline? (ev: events.ILifecycleEvent): void;

        /**
         * Creates a new DispatchEvent and propagates it to all listeners based on the 
         * events.EventManager.DIRECT method. Propagation will always start with the sender, 
         * so the sender can both produce and consume the same event.
         * 
         * @param name The name of the event to send, cooincides with the name used in the
         * app.on() method.
         * @param ...args Any number of arguments to send to all the listeners.
         */
        dispatchEvent(name: string, ...args: any[]): void;

        /**
         * Registers a listener for a beforeNavigate event. The listener will be called when a beforeNavigate 
         * event is propagating over the app. Any number of listeners can exist for a single event name. 
         * This event is cancelable using the ev.cancel() method, and thereby preventing the navigation.
         * 
         * @param name='beforeNavigate' The name of the event, cooinciding with the beforeNavigate event.
         * @param listener The method called when the beforeNavigate event is fired.
         * @return {IRemoveListener} A method for removing the listener. 
         */
        on(name: 'beforeNavigate', listener: (ev: events.INavigationEvent<any>) => void): IRemoveListener;
        /**
         * Registers a listener for a navigating event. The listener will be called when a navigating 
         * event is propagating over the app. Any number of listeners can exist for a single event name. 
         * This event is cancelable using the ev.cancel() method, and thereby preventing the navigation.
         * 
         * @param name='navigating' The name of the event, cooinciding with the navigating event.
         * @param listener The method called when the navigating event is fired.
         * @return {IRemoveListener} A method for removing the listener. 
         */
        on(name: 'navigating', listener: (ev: events.INavigationEvent<any>) => void): IRemoveListener;
        /**
         * Registers a listener for a navigated event. The listener will be called when a navigated 
         * event is propagating over the app. Any number of listeners can exist for a single event name. 
         * This event is not cancelable.
         * 
         * @param name='navigated' The name of the event, cooinciding with the navigated event.
         * @param listener The method called when the navigated event is fired.
         * @return {IRemoveListener} A method for removing the listener. 
         */
        on(name: 'navigated', listener: (ev: events.INavigationEvent<any>) => void): IRemoveListener;
        /**
         * Registers a listener for a routeChanged event. The listener will be called when a routeChange event 
         * is propagating over the app. Any number of listeners can exist for a single event name.
         *
         * @param eventName='routeChange' This specifies that the listener is for a routeChange event.
         * @param listener The method called when the routeChange is fired. The route argument will contain 
         * a parsed route.
         * @return {IRemoveListener} A method for removing the listener.
         */
        on(name: 'routeChanged', listener: (ev: events.INavigationEvent<web.IRoute<any>>) => void): IRemoveListener;
        /**
         * Registers a listener for a NavigationEvent. The listener will be called when a NavigationEvent is 
         * propagating over the app. Any number of listeners can exist for a single event name.
         * 
         * @param name The name of the event, cooinciding with the NavigationEvent name.
         * @param listener The method called when the NavigationEvent is fired.
         * @return {IRemoveListener} A method for removing the listener.
         */
        on(name: string, listener: (ev: events.INavigationEvent<any>) => void): IRemoveListener;
        /**
         * Registers a listener for a DispatchEvent. The listener will be called when a DispatchEvent is 
         * propagating over the app. Any number of listeners can exist for a single event name.
         * 
         * @param name The name of the event, cooinciding with the DispatchEvent name.
         * @param listener The method called when the DispatchEvent is fired.
         * @return {IRemoveListener} A method for removing the listener.
         */
        on(name: string, listener: (ev: events.IDispatchEventInstance, ...args: any[]) => void): IRemoveListener;

        /**
         * Kicks off compilation of the DOM from the specified node. If no node is specified, 
         * the default start node is document.body. This method should be called from the app when 
         * using module loaders. If a module loader is in use, the app will delay loading until 
         * this method is called.
         * 
         * @param node The node where at which DOM compilation begins.
         */
        load(node?: Node): void;
    }

    /**
     * Interface for an object where every key has the same typed value.
     */
    export interface IObject<T> {
        [key: string]: T
    }
    
    /**
     * Defines a function that will halt further callbacks to a listener.
     * Equivalent to () => void.
     */
    export interface IRemoveListener {
        (): void;
    }
}
