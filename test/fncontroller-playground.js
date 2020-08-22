
const MySub = Composer.FnController(({ props, data }) => {
    // data({
    //     // ...props
    // })
    return `
        <h2>nested observable text: {title}</h2>
    `
});
const Main = Composer.FnController(({ data, sub }) => {

    // const text = observable('');
    const model = new Composer.Model({
        count:0
    });

    const { text, count } = data({
        text:'',
        count:0,

        bind: {
            model,
        },

        methods: {
            on_text:e => text(e.target.value),
            on_click:() => {

                count(count() + 1);
                model.set({
                    count:model.get('count') + 1
                })
            },
        },
        controllers: {
            MySub
        }
    });

    // sub('.sub', MySub({
    //     title:'wow'
    // }));

    return `
        <button @click="on_click">click me</button>
        <div>
            <input placeholder="my text" value="{ text }" @keyup="on_text">
        </div>
        <h2>
            model text: { model.count }
        </h2>
        <h2>
            observable text: { text }
        </h2>
        <h3>
        count: { count }
        </h3>
        <h2>My Sub Controller</h2>
        <MySub/>
    `
});

window.addEventListener('DOMContentLoaded', () => {
    console.log('starting');
    Main({ inject:'#app' });
})

// window.addEventListener('DOMContentLoaded', () => {
//     console.log('starting lol');
//     ListMain({ inject:'#app' });
//     new ListController({ inject:'#app' })
// })

