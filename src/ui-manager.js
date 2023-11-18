import todoManager from "./todo-manager.js";
import { format, isToday, isThisWeek, isFuture } from "date-fns";
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
    }
    return format(date, 'd MMM');
}

function clearPage() {
    main.innerHTML = '';
    domAssociatorObject.reset();
}

function createTopBar(title, isProject = false, projectDescription = '') {
    const topBar = createElementWithClass('pg-top-section');

    const topBarHeader = createElementWithClass(isProject ? 'project-name' : '', 'h1');
    topBarHeader.textContent = title;

    topBar.appendChild(topBarHeader);

    if (isProject) {
        const desc = createElementWithClass('project-desc');
        desc.textContent = projectDescription;

        const buttons = createElementWithClass('project-buttons');

        const editButton = createElementWithClass('project-edit', 'button');
        editButton.innerHTML = SVGObject.edit + 'Edit Project';

        const addSection = createElementWithClass('project-add-section', 'button');
        addSection.innerHTML = SVGObject.add + 'Add Section';

        const deleteProject = createElementWithClass('project-delete', 'button');
        deleteProject.innerHTML = SVGObject.delete + 'Delete Project';

        buttons.appendChild(editButton);
        buttons.appendChild(addSection);
        buttons.appendChild(deleteProject);

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

function createSectionElement(section) {
    const sectionDiv = createElementWithClass('section');
    sectionDiv.id = section.name.toLowerCase();

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
    currentPage = pageId;
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
let currentPage = 'inbox';

const getCurrentPage = () => currentPage;

const inboxPage = {
    id: 'inbox',
    switchTo() {
        clearPage();

        const page = createElementWithClass('page');
        page.dataset.page = 'inbox';

        page.appendChild(createTopBar('Inbox'));

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
                if (isToday(unlistedItem.dueDate) || format(new Date(), 'yyyy-MM-dd') === format(unlistedItem.dueDate, 'yyyy-MM-dd')) {
                    itemList.appendChild(createItemElement(unlistedItem));
                }
            }
            for (const section of project.sections) {
                for (const item of section.items) {
                    if (isToday(item.dueDate) || format(new Date(), 'yyyy-MM-dd') === format(item.dueDate, 'yyyy-MM-dd')) {
                        itemList.appendChild(createItemElement(item));
                    }
                }
            }
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

        page.appendChild(createTopBar('Week'));

        const itemList = createElementWithClass('todo-items');

        for (const project of todoObject.projects) {
            for (const unlistedItem of project.unlistedItems) {
                if (isThisWeek(unlistedItem.dueDate, { weekStartsOn: 0 }) && (isFuture(unlistedItem.dueDate) || isToday(unlistedItem.dueDate))) {
                    itemList.appendChild(createItemElement(unlistedItem));
                }
            }
            for (const section of project.sections) {
                for (const item of section.items) {
                    if (isThisWeek(item.dueDate, { weekStartsOn: 0 }) && (isFuture(item.dueDate) || isToday(item.dueDate))) {
                        itemList.appendChild(createItemElement(item));
                    }
                }
            }
        }

        page.appendChild(itemList);
        main.appendChild(page);
        setActivePage('week');
    },
};

const projectPageLoader = project => {
    clearPage();

    const page = createElementWithClass('page');
    page.dataset.page = `project-${project.name.toLowerCase()}`;

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
    setActivePage(`project-${project.name.toLowerCase()}`);
};

const sidebarLoader = () => {
    const addProjectButton = document.querySelector('#add-project-button');
    const projectsList = document.querySelector('.sidebar-list.project-list');

    // Clear everything from the list except the add-project button
    for (const child of projectsList.children) {
        if (child === addProjectButton) {
            continue;
        }

        projectsList.removeChild(child);
    }

    for (const project of todoObject.projects) {
        if (project.name === 'default') {
            continue;
        }

        const projectButton = createElementWithClass('sidebar-item project', 'button');
        projectButton.id = `project-${project.name.toLowerCase()}`;
        projectButton.dataset.name = project.name.toLowerCase();
        projectButton.innerHTML = SVGObject.project + project.name;

        projectsList.insertBefore(projectButton, addProjectButton);
    }
};

const defaultLoader = () => {
    // Loads the elements on the sidebar
    sidebarLoader();

    // Loads the inbox page by default
    inboxPage.switchTo();
};

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

    const loadEditModal = (projectName = '', sectionName = null, todoItem) => {
        const page = document.querySelector('.page');

        // Close all open popups if they exist
        document.querySelectorAll('.popup.overlay').forEach(element => {
            page.removeChild(element);
        });

        const [ overlay, dialog ] = modalLoader(projectName + (sectionName !== null ? ` > ${sectionName}` : '') );

        const popupForm = createElementWithClass('popup-body', 'form');

        const checkboxContainer = createElementWithClass('checkbox-container');

        const checkbox = createElementWithClass('todo-checkbox', 'input');
        checkbox.type = 'checkbox';
        checkbox.id = 'edit-todo-checkbox';

        const checkmark = createElementWithClass('checkmark', 'span');

        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(checkmark);

        const title = createElementWithClass('todo-title', 'input');
        title.type = 'text';
        title.id = 'edit-todo-title';
        title.spellcheck = false;
        title.autocomplete = 'off';
        title.value = todoItem.title;
        title.required = true;

        const desc = createElementWithClass('todo-desc', 'textarea');
        desc.id = 'edit-todo-desc';
        desc.spellcheck = false;
        desc.textContent = todoItem.description;

        const dateDiv = createElementWithClass('date');

        const dateLabel = createElementWithClass('', 'label');
        dateLabel.setAttribute('for', 'edit-todo-date');
        dateLabel.textContent = 'Due Date: ';

        const date = createElementWithClass('todo-date', 'input');
        date.type = 'date';
        date.id = 'edit-todo-date';

        date.value = todoItem.dueDate === null ? '' : format(todoItem.dueDate, 'yyyy-MM-dd');
        date.min = date.value !== '' ? date.value : format(new Date(), 'yyyy-MM-dd');


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
        mid.dataset.priority = 'mid';
        mid.type = 'button';

        const high = createElementWithClass('priority-button high', 'button');
        high.textContent = 'High';
        high.dataset.priority = 'high';
        high.type = 'button';

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

        selectButtons.appendChild(low);
        selectButtons.appendChild(mid);
        selectButtons.appendChild(high);

        const confirmButton = createElementWithClass('confirm', 'button');
        confirmButton.textContent = 'Confirm Edit';
        confirmButton.type = 'submit';

        buttons.appendChild(selectButtons);
        buttons.appendChild(confirmButton);

        popupForm.appendChild(checkboxContainer);
        popupForm.appendChild(title);
        popupForm.appendChild(desc);
        popupForm.appendChild(dateDiv);
        popupForm.appendChild(buttons);

        dialog.appendChild(popupForm);

        overlay.appendChild(dialog);

        page.appendChild(overlay);

        // Disable the body so that the user cannot interact with it
        document.body.classList.add('disabled');
    };

    const closeModal = () => {
        const page = document.querySelector('.page');
        const popupOverlay = document.querySelector('.popup.overlay');

        page.removeChild(popupOverlay);

        document.body.classList.remove('disabled');
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

    return { loadEditModal, closeModal, switchPriority };
})();

export { getCurrentPage, domAssociatorObject, inboxPage, todayPage, weekPage, projectPageLoader, sidebarLoader, defaultLoader, modalManager };