
const MySub = Composer.FnController(({ props, data }) => {
    // data({
    //     // ...props
    // })
    return `
        <h2>nested observable text: {title}</h2>
    `
});
const Main = Composer.FnController(({ sub, event, data }) => {

    // const text = observable('');
    const model = new Composer.Model();

    const { text, count } = data({
        text:'',
        count:0,
    });

    sub('div', MySub({
        props: {
            title:text,
            model
        }
    }));

    event('keyup input', e => {
        text(e.target.value);
        model.set({ 
            moose:e.target.value,
            goose: {
                value:e.target.value
            }
        })
    });

    return `
        <div>
            <input placeholder="my text" value="{ text }">
            <input placeholder="update kek">
            <input title="+" class="up">
        </div>
        <h2>
            model text: { model.goose.value }
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

