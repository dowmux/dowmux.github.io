/*******************************************************************************
 >> jquery-функция готовности DOM'а
*******************************************************************************/
$(document).ready(function()
{
	gTimingEventsUpdatingFunction = RefreshDevicesPage;
	gTimingEventsObject = setTimeout(gTimingEventsUpdatingFunction, gTimingEventsUpdatingPeriodMs);
});
/*******************************************************************************
 >> Обновить статусы всех устройств на главной странице web-интерфейса
*******************************************************************************/
function RefreshDevicesPage()
{
	// если все необходимые глобальные переменные определены
	if (typeof refreshPeriod != "undefined")
	{
		// создаем и посылаем на сервер асинхронный ajax-запрос
		$.ajax({
			type: "POST",
			url: "/js/refresh/status.php",
			data: "ajax=refresh_status",
			timeout: 10000,
			cache: false,
			async: true,
			success: function(data, textStatus, jqXHR) // если пришел корректный ответ
			{
				var result = $.parseJSON(jqXHR.responseText); // парсим ответ в формате json с помощью jquery

				if (isset(result.error) && isset(result.error.code)) // в ответе обязательно должен быть раздел ошибок
				{
					if (0 == parseInt(result.error.code)) // и если при получении параметров не было никаких ошибок
					{
						// обновляем страницу, только если все параметры доступны

						if (isset(result.status))
						{
							UpdateStatus(result.status); // обновить статусы всех SNMP-агентов
						}

						if (isset(result.messages))
						{
							UpdateMessages(result.messages); // обновить таблицу системных сообщений СДК
						}

						if (isset(result.rcu_status))
						{
							UpdateRcuStatus(result.rcu_status); // обновить глобальный статус СДК
						}

						RenderGreenLoader(); // ОК: нет ошибок
					}
					else // some errors
					{
						RenderRedLoader(); // ОШИБКА: статус работы php-скрипта (error.code) != 0
					}
				}
				else
				{
					RenderRedLoader(); // ОШИБКА: нет раздела со статусом работы php-скрипта (error.code)
				}
			},
			error: function()
			{
            	RenderRedLoader(); // ОШИБКА: данные не готовы или http-статус != OK
			}
		});

		// через заданный промежуток времени псевдо-рекурсивно запускаем функцию посылки асинхронного запроса еще раз
		gTimingEventsObject = setTimeout(gTimingEventsUpdatingFunction, refreshPeriod);
	}
}
/*******************************************************************************
 >> Обновить статусы устройства
	(изменение статуса устройства приводит к замене изображения этого статуса на зеленый, желтый или красный треугольник)
*******************************************************************************/
function UpdateStatus(data)
{
	for (var key in data)
	{
		var image = document.getElementById("status_app_" + parseInt(key));
		if (isset(image))
		{
			switch (parseInt(data[key]))
			{
				case 0:
					image.src = IMAGE_PATH_GLOBAL_STATUS_NOT_CONNECTED;
					image.title = STATE_NOT_CONNECTED;
					break;
				case 1:
					image.src = IMAGE_PATH_GLOBAL_STATUS_NORMAL;
					image.title = STATE_NORMAL;
					break;
				case 2:
					image.src = IMAGE_PATH_GLOBAL_STATUS_WARNING;
					image.title = STATE_WARNING;
					break;
				case 3:
					image.src = IMAGE_PATH_GLOBAL_STATUS_FAILURE;
					image.title = STATE_FAILURE;
					break;
				case 4:
					image.src = IMAGE_PATH_GLOBAL_STATUS_UNKNOWN;
					image.title = STATE_NOT_ACTIVE;
					break;
				default:
					image.src = IMAGE_PATH_GLOBAL_STATUS_EMPTY;
					image.title = "";
					break;
			}
		}
	}
}
/******************************************************************************/
function UpdateMessages(data)
{
	var messagesTable = new MessagesTable("rcu", 2);
    messagesTable.Clear();

    var failMessages = data.fail;
	var warnMessages = data.warn;
	var infoMessages = data.info;

	if ((isset(failMessages) && failMessages.length > 0) ||
		(isset(warnMessages) && warnMessages.length > 0) ||
		(isset(infoMessages) && infoMessages.length > 0))
	{
    	new TableElement("idRcuTableMessages", TableType.Table).Show();
    	messagesTable.Fill(failMessages, warnMessages, infoMessages);
    }
    else
    {    	new TableElement("idRcuTableMessages", TableType.Table).Hide();    }}
/******************************************************************************/
function UpdateRcuStatus(status)
{	var lamp1 = document.getElementById("idRcuStatus1");
	var lamp2 = document.getElementById("idRcuStatus2");

    if (!! lamp1 && !! lamp2)
    {
    	switch (parseInt(status))
    	{
    		case 3:
    			lamp1.src = IMAGE_PATH_LAMP_YELLOW;
    			lamp2.src = IMAGE_PATH_LAMP_RED;
    			break;
    		case 2:
    			lamp1.src = IMAGE_PATH_LAMP_GREY;
    			lamp2.src = IMAGE_PATH_LAMP_RED;
    			break;
    		case 1:
    			lamp1.src = IMAGE_PATH_LAMP_YELLOW;
    			lamp2.src = IMAGE_PATH_LAMP_GREY;
    			break;
    		case 0:
    		default:
    			lamp1.src = IMAGE_PATH_LAMP_GREY;
    			lamp2.src = IMAGE_PATH_LAMP_GREY;
    			break;
    	}
	}}
/******************************************************************************/