/******************************************************************************/
function RenderGreenLoader()
{
	var loader = document.getElementById("loader");
    if (isset(loader))
    {
		loader.src = IMAGE_LOADER_GREEN.src;
		setTimeout("StopLoaderAnimation();", 800);
	}
}

function RenderRedLoader()
{
	var loader = document.getElementById("loader");
    if (isset(loader))
    {
    	loader.src = IMAGE_LOADER_RED.src;
		setTimeout("StopLoaderAnimation();", 800);
	}
}

function StopLoaderAnimation()
{
	var loader = document.getElementById("loader");
	if (isset(loader))
		loader.src = IMAGE_LOADER_WHITE.src;
}
/******************************************************************************/