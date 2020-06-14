const ListItem = Composer.FnController(({ props, element, setup, tag, event }) => {

    tag('li');

    const { title } = props;
    const el_title = element('.item-title');

    setup(() => {
        el_title().innerHTML = title();
    });

    event('click .delete', props.on_delete);

    return `
        <div style="display:flex">
            <p style="margin:0;margin-right:1rem" class="item-title"></p>
            <a href="#" class="delete">Delete</a>
        </div>
    `
});

const ListMain = Composer.FnController(({ event, element, sub, subscribe, setup, el }) => {
    const items = observable([]);
    const sub_controllers = observable([]);

    const el_text = element('input');
    const el_array = element('.array');

    const add_item = () => {

        if(!el_text().value)return;
        const title = observable(el_text().value)

        items([
            ...items(),
            title
        ]);

        el_text().value = '';

        const sub_controller = sub('.list', ListItem({
            props: {
                title,
                on_delete() {
                    sub_controller().release();
                    items(items().filter(item => item !== title));
                }
            }
        }));

        sub_controllers([
            ...sub_controllers(),
            sub_controller
        ]);
    }

    event('click button', () => {
        add_item();
    });

    event('keydown input', (e) => {
        if(e.key === 'Enter') add_item();
    })

    subscribe(items, values => {
        el_array().innerHTML = values.map(v => v()).toString();
    })

    setup(() => {
        console.log('we have an el???', el());
        console.log('what about the other els',el_text());
    })

    return `
        <h2>Fn Controller</h2>
        <ul class="list"></ul>
        <div style="display:flex">
            <input placeholder="Item Title">
            <button class="add">Add Item</button>
        </div>
        <div>
            <p>Array stringified: <span class="array"></span></p>
        </div>
    `
});


