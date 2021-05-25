/******************************************************************************/
function SubTable(tableId, targetColumns)
{
	var id = tableId;
	var targetColumns = targetColumns;

	this.Fill = function(statusImageSrc, messagesList)
	{
		var table = document.getElementById(id);
		if (isset(table) && isset(messagesList))
		{
			for (var key in messagesList)
			{
				// создаем новую строку в DOM
		  		var row = table.insertRow(-1); // добавляем новую строку в самый конец таблицы

		    	// создаем ячейку №1 для статуса
				var imageCell = row.insertCell(0);
		        // создаем иконку статуса и добавляем ее в ячейку
		        var image = new Image();
		        image.src = statusImageSrc;
		        imageCell.appendChild(image);

		        // создаем ячейку №2 для текста сообщения
		        var textCell = row.insertCell(1);

		        if (targetColumns > 1)
		        	textCell.colSpan = 1 + (targetColumns-2);
		   		else
		   			textCell.colSpan = 1;

		        textCell.innerHTML = messagesList[key];
			}
		}
	}

	// Удалить все сообщения из таблицы
	this.Clear = function()
	{
		var table = document.getElementById(id);
		if (isset(table))
		{
			// table.rows.length пересчитывается на каждой итерации, поэтому удаляем с конца
			for (var i = table.rows.length - 1; i >= 0; i--) // sic!
				table.deleteRow(i);
		}
	}
}
/******************************************************************************/
var TableType = {
	Table 				: 'table',
	TableCaption 		: 'table-caption',
	TableCell 			: 'table-cell',
	TableColumn 		: 'table-column',
	TableColumnGroup 	: 'table-column-group',
	TableFooterGroup 	: 'table-footer-group',
	TableHeaderGroup 	: 'table-header-group',
	TableRow 			: 'table-row',
	TableRowGroup 		: 'table-row-group'
};

function TableElement(id, type)
{
	var elementID = id;
	var elementType = type;

	this.Show = function()
	{
		var element = document.getElementById(elementID);
		if (isset(element))
		{
			switch (elementType)
			{
				case TableType.Table:
					element.style.display = "table"; break; // элемент "table" не поддерживается в IE6/7
				case TableType.TableCaption:
					element.style.display = "table-caption"; break; // элемент "table-caption" не поддерживается в IE6/7
				case TableType.TableCell:
					element.style.display = "table-cell"; break; // элемент "table-cell" не поддерживается в IE6/7
				case TableType.TableColumn:
					element.style.display = "table-column"; break; // элемент "table-column" не поддерживается в IE6/7
				case TableType.TableColumnGroup:
					element.style.display = "table-column-group"; break; // элемент "table-column-group" не поддерживается в IE6/7
				case TableType.TableFooterGroup:
					element.style.display = "table-footer-group"; break;
				case TableType.TableHeaderGroup:
					element.style.display = "table-header-group"; break;
				case TableType.TableRow:
					element.style.display = "table-row"; break; // элемент "table-row" не поддерживается в IE6/7
				case TableType.TableRowGroup:
					element.style.display = "table-row-group"; break; // элемент "table-row-group" не поддерживается в IE6/7

				default: break;
			}
		}
	}

	this.Hide = function()
	{
		var element = document.getElementById(elementID);
		if (isset(element))
			element.style.display = "none";
	}
}
/******************************************************************************/