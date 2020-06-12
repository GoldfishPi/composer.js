/*
 *
 */
(function() {
    const FnController = (controller) => {
        const create_controller = (options = {}) => {

            // -- root element populated on inject
            const el = observable(null); 

            // -- flag used to check if a controller has injected
            const active = observable(false);

            // -- used to change the root element tag
            const tag = observable('div');

            // -- controller set item refs
            const elements = observable([]);
            const sub_controllers = observable([]);

            // -- setup function set by controller
            const setup_fn = observable(() => {});

            // -- These are all events we have to bind and unbind
            //    with inject and release
            const observable_subscriptions = observable([]);
            const element_events = observable([]);
            const composer_events = observable([]);

            const id = observable(Composer.cid());

            /* -- Logic for adding a sub-controller 
             * if the sub-controller already exists replace it.
             * if this is a sub-controller being added on the fly inject it 
             * otherwise the sub-controller will be added on render
             */
            const add_subcontroller = (tag, controller) => {
                const current_controller = observable(controller)
                const previous_controller = observable(controller);
                sub_controllers([
                    ...sub_controllers(),
                    { tag, controller:current_controller }
                ]);

                if(active() && controller) append_subcontroller(tag, controller);

                current_controller
                    .subscribe(controller => {

                        if(previous_controller() && previous_controller().active()) {
                            previous_controller().release();
                        }

                        previous_controller(controller);
                        append_subcontroller(tag, controller)

                    });

                return current_controller;
            }

            const bind_element_event = (tag, cb) => element_events([
                ...element_events(),
                { tag, cb }
            ])

            const bind_composer_event = (event_obj, event_name, fn) => composer_events([
                ...composer_events(),
                { event_obj, fn, event_name, id:event_obj.bind(event_name, fn) }
            ])

            const make_element_reffrence = (tag) => {
                const element = observable(null)
                elements([
                    ...elements(),
                    { tag, element }
                ]);
                return element;
            }

            const bind_observable = (observable, cb) => observable_subscriptions([
                ...observable_subscriptions(),
                { observable, index:observable.subscribe(cb), cb }
            ]);

            const setup = (fn) => setup_fn(fn);        

            const release = () => {

                if(!active()) return;

                element_events().forEach(({ tag, cb }) => {
                    const match = tag.match(/^(\w+)\s*(.*)$/);
                    const evname = match[1].trim();
                    const selector = match[2].trim();
                    Composer.remove_event(el(), evname, cb, selector);
                });

                observable_subscriptions()
                    .forEach(({ observable, cb }) => {
                        observable.unsubscribe(cb)
                    });

                sub_controllers().forEach(({ controller }) => {
                    controller().release();
                });

                composer_events().forEach(({ event_obj, name, fn }) => {
                    event_obj.unbind(name, fn);
                })

                el().parentNode.removeChild(el());
                active(false);
            }

            const append_subcontroller = (tag, controller) => {
                if(controller.active === undefined) {
                    el().querySelector(tag)
                        .appendChild(controller.el);
                }else if(controller.active()) {
                    el().querySelector(tag)
                        .appendChild(controller.el());
                } else {
                    el().querySelector(tag)
                        .appendChild(controller.inject());
                }
            }

            const inject = (inject_tag) => {

                // -- init
                const html = controller({
                    el, 
                    tag,

                    sub: add_subcontroller, 
                    element: make_element_reffrence, 

                    event: bind_element_event, 
                    with_bind: bind_composer_event,
                    subscribe: bind_observable,

                    setup,
                    release,

                    props: {
                        ...options.props
                    },
                    slots: {
                        ...options.slots
                    }
                });

                el(document.createElement(tag()))

                el().innerHTML = html;

                // -- bind events
                element_events().forEach(({ tag, cb }) => {
                    const match = tag.match(/^(\w+)\s*(.*)$/);
                    const evname = match[1].trim();
                    const selector = match[2].trim();
                    Composer.add_event(el(), evname, cb, selector);
                })

                elements().forEach(({ tag, element }) => {
                    element(Composer.find(el(), tag));
                });

                // -- add sub controllers
                sub_controllers().forEach(({ tag, controller }) => {
                    if(controller()) append_subcontroller(tag, controller());
                });

                const element = Composer.find(document, inject_tag);
                if(element) element.appendChild(el());
                active(true);
                setup_fn()();
                return el();
            }

            if(options.inject) {
                inject(options.inject);
            }

            return {
                el,
                inject,
                release,
                active,
                id,
            }
        }
        return create_controller;
    }
    Composer.exp0rt({ FnController })
}).apply((typeof exports != 'undefined') ? exports : this);

