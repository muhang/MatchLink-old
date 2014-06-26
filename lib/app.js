$(document).ready(function(){
	
	if($(window).width() < 650)
	{
		alert("This game is not optimized for this browser width. Please use a wider screen for full functionality");
	}
	var cells = $('.gcell');
	//Save starting cell elements
	var classBackup = [];
	for(var i = 0; i < cells.length; i++)
	{
		var classList = $(cells[i]).attr('class').split(/\s+/);
		classBackup.push(classList);
	}
	var cellTypes = ['type1', 'type2', 'type3', 'type4', 'type5', 'type6', 'type7', 'type8', 'type9', 'type10', 'type11', 'type12'];
	var rows = $('.gameboard > div').length;
	var cols = $('.grow0 > div').length;
	var isMatch = false;	//Initialize color match check
	var timeAdds = 3;		//Set number of additions to time user starts with
	var timer = 60; 	//Set intial timer value
	var score = 0;	//Initialize score
	var levelScore = 0; 	//Initialize level score
	//Create matrix for PF based on board size
	var matRow = [];
	for (var i = 0; i < cols; i++)
	{
		matRow.push(1);
	}
	var matrix = [];
	for (var i = 0; i < rows; i++)
	{
		matrix[i] = matRow;	
	}
	var grid = new PF.Grid(cols,rows,matrix);	//Create grid for PF
	var emptyCells = [];
	var activeCells = [];
	var flashingCells = [];
	var selectedCells = [];

	//Fishcer-Yates shuffle for randomization
	function shuffle(array) 
	{
	  for (var i = array.length - 1; i > 0; i--) 
	  {
	    var j = Math.floor(Math.random() * (i + 1));
	    var temp = array[i];
	    array[i] = array[j];
	    array[j] = temp;
	  }
	  return array;
	}

	//Point handler
	function addPoints(newScore)
	{	
		score = score + newScore;
		levelScore = levelScore + newScore;
		$('span.score-count').text(score);
		$('span.total-p').text(score);
		$('span.level-p').text(levelScore);
	}

	//Create active and empty cells based on level
	function setDifficulty(level)
	{
		cells.each(function(i){
			var getX = $(this).data('x');
			var getY = $(this).data('y');
			switch (level)
			{
				case 1:
					if($(this).parent().hasClass('grow0') || $(this).parent().hasClass('grow1')
						|| $(this).parent().hasClass('grow8') || $(this).parent().hasClass('grow9')
						|| $(this).hasClass('gcol0') || $(this).hasClass('gcol1')
						|| $(this).hasClass('gcol8') || $(this).hasClass('gcol9'))
					{
						$(this).addClass('empty');
						grid.setWalkableAt(getX, getY, true);
						emptyCells.push($(this));
					}
					else
					{
						$(this).addClass('active');
						activeCells.push($(this));
					}
					break;
				case 2:
					if($(this).parent().hasClass('grow0') || $(this).parent().hasClass('grow1')
						|| $(this).parent().hasClass('grow8') || $(this).parent().hasClass('grow9')
						|| $(this).hasClass('gcol0') || $(this).hasClass('gcol9'))
					{
						$(this).addClass('empty');
						grid.setWalkableAt(getX, getY, true);
						emptyCells.push($(this));
					}
					else
					{
						$(this).addClass('active');
						activeCells.push($(this));
					}
					break;
				case 3:
					if($(this).parent().hasClass('grow0') || $(this).parent().hasClass('grow9')
						|| $(this).hasClass('gcol0') || $(this).hasClass('gcol9'))
					{
						$(this).addClass('empty');
						grid.setWalkableAt(getX, getY, true);
						emptyCells.push($(this));
					}
					else
					{
						$(this).addClass('active');
						activeCells.push($(this));
					}
					break;
				case 4: 
					if($(this).parent().hasClass('grow0') || $(this).parent().hasClass('grow9'))
					{
						$(this).addClass('empty');
						grid.setWalkableAt(getX, getY, true);
						emptyCells.push($(this));
					}
					else
					{
						$(this).addClass('active');
						activeCells.push($(this));
					}
					break;
				case 5:
					$(this).addClass('active');
					activeCells.push($(this));
					break;
			}
		});
	}

	//Give active cells matchable classes in pairs
	function assignClasses(array1, array2)
	{
		for (var i = 0; i < array1.length; i+=2)
		{
			if(array1.length < 50)
			{
				//Level 1 and 2
				var type = Math.floor(i/4);
				$(array1[i]).addClass(array2[type]);
				$(array1[i+1]).addClass(array2[type]);
			}
			else
			{
				if(array1.length < 79)
				{
					//Level 3
					var type = Math.floor(i/6);
					$(array1[i]).addClass(array2[type]);
					$(array1[i+1]).addClass(array2[type]);
				}
				else
				{
					if(array1.length < 99)
					{
						//Level 4
						var type = Math.floor(i/7);
						$(array1[i]).addClass(array2[type]);
						$(array1[i+1]).addClass(array2[type]);
					}
					else
					{
						//Level 5
						var type = Math.floor(i/9);
						$(array1[i]).addClass(array2[type]);
						$(array1[i+1]).addClass(array2[type]);
					}
				}
			}
		}
	}


	//Check for class match
	function checkMatch(array)
	{
		var colorCheck = [];
		for (var i = 0; i < array.length; i++)
		{
			var classList = $(array[i]).attr('class').split(/\s+/);
			colorCheck.push(classList[3]);
		}
		if (colorCheck[0] ==  colorCheck[1])
		{
			return true;
		}
		else
		{
			return false;
		}
	}

	//Timer
	function startTimer(level)
	{
		setInterval(function()
		{
			if(timer > 0 && !$('.slideLeft').length)
			{
				timer--;
				$('span.counter').text(timer);
				var prevHeight = $('.timebar').height();
				$('.timebar').css("height", (timer*10) + 'px');
				if(timer < 20)
				{
					$('.timebar').css("background", "#db4437").css("border-color", "#db4437");
				}
				else
				{
					$('.timebar').css("background", "#0f9d58").css("border-color", "#084E2C");
				}
			}
			else
			{
				if(timer < 1)
				{
					$('.timebar').css("visibility", "hidden");

					//Lose game
					$('.loss-alert').addClass("slideLeft");
				}
			}
		}, 1000);
	}

	//Reset game board for next level
	function reset()
	{
		var curCells = $('.gcell');
		for (var i = 0; i < curCells.length; i++)
		{
			$(curCells[i]).unbind("click");
			$(curCells[i]).removeClass();
			$(curCells[i]).attr('class', classBackup[i][0] + ' ' + classBackup[i][1]);
		}
		selectedCells = [];
		activeCells = [];
		emptyCells = [];
		levelScore = 0;
		$('span.level-p').text(levelScore);
		return true;
	}

	//New Level
	function levelUp(level)
	{
			$('.level-alert').addClass("slideLeft");
			$('p.continue').on("click", function(){
				$(this).parent().removeClass("slideLeft");
				if(reset())
				{
					if (timer < 30)
					{
						timer = timer + 30;
					}
					else
					{
						timer = 60;
					}
					timeAdds = 3;
					$('.uses-left').text(timeAdds);
					if($('.addtime').hasClass('notime'))
					{
						$('.addtime').removeClass('notime');
					}
					$('.gcell').unbind("click");
					emptyCells = [];
					activeCells = [];
					startGame(level+1);
				}
			});
	}

	//Check for win
	function winCheck(level)
	{
		if($('.gcell.active').length)
		{
			console.log($('.gcell.active').length);
		}
		else
		{
			addPoints(timer * 100);
			if(level < 5)
				{
					//Go to next level
					levelUp(level);
				}
			else
			{
					//Win game
				$('.win-alert').addClass("slideLeft");
			}
		}
	}

	//Check if two cells are adjacent based on data values
	function isNearby(startX, startY, endX, endY)
	{
		var xDiff = Math.abs(startX - endX);
		var yDiff = Math.abs(startY - endY);
		if ((startX == endX && yDiff == 1) || (startY == endY && xDiff == 1))
		{
			if (xDiff == 1 && yDiff == 1)	//Prevent occasional diagonal glitch
			{
				return false;
			}
			else
			{
				return true;
			}
		}
		else
		{
			return false;
		}
	}

	//Remove selection class
	function removeSelection(array)
	{
		for(var i = 0; i < array.length; i++)
		{
			array[i].removeClass('selected');
		}
	}

	//Selection handler
	function checkSelection(array, elem)
	{
		if (array.length == 0 )

			//First cell selected
			{
				elem.addClass('selected');
				array.push(elem);
				return 1;
			}
			else
			{
				if (array.length == 1)
				{

					//Cell is duplicate
					if ( elem.hasClass('selected') )
					{
						array = [];
						elem.removeClass('selected');
						array = [];
						return 2;
					}
					else
					{

						//Cell can be matched
						elem.addClass('selected');
						array.push(elem);
						if(checkMatch(array))
						{

							//Cell passes match test
							return 3;
							array = [];
						}
						else
						{

							//Cell fails match test
							array = [];
							return 4;
						}
					}
				}
				else
				{
					//May not be needed, erases selection in case of error
					array = [];
					return 5;
				}
			}
	}

	//Pathfinder
	function checkPath(elem1, elem2, startX, endX, startY, endY)
	{
		grid.setWalkableAt(startX,startY,true);	//Make both cells walkable for pathfinder
		grid.setWalkableAt(endX,endY,true);

		var pathCells = [];	//Array to hold cells used in path
		var gridBackup = grid.clone();	//Backup grid

		//PathfindingJS stuff
		var finder = new PF.AStarFinder();
		var path = finder.findPath(startX, startY, endX, endY, grid);
		grid = gridBackup;	//Reset grid

		//Diagonals throw exception
		try{
			var checkTurns = PF.Util.smoothenPath(grid, path);
		}
		catch(err){
			path = [];
			return false;		//Failure
		}
		if( path.length)	//Path can be made
		{
			//Get each cell in path as element
			for (var i = 0; i < path.length; i++)
			{
				pathCells.push($('div[data-x="'+path[i][0]+'"][data-y="'+path[i][1]+'"]'));
			}
			flashPath(pathCells); 	//Progress effect through cells used in path
			return true;		//Success
		}
		else
		{
			flashError(selectedCells);
			return false;		//Failure
		}
	}

	function flashPath(array)
	{
		for (var i = 0; i < array.length; i++)
		{
			(function(i){
				setTimeout(function(){
					$(array[i]).addClass('pathflash').delay(500).queue(function(next){
						$(this).removeClass('pathflash').dequeue();
					});
				}, 100 * i);
			}(i));
		}
	}

	function flashError(array)
	{
		for (var i = 0; i < array.length; i++)
		{
			$(array[i]).addClass('error').delay(500).queue(function(next){
				$(this).removeClass('error').dequeue();
			});
		}
	}

	function allowClick(level)
	{
		$('.gcell.active').on("click", function(){
			switch(checkSelection(selectedCells, $(this)))
			{
				case 1:
					break;
				case 2:
					removeSelection(selectedCells);
					selectedCells = [];
					break;
				case 3:
					var start = selectedCells[0];
					var end = selectedCells[1];
					
					//Get cell coordinates
					var startX = $(selectedCells[0]).data('x');
					var startY = $(selectedCells[0]).data('y');
					var endX = $(selectedCells[1]).data('x');
					var endY = $(selectedCells[1]).data('y');
					if( isNearby(startX, startY, endX, endY) )
					{
						grid.setWalkableAt(startX,startY,true);	//Make both cells walkable permanently
						grid.setWalkableAt(endX,endY,true);
						$(start).removeClass('active').addClass('empty').unbind("click");
						$(end).removeClass('active').addClass('empty').unbind("click");
						addPoints(100);
						flashPath(selectedCells);
						removeSelection(selectedCells);
						selectedCells = [];
						winCheck(level);
					}
					else
					{
						if(checkPath(start, end, startX, endX, startY, endY))
						{
							$(start).removeClass('active').addClass('empty').unbind("click");
							$(end).removeClass('active').addClass('empty').unbind("click");
							grid.setWalkableAt(startX,startY,true);	//Make both cells walkable permanently
							grid.setWalkableAt(endX,endY,true);
							removeSelection(selectedCells);
							selectedCells = [];
							addPoints(100);
							winCheck(level);
							break;
						}
						else
						{
							flashError(selectedCells);
							removeSelection(selectedCells);
							selectedCells = [];
							break;
						}
					}
				case 4:
					//Flash error if no match
					flashError(selectedCells);
					removeSelection(selectedCells);
					selectedCells = [];
					break;
				case 5:
					removeSelection(selectedCells);
					selectedCells = [];
					break;
			}
		});
	}

	function startGame(level)
	{	
		$('.timebar, .addtime, .score').css("visibility", "visible");
		$('span.levelc').text(level);
		grid = new PF.Grid(cols,rows,matrix);	//Create grid for PF
		setDifficulty(level);
		shuffle(cellTypes);
		shuffle(activeCells);
		assignClasses(activeCells, cellTypes);
		selectedCells = [];
		allowClick(level);
	}
	$('p.starter').on("click", function(){
		$('.gameoverlay').addClass("slideOut");
		startTimer();
		startGame(1);
	});
	$('p.restart').on("click", function(){
		location.reload();
	});
	$('.addtime').on("click", function(){
			if(timeAdds > 0)
			{
				if(timer <= 45)
				{
					timer = timer + 15;
				}
				else
				{
					timer = 60;
				}
				timeAdds = timeAdds - 1;
				$('span.uses-left').text(timeAdds);
				if(timeAdds == 0)
				{
					$(this).addClass('notime');
				}
			}
	});
	$('p.warpzone').on("click", function(){
		if($(this).hasClass('mainmenu'))
		{
			$('.warp').removeClass("slideLeft");
		}
		else
		{
			$('.warp').addClass("slideLeft");
		}
	});
	$('ul.level-list li').on("click", function(){
		var levelNum = $(this).data('level');
		$(this).parent().parent().parent().removeClass("slideLeft");
		$('.gameoverlay').css("display", "none");
		startTimer();
		startGame(levelNum);
	});
	$('h1.content-head').on("click", function(){
		location.reload();
	});
});