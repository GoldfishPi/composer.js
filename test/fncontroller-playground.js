
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

const EventedController = Composer.FnController(({ with_bind, props, element }) => {
    const event_status = element('span')

    with_bind(props.event_bus, 'update', () => {
        event_status().innerHTML = 'EVENT TRIGGERED REEEEEEE';
    })
    return `
        <p>event status: <span>no events triggered....</span></p>
    `
})

const Main = Composer.FnController(({ sub, event, release, setup, element }) => {

    const count = observable(0)
    const toggle = observable('off');
    const text = observable('lol');

    const el_text = element('input');
    const el_count = element('.my-count');
    const el_toggle = element('.toggle')

    const event_bus = new Composer.Event();

    sub('.inject-event', EventedController({
        props: {
            event_bus
        }
    }))

    const test_sub = sub('.inject-target');

    event('click .release-btn', () => {
        if(test_sub()) test_sub().release();
    })
    event('click .inject-btn', () => {
        test_sub(TestSub({
            props: {
                text
            },
        }));
    });

    event('click .event-trigger', () => {
        event_bus.trigger('update');
    })

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
            <div class="inject-event"></div>
            <button class="release-btn">Rlease Sub Controller</button>
            <button class="inject-btn">Inject Sub Controller</button>
            <button class="event-trigger">Trigger Composer Event</button>
        </div>
        <h2>Goodbye world</h2>
        <p>My data test <span class="my-count">0</span></p>
        <button class="amazing-button">Click me!</button>
        <button class="release">Rlease me</button>
        <button class="toggle">off</button>
        <input type="text">
    `
});

// window.addEventListener('DOMContentLoaded', () => {
//     console.log('starting');
//     Main({ inject:'#app' });
// })

window.addEventListener('DOMContentLoaded', () => {
    console.log('starting lol');
    ListMain({ inject:'#app' });
    // new ListController({ inject:'#app' })
})

