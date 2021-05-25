/******************************************************************************/
function ShowSpoiler()
{
	var spoiler = document.getElementById("id_spoiler_content");
	if (isset(spoiler))
	{
		if (spoiler.style.display == "none")			spoiler.style.display = "block";
		else			spoiler.style.display = "none";
	}
}
/******************************************************************************/
function DeviceStatus(imageId, textId, moreId)
{
	var imageId = imageId;
	var textId = textId;
    var moreId = moreId;

    this.SetStatus = function(imagePath, messageText, isShowMore)
    {
		var image = document.getElementById(imageId);
		var text = document.getElementById(textId);
    	var more = document.getElementById(moreId);

    	if (isset(image) && isset(text) && isset(more))
    	{
    		image.src = imagePath;
    		text.innerHTML = messageText;
			if (isShowMore)
				more.style.display = 'inline';
			else
				more.style.display = 'none';
    	}
    }

	this.Update = function(warningStatus, failureStatus)
	{
		if (1 == failureStatus && 1 == warningStatus)
			this.SetStatus(IMAGE_PATH_FAILURE, MESSAGE_STATUS_FAILURES_WARNINGS, true);
		else
		if (1 == failureStatus)
			this.SetStatus(IMAGE_PATH_FAILURE, MESSAGE_STATUS_FAILURES, true);
		else
		if (1 == warningStatus)
			this.SetStatus(IMAGE_PATH_WARNING, MESSAGE_STATUS_WARNINGS, true);
		else
			this.SetStatus(IMAGE_PATH_NORMAL, MESSAGE_STATUS_NORMAL, true);
	}
}
/******************************************************************************/
function GlobalStatus(statusId)
{
	var id = statusId;

	this.Update = function(warningStatus, failureStatus)
	{
		var element = document.getElementById(id);
		if (isset(element) && isset(warningStatus) && isset(failureStatus))
		{
			if (1 == failureStatus)
			{
				element.src = IMAGE_PATH_GLOBAL_STATUS_FAILURE;
				element.title = STATE_FAILURE;
			}
			else
			if (1 == warningStatus)
			{
				element.src = IMAGE_PATH_GLOBAL_STATUS_WARNING;
				element.title = STATE_WARNING;
			}
			else
			{
				element.src = IMAGE_PATH_GLOBAL_STATUS_NORMAL;
				element.title = STATE_NORMAL;
			}
		}
	}
}
/******************************************************************************/
function MessagesTable(postfix, targetColumns)
{
	var imageId = "idMessageIcon_" + postfix;
	var textId = "idMessageText_" + postfix;
    var moreId = "idMessageMore_" + postfix;
    var statusRowId = "idStatusRow_" + postfix;

	var failuresSubTable = new SubTable("idSubtableFailure_" + postfix, targetColumns);
	var warningsSubTable = new SubTable("idSubtableWarning_" + postfix, targetColumns);
	var infosSubTable = new SubTable("idSubtableInfo_" + postfix, targetColumns);

	this.Fill = function(failuresList, warningsList, infosList)
	{
		failuresSubTable.Fill(IMAGE_PATH_FAILURE, failuresList);
		warningsSubTable.Fill(IMAGE_PATH_WARNING, warningsList);
		infosSubTable.Fill(IMAGE_PATH_INFO, infosList);
	}

	this.Clear = function()
	{
		failuresSubTable.Clear();
		warningsSubTable.Clear();
		infosSubTable.Clear();
	}

	this.SetStatus = function(imagePath, messageText, isShowMore)
	{
		var image = document.getElementById(imageId);
		var text = document.getElementById(textId);
		var more = document.getElementById(moreId);
        if (isset(image) && isset(text) && isset(more))
        {
			image.src = imagePath;
			text.innerHTML = messageText;
			if (isShowMore)
				more.style.display = 'inline';
			else
				more.style.display = 'none';
		}
	}

	this.ShowStatusRow = function()
	{
		new TableElement(statusRowId, TableType.TableRow).Show();
	}

	this.HideStatusRow = function()
	{
		new TableElement(statusRowId, TableType.TableRow).Hide();
	}

	this.Update = function(data)
	{
		var warning = data.warning;
		var failure = data.failure;
		var messages = data.messages;

		if (isset(warning) && isset(failure) && isset(messages))
		{
			this.Clear();

			var failuresMessages = messages.fail;
			var warningsMessages = messages.warn;
			var infosMessages = messages.info;
			if (isset(failuresMessages) || isset(warningsMessages) || isset(infosMessages))
			{
				this.Fill(failuresMessages, warningsMessages, infosMessages);
	        }

			// "Работает нормально"
			if (0 == warning && 0 == failure)
			{
				if (isset(infosMessages) && infosMessages.length > 0)
					this.SetStatus(IMAGE_PATH_INFO, MESSAGE_STATUS_INFO, true);
				else
					this.SetStatus(IMAGE_PATH_NORMAL, MESSAGE_STATUS_NORMAL, false);
			}
			else
			// "Неисправности и предупреждения"
			if (1 == warning && 1 == failure)
			{
				this.SetStatus(IMAGE_PATH_FAILURE, MESSAGE_STATUS_FAILURES_WARNINGS, true);
			}
			else
			// "Неисправности"
			if (1 == failure)
			{
				this.SetStatus(IMAGE_PATH_FAILURE, MESSAGE_STATUS_FAILURES, true);
			}
			// "Предупреждения"
			else
			{
				this.SetStatus(IMAGE_PATH_WARNING, MESSAGE_STATUS_WARNINGS, true);
			}
		}
	}
}
/******************************************************************************/
// обновить (по переданным статусам warning и failure) одну строку в таблице сообщений: только иконку и текст сообщения
// возможные варианты: [Неисправности и предупреждения | Неисправности | Предупреждения | Работает нормально]
function MessagesTableSimpleStateRow(iconId, textId)
{	var imageId = iconId;
	var messageId = textId;

	this.Update = function(warning, failure)
	{
		var image = document.getElementById(imageId);
		var message = document.getElementById(messageId);

		if (isset(image) && isset(message))
		{
			if (1 == failure && 1 == warning)
			{
				image.src = IMAGE_PATH_FAILURE;
				message.innerHTML = MESSAGE_STATUS_FAILURES_WARNINGS;
			}
			else
			if (1 == failure)
			{
				image.src = IMAGE_PATH_FAILURE;
				message.innerHTML = MESSAGE_STATUS_FAILURES;
			}
			else
			if (1 == warning)
			{
				image.src = IMAGE_PATH_WARNING;
				message.innerHTML = MESSAGE_STATUS_WARNINGS;
			}
			else
			{
				image.src = IMAGE_PATH_NORMAL;
				message.innerHTML = MESSAGE_STATUS_NORMAL;
			}
		}
	}}
