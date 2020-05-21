const TestSub = Composer.FnController(({ data, event }) => {
    const count = observable(0);

    data({
        count
    });

    event('click button', () => count(count() + 1));

    return `
        <p> I am a sub controller, my count is { count }</p>
        <button>++ subcontroller count</button>
    `
})
const Main = Composer.FnController(({ sub, event, release, data }) => {

    const count = observable(0)
    const toggle = observable('off');

    data({
        count,
        toggle
    });

    sub('.inject-target', TestSub({
        hello:'erik',
        props: {
            count
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

    return `
        <h1>Hello World</h1>
            <div class="inject-target"></div>
        <h2>Goodbye world</h2>
        <p>My data test { count }</p>
        <button class="amazing-button">Click me!</button>
        <button class="release">Rlease me</button>
        <button class="toggle">{ toggle }</button>
    `
})

window.addEventListener('DOMContentLoaded', () => {
    console.log('starting')
    Main().inject('#app');
})
