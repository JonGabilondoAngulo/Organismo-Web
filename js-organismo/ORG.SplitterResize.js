/**
 * Created by jongabilondo on 14/08/2017.
 */

ORG.SplitterResize	= function(paneSep, fullContent, leftPane, rightPane, scene) {

    const splitterWidth = paneSep.offsetWidth;

    // The script below constrains the target to move horizontally between a left and a right virtual boundaries.
    // - the left limit is positioned at 10% of the screen width
    // - the right limit is positioned at 90% of the screen width
    const leftLimit = 10;
    const rightLimit = 90;


    paneSep.sdrag(function (el, pageX, startX, pageY, startY, fix) {

        fix.skipX = true;

        if (pageX < window.innerWidth * leftLimit / 100) {
            pageX = window.innerWidth * leftLimit / 100;
            fix.pageX = pageX;
        }
        if (pageX > window.innerWidth * rightLimit / 100) {
            pageX = window.innerWidth * rightLimit / 100;
            fix.pageX = pageX;
        }

        const xOffset = pageX-startX;

        var cur = pageX / window.innerWidth * 100;
        if (cur < 0) {
            cur = 0;
        }
        if (cur > window.innerWidth) {
            cur = window.innerWidth;
        }

        const right = window.innerWidth - pageX - splitterWidth;
        leftPane.style.width = pageX + 'px';
        rightPane.style.width = right + 'px';

        ORG.canvasDomElem.style.width = leftPane.style.width;
        scene.resize({width:pageX - 30, height:scene.sceneSize.height});

    }, null, 'horizontal');

}
