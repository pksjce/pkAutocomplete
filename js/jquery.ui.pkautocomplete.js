(function($) {  
 	$.widget("ui.pkautocomplete", {
 		options:{
 			/*url:"http://herokory.herokuapp.com/autocomplete/jsonpCallback/",
 			criteriaName: "pavi"*/
 		},
 		// store the values in array
		formElements :[],
		
		//create the required skeleton and bind methods
 		_create: function(){
 			var self = this,
	 			o = self.options,
 				el = self.element,
 				criteriaName = o.criteriaName;
 				// will have the input box
 				pkAutoComplete = $("<input type='text' id='" + criteriaName + "pureautocomplete' name='"+ criteriaName +"' ></input>"),
 				//will store all the chiclets on the ui
 				pkChicletBox = $("<div id='" + criteriaName +"chicletBox' class ='chicletBox'></div>"),
 				// the list of dropdown values
 				pkDropDown = $("<div id='"+ criteriaName +"dropdown' style='display:none'></div>");
 				el.append(pkAutoComplete);	
 				pkDropDown.insertAfter(pkAutoComplete);
 				pkChicletBox.insertAfter(pkDropDown);
 				self._setDefaultValue(pkAutoComplete);
 				pkAutoComplete.bind({		
 						// keydown is triggered only on the input box and sent as separate event to the concerned li field
 						keydown: function(e){
 							var code = e.keyCode ? e.keyCode : e.which;
 							if(code == 40){
 								var event = $.Event("moveNext");
 								$("li.itemSelected").trigger(event);
 							} else if(code == 38){
 								var event = $.Event("movePrev");
 								$("li.itemSelected").trigger(event);
 							} else if(code == 13 || code == 9){
 								var event = $.Event("selectItem");
 								$("li.itemSelected").trigger(event);
 							}
 						},
 						// detect each character entered and send ajax call for the dropdown
 						keyup : function(e){
							var code = e.keyCode ? e.keyCode : e.which;
							if(code == 38 || code == 39 || code == 40){
							} else { 		
								pkAutoComplete.removeClass('defaultValue');				
								self._displayDropDown(self, $(this).val()); 
							}
						},
						// even perform the same action on focus.
						focus : function(){
							self._removeDefaultValue(pkAutoComplete);
							self._displayDropDown(self, $(this).val()); 
						},
						// show default value onblur when nothing is present in the field.
						blur : function(){
							self._setDefaultValue(pkAutoComplete);
						}
						});
 		},
 		// dont show default value when in focus
 		_removeDefaultValue: function(pkAutoComplete){
 			var defaultValue = "Enter Keyword";
 			if(pkAutoComplete.val() == defaultValue){
 				pkAutoComplete.val('');
 				pkAutoComplete.removeClass('defaultvalue');
 			}
 		},
 		//show default value when not in focus
 		_setDefaultValue: function(pkAutoComplete){
 			var defaultValue = "Enter Keyword";
 			if(!pkAutoComplete.val()){
 				pkAutoComplete.val(defaultValue);
				pkAutoComplete.addClass('defaultValue'); 				
 			}
 		},
 		//make ajax call and show data
 		_displayDropDown: function(self, value){
			$.ajax({
				url: self.options.url + value,
				dataType: 'jsonp',
				jsonp: false,
				jsonpCallback:'jsonpCallback',
				success: function(data){
					if(!$.isEmptyObject(data)){
						self._addDataToDropDown(data);
						self._showDropDown(data);
						$("#" + self.options.criteriaName + "itemList li:first-child").trigger("mouseenter");
					}else {
						self._hideDropDown();
					}
				},
				crossDomain:true});
 		},
 		// destroy all the objects created
 		destroy: function() {			
				el.remove();
				$(dataDiv).remove();
			},
			
		jsonpCallback: function(data){
			//dummy callback
		},
		//create list and add data
		_addDataToDropDown: function(data){
			var self = this;
			var pkDropDown = $("#"+ self.options.criteriaName +"dropdown");
			pkDropDown.html('');
			var itemList = $("<ul id ='"+ self.options.criteriaName +"itemList' class ='itemList'></ul>");
			pkDropDown.append(itemList);
			$.each(data, function(index, item){	
				// each li item
				var perItem = $("<li class = 'perItem' id = '" + item.id + "' resultSize = '"+ item.resultSize +"'></li>").text(item.value);
				// show the plus button
				var addButton = $('<a id="add" href="#" class="selectPlus" title="Add Item"></a>');
				addButton.bind({
					click: function(){
						$(this).parent().trigger("selectItem");
					},
					mouseover: function(){
						$(this).parent().trigger("mouseenter");
					},
					mouseout: function(){
						$(this).parent().trigger("mouseout");
					},					
				});
				perItem.append(addButton);
				var liSelected;
				perItem.bind({
				// select when mouse enters
				mouseenter : function(){					
					$("li.itemSelected").removeClass('itemSelected');
					$(this).addClass('itemSelected');
					liSelected = $(this);					
				}, 			
				// remove select when mouse leaves	
				mouseout: function(){
					$(this).removeClass('itemSelected');					
				},
				// remose select when blur
				blur: function(){
					$(this).removeClass('itemSelected');				
				},
				// move to the next item when arrow is pressed
				moveNext: function(){
					$(this).removeClass('itemSelected');
					var next = ($(this).next().length > 0) ? $(this).next() : $("li").eq(0);
					next.addClass('itemSelected');
				},
				movePrev: function(){
					$(this).removeClass('itemSelected');
					var prev = ($(this).prev().length > 0) ? $(this).prev() : $("li").last();
					prev.addClass('itemSelected');
				},		
				selectItem: function(){
					self._selectItem($(this));
				},						
				keypress: function(e){
					var code = e.keyCode? e.keyCode: e.which;
					if(code == 13){
						self._selectItem($(this));
					}
				}
				});
				itemList.append(perItem);
			})
		},
		// add proper css to show the dropdown
		_showDropDown: function(data){	
			var self = this;
			var pkDropDown = $("#"+ self.options.criteriaName +"dropdown");
			pkDropDown.css({
				'display':'block',
				'z-index':'100',
				'position':'absolute',
				'background-color':'white',
				'margin-top': 0});
		},
		//dont show dropdown
		_hideDropDown: function(){
			var self = this;
			var pkDropDown = $("#"+ self.options.criteriaName +"dropdown");		
			pkDropDown.html("");
			pkDropDown.css({
				'display':'none'
			});
		},
		//when a particular item is selected
		_selectItem: function(item){	
			var self = this;	
			var value = item.text() + " (" + item.attr('resultSize') +")";
			//push into the array
			self.formElements.push(item.attr("id"));
			$("#"+ self.options.criteriaName +"chicletBox").attr("value", self.formElements.toString());
			//show close button
			var closeButton = $('<a id="close" href="#" class="chicletclose" title="close"></a>');
			closeButton.bind('click', function(){
					var removeItem = $(this).parent();
					$(this).parent().remove();
					self.formElements.splice(removeItem.attr("id"));
					self.parent().attr("value", self.formElements.toString());
				});
			// show the chiclet
			var chicletItem = $('<span id="chiclet'+ item.attr('id') +'" class="chiclet"></span>').text(value).append(closeButton);
			$("#"+ self.options.criteriaName +"chicletBox").append(chicletItem);
			//hide dropdown
			self._hideDropDown();
			//empty input box
			var pkAutoComplete = $("#"+ self.options.criteriaName +"pureautocomplete");				
			pkAutoComplete.attr("value", "");
			//add values to datadiv
			$("#" + self.options.dataDiv).attr("value", self.formElements.toString());
		},
	
	}); 
})(jQuery); 