/******************************************************************************/
function MessagesTableSimpleStateRowWithMoreLink(iconId, textId, deviceGroup, deviceId)
{
	var imageId = iconId;
	var messageId = textId;
	var link = '<a href="/config/' + deviceGroup + '/?id=' + deviceId + '" class="aegir">(Подробнее...)</a>';

	this.Update = function(warning, failure)
	{
		var image = document.getElementById(imageId);
		var message = document.getElementById(messageId);

		if (isset(image) && isset(message))
		{
			if (1 == failure && 1 == warning)
			{
				image.src = IMAGE_PATH_FAILURE;
				message.innerHTML = MESSAGE_STATUS_FAILURES_WARNINGS + ' ' + link;
			}
			else
			if (1 == failure)
			{
				image.src = IMAGE_PATH_FAILURE;
				message.innerHTML = MESSAGE_STATUS_FAILURES + ' ' + link;
			}
			else
			if (1 == warning)
			{
				image.src = IMAGE_PATH_WARNING;
				message.innerHTML = MESSAGE_STATUS_WARNINGS + ' ' + link;
			}
			else
			{
				image.src = IMAGE_PATH_NORMAL;
				message.innerHTML = MESSAGE_STATUS_NORMAL;
			}
		}
	}
}
/******************************************************************************/
function MessagesTableMoreImage(id)
{
	var imageID = id;

	this.Open = function()
	{
		var image = document.getElementById(imageID);
		if (isset(image))
			image.src = IMAGE_PATH_MINUS;
	}

	this.Close = function()
	{
		var image = document.getElementById(imageID);
		if (isset(image))
			image.src = IMAGE_PATH_PLUS;
	}
}
/******************************************************************************/
function MessagesTableModuleSubTable(postfix)
{
	var failuresTable = new TableElement("idSubtableFailure_" + postfix, TableType.TableRowGroup);
	var warningsTable = new TableElement("idSubtableWarning_" + postfix, TableType.TableRowGroup);
	var infosTable = new TableElement("idSubtableInfo_" + postfix, TableType.TableRowGroup);

	this.Show = function()
	{
		failuresTable.Show();
		warningsTable.Show();
		infosTable.Show();
	}

	this.Hide = function()
	{
		failuresTable.Hide();
		warningsTable.Hide();
		infosTable.Hide();
	}
}
/******************************************************************************/
function Header()
{
	this.Update = function(data)
	{
		new GlobalStatus("idSysStatus").Update(data.warning, data.failure); // глобальный статус устройства (треугольник в шапке страницы)

		new Value("idSysModel").Update(data.model); // модель
		new Value("idSysChannel").Update(data.channel); // канал
		new Value("idSysSerial").Update(data.sn); // серийный номер
		new Value("idSysDeviceID").Update(data.deviceID); // id устройства на ЦС
		new Value("idSysDeviceTypeID").Update(data.deviceTypeID); // id типа устройства
		new Value("idSysDevConnected").Update(data.devConnected); // количество подключенных физических блоков устройства
		new Value("idSysDevTotal").Update(data.devTotal); // общее количество физических блоков устройства
		new Value("idSysDevIgnored").Update(data.devIgnored); // количество скрытых блоков
		new Value("idSysTime").Update(data.time); // текущие дата/время сервера
	}
}
/******************************************************************************/