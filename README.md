## knockoutjs-component-loader
This can take tcomponet name html file path and js files path and register a component for you.

## Code Example
var test = new SonsorTemplate('test-component', {
            html: 'path to html file',
            js: ['path of arrays of js files'],
            viewModelName: 'your view model name'
        });
then put this tag on you html where you wanna use
<test-component></test-component>

@ Hooks
This also provice ready hook when you html and js files are loaded and binded
as in above example you can use hoo like
test.ready(function() {
    console.log("componenet is ready");
});