//app goes here
//this application only has one component: todo
var todo = {};

//for simplicity, we use this component to namespace the model classes

//the Todo class has two properties
todo.Todo = function(data) {
    this.description = m.prop(data.description);
    this.done = m.prop(false);
};

//the TodoList class is a list of Todo's
todo.TodoList = Array;

//the view-model tracks a running list of todos,
//stores a description for new todos before they are created
//and takes care of the logic surrounding when adding is permitted
//and clearing the input after adding a todo to the list
todo.vm = (function() {
    var vm = {}
    vm.init = function() {
        //a running list of todos
        vm.list = new todo.TodoList();

        //a slot to store the name of a new todo before it is created
        vm.description = m.prop("");

        //adds a todo to the list, and clears the description field for user convenience
        vm.add = function() {
            if (vm.description()) {
                vm.list.push(new todo.Todo({description: vm.description()}));
                vm.description("");
            }
        };
    }
    return vm
}())

//the controller defines what part of the model is relevant for the current page
//in our case, there's only one view-model that handles everything
todo.controller = function() {
    todo.vm.init()
}

//////// Log framework....
var logLines=[];
function debug(logline){
    log_priv({d:(new Date()), m:logline, level:"D"});
}
function error(logline){
        log_priv({d:(new Date()), m:logline, level:"E"});
} 
function log_priv(rec){
    logLines.push(rec);
    if(logLines.length >5 /** GG CONFIG: HOW MUCH LOG LINES TO RETAIN? */ ){
        // Remove first
        logLines.shift();
    }
}
////////////////////////////

debug("Building view...");
//here's the view
todo.view = function() {
    debug("View Called");
    return m("html", [
        m("body", [
            m("h3","DashBoard"),
            m("div",  [
                m("div","Search:"),
                m("input", {onchange: m.withAttr("value", todo.vm.description), value: todo.vm.description()})
            ]),
            m("input", {onchange: m.withAttr("value", todo.vm.description), value: todo.vm.description()}),
            m("button", {onclick: todo.vm.add}, "Add"),
            m("table", [
                todo.vm.list.map(function(task, index) {
                    return m("tr", [
                        m("td", [
                            m("input[type=checkbox]", {onclick: m.withAttr("checked", task.done), checked: task.done()})
                        ]),
                        m("td", {style: {textDecoration: task.done() ? "line-through" : "none"}}, task.description()),
                    ])
                })
            ]),
            m("div",
              [
                  m("h4","Log console"),
                  m("ul",[
                      logLines.map(function(elem){
                          return m("li", elem.d+" ["+elem.level+"] "+elem.m);
                      })
                  ])
              ]
             ),            
        ])
    ]);
};


//initialize the application
m.mount(document.body, {controller: todo.controller, view: todo.view});
debug("Dash board setup ends here");

// Emacs config
// Auto complete: remebmeber to issue (ac-config-default)
// Local variables:
// mode: js2
// End:
