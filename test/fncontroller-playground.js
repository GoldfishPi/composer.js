
const MySub = Composer.FnController(({ props, data }) => {
    data(props)
    console.log('props', props);
    return `
        <h1>title: {title}</h1>
    `
});
const Main = Composer.FnController(({ sub, event, release, setup, element, data }) => {

    const text = observable('');
    const my_title = observable('lol im a title');

    data({
        text
    });

    sub('div', MySub({
        props: {
            title:text
        }
    }));

    event('keyup input', e => {
        text(e.target.value);
    });

    return `
        <div>
            <input placeholder="my text" value="{text}">
        </div>
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

