const TestSub = Composer.FnController(({ hello, props }) => {
  return `
		<p> I am a sub controller, hello ${props.count()} </p>
	`
})
const Main = Composer.FnController(({ sub, event, element, el, release }) => {
  
 	const my_element = element('h1');
  const count = observable(0)
  
  sub('.inject-target', TestSub({
    hello:'erik',
    props: {
      count
    }
  }));
  
  event('click .amazing-button', () => {
    console.log('click')
  });
  
  event('click .release', () => release());
  
  return `
		<h1>Hello World</h1>
			<div class="inject-target"></div>
		<h2>Goodbye world</h2>
		<button class="amazing-button">Click me!</button>
		<button class="release">Rlease me</button>
	`
})

window.addEventListener('DOMContentLoaded', () => {
    console.log('starting')
    Main().inject('#app');
})
