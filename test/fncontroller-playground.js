
const MySub = Composer.FnController(({ props, data }) => {
    // data({
    //     // ...props
    // })
    return `
        <h2>nested observable text: {title}</h2>
    `
});
const Main = Composer.FnController(({ data }) => {

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
        }
    });

    const on_click = () => {

        count(count() + 1);
        model.set({
            count:model.get('count') + 1
        })
    }

    data({ methods: {
        on_click
    } });

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

