Ember.TEMPLATES["_away_dates"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("<label id=\"person-rota-spinner\" class=\"spinner\">&nbsp;</label>");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <table class=\"table\">\n            <thead>\n                <tr>\n                    <th></th><th>From Date</th><th>To Date</th><th></th>\n                </tr>\n            </thead>\n            <tbody>\n            ");
  stack1 = helpers.each.call(depth0, "r", "in", "away_dates", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </tbody>\n            </table>\n        ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n            <tr>\n                <td><button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "editAwayDate", "r", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["ID","ID"],data:data})));
  data.buffer.push(" class=\"btn btn-default\">Edit</button></td>\n                <td>");
  data.buffer.push(escapeExpression((helper = helpers.formatDate || (depth0 && depth0.formatDate),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "r.from_date", options) : helperMissing.call(depth0, "formatDate", "r.from_date", options))));
  data.buffer.push("</td>\n                <td>");
  data.buffer.push(escapeExpression((helper = helpers.formatDate || (depth0 && depth0.formatDate),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "r.to_date", options) : helperMissing.call(depth0, "formatDate", "r.to_date", options))));
  data.buffer.push("</td>\n                <td><button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteAwayDate", "r", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["ID","ID"],data:data})));
  data.buffer.push(" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-remove-circle\"></span></button></td>\n            </tr>\n            ");
  return buffer;
  }

function program6(depth0,data) {
  
  
  data.buffer.push("\n            <p>No away dates found.</p>\n        ");
  }

