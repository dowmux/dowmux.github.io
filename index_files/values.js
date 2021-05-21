/******************************************************************************/
function Value(valueId)
{
	var id = valueId;

	this.Update = function(value)
	{
		var element = document.getElementById(id);
		if (isset(element) && isset(value) && element.innerHTML != value)
		{
			element.innerHTML = value;
		}
	}
}

function ValueWithUnit(valueId)
{
	var id = valueId;

	this.Update = function(value, unit)
	{
		var element = document.getElementById(id);
		if (isset(element) && isset(value) && isset(unit) && element.innerHTML != (value + ' ' + unit))
		{
			element.innerHTML = value + ' ' + unit;
		}
	}
}

function ValueWithUnitAndDivider(valueId)
{
	var id = valueId;

	this.Update = function(value, unit, divider)
	{
		var element = document.getElementById(id);
		if (!! element && isset(value) && isset(unit) && isset(divider))
		{			var newValue = '?';

			if (divider > 0)
			{				if (0 == value || 1 == divider)
					newValue = value;
				else
					newValue = (value/divider).toFixed(log10(divider));

				newValue = newValue + ' ' + unit;
			}

			if (element.innerHTML != newValue)
				element.innerHTML = newValue;
		}
	}
}

function log10(number)
{
	return Math.ceil(Math.log(number)/Math.log(10));
}

function ArrayValue(valueId)
{
	var id = valueId;

	this.Update = function(value, array)
	{
		var element = document.getElementById(id);
		if (isset(element) && isset(value) && isset(array))
		{
			if (isset(array[value]))
			{
				if (element.innerHTML != array[value])
					element.innerHTML = array[value];
			}
			else
			{
				element.innerHTML = '?';
			}
		}
	}
}

function ArrayValueWithImage(valueId)
{
	var id = valueId;

	this.Update = function(value, valuesArray, imagesArray)
	{
		var element = document.getElementById(id);
		if (isset(element) && isset(value) && isset(valuesArray) && isset(imagesArray))
		{
			if (isset(valuesArray[value]) && isset(imagesArray[value]))
			{
				// Создаем картинку
				var image = new Image();
				image.src = imagesArray[value];
				image.height = 14;
				image.width = 14;

				// Удаляем всех потомков элемента
				// element.childNodes.length пересчитывается на каждой итерации, поэтому удаляем с конца
				for (var i = element.childNodes.length - 1; i >= 0; i--) // sic!
					element.removeChild(element.childNodes[i]);

				// Добавляем в элемент картинку и текст
				element.appendChild(image);
				element.appendChild(document.createTextNode(' ' + valuesArray[value]));
			}
			else
			{
				element.innerHTML = '---';
			}
		}
	}
}

function ValueWithUnitAndImage(valueId)
{
	var id = valueId;

	this.Update = function(value, unit, isLow, isHigh)
	{
		var element = document.getElementById(id);
		if (isset(element) && isset(value) && isset(unit) && isset(isLow) && isset(isHigh))
		{
			// Создаем картинку
			var image = new Image();
			image.height = 14;
			image.width = 14;
			if (1 == isLow)
				image.src = IMAGE_PATH_BALL_BLUE;
			else
			if (1 == isHigh)
				image.src = IMAGE_PATH_BALL_RED;
			else
				image.src = IMAGE_PATH_BALL_GREEN;

			// Удаляем всех потомков элемента
			// element.childNodes.length пересчитывается на каждой итерации, поэтому удаляем с конца
			for (var i = element.childNodes.length - 1; i >= 0; i--) // sic!
				element.removeChild(element.childNodes[i]);

			// Добавляем в элемент картинку, текст и ед.измерения
			element.appendChild(image);
			element.appendChild(document.createTextNode(' ' + value + ' ' + unit));
		}
	}
}
/******************************************************************************/