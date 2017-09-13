/**
 * Created by jongabilondo on 14/08/2017.
 */

ORG.SplitterResize	= function(fullContent, leftSide, rightSide, scene) {

    $( leftSide ).resizable({
        handles: 'e,w',
        minWidth: 500,
        resize:function(event, ui) {

            const newRightWidth = fullContent.offsetWidth - ui.size.width;
            const newLeftWidth = ui.size.width;
            leftSide.style.width = newLeftWidth + 'px';
            ORG.canvasDomElem.style.width = newLeftWidth + 'px';
            scene.resize(ui.size);
            rightSide.style.width = newRightWidth + 'px';
        }
    });
}