function program8(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <div class=\"alert alert-danger\">");
  stack1 = helpers._triageMustache.call(depth0, "awayError", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n        ");
  return buffer;
  }

  data.buffer.push("\n    <div class=\"panel panel-default\">\n        <div class=\"panel-heading\">\n            <h3 class=\"panel-title\">");
  stack1 = helpers['if'].call(depth0, "awayLoading", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("Away Dates&nbsp;\n                <button class=\"btn btn-primary\" title=\"New Away Dates\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "newAwayDates", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("><span class=\"glyphicon glyphicon-plus\"></span></button>\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'value': ("awayRangeSelected"),
    'content': ("ranges"),
    'optionValuePath': ("content.value"),
    'optionLabelPath': ("content.name")
  },hashTypes:{'value': "ID",'content': "ID",'optionValuePath': "STRING",'optionLabelPath': "STRING"},hashContexts:{'value': depth0,'content': depth0,'optionValuePath': depth0,'optionLabelPath': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n            </h3>\n        </div>\n        <div class=\"panel-body\" id=\"person-rota\">\n        ");
  stack1 = helpers['if'].call(depth0, "away_dates", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n    </div>\n\n\n<div class=\"modal fade\" id=\"awayModal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n  <div class=\"modal-dialog\">\n    <div class=\"modal-content\">\n      <div class=\"modal-header\">\n        <h4 class=\"modal-title\">Away Dates</h4>\n      </div>\n      <div class=\"modal-body\">\n        ");
  stack1 = helpers['if'].call(depth0, "awayError", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("hidden"),
    'name': ("awayForm.id"),
    'value': ("awayForm.id"),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'name': "ID",'value': "ID",'class': "STRING"},hashContexts:{'type': depth0,'name': depth0,'value': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n        <label>From Date</label>\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.CalendarDatePicker", {hash:{
    'name': ("awayForm.from_date"),
    'value': ("awayForm.from_date"),
    'class': ("form-control"),
    'placeholder': ("from date")
  },hashTypes:{'name': "ID",'value': "ID",'class': "STRING",'placeholder': "STRING"},hashContexts:{'name': depth0,'value': depth0,'class': depth0,'placeholder': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n        <label>To Date</label>\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.CalendarDatePicker", {hash:{
    'name': ("awayForm.to_date"),
    'value': ("awayForm.to_date"),
    'class': ("form-control"),
    'placeholder': ("to date")
  },hashTypes:{'name': "ID",'value': "ID",'class': "STRING",'placeholder': "STRING"},hashContexts:{'name': depth0,'value': depth0,'class': depth0,'placeholder': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n      </div>\n      <div class=\"modal-footer\">\n        <button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "saveAwayDate", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push(" class=\"btn btn-primary\">Save</button>\n        <button class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>\n      </div>\n    </div>\n  </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["_confirm_dialog"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <div class=\"alert alert-danger\">");
  stack1 = helpers._triageMustache.call(depth0, "confirmError", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n        ");
  return buffer;
  }

  data.buffer.push("\n<div class=\"modal fade\" id=\"confirmModal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n  <div class=\"modal-dialog\">\n    <div class=\"modal-content\">\n      <div class=\"modal-header\">\n        <h4 class=\"modal-title\">");
  stack1 = helpers._triageMustache.call(depth0, "confirmHeader", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h4>\n      </div>\n      <div class=\"modal-body\">\n        ");
  stack1 = helpers['if'].call(depth0, "confirmError", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          ");
  stack1 = helpers._triageMustache.call(depth0, "confirmBody", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n      </div>\n      <div class=\"modal-footer\">\n          <button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "confirmYes", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push(" class=\"btn btn-success\">Okay</button> <button data-dismiss=\"modal\" class=\"btn btn-danger\">Cancel</button>\n      </div>\n    </div>\n  </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["_create_dates"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  data.buffer.push("<!-- Create Event Dates -->\n<div id=\"dialog-form\" title=\"Create Event Dates\" class=\"modal fade\">\n  <div class=\"modal-dialog\">\n      <div class=\"modal-content\">\n          <div class=\"modal-header\">\n              <h4 class=\"modal-title\">Create one or more event dates for '");
  stack1 = helpers._triageMustache.call(depth0, "model.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("'.</h4>\n              <br />\n              <div class=\"ui-state-error ui-corner-all\">");
  stack1 = helpers._triageMustache.call(depth0, "d_errors", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n          </div>\n          <div class=\"modal-body\">\n              <form>\n                  <fieldset>\n                    <label for=\"d-frequency\">Repeats</label>\n                    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'value': ("model.frequency"),
    'content': ("frequencies"),
    'optionValuePath': ("content.value"),
    'optionLabelPath': ("content.name"),
    'class': ("form-control")
  },hashTypes:{'value': "ID",'content': "ID",'optionValuePath': "STRING",'optionLabelPath': "STRING",'class': "STRING"},hashContexts:{'value': depth0,'content': depth0,'optionValuePath': depth0,'optionLabelPath': depth0,'class': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                    <label>Repeats Every</label>\n                    ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("number"),
    'name': ("model.repeat_every"),
    'min': (0),
    'max': (52),
    'class': ("form-control")
  },hashTypes:{'type': "STRING",'name': "STRING",'min': "INTEGER",'max': "INTEGER",'class': "STRING"},hashContexts:{'type': depth0,'name': depth0,'min': depth0,'max': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                    <label>Repeats On</label>&nbsp;\n                    M<input type=\"checkbox\" name=\"model.day_mon\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'checked': ("model.day_mon")
  },hashTypes:{'checked': "STRING"},hashContexts:{'checked': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" />\n                    T<input type=\"checkbox\" name=\"model.day_tue\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'checked': ("model.day_tue")
  },hashTypes:{'checked': "STRING"},hashContexts:{'checked': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" />\n                    W<input type=\"checkbox\" name=\"model.day_wed\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'checked': ("model.day_wed")
  },hashTypes:{'checked': "STRING"},hashContexts:{'checked': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" />\n                    T<input type=\"checkbox\" name=\"model.day_thu\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'checked': ("model.day_thu")
  },hashTypes:{'checked': "STRING"},hashContexts:{'checked': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" />\n                    F<input type=\"checkbox\" name=\"model.day_fri\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'checked': ("model.day_fri")
  },hashTypes:{'checked': "STRING"},hashContexts:{'checked': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" />\n                    S<input type=\"checkbox\" name=\"model.day_sat\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'checked': ("model.day_sat")
  },hashTypes:{'checked': "STRING"},hashContexts:{'checked': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" />\n                    S<input type=\"checkbox\" name=\"model.day_sun\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'checked': ("model.day_sun")
  },hashTypes:{'checked': "STRING"},hashContexts:{'checked': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" />\n                    <br />\n                    <label>From Date</label>\n                    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.CalendarDatePicker", {hash:{
    'name': ("model.from_date"),
    'value': ("model.from_date"),
    'class': ("form-control"),
    'placeholder': ("from date")
  },hashTypes:{'name': "ID",'value': "ID",'class': "STRING",'placeholder': "STRING"},hashContexts:{'name': depth0,'value': depth0,'class': depth0,'placeholder': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                    <label>To Date</label>\n                    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.CalendarDatePicker", {hash:{
    'name': ("model.to_date"),
    'value': ("model.to_date"),
    'class': ("form-control"),
    'placeholder': ("to date")
  },hashTypes:{'name': "ID",'value': "ID",'class': "STRING",'placeholder': "STRING"},hashContexts:{'name': depth0,'value': depth0,'class': depth0,'placeholder': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                  </fieldset>\n              </form>\n          </div>\n          <div class=\"modal-footer\">\n            <button type=\"button\" class=\"btn btn-primary\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createEventDates", "model", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">Save</button>\n            <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>\n          </div>\n      </div>\n  </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["_rota"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("<label id=\"person-rota-spinner\" class=\"spinner\">&nbsp;</label>");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <table class=\"table\">\n            <thead>\n                <tr>\n                    <th>Event</th><th>Date</th><th>Role</th>\n                </tr>\n            </thead>\n            <tbody>\n            ");
  stack1 = helpers.each.call(depth0, "r", "in", "rota", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </tbody>\n            </table>\n        ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n            <tr>\n                <td>");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0,depth0,depth0],types:["STRING","ID","ID"],data:data},helper ? helper.call(depth0, "event_date", "r.event_date.event_id", "r.event_date.id", options) : helperMissing.call(depth0, "link-to", "event_date", "r.event_date.event_id", "r.event_date.id", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n                <td>\n                    ");
  stack1 = helpers['if'].call(depth0, "r.is_away", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </td>\n                <td>");
  stack1 = helpers._triageMustache.call(depth0, "r.role.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n            </tr>\n            ");
  return buffer;
  }
function program5(depth0,data) {
  
  var stack1;
  stack1 = helpers._triageMustache.call(depth0, "r.event_date.event", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }

function program7(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n                        <span class=\"alert-danger\">");
  data.buffer.push(escapeExpression((helper = helpers.formatDate || (depth0 && depth0.formatDate),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "r.event_date.on_date", options) : helperMissing.call(depth0, "formatDate", "r.event_date.on_date", options))));
  data.buffer.push("</span>\n                    ");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n                        ");
  data.buffer.push(escapeExpression((helper = helpers.formatDate || (depth0 && depth0.formatDate),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "r.event_date.on_date", options) : helperMissing.call(depth0, "formatDate", "r.event_date.on_date", options))));
  data.buffer.push("\n                    ");
  return buffer;
  }

function program11(depth0,data) {
  
  
  data.buffer.push("\n            <p>Dude! You've got nothing to do!</p>\n        ");
  }

  data.buffer.push("\n    <div class=\"panel panel-default\">\n        <div class=\"panel-heading\">\n            <h3 class=\"panel-title\">");
  stack1 = helpers['if'].call(depth0, "rotaLoading", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("Rota&nbsp;\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'value': ("rotaRangeSelected"),
    'content': ("ranges"),
    'optionValuePath': ("content.value"),
    'optionLabelPath': ("content.name")
  },hashTypes:{'value': "ID",'content': "ID",'optionValuePath': "STRING",'optionLabelPath': "STRING"},hashContexts:{'value': depth0,'content': depth0,'optionValuePath': depth0,'optionLabelPath': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n            </h3>\n        </div>\n        <div class=\"panel-body\" id=\"person-rota\">\n        ");
  stack1 = helpers['if'].call(depth0, "rota", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(11, program11, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n    </div>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["event"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("<label class=\"spinner\">&nbsp;</label>");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n                ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'title': ("View Rota"),
    'class': ("list-group-item")
  },hashTypes:{'title': "STRING",'class': "STRING"},hashContexts:{'title': depth0,'class': depth0},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "event_date", "ed.id", options) : helperMissing.call(depth0, "link-to", "event_date", "ed.id", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n                    ");
  data.buffer.push(escapeExpression((helper = helpers.formatDate || (depth0 && depth0.formatDate),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "ed.on_date", options) : helperMissing.call(depth0, "formatDate", "ed.on_date", options))));
  data.buffer.push("\n                ");
  return buffer;
  }

function program6(depth0,data) {
  
  
  data.buffer.push("\n                            <span class=\"glyphicon glyphicon-ok\"></span>\n                            ");
  }

function program8(depth0,data) {
  
  
  data.buffer.push("<b>M</b>");
  }

function program10(depth0,data) {
  
  
  data.buffer.push("M");
  }

function program12(depth0,data) {
  
  
  data.buffer.push("<b>T</b>");
  }

function program14(depth0,data) {
  
  
  data.buffer.push("T");
  }

function program16(depth0,data) {
  
  
  data.buffer.push("<b>W</b>");
  }

function program18(depth0,data) {
  
  
  data.buffer.push("W");
  }

function program20(depth0,data) {
  
  
  data.buffer.push("<b>F</b>");
  }

function program22(depth0,data) {
  
  
  data.buffer.push("F");
  }

function program24(depth0,data) {
  
  
  data.buffer.push("<b>S</b>");
  }

function program26(depth0,data) {
  
  
  data.buffer.push("S");
  }

  data.buffer.push("<h2 class=\"heading center\">");
  stack1 = helpers._triageMustache.call(depth0, "model.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h2>\n\n<div class=\"col-md-4 col-xs-12\">\n<div class=\"panel panel-default\">\n    <div class=\"panel-heading\">\n        <h3 class=\"panel-title\">\n    ");
  stack1 = helpers['if'].call(depth0, "datesLoading", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            Dates&nbsp;\n            <button id=\"create-event-dates\" class=\"btn btn-primary\" data-toggle=\"modal\" data-target=\"#dialog-form\" title=\"New Event Dates\"><span class=\"glyphicon glyphicon-plus\"></span></button>\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'value': ("datesRangeSelected"),
    'content': ("ranges"),
    'optionValuePath': ("content.value"),
    'optionLabelPath': ("content.name")
  },hashTypes:{'value': "ID",'content': "ID",'optionValuePath': "STRING",'optionLabelPath': "STRING"},hashContexts:{'value': depth0,'content': depth0,'optionValuePath': depth0,'optionLabelPath': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n        </h3>\n    </div>\n    <div id=\"event-dates\">\n        <div class=\"list-group\">\n            ");
  stack1 = helpers.each.call(depth0, "ed", "in", "event_dates", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n    </div>\n</div>\n\n<div class=\"panel panel-default\">\n    <div class=\"panel-heading\">\n        <h3 class=\"panel-title\">Details</h3>\n    </div>\n    <div class=\"panel-body\">\n        <table class=\"panel-form\">\n            <tbody>\n            <tr>\n                <td>\n                    <label>Name</label><span class=\"panel-cell\">");
  stack1 = helpers._triageMustache.call(depth0, "model.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n                </td>\n                <td>\n                    <label>Active</label>\n                        <span class=\"panel-cell\">\n                            ");
  stack1 = helpers['if'].call(depth0, "model.active", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        </span>\n                </td>\n            </tr>\n            <tr>\n                <td>\n                    <label>Frequency</label><span class=\"panel-cell\">");
  stack1 = helpers._triageMustache.call(depth0, "model.frequency", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n                </td>\n                <td>\n                    <label>Repeats Every</label><span class=\"panel-cell\">");
  stack1 = helpers._triageMustache.call(depth0, "model.repeat_every", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n                </td>\n            </tr>\n             <tr>\n                <td>\n                    <label>Created</label><span class=\"panel-cell\">");
  data.buffer.push(escapeExpression((helper = helpers.dateFromNow || (depth0 && depth0.dateFromNow),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "model.created", options) : helperMissing.call(depth0, "dateFromNow", "model.created", options))));
  data.buffer.push("</span>\n                </td>\n                <td>\n                    <label>Repeats On</label>\n                    <span class=\"panel-cell\">\n                    ");
  stack1 = helpers['if'].call(depth0, "model.day_mon", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    ");
  stack1 = helpers['if'].call(depth0, "model.day_tue", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(14, program14, data),fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    ");
  stack1 = helpers['if'].call(depth0, "model.day_wed", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(18, program18, data),fn:self.program(16, program16, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    ");
  stack1 = helpers['if'].call(depth0, "model.day_thu", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(14, program14, data),fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    ");
  stack1 = helpers['if'].call(depth0, "model.day_fri", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(22, program22, data),fn:self.program(20, program20, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    ");
  stack1 = helpers['if'].call(depth0, "model.day_sat", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(26, program26, data),fn:self.program(24, program24, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    ");
  stack1 = helpers['if'].call(depth0, "model.day_sun", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(26, program26, data),fn:self.program(24, program24, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </span>\n                </td>\n            </tr>\n            </tbody>\n        </table>\n    </div>\n</div>\n</div>\n\n<div class=\"col-md-8 col-xs-12\">\n");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n\n");
  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "_create_dates", options) : helperMissing.call(depth0, "partial", "_create_dates", options))));
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["event_date"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("<label class=\"spinner\">&nbsp;</label>");
  }

function program3(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "saveEventDate", "model", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" class=\"btn btn-success\">Save</button>&nbsp;\n            <button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancelEventDate", "model", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" class=\"btn btn-danger\">Cancel</button>\n        ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "editEventDate", "model", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(" class=\"btn btn-info\">Edit</button>\n        ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                ");
  stack1 = helpers.each.call(depth0, "r", "in", "model.rota", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  return buffer;
  }
function program8(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <tr>\n                        <td>");
  stack1 = helpers._triageMustache.call(depth0, "r.role.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n                        <td>\n                            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'value': ("r.person_id"),
    'content': ("r.people"),
    'optionValuePath': ("content.person_id"),
    'optionLabelPath': ("content.person_name_status"),
    'class': ("form-control")
  },hashTypes:{'value': "ID",'content': "ID",'optionValuePath': "STRING",'optionLabelPath': "STRING",'class': "STRING"},hashContexts:{'value': depth0,'content': depth0,'optionValuePath': depth0,'optionLabelPath': depth0,'class': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                        </td>\n                    </tr>\n                ");
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                ");
  stack1 = helpers.each.call(depth0, "r", "in", "model.rota", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  return buffer;
  }
function program11(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <tr>\n                        <td>");
  stack1 = helpers._triageMustache.call(depth0, "r.role.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n                        <td>");
  stack1 = helpers['if'].call(depth0, "r.is_away", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(15, program15, data),fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n                    </tr>\n                ");
  return buffer;
  }
function program12(depth0,data) {
  
  var stack1, helper, options;
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(13, program13, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "person", "r.person_id", options) : helperMissing.call(depth0, "link-to", "person", "r.person_id", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program13(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("<span class=\"alert-danger\">");
  stack1 = helpers._triageMustache.call(depth0, "r.person_name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>");
  return buffer;
  }

function program15(depth0,data) {
  
  var stack1, helper, options;
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(16, program16, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "person", "r.person_id", options) : helperMissing.call(depth0, "link-to", "person", "r.person_id", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }
function program16(depth0,data) {
  
  var stack1;
  stack1 = helpers._triageMustache.call(depth0, "r.person_name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }

  data.buffer.push("\n<div class=\"panel panel-default\">\n    <div class=\"panel-heading\">\n        <h4 class=\"sub-heading\">\n        ");
  stack1 = helpers['if'].call(depth0, "eventDataLoading", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  stack1 = helpers['if'].call(depth0, "isEditing", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        On ");
  data.buffer.push(escapeExpression((helper = helpers.formatDate || (depth0 && depth0.formatDate),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "model.on_date", options) : helperMissing.call(depth0, "formatDate", "model.on_date", options))));
  data.buffer.push("</h4>\n    </div>\n    <div class=\"panel-body\">\n        <table class=\"table table-striped\">\n            <tr>\n                <th>Role</th><th>Name</th>\n            </tr>\n            ");
  stack1 = helpers['if'].call(depth0, "isEditing", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(10, program10, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </table>\n    </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["events"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n          <tr>\n            <td>");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "event", "event", options) : helperMissing.call(depth0, "link-to", "event", "event", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n            <td class=\"center\">\n                ");
  stack1 = helpers['if'].call(depth0, "event.active", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </td>\n            <td>");
  data.buffer.push(escapeExpression((helper = helpers.dateFromNow || (depth0 && depth0.dateFromNow),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "event.created", options) : helperMissing.call(depth0, "dateFromNow", "event.created", options))));
  data.buffer.push("</td>\n          </tr>\n        ");
  return buffer;
  }
function program2(depth0,data) {
  
  var stack1;
  stack1 = helpers._triageMustache.call(depth0, "event.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\n                <span class=\"glyphicon glyphicon-ok\"></span>\n                ");
  }

  data.buffer.push("<h2 class=\"sub-heading\">Events</h2>\n\n<div class=\"panel panel-default\">\n    <div class=\"panel-heading\">\n        <h3 class=\"panel-title\">Events&nbsp;\n            <button class=\"btn btn-primary\" title=\"New User\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "newEvent", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("><span class=\"glyphicon glyphicon-plus\"></span></button>\n        </h3>\n    </div>\n    <div class=\"panel-body\">\n        <table class=\"table table-striped\">\n          <thead>\n            <tr>\n                <th>Name</th><th>Active</th><th>Created</th>\n            </tr>\n          </thead>\n          <tbody>\n        ");
  stack1 = helpers.each.call(depth0, "event", "in", "model", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          </tbody>\n       </table>\n    </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["loading"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  


  data.buffer.push("<div class=\"container\">\n    <br><br>\n    <label class=\"spinner\">&nbsp;</label>\n</div>\n");
  
});

Ember.TEMPLATES["people"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n          <tr>\n            <td>");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "person", "person", options) : helperMissing.call(depth0, "link-to", "person", "person", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n            <td class=\"center\">\n                ");
  stack1 = helpers['if'].call(depth0, "person.active", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </td>\n            <td>");
  stack1 = helpers._triageMustache.call(depth0, "person.user_role", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td>\n            <td>");
  data.buffer.push(escapeExpression((helper = helpers.dateFromNow || (depth0 && depth0.dateFromNow),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "person.last_login", options) : helperMissing.call(depth0, "dateFromNow", "person.last_login", options))));
  data.buffer.push("</td>\n          </tr>\n        ");
  return buffer;
  }
function program2(depth0,data) {
  
  var stack1;
  stack1 = helpers._triageMustache.call(depth0, "person.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\n                <span class=\"glyphicon glyphicon-ok\"></span>\n                ");
  }

  data.buffer.push("<h2 class=\"sub-heading\">People</h2>\n\n<div class=\"panel panel-default\">\n    <div class=\"panel-heading\">\n        <h3 class=\"panel-title\">People&nbsp;\n            <button class=\"btn btn-primary\" title=\"New User\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "newPerson", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("><span class=\"glyphicon glyphicon-plus\"></span></button>\n        </h3>\n    </div>\n    <div class=\"panel-body\">\n        <table class=\"table table-striped\">\n          <thead>\n            <tr>\n                <th>Name</th><th>Active</th><th>Permissions</th><th>Last Login</th>\n            </tr>\n          </thead>\n          <tbody>\n        ");
  stack1 = helpers.each.call(depth0, "person", "in", "model", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n          </tbody>\n       </table>\n    </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["person"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                        <span class=\"label label-default\">");
  stack1 = helpers._triageMustache.call(depth0, "r.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n                        ");
  return buffer;
  }

  data.buffer.push("\n    <h2 class=\"sub-heading\">");
  stack1 = helpers._triageMustache.call(depth0, "model.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h2>\n    <div class=\"panel panel-default\">\n        <div class=\"panel-heading\">\n            <h3 class=\"panel-title\">Person Details</h3>\n            <div id=\"message\" hidden></div>\n        </div>\n        <div class=\"panel-body\">\n            <table class=\"panel-form\">\n            <tbody>\n                <tr>\n                    <td>\n                        <label>Name</label><span class=\"panel-cell\">");
  stack1 = helpers._triageMustache.call(depth0, "model.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n                    </td>\n                    <td>\n                        <label>Email</label><span class=\"panel-cell\">");
  stack1 = helpers._triageMustache.call(depth0, "model.email", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n                    </td>\n                </tr>\n                <tr>\n                    <td>\n                        <label>Permissions</label><span class=\"panel-cell\">");
  stack1 = helpers._triageMustache.call(depth0, "model.user_role", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n                    </td>\n                    <td>\n                        <label>Last Access</label><span class=\"panel-cell\">");
  data.buffer.push(escapeExpression((helper = helpers.dateFromNow || (depth0 && depth0.dateFromNow),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "model.last_login", options) : helperMissing.call(depth0, "dateFromNow", "model.last_login", options))));
  data.buffer.push("</span>\n                    </td>\n                </tr>\n                <tr>\n                     <td colspan=\"2\">\n                        <label>Roles</label>\n                        <span class=\"panel-cell\">\n                        ");
  stack1 = helpers.each.call(depth0, "r", "in", "model.person_roles", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        </span>\n                    </td>\n                </tr>\n            </tbody>\n            </table>\n        </div>\n    </div>\n\n    ");
  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "rota", options) : helperMissing.call(depth0, "partial", "rota", options))));
  data.buffer.push("\n    ");
  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "away_dates", options) : helperMissing.call(depth0, "partial", "away_dates", options))));
  data.buffer.push("\n    ");
  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "confirm_dialog", options) : helperMissing.call(depth0, "partial", "confirm_dialog", options))));
  data.buffer.push("\n");
  return buffer;
  
});