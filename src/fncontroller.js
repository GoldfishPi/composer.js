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

            const dom_diff = observable('');

            const bound_data = observable({});

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

            // -- Start Event Binding Helpers
            const bind_element_event = (tag, cb) => element_events([
                ...element_events(),
                { tag, cb }
            ])

            const bind_composer_event = (event_obj, event_name, fn) => composer_events([
                ...composer_events(),
                { event_obj, fn, event_name, id:event_obj.bind(event_name, fn) }
            ])

            const bind_observable = (observable, cb) => observable_subscriptions([
                ...observable_subscriptions(),
                { observable, index:observable.subscribe(cb), cb }
            ]);
            const bind_data = observables => {
                bound_data(observables);
            }
            // -- End Event Binding Helpers

            const make_element_reffrence = (tag) => {
                const element = observable(null)
                elements([
                    ...elements(),
                    { tag, element }
                ]);
                return element;
            }


            const release = () => {

                if(!active()) return;

                // -- Start Cleanup Events
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
                // -- End cleanup events

                el().parentNode.removeChild(el());
                active(false);
            }

            const append_subcontroller = (tag, controller) => {
                // -- used for normal controllers
                if(controller.active === undefined) {
                    el().querySelector(tag)
                        .appendChild(controller.el);

                // -- used for active fn controller that needs to be moved
                }else if(controller.active()) {
                    el().querySelector(tag)
                        .appendChild(controller.el());

                // -- used for inactive fn controller that needs to be injected
                } else {
                    el().querySelector(tag)
                        .appendChild(controller.inject());
                }
            }

            const render_xdom = () => {

                const el_to = document.createElement(tag());

                const html = observable(dom_diff());

                console.log('start html render')

                const replace_item = (key, value) => {
                    const regex = new RegExp(`{\\s*${key}.*\\s*}`, 'g');
                    return html().replace(regex, item => {
                        if(item.includes('.')) {
                            let res = value.toJSON ? value.toJSON() : value;
                            item
                                .replace( '}','')
                                .replace('{', '')
                                .replace(/\s/g, '')
                                .split('.')
                                .slice(1)
                                .forEach(item => {
                                    if(!res)return;
                                    res = res[item];
                                })
                            return res || '';
                        }
                        return value;
                    });
                }

                for(let key in bound_data()) {
                    const item = bound_data()[key];
                    if(item.subscribe) {
                        html(replace_item(key, item()));
                    } else {
                        html(replace_item(key, item))
                    }
                }

                el_to.innerHTML = html();

                const options = {
                    children_only:true,
                    ignore_elements:sub_controllers()
                        .map(({ controller }) => controller().el() )
                }

                Composer.frame(() => {
                    Composer.xdom.patch(el(), [ el(), el_to ], options);

                    // -- set elements
                    elements().forEach(({ tag, element }) => {
                        element(Composer.find(el(), tag));
                    });

                    // -- add sub controllers
                    sub_controllers().forEach(({ tag, controller }) => {
                        if(controller()) append_subcontroller(tag, controller());
                    });

                    active(true);
                    setup_fn()();

                })
            }

            const inject = inject_tag => {

                // -- init
                const html = controller({
                    el, 
                    tag,

                    sub: add_subcontroller, 
                    element: make_element_reffrence, 

                    event: bind_element_event, 
                    with_bind: bind_composer_event,
                    subscribe: bind_observable,
                    data: bind_data,

                    setup: fn => setup_fn(fn),
                    release,

                    props: {
                        ...options.props
                    },
                    slots: {
                        ...options.slots
                    }
                });

                el(document.createElement(tag()))

                // el().innerHTML = html;

                dom_diff(html);

                // -- bind events
                element_events().forEach(({ tag, cb }) => {
                    const match = tag.match(/^(\w+)\s*(.*)$/);
                    const evname = match[1].trim();
                    const selector = match[2].trim();
                    Composer.add_event(el(), evname, cb, selector);
                })


                for(let key in bound_data()) {
                    const item = bound_data()[key];
                    if(item.subscribe) {
                        bind_observable(item, () => {
                            render_xdom();
                        });
                    } else {
                        bind_composer_event(item, 'change', () => {
                            render_xdom()
                        });
                    }
                }

                const element = Composer.find(document, inject_tag);
                if(element) element.appendChild(el());

                render_xdom();

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

