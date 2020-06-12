const ListItem = Composer.FnController(({ props, element, setup, tag, event }) => {

    tag('li');

    const { title } = props;
    const el_title = element('.item-title');

    setup(() => {
        el_title().innerHTML = title();
        console.log('title', title());
    });

    event('click .delete', props.on_delete);

    return `
        <div style="display:flex">
            <p style="margin:0;margin-right:1rem" class="item-title"></p>
            <a href="#" class="delete">Delete</a>
        </div>
    `
});
const ListMain = Composer.FnController(({ event, element, subscribe, sub }) => {
    const items = observable([]);
    const sub_controllers = observable([]);
    const el_text = element('input');

    event('click button', () => {
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
                    console.log('plz kill meh');
                    sub_controller().release();
                }
            }
        }));

        sub_controllers([
            ...sub_controllers(),
            sub_controller
        ]);

    });

    return `
        <ul class="list"></ul>
        <div style="display:flex">
            <input placeholder="Item Title">
            <button class="add">Add Item</button>
        </div>
    `
});

window.addEventListener('DOMContentLoaded', () => {
    console.log('starting lol');
    ListMain({ inject:'#app' });
})
