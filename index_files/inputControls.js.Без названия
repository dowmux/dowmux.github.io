/******************************************************************************/
// элемент управления: кнопка (TODO)
function Button(buttonId)
{
	var id = buttonId;

	this.Enable = function()
	{
		var element = document.getElementById(id);
		if (isset(element))
		{
			element.disabled = false;
		}
	}

	this.Disable = function()
	{
		var element = document.getElementById(id);
		if (isset(element))
		{
			element.disabled = true;
		}
	}
}
/******************************************************************************/
// элемент управления: чекбокс
function CheckBox(idContainer, idElement, elementTitle, elementName, elementClassName, elementOnChangeHandler)
{
	var idContainer = idContainer;
	var idElement = idElement;
	var title = elementTitle;
	var name = elementName;
	var className = elementClassName;
    var onChangeHandler = elementOnChangeHandler;

    this.Render = function()
    {
		var element = document.getElementById(idContainer);
		if (isset(element))
			element.innerHTML = '<input type="checkbox" id="' + idElement + '" class="' + className + '" title="' + title + '" name="' + name + '" onChange="' + onChangeHandler + '">';
    }

    this.Reset = function()
    {    	var element = document.getElementById(idContainer);
		if (isset(element))
			element.innerHTML = '---';    }

    this.IsReseted = function()
    {
    	var element = document.getElementById(idContainer);
		if (isset(element))
			return element.innerHTML == '---';
    }

    this.UpdateValue = function(value)
    {
		var element = document.getElementById(idElement);
		if (isset(element))
			element.checked = value;
    }

    this.Enable = function()
    {
		var element = document.getElementById(idElement);
		if (isset(element))
			element.disabled = false;
    }

    this.Disable = function()
    {
		var element = document.getElementById(idElement);
		if (isset(element))
			element.disabled = true;
    }
}
/******************************************************************************/
// элемент управления: радио-кнопка
function RadioBox(idContainer, elementValues, elementPostfix, elementName, elementClassName, elementOnChangeHandler)
{
	var idContainer = idContainer;
	var values = elementValues;
	var postfix = elementPostfix;
	var name = elementName;
	var className = elementClassName;
    var onChangeHandler = elementOnChangeHandler;

	this.Render = function()
	{
		var element = document.getElementById(idContainer);
		var value = "";
		for (var i = 0; i < values.length; i++) // делаем два цикла, чтобы сохранить порядок рендеринга items у радиобокса
		{
			for (var key in values[i]) // sic!
				value += '<input type="radio" name="' + name + '" value="' + key + '" class="' + className + '" onChange="' + onChangeHandler + '">' + values[i][key] + postfix;
		}
		element.innerHTML = value;
	}

	this.Reset = function()
    {
    	var element = document.getElementById(idContainer);
		if (isset(element))
			element.innerHTML = '---';
    }

    this.IsReseted = function()
    {
    	var element = document.getElementById(idContainer);
		if (isset(element))
			return element.innerHTML == '---';
    }

    this.UpdateValue = function(value)
	{
		var elements = document.getElementsByName(name);
		for (var i = 0; i < elements.length; i++)
		{
			elements[i].checked = elements[i].getAttribute('value') == value;
		}
	}
}
/******************************************************************************/