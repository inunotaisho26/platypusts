namespace plat.controls {
    'use strict';

    /**
     * @name ElementPropertyControl
     * @memberof plat.controls
     * @kind class
     *
     * @extends {plat.controls.SetAttributeControl}
     *
     * @description
     * Base class used for setting the property of an element (e.g. href for anchor elements).
     */
    export class ElementPropertyControl extends SetAttributeControl {
        /**
         * @name setter
         * @memberof plat.controls.ElementPropertyControl
         * @kind function
         * @access public
         *
         * @description
         * The function for setting the corresponding
         * attribute property value to the evaluated expression.
         *
         * @returns {void}
         */
        public setter(): void {
            const element = this.element;
            const elementProperty = this.property;
            const expression = this.attributes[this.attribute];

            if (isEmpty(expression) || isNull(element)) {
                return;
            }

            if (!isUndefined((<any>element)[elementProperty])) {
                (<any>element)[elementProperty] = expression;
            }
        }
    }

    /**
     * @name Href
     * @memberof plat.controls
     * @kind class
     *
     * @extends {plat.controls.ElementPropertyControl}
     *
     * @description
     * A type of {@link plat.controls.ElementPropertyControl|ElementPropertyControl} used to set 'href' on an anchor tag.
     */
    export class Href extends ElementPropertyControl {
        /**
         * @name property
         * @memberof plat.controls.Href
         * @kind property
         * @access public
         * @readonly
         *
         * @type {string}
         *
         * @description
         * Used to set the element's href property.
         */
        public property: string = 'href';
    }

    /**
     * @name Src
     * @memberof plat.controls
     * @kind class
     *
     * @extends {plat.controls.ElementPropertyControl}
     *
     * @description
     * A type of {@link plat.controls.ElementPropertyControl|ElementPropertyControl} used to set 'src' on an anchor tag.
     */
    export class Src extends ElementPropertyControl {
        protected static _inject: any = {
            _browser: __Browser,
        };

        /**
         * @name property
         * @memberof plat.controls.Src
         * @kind property
         * @access public
         * @readonly
         *
         * @type {string}
         *
         * @description
         * Used to set the element's src property.
         */
        public property: string = 'src';

        /**
         * @name _browser
         * @memberof plat.controls.Src
         * @kind property
         * @access protected
         *
         * @type {plat.web.Browser}
         *
         * @description
         * The plat.web.Browser injectable instance
         */
        protected _browser: web.Browser;

        /**
         * @name setter
         * @memberof plat.controls.Src
         * @kind function
         * @access public
         *
         * @description
         * The function for setting the corresponding
         * attribute property value to the evaluated expression.
         *
         * @returns {void}
         */
        public setter(): void {
            const element = this.element;
            const elementProperty = this.property;
            const expression = this.attributes[this.attribute];

            if (isEmpty(expression) || isNull(element)) {
                return;
            }

            if (!isUndefined((<any>element)[elementProperty])) {
                (<any>element)[elementProperty] = this._browser.urlUtils(
                    expression
                );
            }
        }
    }

    register.control(__Href, Href);
    register.control(__Src, Src);
}
