import createElementWithClass from './common.js';
import SVGObject from './svg-manager.js';
import { format, isFuture } from 'date-fns';

function modalLoader(topBarText) {
    const overlay = createElementWithClass('popup overlay');

    const dialog = createElementWithClass('dialog');

    const topHeader = createElementWithClass('top-header');

    const headerText = createElementWithClass('project-name', 'span');
    headerText.textContent = topBarText;

    const closeButton = createElementWithClass('close-popup', 'button');
    closeButton.id = 'close-popup-modal';
    closeButton.innerHTML = SVGObject.close;

    topHeader.appendChild(headerText);
    topHeader.appendChild(closeButton);

    dialog.appendChild(topHeader);

    return [overlay, dialog];
}

// itemObject may be the section or the project
function createSmallPopupForm(targetType, itemObject) {
    const popupForm = createElementWithClass('popup-body', 'form');

    const title = createElementWithClass('todo-title', 'input');
    title.type = 'text';
    title.id = 'edit-title';
    title.spellcheck = false;
    title.autocomplete = 'off';
    title.required = true;
    title.placeholder = `A name for your ${targetType}, e.g. "${
        targetType === 'Section' ? 'classes' : 'Study'
    }" (required)`;

    if (itemObject) {
        title.value = itemObject.name;
    }

    popupForm.appendChild(title);

    if (targetType === 'Project') {
        const desc = createElementWithClass('todo-desc', 'textarea');
        desc.id = 'edit-desc';
        desc.spellcheck = false;
        desc.placeholder =
            'A neat description for your Project e.g. "stuff to do before vacation ends"';

        if (itemObject) {
            desc.textContent = itemObject.description;
        }

        popupForm.appendChild(desc);
    }

    const buttons = createElementWithClass('buttons right');

    const confirmButton = createElementWithClass('confirm', 'button');
    confirmButton.textContent = 'Confirm';
    confirmButton.type = 'submit';

    buttons.appendChild(confirmButton);
    popupForm.appendChild(buttons);

    return popupForm;
}

function createPopupForm(todoItem) {
    const popupForm = createElementWithClass('popup-body', 'form');

    // Checkbox will only exist for editing items
    if (todoItem) {
        const checkboxContainer = createElementWithClass('checkbox-container');

        const checkbox = createElementWithClass('todo-checkbox', 'input');
        checkbox.type = 'checkbox';
        checkbox.id = 'edit-todo-checkbox';
        checkbox.checked = todoItem.status;

        const checkmark = createElementWithClass('checkmark', 'span');

        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(checkmark);
        popupForm.appendChild(checkboxContainer);
    }

    const title = createElementWithClass('todo-title', 'input');
    title.type = 'text';
    title.id = 'edit-title';
    title.spellcheck = false;
    title.autocomplete = 'off';
    title.required = true;
    title.placeholder =
        'Title for your To-Do, e.g. "do the laundry" (required)';

    const desc = createElementWithClass('todo-desc', 'textarea');
    desc.id = 'edit-desc';
    desc.spellcheck = false;
    desc.placeholder =
        'A neat description for your To-Do e.g. "must finish them by tomorrow, else I won\'t have clean clothes next week!"';

    const dateDiv = createElementWithClass('date');

    const dateLabel = createElementWithClass('', 'label');
    dateLabel.setAttribute('for', 'edit-todo-date');
    dateLabel.textContent = 'Due Date: ';

    const date = createElementWithClass('todo-date', 'input');
    date.type = 'date';
    date.id = 'edit-todo-date';

    date.min = format(new Date(), 'yyyy-MM-dd');

    dateDiv.appendChild(dateLabel);
    dateDiv.appendChild(date);

    const buttons = createElementWithClass('buttons');

    const selectButtons = createElementWithClass('select-buttons');

    const low = createElementWithClass('priority-button low', 'button');
    low.textContent = 'Low';
    low.dataset.priority = 'low';
    low.type = 'button';

    const mid = createElementWithClass('priority-button mid', 'button');
    mid.textContent = 'Medium';
    mid.dataset.priority = 'medium';
    mid.type = 'button';

    const high = createElementWithClass('priority-button high', 'button');
    high.textContent = 'High';
    high.dataset.priority = 'high';
    high.type = 'button';

    selectButtons.appendChild(low);
    selectButtons.appendChild(mid);
    selectButtons.appendChild(high);

    const confirmButton = createElementWithClass('confirm', 'button');
    confirmButton.textContent = 'Confirm';
    confirmButton.type = 'submit';

    buttons.appendChild(selectButtons);
    buttons.appendChild(confirmButton);

    // Set their values (if it's an edit modal)
    if (todoItem) {
        title.value = todoItem.title;
        desc.textContent = todoItem.description;

        date.value =
            todoItem.dueDate === null
                ? ''
                : format(todoItem.dueDate, 'yyyy-MM-dd');
        if (date.value !== '' && !isFuture(todoItem.dueDate)) {
            date.min = date.value;
        }

        switch (todoItem.priority) {
            case 'low':
                low.classList.add('selected');
                break;
            case 'medium':
                mid.classList.add('selected');
                break;
            case 'high':
                high.classList.add('selected');
                break;
        }

        confirmButton.textContent = 'Confirm Edit';
    } else {
        low.classList.add('selected');
    }

    popupForm.appendChild(title);
    popupForm.appendChild(desc);
    popupForm.appendChild(dateDiv);
    popupForm.appendChild(buttons);

    return popupForm;
}

