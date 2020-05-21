function observable(value) {
    let listeners = [];
    function notify(new_value) {
        listeners.forEach(listener => listener(new_value))
    }
    function accessor(new_value) {
        if(arguments.length && new_value !== value) {
            value = new_value;
            notify(new_value);
        }
        return value;
    }
    accessor.subscribe = function(listener) {
        listeners.push(listener);
    }
    return accessor;
}

function watch_many(listener, observables) {
    observables.forEach(observable.subscribe(listener));
}
