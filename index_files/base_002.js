/*******************************************************************************
 >> Проверить существует ли переменная
 	element = переменная
*******************************************************************************/
function isset(element)
{
	return element != null;
}
/*******************************************************************************
 >> Отформатировать дату date (день или месяц)
    в поле длиной 2 с ведущим нулем
*******************************************************************************/
function FormatDateToString(date)
{
	return FormatIntegerToString(date, 2, "0");
}
/*******************************************************************************
 >> Отформатировать целое число number
    в поле длиной totalLength с ведущими символами leadingSymbol
*******************************************************************************/
function FormatIntegerToString(number, totalLength, leadingSymbol)
{
	var leadingLength = totalLength - number.toString().length;
	if (leadingLength > 0)
	{
		var leadingString = "";
		for (var i = 0; i < leadingLength; i++)
			leadingString += leadingSymbol;
		return leadingString + number.toString();
	}
	else
	{
		return number.toString();
	}
}
/*******************************************************************************
 >> Простой элемент (обычно span или div) с простыми методами:
 	1. Показать
 	2. Скрыть
*******************************************************************************/
function Element(elementId)
{
	var id = elementId;

	this.Show = function()
	{
		var element = document.getElementById(id);
		if (isset(element))
			element.style.display = 'inline';
	}

	this.Hide = function()
	{
		var element = document.getElementById(id);
		if (isset(element))
			element.style.display = 'none';
	}
}
/******************************************************************************/