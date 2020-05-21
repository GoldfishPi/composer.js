const TestSub = Composer.FnController(({ data, event, props }) => {
    const { text } = props;
    const count = observable(0);

    data({
        count,
        text,
    });

    event('click button', () => count(count() + 1));

    return `
        <p>my text { text }</p>
        <p> I am a sub controller, my count is { count }</p>
        <button>++ subcontroller count</button>
    `
})
const Main = Composer.FnController(({ sub, event, release, data, setup, element }) => {

    const count = observable(0)
    const toggle = observable('off');
    const text = observable('lol');

    const el_text = element('input');

    data({
        count,
        toggle,
        text
    });

    sub('.inject-target', TestSub({
        hello:'erik',
        props: {
            count,
            text
        }
    }));

    event('click .amazing-button', () => {
        count(count() + 1);
    });

    event('click .release', () => release());

    event('click .toggle', () => {
        if(toggle() === 'on') {
            toggle('off');
        } else {
            toggle('on')
        }
    })

    setup(() => {
        console.log('el_text', el_text);
        el_text().value = text();
    })

    event('keyup input', (e) => text(e.target.value));

    return `
        <h1>Hello World</h1>
            <div class="inject-target"></div>
        <h2>Goodbye world</h2>
        <p>My data test { count}</p>
        <button class="amazing-button">Click me!</button>
        <button class="release">Rlease me</button>
        <button class="toggle">{ toggle }</button>
        <input type="text">
    `
})

window.addEventListener('DOMContentLoaded', () => {
    console.log('starting')
    Main().inject('#app');
})
