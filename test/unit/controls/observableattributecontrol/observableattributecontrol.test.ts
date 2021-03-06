module tests.controls.observableAttributeControl {
    describe('ObservableAttributeControl Tests', () => {
        let control: plat.controls.ObservableAttributeControl;
        let parent: plat.ui.TemplateControl;
        const ControlFactory = plat.acquire(plat.IControlFactory);

        beforeEach(() => {
            control = plat.acquire(plat.controls.Options);
            parent = plat.acquire(plat.ui.TemplateControl);
            parent.controls = [control];
            parent.resources = plat
                .acquire(plat.ui.IResourcesFactory)
                .getInstance();
            parent.hasOwnContext = true;
            control.parent = parent;
            control.type = 'plat-options';
            control.templateControl = plat.acquire(plat.ui.TemplateControl);
            control.attributes = plat.acquire(plat.ui.Attributes);
            control.attributes.platOptions = 'foo.bar';
            parent.context = {
                foo: {
                    bar: 'test',
                },
            };
            parent.absoluteContextPath = 'context';
        });

        afterEach(() => {
            ControlFactory.dispose(control);
            ControlFactory.dispose(parent);
        });

        it('should test initialize with null templateControl', () => {
            const spy = spyOn(control, 'evaluateExpression');
            control.templateControl = null;
            control.initialize();

            expect(control.attribute).toBe('platOptions');
            expect(spy).not.toHaveBeenCalled();
        });

        it('should test initialize', () => {
            control.initialize();
            expect((<any>control.templateControl).options.value).toBe('test');
        });

        it('should test loaded with null templateControl', () => {
            control.templateControl = null;
            control.initialize();

            expect((<any>control)._removeListener).toBeUndefined();

            control.loaded();

            expect((<any>control)._removeListener).toBeUndefined();
        });

        it('should test loaded', () => {
            control.initialize();

            expect((<any>control)._removeListener).toBeUndefined();

            control.loaded();

            expect((<any>control)._removeListener).toBeDefined();
        });

        it('should test observe', () => {
            let called = 0;
            const spy = spyOn(control, <any>'_boundAddListener');
            const observeExpressionSpy = spyOn(control, 'observeExpression');

            spy.and.callThrough();
            observeExpressionSpy.and.callThrough();

            control.initialize();
            control.loaded();

            (<any>control.templateControl).options.observe(
                (newValue: any, oldValue: any) => {
                    expect(newValue).toBe('foo');
                    expect(oldValue).toBe('test');
                    called += 1;
                }
            );

            parent.context.foo.bar = 'foo';

            expect(observeExpressionSpy).toHaveBeenCalledWith(
                (<any>control)._setProperty,
                'foo.bar'
            );
            expect(called).toBe(1);
            expect(spy).toHaveBeenCalled();
        });

        it('should test observe and called the remove callback', () => {
            let called = 0;
            const spy = spyOn(control, <any>'_boundAddListener');
            const observeExpressionSpy = spyOn(control, 'observeExpression');

            spy.and.callThrough();
            observeExpressionSpy.and.callThrough();

            control.initialize();
            control.loaded();

            (<any>control.templateControl).options.observe(
                (newValue: any, oldValue: any) => {
                    expect(newValue).toBe('foo');
                    expect(oldValue).toBe('test');
                    called += 1;
                }
            )();

            parent.context.foo.bar = 'foo';

            expect(observeExpressionSpy).toHaveBeenCalledWith(
                (<any>control)._setProperty,
                'foo.bar'
            );
            expect(called).toBe(0);
            expect(spy).toHaveBeenCalled();
        });
    });
}
