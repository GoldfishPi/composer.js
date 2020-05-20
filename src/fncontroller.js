/*
 *
 */
(function() {
    const FnController = controller => {

        const tag = 'div';

        const use_state = (initial_value = null) => {
            let value = initial_value;
            let subscriptions = [];
            const set_value = new_value => {
                value = new_value;
                subscriptions.forEach(cb => cb(new_value));
            }

            const curr_fn = function() {
                return value;
            }

            curr_fn.subscribe = (cb) => {
                subscriptions.push(cb);
            }

            return [ curr_fn, set_value ]
        }

        const use_effect = (cb, states) => {
            states.forEach(state => {
                state.subscribe(cb);
            });
        }


        let sub_controllers = [];
        const sub = (tag, controller) => {
            sub_controllers.push({ tag, controller });
        }

        let events = [];

        const event = (tag, cb) => {
            events.push({ tag, cb })
        }

        let elements = [];
        const element = (tag) => {
            const [ element, set_element ] = use_state(null);
            elements.push({ tag, set_element });
            return element;
        }

        let setup_fn = () => {};
        const setup = (fn) => {
            setup_fn = fn;
        }
        
        let [el, set_el] = use_state(null);

        const release = () => {

            events.forEach(({ tag, cb }) => {
				const match = tag.match(/^(\w+)\s*(.*)$/);
				const evname = match[1].trim();
				const selector = match[2].trim();
                Composer.remove_event(el(), evname, cb, selector);
            });

            sub_controllers.forEach(({ controller }) => {
                controller.release();
            });

            el().parentNode.removeChild(el());
        }

        let controller_options = { 
            sub, 
            event, 
            element, 
            el, 
            setup,
            use_state, 
            use_effect,
            release,
        };

        let controller_html = '';
        const init = () => {
            controller_html = controller(controller_options);
            set_el(document.createElement(tag));
            setup_fn();
        }


        const render = () => {
            el().innerHTML = controller_html;
            for(let sub_controller of sub_controllers) {
                const target = el().querySelector(sub_controller.tag)
                const sub_element = sub_controller.controller.inject();
                target.appendChild(sub_element);
            }

            events.forEach(({ tag, cb }) => {
				const match = tag.match(/^(\w+)\s*(.*)$/);
				const evname = match[1].trim();
				const selector = match[2].trim();
                Composer.add_event(el(), evname, cb, selector);
            })

            elements.forEach(({ tag, set_element }) => {
                set_element(Composer.find(el(), tag));
            });
        }

        const inject = (inject_tag) => {
            init();
            render();
            const element = Composer.find(document, inject_tag);
            if(element) element.appendChild(el());
            return el();
        }

        return (options) => {
            controller_options = {
                ...controller_options,
                ...options
            }
            return {
                inject,
                release,
            }
        };
    }
    Composer.exp0rt({ FnController })
}).apply((typeof exports != 'undefined') ? exports : this);
