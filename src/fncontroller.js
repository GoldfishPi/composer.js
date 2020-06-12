/*
 *
 */
(function() {
    const FnController = (controller) => {
        const create_controller = (options = {}) => {

            const el = observable(null); 
            const active = observable(false);

            const tag = observable('div');
            const sub_controllers = observable([]);
            const events = observable([]);
            const elements = observable([]);
            const setup_fn = observable(() => {});
            const bound_data = observable({});
            const observable_subscriptions = observable([]);

            const controller_html = observable('');
            const previous_render = observable('');
            const id = observable(Composer.cid());

            const sub = (tag, controller) => {
                const current_controller = observable(controller)
                const previous_controller = observable(controller);
                sub_controllers([
                    ...sub_controllers(),
                    { tag, controller:current_controller }
                ]);

                if(active() && controller) append_subcontroller(tag, controller);

                current_controller
                    .subscribe(controller => {

                        if(previous_controller().active())previous_controller().release();

                        previous_controller(controller);
                        append_subcontroller(tag, controller)

                    });

                return current_controller;
            }

            const event = (tag, cb) => events([
                ...events(),
                { tag, cb }
            ])

            const element = (tag) => {
                const element = observable(null)
                elements([
                    ...elements(),
                    { tag, element }
                ]);
                return element;
            }

            const subscribe = (observable, cb) => observable_subscriptions([
                ...observable_subscriptions(),
                { observable, index:observable.subscribe(cb) }
            ]);

            const setup = (fn) => setup_fn(fn);        

            const release = () => {

                events().forEach(({ tag, cb }) => {
                    const match = tag.match(/^(\w+)\s*(.*)$/);
                    const evname = match[1].trim();
                    const selector = match[2].trim();
                    Composer.remove_event(el(), evname, cb, selector);
                });

                observable_subscriptions()
                    .forEach(({ observable, index }) => observable.unsubscribe(index));

                sub_controllers().forEach(({ controller }) => {
                    controller().release();
                });

                el().parentNode.removeChild(el());
                active(false);
            }

            const controller_options = observable({ 
                sub, 
                event, 
                element, 
                el, 
                setup,
                release,
                tag,
                subscribe,

                props: {
                    ...options.props
                },
                slots: {
                    ...options.slots
                }
            });


            const init = () => {
                controller_html(
                    controller(controller_options())
                );
                const created = document.createElement(tag())
                el(created);
                setup_fn();
            }

            const render = () => {
                const html = observable(controller_html());
                for(const key in bound_data()) {
                    const regex = new RegExp(`{\\s*${key}\\s*}`, 'g');
                    const new_html = html().replace(regex, bound_data()[key]());
                    html(new_html);
                }

                if(html() === previous_render())return;
                previous_render(html());
                el().innerHTML = html();
                if(active()) append_subcontrollers();
            }

            const bind = () => {
                events().forEach(({ tag, cb }) => {
                    const match = tag.match(/^(\w+)\s*(.*)$/);
                    const evname = match[1].trim();
                    const selector = match[2].trim();
                    Composer.add_event(el(), evname, cb, selector);
                })

                elements().forEach(({ tag, element }) => {
                    element(Composer.find(el(), tag));
                });

                for(let key in bound_data()) {
                    bound_data()[key].subscribe(() => render());
                }
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

            const append_subcontrollers = () => {
                sub_controllers().forEach(({ tag, controller }) => {
                    append_subcontroller(tag, controller());
                })
            }

            const inject = (inject_tag) => {
                init();
                render();
                bind();
                append_subcontrollers();
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

