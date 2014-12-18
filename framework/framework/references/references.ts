﻿/* tslint:disable:no-unused-variable */
/*
 * Injectables
 */
var __prefix = '$',
    __AppStatic = __prefix + 'AppStatic',
    __App = __prefix + 'App',
    __Http = __prefix + 'Http',
    __HttpConfig = __prefix + 'HttpConfig',
    __Promise = __prefix + 'Promise',
    __Compat = __prefix + 'Compat',
    __ControlFactory = __prefix + 'ControlFactory',
    __AttributeControlFactory = __prefix + 'AttributeControlFactory',
    __Document = __prefix + 'Document',
    __DispatchEventInstance = __prefix + 'DispatchEventInstance',
    __ErrorEventStatic = __prefix + 'ErrorEventStatic',
    __EventManagerStatic = __prefix + 'EventManagerStatic',
    __LifecycleEventStatic = __prefix + 'LifecycleEventStatic',
    __NavigationEventStatic = __prefix + 'NavigationEventStatic',
    __ExceptionStatic = __prefix + 'ExceptionStatic',
    __Parser = __prefix + 'Parser',
    __Regex = __prefix + 'Regex',
    __Tokenizer = __prefix + 'Tokenizer',
    __NavigatorInstance = __prefix + 'NavigatorInstance',
    __RoutingNavigator = __prefix + 'RoutingNavigator',
    __ContextManagerStatic = __prefix + 'ContextManagerStatic',
    __Compiler = __prefix + 'Compiler',
    __CommentManagerFactory = __prefix + 'CommentManagerFactory',
    __ElementManagerFactory = __prefix + 'ElementManagerFactory',
    __NodeManagerStatic = __prefix + 'NodeManagerStatic',
    __TextManagerFactory = __prefix + 'TextManagerFactory',
    __CacheFactory = __prefix + 'CacheFactory',
    __ManagerCache = __prefix + 'ManagerCache',
    __TemplateCache = __prefix + 'TemplateCache',
    __Animator = __prefix + 'Animator',
    __AttributesInstance = __prefix + 'AttributesInstance',
    __BindableTemplatesFactory = __prefix + 'BindableTemplatesFactory',
    __Dom = __prefix + 'Dom',
    __DomEvents = __prefix + 'DomEvents',
    __DomEventsConfig = __prefix + 'DomEventsConfig',
    __DomEventInstance = __prefix + 'DomEventInstance',
    __ResourcesFactory = __prefix + 'ResourcesFactory',
    __TemplateControlFactory = __prefix + 'TemplateControlFactory',
    __BaseViewControlFactory = __prefix + 'BaseViewControlFactory',
    __Utils = __prefix + 'Utils',
    __Browser = __prefix + 'Browser',
    __BrowserConfig = __prefix + 'BrowserConfig',
    __Router = __prefix + 'Router',
    __UrlUtilsInstance = __prefix + 'UrlUtilsInstance',
    __Window = __prefix + 'Window',
    __LocalStorage = __prefix + 'LocalStorage',
    __SessionStorage = __prefix + 'SessionStorage',
    __Geolocation = __prefix + 'Geolocation',
    __BaseSegmentFactory = __prefix + 'BaseSegmentFactory',
    __BaseSegmentInstance = __prefix + 'BaseSegmentInstance',
    __StaticSegmentInstance = __prefix + 'StaticSegmentInstance',
    __VariableSegmentInstance = __prefix + 'VariableSegmentInstance',
    __DynamicSegmentInstance = __prefix + 'DynamicSegmentInstance',
    __SplatSegmentInstance = __prefix + 'SplatSegmentInstance',
    __StateStatic = __prefix + 'StateStatic',
    __StateInstance = __prefix + 'StateInstance',
    __RouteRecognizerInstance = __prefix + 'RouteRecognizerInstance',


    /**
     * Controls
     */
    __Plat = 'plat-',
    __Bind = __Plat + 'bind',
    __Href = __Plat + 'href',
    __Src = __Plat + 'src',
    __KeyDown = __Plat + 'keydown',
    __KeyPress = __Plat + 'keypress',
    __KeyUp = __Plat + 'keyup',
    __Name = __Plat + 'name',
    __Options = __Plat + 'options',
    __Checked = __Plat + 'checked',
    __Disabled = __Plat + 'disabled',
    __Selected = __Plat + 'selected',
    __ReadOnly = __Plat + 'readonly',
    __Visible = __Plat + 'visible',
    __Style = __Plat + 'style',
    __Tap = __Plat + 'tap',
    __Blur = __Plat + 'blur',
    __Change = __Plat + 'change',
    __Copy = __Plat + 'copy',
    __Cut = __Plat + 'cut',
    __Paste = __Plat + 'paste',
    __DblTap = __Plat + 'dbltap',
    __Focus = __Plat + 'focus',
    __Submit = __Plat + 'submit',
    __TouchStart = __Plat + 'touchstart',
    __TouchEnd = __Plat + 'touchend',
    __TouchMove = __Plat + 'touchmove',
    __TouchCancel = __Plat + 'touchcancel',
    __Hold = __Plat + 'hold',
    __Release = __Plat + 'release',
    __Swipe = __Plat + 'swipe',
    __SwipeLeft = __Plat + 'swipeleft',
    __SwipeRight = __Plat + 'swiperight',
    __SwipeUp = __Plat + 'swipeup',
    __SwipeDown = __Plat + 'swipedown',
    __Track = __Plat + 'track',
    __TrackLeft = __Plat + 'trackleft',
    __TrackRight = __Plat + 'trackright',
    __TrackUp = __Plat + 'trackup',
    __TrackDown = __Plat + 'trackdown',
    __TrackEnd = __Plat + 'trackend',
    __Link = __Plat + 'link',
    __ForEach = __Plat + 'foreach',
    __Html = __Plat + 'html',
    __If = __Plat + 'if',
    __Ignore = __Plat + 'ignore',
    __Select = __Plat + 'select',
    __Template = __Plat + 'template',
    __Routeport = __Plat + 'routeport',
    __Viewport = __Plat + 'viewport',
    __Context = __Plat + __CONTEXT,

    /**
     * Control Properties
     */
    __TemplateControlCache = '__templateControlCache',

    /**
     * Lifecycle events
     */
    __ready = 'ready',
    __suspend = 'suspend',
    __resume = 'resume',
    __online = 'online',
    __offline = 'offline',
    __error = 'error',
    __shutdown = 'shutdown',
    __beforeLoad = 'beforeLoad',

    /**
     * Navigation events
     */
    __beforeNavigate = 'beforeNavigate',
    __navigated = 'navigated',
    __navigating = 'navigating',
    __beforeRouteChange = 'beforeRouteChange',
    __routeChanged = 'routeChanged',
    __urlChanged = 'urlChanged',

    /**
     * Device events
     */
    __pause = 'pause',
    __deviceReady = 'deviceReady',
    __backButton = 'backbutton',
    __backButtonPressed = 'backButtonPressed',

    /**
     * Animations
     */
    __Hide = __Plat + 'hide',
    __Animating = __Plat + 'animating',
    __SimpleAnimation = __Plat + 'animation',
    __SimpleTransition = __Plat + 'transition',
    __Enter = __Plat + 'enter',
    __Leave = __Plat + 'leave',
    __Move = __Plat + 'move',
    __FadeIn = __Plat + 'fadein',
    __FadeOut = __Plat + 'fadeout',

    /**
     * Custom DOM events
     */
    __tap = __prefix + 'tap',
    __dbltap = __prefix + 'dbltap',
    __touchstart = __prefix + 'touchstart',
    __touchend = __prefix + 'touchend',
    __touchmove = __prefix + 'touchmove',
    __touchcancel = __prefix + 'touchcancel',
    __hold = __prefix + 'hold',
    __release = __prefix + 'release',
    __swipe = __prefix + 'swipe',
    __swipeleft = __prefix + 'swipeleft',
    __swiperight = __prefix + 'swiperight',
    __swipeup = __prefix + 'swipeup',
    __swipedown = __prefix + 'swipedown',
    __track = __prefix + 'track',
    __trackleft = __prefix + 'trackleft',
    __trackright = __prefix + 'trackright',
    __trackup = __prefix + 'trackup',
    __trackdown = __prefix + 'trackdown',
    __trackend = __prefix + 'trackend',

    /**
     * Errors
     */
    __errorSuffix = 'Error',
    __platError = 'Plat' + __errorSuffix,
    __parseError = 'Parsing' + __errorSuffix,
    __bindError = 'Binding' + __errorSuffix,
    __compileError = 'Compiling' + __errorSuffix,
    __nameError = 'PlatName' + __errorSuffix,
    __navigationError = 'Navigating' + __errorSuffix,
    __templateError = 'Templating' + __errorSuffix,
    __contextError = 'Context' + __errorSuffix,
    __eventError = 'DispatchEvent' + __errorSuffix,
    __injectableError = 'Injectable' + __errorSuffix,
    __compatError = 'Compatibility' + __errorSuffix,

    /**
     * ForEach aliases
     */
    __forEachAliasOptions = {
        index: 'index',
        even: 'even',
        odd: 'odd',
        first: 'first',
        last: 'last'
    },

    /**
     * Routing
     */
    __BASE_SEGMENT_TYPE = 'base',
    __VARIABLE_SEGMENT_TYPE = 'variable',
    __STATIC_SEGMENT_TYPE = 'static',
    __SPLAT_SEGMENT_TYPE = 'splat',
    __DYNAMIC_SEGMENT_TYPE = 'dynamic',

    /**
     * Constants
     */
    __startSymbol = '{{',
    __endSymbol = '}}',
    __STATIC = 'static',
    __SINGLETON = 'singleton',
    __INSTANCE = 'instance',
    __FACTORY = 'factory',
    __CLASS = 'class',
    __CSS = 'css',
    __COMPILED = '-compiled',
    __BOUND_PREFIX = '-@',
    __END_SUFFIX = '-end',
    __START_NODE = ': start node',
    __END_NODE = ': end node',
    __POPSTATE = 'popstate',
    __HASHCHANGE = 'hashchange',
    __WRAPPED_INJECTOR = 'wrapped',
    __JSONP_CALLBACK = 'plat_callback',
    __JS = 'js',
    __NOOP_INJECTOR = 'noop',
    __APP = '__app__',
    __CONTEXT = 'context',
    __RESOURCE = 'resource',
    __RESOURCES = __RESOURCE + 's',
    __ALIAS = 'alias',
    __ALIASES = __ALIAS + 'es',
    __OBSERVABLE_RESOURCE = 'observable',
    __INJECTABLE_RESOURCE = 'injectable',
    __OBJECT_RESOURCE = 'object',
    __FUNCTION_RESOURCE = 'function',
    __LITERAL_RESOURCE = 'literal',
    __ROOT_RESOURCE = 'root',
    __ROOT_CONTEXT_RESOURCE = 'rootContext',
    __CONTROL_RESOURCE = 'control',
    __CONTEXT_RESOURCE = __CONTEXT;
/* tslint:enable:no-unused-variable */
