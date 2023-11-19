import todoManager from "./todo-manager.js";
import { format, isToday, isThisWeek, isFuture, isValid } from "date-fns";
import SVGObject from "./svg-manager.js";
import { de } from "date-fns/locale";

const main = document.querySelector('main');

const todoObject = todoManager.getTodoObject();

function createElementWithClass(classProperty = '', tag = 'div') {
    const element = document.createElement(tag);
    element.setAttribute('class', classProperty);
    return element;
}

function dateFormatter(date) {
    if (date === null) {
        return 'No Due Date';
    } else if (!(date instanceof Date)) {
        date = new Date(date);
    }
    return format(date, 'd MMM');
}

function clearPage() {
    main.innerHTML = '';
    domAssociatorObject.reset();
}

function createProjectButton(project) {
    const projectButton = createElementWithClass('sidebar-item project', 'button');
    projectButton.id = `project-${project.name}`;
    projectButton.dataset.name = project.name;
    projectButton.innerHTML = SVGObject.project + project.name;

    return projectButton;
}

function createTopBar(title, hasExtra = false, projectDescription = '', isInbox = false) {
    const topBar = createElementWithClass('pg-top-section');

    const topBarHeader = createElementWithClass((hasExtra ? 'project-name' : ''), 'h1');
    topBarHeader.textContent = title;

    topBar.appendChild(topBarHeader);

    if (hasExtra) {
        const desc = createElementWithClass('project-desc');
        desc.textContent = projectDescription;

        const buttons = createElementWithClass('project-buttons');

        if (!isInbox) {
            const editButton = createElementWithClass('project-edit', 'button');
            editButton.innerHTML = SVGObject.edit + 'Edit Project';
            buttons.appendChild(editButton);
        }

        const addSection = createElementWithClass('project-add-section', 'button');
        addSection.innerHTML = SVGObject.add + 'Add Section';

        buttons.appendChild(addSection);

        if (!isInbox) {
            const deleteProject = createElementWithClass('project-delete', 'button');
            deleteProject.innerHTML = SVGObject.delete + 'Delete Project';
            buttons.appendChild(deleteProject);
        }

        topBar.appendChild(desc);
        topBar.appendChild(buttons);
    }

    return topBar;
}