const loadAddItemModal = (projectName = '', sectionName = null) => {
    const page = document.querySelector('.page');

    closeModal();

    const [overlay, dialog] = modalLoader(
        projectName + (sectionName !== null ? ` > ${sectionName}` : ''),
    );

    const popupForm = createPopupForm();

    dialog.appendChild(popupForm);

    overlay.appendChild(dialog);

    disableBody();

    page.appendChild(overlay);
};

const loadEditItemModal = (todoItem) => {
    const page = document.querySelector('.page');

    closeModal();

    const [overlay, dialog] = modalLoader(
        todoItem.projectName === 'default'
            ? 'Inbox'
            : todoItem.projectName +
                  (todoItem.sectionName !== null
                      ? ` > ${todoItem.sectionName}`
                      : ''),
    );

    const popupForm = createPopupForm(todoItem);

    dialog.appendChild(popupForm);

    overlay.appendChild(dialog);

    disableBody();

    page.appendChild(overlay);
};

const loadAddSectionModal = (projectName) => {
    const page = document.querySelector('.page');

    closeModal();

    const [overlay, dialog] = modalLoader(projectName + ': Add New Section');

    const popupForm = createSmallPopupForm('Section');

    dialog.appendChild(popupForm);

    overlay.appendChild(dialog);

    disableBody();

    page.appendChild(overlay);
};

const loadAddProjectModal = () => {
    const page = document.querySelector('.page');

    closeModal();

    const [overlay, dialog] = modalLoader('Add New Project');

    const popupForm = createSmallPopupForm('Project');

    dialog.appendChild(popupForm);

    overlay.appendChild(dialog);

    disableBody();

    page.appendChild(overlay);
};

const loadEditProjectModal = (project) => {
    const page = document.querySelector('.page');

    closeModal();

    const [overlay, dialog] = modalLoader(`${project.name}: Edit Project`);

    const popupForm = createSmallPopupForm('Project', project);

    dialog.appendChild(popupForm);

    overlay.appendChild(dialog);

    disableBody();

    page.appendChild(overlay);
};

const loadConfirmationModal = (targetType, targetName) => {
    const page = document.querySelector('.page');

    closeModal();

    const [overlay, dialog] = modalLoader(`Remove ${targetType}`);
    dialog.classList.add('confirmation');

    const popupBody = createElementWithClass('popup-body');

    popupBody.innerHTML = SVGObject.info;

    const text = createElementWithClass('confirmation-text', 'p');
    text.textContent = `Are you sure you want to delete the ${targetType} "`;

    const nameSpan = createElementWithClass('name', 'span');
    nameSpan.textContent = targetName;

    text.appendChild(nameSpan);

    text.innerHTML += '"? This is an irreversible action.';

    const buttons = createElementWithClass('buttons');

    const cancel = createElementWithClass('confirmation-button', 'button');
    cancel.id = 'confirm-no';
    cancel.textContent = 'No';

    const confirm = createElementWithClass('confirmation-button yes', 'button');
    confirm.id = 'confirm-yes';
    confirm.textContent = 'Yes';

    buttons.appendChild(cancel);
    buttons.appendChild(confirm);

    popupBody.appendChild(text);
    popupBody.appendChild(buttons);

    dialog.appendChild(popupBody);
    overlay.appendChild(dialog);

    disableBody();

    page.appendChild(overlay);
};

let elementsToBeMadeUnfocusable = [document.body];
function disableBody() {
    // Disable the body so that the user cannot interact with it
    document.body.classList.add('disabled');

    elementsToBeMadeUnfocusable = document.body.querySelectorAll(
        'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])',
    );
    elementsToBeMadeUnfocusable.forEach((element) => (element.tabIndex = '-1'));
}

const closeModal = () => {
    const page = document.querySelector('.page');
    const popupOverlay = document.querySelector('.popup.overlay');

    if (popupOverlay) {
        page.removeChild(popupOverlay);
    }

    document.body.classList.remove('disabled');
    elementsToBeMadeUnfocusable.forEach((element) => (element.tabIndex = '0'));
};

const switchPriority = (priority) => {
    const buttons = document.querySelectorAll('.priority-button');
    if (buttons === undefined) {
        return;
    }

    buttons.forEach((button) => {
        if (button.dataset.priority === priority) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });
};

export {
    loadAddItemModal,
    loadEditItemModal,
    loadAddSectionModal,
    loadAddProjectModal,
    loadEditProjectModal,
    loadConfirmationModal,
    closeModal,
    switchPriority,
};
