$(function () {

    var fieldsSelected;
    var pairsMatched;
    var secondsPlayed;
    var timeElapsed;
    var isFirstMove;
    var $fields; // Store Board fields in a jQuery object
    var images = []; // Store the images for the Board fields in an array


    /*
     ===========================================================================
     DIALOGS
     ===========================================================================
     */
    var $chooseModeDialog = $("dialog[title='choose-mode-dialog']");
    var $endGameDialog = $("dialog[title='end-game-dialog']");
    var $playAsDialog = $("dialog[title='play-as-dialog']");

    $chooseModeDialog.dialog({
        width: 280,
        height: 250,
        draggable: false,
        autoOpen: true,
        modal: true,
        closeOnEscape: false,
        title: "Choose Game Mode",
        // hide: "slide",
        buttons: {
            Play: function () {
                closeDialogAndStart();
            },
            'Play as...': function () {
                $(this).dialog('close');
                $playAsDialog.dialog('open');
            }
        }
    });

    $playAsDialog.dialog({
        width: 280,
        height: 250,
        draggable: false,
        autoOpen: false,
        modal: true,
        closeOnEscape: false,
        title: "Play with name",
        // show: "drop",
        buttons: {
            Ok: function () {
                closeDialogAndStart();
                activatePlayerNameMode();
            }
        }
    });

    $endGameDialog.dialog({
        width: 280,
        height: 250,
        draggable: false,
        autoOpen: false,
        modal: true,
        title: "Game Won!",
        show: {effect: "blind", duration: 800},
        buttons: {
            Yes: function () {
                $chooseModeDialog.dialog('open');
                $(this).dialog('close');
            },
            Cancel: function () {
                window.close();
            }
        }
    });

    function clickFieldFunction() {
        if ($(this).hasClass('selected') || $(this).hasClass('matched'))
            return;
        if (isFirstMove) {
            isFirstMove = false;
            countTime();
        }

        fieldsSelected++;
        selectField($(this));

        if (fieldsSelected == 2) {
            $fields.off('click', clickFieldFunction);

            setTimeout(function () {
                if (!isMatch()) {
                    closeMismatched();
                } else {
                    registerMatch();
                    if (isWin())
                        endGame();
                }
                fieldsSelected = 0;
                $fields.on('click', clickFieldFunction);
            }, 600);
        }
    }

    function closeDialogAndStart() {
        clearInterval(postGameAnimation);
        startNewGame();
        $chooseModeDialog.dialog("close");
        $playAsDialog.dialog('close');
        $fields.show(genRandomEffect(), function () {
            $fields.on('click', clickFieldFunction);
        });
    }

    /*
     ===========================================================================
     Attaching event handlers
     ===========================================================================
     */

    $("select, #input-name").keydown(function (e) {
        if (e.which == 13) {
            closeDialogAndStart();
            activatePlayerNameMode();
        }
    });

    /*
     ===========================================================================
     Functions for preparing the board and starting new game
     ===========================================================================
     */

    function startNewGame() {
        $('#board').empty();
        $('#playing-time').empty();
        $('#playing-as').empty();
        $('#time').empty();
        images = [];
        fieldsSelected = 0;
        pairsMatched = 0;
        secondsPlayed = 0;
        isFirstMove = true;
        generateBoard();
        loadBoard();
    }

    function generateBoard() {
        for (var i = 0; i < 16; i++)
            $('#board').append('<figure class="field"></figure>');
        $fields = $('.field');
        $fields.hide();
    }

    function loadBoard() {
        var img_folder_path = $('select[name="mode"] option:selected').val();
        // Fills the array with images
        for (var i = 1; i <= 8; i++) {
            var $img= $('<img>');
            var src = img_folder_path + i + '.png';
            $img.attr('src', src);
            images.push($img);
            images.push($img.clone());
        }
        // Shuffles the array
        images.sort(function () {
            return 0.5 - Math.random()
        });
        // Assigns one image to every board field
        $fields.each(function (index, $field) {
            images[index].appendTo($field);
        });
    }

    function activatePlayerNameMode() {
        var player = $('#input-name').val();
        if (player != "")
            $('#playing-as').html("Playing as: <label id='player-name'>" + player + "</label>");
        $('#input-name').val('');
    }

    /*
     ===========================================================================
     Functions for board field manipulation
     ===========================================================================
     */

    function selectField($field) {
        $field.addClass('selected');
        $('img', $field).css('display', 'block');
    }

    function isMatch() {
        var src = [];
        $('.selected').each(function () {
            src.push($('img', this).attr('src'));
        });
        return src[0] == src[1];
    }

    function registerMatch() {
        $('.selected').each(function () {
            $(this).removeClass('selected');
            $(this).addClass('matched');
            $('img', this).animate({width: '110px'}, 'fast', function () {
                $(this).animate({width: '100px'}, 'fast');
            });
        });
        pairsMatched++;
    }

    function closeMismatched() {
        $('.selected').each(function () {
            $(this).removeClass('selected');
            $('img', this).hide();
        });
    }

    /*
     ===========================================================================
     Game associated functions
     ===========================================================================
     */

    function genRandomEffect() {
        var effects = ['blind', 'bounce', 'clip', 'drop', 'explode', 'fade',
            'fold', 'puff', 'pulsate', 'scale', 'shake', 'size', 'slide'];
        var max = effects.length;
        var index = Math.floor(Math.random() * max);
        console.log(index);
        return effects[index];
    }

    function countTime() {
        timeElapsed = setInterval(function () {
            secondsPlayed += 0.1;
            $("#playing-time").empty();
            $("#playing-time").append('Time: <label class="time-label">' + secondsPlayed.toFixed(1) + '</label>');
        }, 100);
    }

    function isWin() {
        return pairsMatched == 8;
    }

    function endGame() {
        clearInterval(timeElapsed);
        $('#time').append("<span>" + secondsPlayed.toFixed(1) + " seconds</span>");
        setTimeout(function () {
            startPostGameAnimation();
            $endGameDialog.dialog("open");
        }, 600);
    }

    var postGameAnimation;

    function startPostGameAnimation() {
        postGameAnimation = setInterval(function () {
            images.sort(function () {
                return 0.5 - Math.random()
            });
            $fields.each(function (index, $field) {
                images[index].appendTo($field);
            });
        }, 100);
    }
});

