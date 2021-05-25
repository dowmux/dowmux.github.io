/*******************************************************************************
***************************** GLOBAL VARIABLES *********************************
*******************************************************************************/
// ВСЕ ГЛОБАЛЬНЫЕ переменные должны иметь префикс "g" либо имена строчными буквами
// глобальная переменная для управления запуском/остановкой ajax-обновления
var gTimingEventsObject;
// глобальная переменная для хранения функции ajax-обновления
var gTimingEventsUpdatingFunction;
// глобальная переменная для хранения времени первичной задержки запуска ajax-обновления
var gTimingEventsUpdatingPeriodMs = 2000;

// кэшируем картинки
var IMAGE_LOADER_GREEN = new Image();
var IMAGE_LOADER_RED = new Image();
var IMAGE_LOADER_WHITE = new Image();

IMAGE_LOADER_GREEN.src = '/images/loaders/snake-green.gif';
IMAGE_LOADER_RED.src = '/images/loaders/snake-red.gif';
IMAGE_LOADER_WHITE.src = '/images/loaders/snake-white.gif';
/******************************************************************************/

// Глобальные константы

var IMAGE_PATH_PLUS = "/images/plus.gif";
var IMAGE_PATH_MINUS = "/images/minus.gif";

var IMAGE_PATH_BALL_LOCKED = '/images/balls/green_14.png';
var IMAGE_PATH_BALL_UNLOCKED = '/images/balls/red_14.png';

var IMAGE_PATH_BALL_GREEN = '/images/balls/green_14.png';
var IMAGE_PATH_BALL_RED = '/images/balls/red_14.png';
var IMAGE_PATH_BALL_BLUE = '/images/balls/blue_14.png';

var IMAGE_PATH_LAMP_GREY = '/images/balls/grey_14.png';
var IMAGE_PATH_LAMP_YELLOW = '/images/balls/yellow_14.png';
var IMAGE_PATH_LAMP_RED = '/images/balls/red_14.png';

var IMAGE_PATH_EMPTY = "/images/empty.gif";
var IMAGE_PATH_INFO = "/images/status_icons/icon_big_info.gif";
var IMAGE_PATH_NORMAL = "/images/status_icons/icon_big_normal.gif";
var IMAGE_PATH_WARNING = "/images/status_icons/icon_big_warning.gif";
var IMAGE_PATH_FAILURE = "/images/status_icons/icon_big_error.gif";
var IMAGE_PATH_UNKNOWN = "/images/status_icons/icon_big_unknown.gif";

var IMAGE_PATH_GLOBAL_STATUS_NOT_CONNECTED = "/images/triangles/grey.gif";
var IMAGE_PATH_GLOBAL_STATUS_NORMAL = "/images/triangles/green.gif";
var IMAGE_PATH_GLOBAL_STATUS_WARNING = "/images/triangles/yellow.gif";
var IMAGE_PATH_GLOBAL_STATUS_FAILURE = "/images/triangles/red.gif";
var IMAGE_PATH_GLOBAL_STATUS_UNKNOWN = "/images/triangles/unknown.gif";
var IMAGE_PATH_GLOBAL_STATUS_EMPTY = "/images/empty.gif";

var NO_VALUE = "---";

var LANGUAGE_RUS = 1;
var LANGUAGE_ENG = 2;
/******************************************************************************/