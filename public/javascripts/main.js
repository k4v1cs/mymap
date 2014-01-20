﻿$(document).ready( function() {    var Map = new MyMap.Map(),        Ruin = new MyMap.Ruin(),        Land = new MyMap.Land(),        Util = new MyMap.Util();        Map.init();    Ruin.init();    Land.init();        Util.initToggleButtons();    Util.initCloseBox();    });var MyMap = {};MyMap.Map = function() {        function colorLands() {        var count = $(this).data('count');        var opacity = 0;                if(count > 0) {            if(count <= 21) {                opacity = 0.3;            } else            if(count <= 42) {                opacity = 0.6;            } else {                opacity = 1;            }        }                $(this).css({            'background-color': 'rgba(114, 113, 85, ' + opacity + ')'        });    }        function colorRuins() {        var count = $(this).data('count');        var opacity = 0;                if(count > 0) {            if(count > 1) {                opacity = 1;            } else {                opacity = 0.6;            }        }                $(this).css({            'background-color': 'rgba(114, 113, 85, ' + opacity + ')'        });    }        function showKingdomInfo() {        var $cell = $(this).parent();        $cell.find('div.info-bar').show();        $('.map td.x-' + $cell.data('x')).addClass('selected');        $('.map td.y-' + $cell.data('y')).addClass('selected');    }        function hideKingdomInfo() {            var $cell = $(this).parent();            $cell.find('div.info-bar').hide();            $('.map td.x-' + $cell.data('x')).removeClass('selected');            $('.map td.y-' + $cell.data('y')).removeClass('selected');    }        function init() {        $('table.map.lands td.kingdom').each(colorLands);                $('table.map.ruins td.kingdom').each(colorRuins);        $('table.map td.kingdom a').hover(showKingdomInfo, hideKingdomInfo);    }        return {        init: init    }}MyMap.Ruin = function() {        function showForm() {        $(this).find('.add-ruin').show();    }        function hideForm() {            $(this).find('.add-ruin').hide();    }        function saveRuin(e) {        var $form = $(this),            $cell = $form.parents('td');                    $.post(            $form.attr('action'),             $form.serialize(),            function(data) {                            $cell.unbind('mouseenter mouseleave');                $cell.find('.add-ruin').hide();                                $cell.addClass("ruin" + (data.agressive ? ' agressive' : ''))                $cell.append("<div class='level'>" + data.level + "</div>");                $cell.append("<a href='/ruins/remove' class='remove'>X</a>");                var $remove = $cell.find('a.remove');                $remove.data('x', data.x);                $remove.data('y', data.y);                $remove.data('z', data.z);                                $remove.click(removeRuin);            },            'json'        ).fail(function(data) {            var response = data.responseText;            $('.container .error-message').remove();            $('.container').prepend('<div class="error-message">' + response + "<span class='close'>x</span></div>");            MyMap.Util().initCloseBox();        }).done(function() {            $('.container .error-message').remove();        });        e.preventDefault();    }        function removeRuin(e) {        var $link = $(this)            $cell = $link.parents('td');        $.post(            $link.attr('href'),            {                x: $link.data('x'),                y: $link.data('y'),                z: $link.data('z')            },            function() {                $cell.removeClass('ruin agressive');                $cell.find('.level').remove();                $link.remove();                                $cell.hover(showForm, hideForm);            }        ).fail(function(data) {            var response = data.responseText;            $('.container .error-message').remove();            $('.container').prepend('<div class="error-message">' + response + "</div>");        }).done(function() {            $('.container .error-message').remove();        });                e.preventDefault();    }    function init() {            $('table.ruins td:not(.ruin)').hover(showForm, hideForm);        $('table.ruins .add-ruin form').submit(saveRuin);        $('table.ruins .remove').click(removeRuin);    }    return {        init: init    }};              MyMap.Land = function() {        function showLandPicture() {        if(/lands\/[0-9]*\/[0-9]*\?z=[0-9]*$/.test(window.location)) {            var zStart = window.location.search.indexOf('z='),                z = window.location.search.substring(zStart + 2, zStart + 5),                coordinate = $('table.kingdom').data('x') + '-' + $('table.kingdom').data('y') + '-' + z;            $("a[data-name|='" + coordinate + ".jpg']").click();        }    }    function init() {        showLandPicture();    }    return {        init: init    }};MyMap.Util = function() {        function initToggleButtons() {        $('.btn.type').click(function() {            var $this = $(this);            $('input[name="type"]').val($this.data('value'));            $('.btn.type').removeClass('selected')            $this.addClass('selected');        });    }        function initCloseBox() {        $('.close').click( function(e) {            $(this).parent().remove();            e.preventDefault();        });    }        return {        initToggleButtons: initToggleButtons,        initCloseBox: initCloseBox    }};