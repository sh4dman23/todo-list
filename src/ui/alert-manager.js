import createElementWithClass from './common.js';
import SVGObject from './svg-manager.js';

const cornerPopupContainer = document.querySelector('.corner-popup-container');

function createAlertElement(message) {
    const alert = createElementWithClass('corner-popup');
    alert.innerHTML = SVGObject.info;
    alert.appendChild(document.createTextNode(message));

    const closeButton = createElementWithClass('close-alert', 'button');
    closeButton.innerHTML = SVGObject.close;

    alert.appendChild(closeButton);

    return alert;
}

const success = (message) => {
    const alert = createAlertElement(message);
    alert.classList.add('success');
    cornerPopupContainer.appendChild(alert);

    return alert;
};

const error = (message) => {
    const alert = createAlertElement(message);
    alert.classList.add('error');
    cornerPopupContainer.appendChild(alert);

    return alert;
};

export { success, error };
