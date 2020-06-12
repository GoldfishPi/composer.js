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

const ListMain = Composer.FnController(({ event, element, sub, subscribe }) => {
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

// Normal composer way of doing things - 80 lines
const ItemModel = Composer.Model.extend({
});
const ItemCollection = Composer.Collection.extend({
    model:ItemModel
});
const ListItemController = Composer.Controller.extend({
    elements: {
        'p':'el_title'
    },
    events: {
        'click .delete':'on_delete'
    },
    props: {
        on_delete() {},
    },
    init:function() {
        this.render();
        this.el_title.innerHTML = this.model.get('title');
    },
    render: function() {
        this.html(`
            <div style="display:flex">
                <p style="margin:0;margin-right:1rem" class="item-title"></p>
                <a href="#" class="delete">Delete</a>
            </div>
        `);
    },
    on_delete: function(e) {
        this.props.on_delete(e);
    }
});
const ListController = Composer.ListController.extend({
    elements: {
        'input':'el_text',
        '.list':'el_list',
        '.array':'el_array',
    },
    events: {
        'click .add':'on_add',
        'keydown input':'on_keydown'
    },
    init: function() {
        this.render();
        this.collection = new ItemCollection();
        this.track(this.collection, model => new ListItemController({
            model,
            inject:this.el_list,
            props: {
                on_delete: () => {
                    this.collection.remove(model);
                }
            }
        }));
        this.with_bind(this.collection, ['add', 'remove'], () => {
            this.el_array.innerHTML = this.collection
                .toJSON()
                .map(m => m.title)
                .toString();
        })
    },
    render: function() {
        this.html(`
            <h2>Normal Controller</h2>
            <ul class="list"></ul>
            <div style="display:flex">
                <input placeholder="Item Title">
                <button class="add">Add Item</button>
            </div>
            <div>
                <p>Array stringified: <span class="array"></span></p>
            </div>
        `)

    },
    add_item: function() {
        this.collection.add({ title:this.el_text.value });
        this.el_text.value = '';
    },
    on_add: function() {
        this.add_item();
    },
    on_keydown: function(e) {
        if(e.key !== 'Enter') return;
        this.add_item();
    }
});
// window.addEventListener('DOMContentLoaded', () => {
//     console.log('starting lol');
//     ListMain({ inject:'#app' });
//     new ListController({ inject:'#app' })
// })

