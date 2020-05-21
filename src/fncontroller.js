/*
 *
 */
(function() {
    const FnController = controller => {

        const tag = observable('div');
        const sub_controllers = observable([]);
        const events = observable([]);
        const elements = observable([]);
        const setup_fn = observable(() => {});
        const controller_html = observable('');

        const sub = (tag, controller) => {
            sub_controllers([
                ...sub_controllers(),
                { tag, controller }
            ])
        }

        const event = (tag, cb) => events([
            ...events(),
            { tag, cb }
        ])

        const element = (tag) => {
            const element = observable(null)
            elements([
                ...elements(),
                { 
                    tag,
                    element
                }
            ])
            return element;
        }

        const setup = (fn) => setup_fn(fn);        
        const el = observable(null); 

        const release = () => {

            events().forEach(({ tag, cb }) => {
				const match = tag.match(/^(\w+)\s*(.*)$/);
				const evname = match[1].trim();
				const selector = match[2].trim();
                Composer.remove_event(el(), evname, cb, selector);
            });

            sub_controllers().forEach(({ controller }) => {
                controller.release();
            });

            el().parentNode.removeChild(el());
        }

        const controller_options = observable({ 
            sub, 
            event, 
            element, 
            el, 
            setup,
            release,
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
            el().innerHTML = controller_html();

            sub_controllers().forEach(({ tag, controller }) => {
                el().querySelector(tag)
                    .appendChild(controller.inject());
            })

            events().forEach(({ tag, cb }) => {
				const match = tag.match(/^(\w+)\s*(.*)$/);
				const evname = match[1].trim();
				const selector = match[2].trim();
                Composer.add_event(el(), evname, cb, selector);
            })

            elements().forEach(({ tag, element }) => {
                element(Composer.find(el(), tag));
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

            controller_options({
                ...controller_options(),
                ...options
            });

            return {
                inject,
                release,
            }
        };
    }
    Composer.exp0rt({ FnController })
}).apply((typeof exports != 'undefined') ? exports : this);
