//app goes here
//this application only has one component: todo
var todo = {};

//for simplicity, we use this component to namespace the model classes
//the Todo class has two properties
todo.Todo = function(data) {
    this.description = m.prop(data.description);
    this.done = m.prop(false);
    this.editing=m.prop(false);
};

//the TodoList class is a list of Todo's
todo.TodoList = Array;

function load(){
    var data = JSON.parse(localStorage["todoV1"] || "[]");
    var list=new todo.TodoList();
    data.map(function(elem){
        var newTodo=new todo.Todo({description: elem.description });
        newTodo.done(elem.done);
        list.push(newTodo);
    });
    return list;
} 
function save(todoList){
    var js=JSON.stringify(todoList);
    localStorage["todoV1"]=js;
    debug("Saved:"+js);
}

//the view-model tracks a running list of todos,
//stores a description for new todos before they are created
//and takes care of the logic surrounding when adding is permitted
//and clearing the input after adding a todo to the list
todo.vm = (function() {
    var vm = {};
    vm.init = function() {
        //a running list of todos
        // still unclear how to load from localStorage
        vm.list = load();

        //a slot to store the name of a new todo before it is created
        vm.description = m.prop("");

        //adds a todo to the list, and clears the description field for user convenience
        vm.add = function() {
            if (vm.description()) {
                vm.list.push(new todo.Todo({description: vm.description()}));
                vm.description("");                
            }
        };
    };
    vm.remove=function(elem){
        // Filter out the bad guy
        var newlist=
                vm.list.filter(function(e) { return e.description()!=elem.description();});
        vm.list=newlist;
    };
    return vm;
}());

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
//GG: See http://www.w3schools.com/jsref/dom_obj_event.asp for a full list of events
todo.view = function() {
    //debug("View Called");
    return m("html", [
        m("body", [
            m("h3","DashBoard"),
            m("p","Click on an item to edit it. Use wheel on an item to invert it state. Data are saved on you browser storage"),
            m("input", {onchange: m.withAttr("value", todo.vm.description), value: todo.vm.description()}),
            m("button", {onclick: todo.vm.add}, "Add"),
            m("table", [
                m("tr",
                  [ m("td", {class: "done-column"}, "Done?"),
                    m("td","")]),
                todo.vm.list.map(function(task, index) {
                    if(!task.editing()){
                        return m("tr", [
                            m("td", [
                                m("input[type=checkbox]", {onclick: m.withAttr("checked", task.done),
                                                           
                                                           checked: task.done()})
                            ]),
                            m("td", {
                                style: {textDecoration: task.done() ? "line-through" : "none"},
                                onwheel: task.done.bind(this, !task.done()),
                                onclick: task.editing.bind(task,true)
                            }, task.description()),
                        ]);
                    }else{
                        return m("tr", [
                            m("td",{colpsan:2},[
                                m("input", { onchange: m.withAttr("value", task.description),
                                             value: task.description(),
                                             onblur: task.editing.bind(task,false)
                                           }
                                 ),
                                m("button[type=button]",{onclick: todo.vm.remove.bind(this,task)},"Delete")
                            ])
                        ]);
                    }
                })
            ]),
            m("div",[
                m("button[type=button]",{ onclick: save.bind(this,todo.vm.list)},"Save Data"),
                m("button[type=button]",{ onclick: todo.vm.init.bind(this),
                                          class: "super-right"
                                        },"Reload (discard unsaved changes!)")
            ]),
            m("div",
              [
                  m("h4","Log console"),
                  m("ul",[
                      logLines.map(function(elem){
                          return m("li",
                                   elem.d+" ["+elem.level+"] "+elem.m);
                      })
                  ])
              ]
             )            
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
// mode: company
// End:
