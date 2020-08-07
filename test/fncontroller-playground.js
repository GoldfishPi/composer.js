
const MySub = Composer.FnController(({ props, data }) => {
    // data({
    //     // ...props
    // })
    return `
        <h2>nested observable text: {title}</h2>
    `
});
const Main = Composer.FnController(({ dom, data }) => {

    // const text = observable('');
    const model = new Composer.Model();

    const { text, count } = data({
        text:'',
        count:0,

        on_text:e => text(e.target.value),
        on_click: () => count(count() + 1)
    });

    return `
        <button @click="on_click">click me</button>
        <div>
            <input placeholder="my text" value="{ text }" @keyup="on_text">
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

