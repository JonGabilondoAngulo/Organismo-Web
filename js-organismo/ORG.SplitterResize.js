/**
 * Created by jongabilondo on 14/08/2017.
 */

ORG.SplitterResize	= function(paneSep, contentPanel, leftPane, rightPane, scene) {

    const kSplitterWidth = paneSep.offsetWidth;

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

        const contentRect = contentPanel.getBoundingClientRect();
        const leftPanelWidth = pageX + kSplitterWidth/2.0;
        const rightPanelWidth = contentRect.width - leftPanelWidth;
        const sceneWidth = leftPanelWidth - kSplitterWidth/2.0 - 15 - 15;
        leftPane.style.width = leftPanelWidth + 'px';
        rightPane.style.width = rightPanelWidth + 'px';

        //ORG.canvasDomElem.style.width = leftPane.style.width;
        scene.resize({width:sceneWidth, height:scene.sceneSize.height});

    }, null, 'horizontal');

}
