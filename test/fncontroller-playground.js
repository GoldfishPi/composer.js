
const TestSub = Composer.FnController(({ element, event, props, setup, subscribe }) => {
    const { text } = props;
    const count = observable(0);

    const el_text = element('.my-text');
    const el_count = element('.my-count');

    subscribe(text, value => el_text().innerHTML = value);
    subscribe(count, value => el_count().innerHTML = value)

    event('click button', () => count(count() + 1));

    setup(() => {
        el_text().innerHTML = text();
        el_count().innerHTML = count();
    });

    return `
        <p>my text: <span class="my-text"></span></p>
        <p> I am a sub controller, my count is <span class="my-count"></span></p>
        <button>++ subcontroller count</button>
        <div class="content"></div>
    `
});

const Main = Composer.FnController(({ sub, event, release, setup, element }) => {

    const count = observable(0)
    const toggle = observable('off');
    const text = observable('lol');

    const el_text = element('input');
    const el_count = element('.my-count');
    const el_toggle = element('.toggle')

    const test_sub = sub('.inject-target', TestSub({
        props: {
            text
        },
    }));

    event('click .release-btn', () => {
        test_sub().release();
    })
    event('click .inject-btn', () => {
        test_sub(TestSub({
            props: {
                text
            },
        }));
    });

    event('click .amazing-button', () => {
        count(count() + 1);
        el_count().innerHTML = count();
    });

    event('click .release', () => release());

    event('click .toggle', () => {
        if(toggle() === 'on') {
            toggle('off');
        } else {
            toggle('on')
        }
        el_toggle().innerHTML = toggle();
    });

    event('keyup input', (e) => text(e.target.value));

    setup(() => {
        el_text().value = text();
    });


    return `
        <h1>Hello World</h1>
        <div>
            <div class="inject-target"></div>
            <button class="release-btn">Rlease Sub Controller</button>
            <button class="inject-btn">Inject Sub Controller</button>
        </div>
        <h2>Goodbye world</h2>
        <p>My data test <span class="my-count">0</span></p>
        <button class="amazing-button">Click me!</button>
        <button class="release">Rlease me</button>
        <button class="toggle">off</button>
        <input type="text">
    `
});

window.addEventListener('DOMContentLoaded', () => {
    console.log('starting');
    Main({ inject:'#app' });
})