function createItemElement(item) {
    const itemDiv = createElementWithClass('todo-item');
    itemDiv.dataset.index = domAssociatorObject.addObj(item);

    const checkboxContainer = createElementWithClass('checkbox-container');

    const checkbox = createElementWithClass('todo-checkbox', 'input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.status;

    const checkmark = createElementWithClass('checkmark', 'span');

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(checkmark);

    const title = createElementWithClass('todo-title', 'span');
    title.textContent = item.title;

    const desc = createElementWithClass('todo-desc', 'p');
    desc.textContent = item.description;

    const date = createElementWithClass('todo-date', 'p');
    date.textContent = dateFormatter(item.dueDate);

    if (isValid(item.dueDate) && !isToday(item.dueDate) && !isFuture(item.dueDate)) {
        date.classList.add('expired');
    }

    // ADD LOGIC FOR PRIORITY MANAGEMENT HERE

    const buttons = createElementWithClass('todo-buttons');

    const editButton = createElementWithClass('icon-button todo-edit', 'button');
    editButton.innerHTML = SVGObject.edit;

    const deleteButton = createElementWithClass('icon-button todo-delete', 'button');
    deleteButton.innerHTML = SVGObject.delete;

    buttons.appendChild(editButton);
    buttons.appendChild(deleteButton);

    itemDiv.appendChild(checkboxContainer);
    itemDiv.appendChild(title);
    itemDiv.appendChild(desc);
    itemDiv.appendChild(date);
    itemDiv.appendChild(buttons);

    return itemDiv;
}

function createTodoButton() {
    const buttonContainer = createElementWithClass('add-todo-button');

    const button = createElementWithClass('add-todo', 'button');
    button.innerHTML = SVGObject.add + 'Add Task';

    buttonContainer.appendChild(button);
    return buttonContainer;
}

function createEmptyDiv() {
    const emptyDiv = createElementWithClass('empty');
    emptyDiv.textContent = 'Woah! You seem to have finished all your tasks for today. Good Job!';
    return emptyDiv;
}

function createSectionElement(section) {
    const sectionDiv = createElementWithClass('section');
    sectionDiv.dataset.name = section.name;

    const sectionHeader = createElementWithClass('section-header');

    const collapseSection = createElementWithClass('collapse-section', 'button');
    collapseSection.innerHTML = SVGObject.arrowDown;

    const sectionName = createElementWithClass('section-name', 'span');
    sectionName.textContent = section.name;

    const deleteSection = createElementWithClass('delete-section', 'button');
    deleteSection.innerHTML = SVGObject.delete;

    sectionHeader.appendChild(collapseSection);
    sectionHeader.appendChild(sectionName);
    sectionHeader.appendChild(deleteSection);

    const itemList = createElementWithClass('todo-items');
    for (const item of section.items) {
        itemList.appendChild(createItemElement(item));
    }

    itemList.appendChild(createTodoButton());

    sectionDiv.appendChild(sectionHeader);
    sectionDiv.appendChild(itemList);

    return sectionDiv;
}

function setActivePage(pageId = 'inbox') {
    document.querySelectorAll('.sidebar-item.active').forEach(item => item.classList.remove('active'));

    document.querySelector(`.sidebar-item#${pageId}`).classList.add('active');
    pageLoader.setCurrentPage(pageId);
}

/* This object keeps track of dom todo items */
const domAssociatorObject = (function() {
    // Keep track of dom object
    let index = 0;

    let assArray = [];
    const getAssArray = () => assArray;

    const getItem = itemIndex => assArray[itemIndex].todoItem;

    // Reset the associator when we change pages
    const reset = () => {
        index = 0;
        assArray = [];
    };

    // Add object to keep track of it
    const addObj = (todoItem) => {
        assArray.push({
            index,
            todoItem,
        });

        return index++;
    };

    // Remove object from tracking
    const removeObj = indexToRemove => {
        assArray[indexToRemove] = undefined;
    };

    return { getAssArray, getItem, reset, addObj, removeObj }
})();


/* The following objects and functions are responsible for loading pages */
const pageLoader = (function() {
    let currentPage = 'inbox';

    const getCurrentPage = () => currentPage;
    const setCurrentPage = newPage => currentPage = newPage;

    const inboxPage = {
        id: 'inbox',
        switchTo() {
            clearPage();

            const page = createElementWithClass('page');
            page.dataset.page = 'inbox';

            page.appendChild(createTopBar('Inbox', true, '', true)); // ..., hasExtra, projectDescription(not req here), isInbox

            const inboxProject = todoObject.findProject('default');

            const unlistedSection = createElementWithClass('section');
            unlistedSection.id = 'unlisted';

            const itemList = createElementWithClass('todo-items');

            for (const item of inboxProject.unlistedItems) {
                itemList.appendChild(createItemElement(item));
            }

            itemList.appendChild(createTodoButton());

            unlistedSection.appendChild(itemList);
            page.appendChild(unlistedSection);

            for (const section of inboxProject.sections) {
                page.appendChild(createSectionElement(section));
            }

            main.appendChild(page);
            setActivePage('inbox');
        },
    };

    const todayPage = {
        id: 'today',
        switchTo() {
            clearPage();

            const page = createElementWithClass('page');
            page.dataset.page = 'today';

            page.appendChild(createTopBar('Today'));

            const itemList = createElementWithClass('todo-items');

            for (const project of todoObject.projects) {
                for (const unlistedItem of project.unlistedItems) {
                    if (unlistedItem.dueDate !== null && (isToday(unlistedItem.dueDate) || format(new Date(), 'yyyy-MM-dd') === format(unlistedItem.dueDate, 'yyyy-MM-dd'))) {
                        itemList.appendChild(createItemElement(unlistedItem));
                    }
                }
                for (const section of project.sections) {
                    for (const item of section.items) {
                        if (item.dueDate !== null && (isToday(item.dueDate) || format(new Date(), 'yyyy-MM-dd') === format(item.dueDate, 'yyyy-MM-dd'))) {
                            itemList.appendChild(createItemElement(item));
                        }
                    }
                }
            }

            if (itemList.childElementCount === 0) {
                itemList.appendChild(createEmptyDiv());
            }

            page.appendChild(itemList);

            main.appendChild(page);
            setActivePage('today');
        },
    };

    const weekPage = {
        id: 'week',
        switchTo() {
            clearPage();

            const page = createElementWithClass('page');
            page.dataset.page = 'week';

            page.appendChild(createTopBar('This Week'));

            const itemList = createElementWithClass('todo-items');

            for (const project of todoObject.projects) {
                for (const unlistedItem of project.unlistedItems) {
                    if (unlistedItem.dueDate !== null && isThisWeek(unlistedItem.dueDate, { weekStartsOn: 0 }) && isFuture(unlistedItem.dueDate)) {
                        itemList.appendChild(createItemElement(unlistedItem));
                    }
                }
                for (const section of project.sections) {
                    for (const item of section.items) {
                        if (item.dueDate !== null && isThisWeek(item.dueDate, { weekStartsOn: 0 }) && isFuture(item.dueDate)) {
                            itemList.appendChild(createItemElement(item));
                        }
                    }
                }
            }

            if (itemList.childElementCount === 0) {
                itemList.appendChild(createEmptyDiv());
            }

            page.appendChild(itemList);
            main.appendChild(page);
            setActivePage('week');
        },
    };

    const defaultPages = [inboxPage, todayPage, weekPage];

    const projectPageLoader = project => {
        clearPage();

        const page = createElementWithClass('page');
        page.dataset.page = `project-${project.name}`;

        page.appendChild(createTopBar(project.name, true, project.description));

        const unlistedSection = createElementWithClass('section');
        unlistedSection.id = 'unlisted';

        const itemList = createElementWithClass('todo-items');

        for (const item of project.unlistedItems) {
            itemList.appendChild(createItemElement(item));
        }

        itemList.appendChild(createTodoButton());

        unlistedSection.appendChild(itemList);
        page.appendChild(unlistedSection);

        for (const section of project.sections) {
            page.appendChild(createSectionElement(section));
        }

        main.appendChild(page);
        setActivePage(`project-${project.name}`);
    };

    const loadSideBar = () => {
        const addProjectButton = document.querySelector('#add-project-button');
        const projectsList = document.querySelector('.sidebar-list.project-list');

        // Clear everything from the list except the add-project button
        projectsList.innerHTML = '';
        projectsList.appendChild(addProjectButton);

        for (const project of todoObject.projects) {
            if (project.name === 'default') {
                continue;
            }

            const projectButton = createProjectButton(project);

            projectsList.insertBefore(projectButton, addProjectButton);
        }
    };

    const defaultLoader = () => {
        // Loads the elements on the sidebar
        loadSideBar();

        // Loads the inbox page by default
        inboxPage.switchTo();
    };

    const refreshPage = () => {
        const currentPage = getCurrentPage();

        let foundPage = false;
        pageLoader.defaultPages.forEach(page => {
            if (page.id === currentPage) {
                foundPage = true;
                page.switchTo();
                return;
            }
        });

        if (foundPage) {
            return;
        }

        const projectName = currentPage.slice('project-'.length);
        const project = todoObject.findProject(projectName);
        projectPageLoader(project);
    };

    return { getCurrentPage, setCurrentPage, defaultPages, projectPageLoader, loadSideBar, defaultLoader, refreshPage };
})();

const modalManager = (function() {
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

        return [ overlay, dialog ];
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
        title.placeholder = `A name for your ${targetType}, e.g. "${targetType === 'Section' ? 'classes' : 'Study'}" (required)`;

        if (itemObject) {
            title.value = itemObject.name;
        }

        popupForm.appendChild(title);

        if (targetType === 'Project') {
            const desc = createElementWithClass('todo-desc', 'textarea');
            desc.id = 'edit-desc';
            desc.spellcheck = false;
            desc.placeholder = 'A neat description for your Project e.g. "stuff to do before vacation ends"';

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
        title.placeholder = 'Title for your To-Do, e.g. "do the laundry" (required)';

        const desc = createElementWithClass('todo-desc', 'textarea');
        desc.id = 'edit-desc';
        desc.spellcheck = false;
        desc.placeholder = 'A neat description for your ToDo e.g. "must finish them by tomorrow, else I won\'t have clean clothes next week!"';

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

            date.value = todoItem.dueDate === null ? '' : format(todoItem.dueDate, 'yyyy-MM-dd');
            if (date.value !== '' && !isFuture(todoItem.dueDate)) {
                date.min = date.value;
            }

            switch(todoItem.priority) {
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

        const [ overlay, dialog ] = modalLoader(projectName + (sectionName !== null ? ` > ${sectionName}` : ''));

        const popupForm = createPopupForm();

        dialog.appendChild(popupForm);

        overlay.appendChild(dialog);

        disableBody();

        page.appendChild(overlay);
    }

    const loadEditItemModal = (projectName = '', sectionName = null, todoItem) => {
        const page = document.querySelector('.page');

        closeModal();

        const [ overlay, dialog ] = modalLoader(projectName + (sectionName !== null ? ` > ${sectionName}` : ''));

        const popupForm = createPopupForm(todoItem);

        dialog.appendChild(popupForm);

        overlay.appendChild(dialog);

        disableBody();

        page.appendChild(overlay);
    };

    const loadAddSectionModal = projectName => {
        const page = document.querySelector('.page');

        closeModal();

        const [ overlay, dialog ] = modalLoader(projectName + ': Add New Section');

        const popupForm = createSmallPopupForm('Section');

        dialog.appendChild(popupForm);

        overlay.appendChild(dialog);

        disableBody();

        page.appendChild(overlay);
    };

    const loadAddProjectModal = () => {
        const page = document.querySelector('.page');

        closeModal();

        const [ overlay, dialog ] = modalLoader('Add New Project');

        const popupForm = createSmallPopupForm('Project');

        dialog.appendChild(popupForm);

        overlay.appendChild(dialog);

        disableBody();

        page.appendChild(overlay);
    };

    const loadEditProjectModal = project => {
        const page = document.querySelector('.page');

        closeModal();

        const [ overlay, dialog ] = modalLoader(`${project.name}: Edit Project`);

        const popupForm = createSmallPopupForm('Project', project);

        dialog.appendChild(popupForm);

        overlay.appendChild(dialog);

        disableBody();

        page.appendChild(overlay);
    };

    const loadConfirmationModal = (targetType, targetName) => {
        const page = document.querySelector('.page');

        closeModal();

        const [ overlay, dialog ] = modalLoader(`Remove ${targetType}`);
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

    let elementsToBeMadeUnfocusable = [ document.body ];
    function disableBody() {
        // Disable the body so that the user cannot interact with it
        document.body.classList.add('disabled');

        elementsToBeMadeUnfocusable = document.body.querySelectorAll( 'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])');
        elementsToBeMadeUnfocusable.forEach(element => element.tabIndex = '-1');
    }

    const closeModal = () => {
        const page = document.querySelector('.page');
        const popupOverlay = document.querySelector('.popup.overlay');

        if (popupOverlay) {
            page.removeChild(popupOverlay);
        }

        document.body.classList.remove('disabled');
        elementsToBeMadeUnfocusable.forEach(element => element.tabIndex = '0');
    };

    const switchPriority = priority => {
        const buttons = document.querySelectorAll('.priority-button');
        if (buttons === undefined) {
            return;
        }

        buttons.forEach(button => {
            if (button.dataset.priority === priority) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
    };

    return { loadAddItemModal, loadEditItemModal, loadAddSectionModal, loadAddProjectModal, loadEditProjectModal,
             loadConfirmationModal, closeModal, switchPriority };
})();

const DOMAdderRemover = (function() {
    const addItem = (sectionElement, todoItem) => {
        if (sectionElement === undefined) {
            return false;
        }

        const itemDiv = createItemElement(todoItem);

        const todoItemsList = sectionElement.querySelector('.todo-items');
        todoItemsList.insertBefore(itemDiv, todoItemsList.lastElementChild);
    };

    const addSection = section => {
        const page = document.querySelector('.page');

        const sectionDiv = createSectionElement(section);

        page.appendChild(sectionDiv);
    };

    const addProject = project => {
        const projectsList = document.querySelector('.sidebar-list.project-list');

        const projectButton = createProjectButton(project);

        projectsList.insertBefore(projectButton, projectsList.lastElementChild);
    }

    return { addItem, addSection, addProject };
})();

const collapseSection = sectionDiv => {
    if (sectionDiv.id === 'unlisted') {
        return;
    }

    const collapseButton = sectionDiv.querySelector('button.collapse-section');

    if (sectionDiv.classList.contains('collapsed')) {
        sectionDiv.classList.remove('collapsed');
        collapseButton.innerHTML = SVGObject.arrowDown;
    } else {
        sectionDiv.classList.add('collapsed');
        collapseButton.innerHTML = SVGObject.arrowUp;
    }
};

const alertManager = (function() {
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

    const success = message => {
        const alert = createAlertElement(message);
        alert.classList.add('success');
        cornerPopupContainer.appendChild(alert);

        return alert;
    };

    const error = message => {
        const alert = createAlertElement(message);
        alert.classList.add('error');
        cornerPopupContainer.appendChild(alert);

        return alert;
    };

    return { success, error };
})();

export { domAssociatorObject, pageLoader, modalManager, DOMAdderRemover, collapseSection, alertManager };