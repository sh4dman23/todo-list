"use strict";
(self["webpackChunktodo_list"] = self["webpackChunktodo_list"] || []).push([[179],{

/***/ 54:
/***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {


;// CONCATENATED MODULE: ./src/todo-manager.js


function updateTodoItem(newTitle, newDescription, newDueDate, newPriority, newStatus) {
    this.title = newTitle !== undefined ? newTitle : this.title;
    this.description = newDescription !== undefined ? newDescription : this.description;
    this.dueDate = newDueDate !== undefined ? newDueDate : this.dueDate;
    this.priority = newPriority !== undefined ? newPriority : this.priority;
    this.status = newStatus !== undefined ? newStatus : this.status;
};

// Finds section by name
function findSection(sectionName) {
    return this.sections.find(section => section.name === sectionName);
}

// While To-Dos may have the same name, projects cannot. So, we need to perform a check
function updateProject(newName, newDescription) {
    if (todoManager.getTodoObject().findProject(newName) !== undefined && newName !== this.name) {
        return false;
    }

    this.name = newName !== undefined ? newName : this.name;
    this.description = newDescription !== undefined ? newDescription : this.description;
}

/*
    The first 3 functions below are responsible for creating and
    returning Todo items, sections and projects respectively
    Note for future: properties can be skipped by the spread operator
        ex: exampleItem.update(...Array(3), 'high'); will only update the priority
*/

function createTodoItem(title, description = '', dueDate = null, priority = 'low', projectName = 'default', sectionName = null) {
    const todo = {
        title,
        description,
        dueDate,
        priority,
        status: false, // status = false means this todo has not been completed
        projectName,
        sectionName,
    };

    return Object.assign(todo, { update: updateTodoItem });
}

function createSection(name) {
    const section = {
        name,
        items: [],
    };

    return section;
}

function createProject(name, description = '') {
    const project = {
        name,
        description,
        unlistedItems: [],
        sections: [],
    };

    return Object.assign(project, { findSection, update: updateProject });
}

function checkForEmpty(...args) {
    args.forEach(arg => {
        if (arg === undefined || arg === null || arg === '') {
            return true;
        }
    });

    return false;
}

/*
    The main ToDo object stores the todo items.
    It has:
        1. a default list for items outside projects (accessible from inbox)
        2. projects for lists
            1. in projects, user can create new projects in which they can create lists (called sections)

    In every list, there are
            1. unlisted items
            2. sections
                1. in every section, there are todo items
    The todoManager below manages the todoObject and other functions related to it
*/

const todoManager = (function() {
    const todoObject = {
        // Projects contains an array of lists each of which has a name, an array of unlisted items,
        // and a sections array which contains dictionaries containing their names and a list of items
        projects: [
            // Default project, accessible from inbox
            createProject(
                'default',
                '',
            ),
        ],

        // Finds project by name
        findProject(projectName) {
            return this.projects.find(project => project.name === projectName);
        },
    };

    const getTodoObject = () => todoObject;

    // Create the new project and return it
    const addProject = (name, description) => {
        const findProject = todoObject.findProject(name);

        // Project must not exist
        if (checkForEmpty(name) || findProject !== undefined) {
            return false;
        }

        const project = createProject(name, description);
        todoObject.projects.push(project);

        return project;
    };

    // Add section and then return it
    const addSection = (name, projectName = 'default') => {
        if (checkForEmpty(name)) {
            return false;
        }

        const project = todoObject.findProject(projectName);

        // Project must exist and section must not
        if (
            project === undefined ||
            project.findSection(name) !== undefined
        ) {
            return false;
        }

        const section = createSection(name);
        project.sections.push(section);

        return section;
    };

    // Add item and then return it
    const addTodoItem = (title, description, dueDate = null, priority, projectName = 'default', sectionName = null) => {
        const project = todoObject.findProject(projectName);

        // Project must exist
        if (checkForEmpty(title, priority) || project === undefined) {
            return false;
        }

        const item = createTodoItem(title, description, dueDate, priority, projectName, sectionName);

        // If section is null, add to unlisted items, else find and then add to that section's item list
        if (sectionName === null) {
            project.unlistedItems.push(item);
        } else {
            const section = project.findSection(sectionName);
            if (section === undefined) {
                return false;
            }

            section.items.push(item);
        }

        return item;
    };

    const deleteTodoItem = (todoItem) => {
        const project = todoObject.findProject(todoItem.projectName);

        if (project === undefined) {
            return false;
        }

        const sectionName = todoItem.sectionName;

        // We need to do the same thing twice here because, the property value isn't passed by reference, unlike the object itself
        let itemList;
        if (sectionName === null) {
            itemList = project.unlistedItems;
            const itemIndex = itemList.findIndex(item => item === todoItem);

            if (itemIndex === undefined) {
                return false;
            }

            project.unlistedItems = itemList.slice(0, itemIndex).concat(itemList.slice(itemIndex + 1));
        } else {
            const section = project.findSection(sectionName);
            if (section === undefined) {
                return false;
            }

            itemList = section.items;
            const itemIndex = itemList.findIndex(item => item === todoItem);
            if (itemIndex === undefined) {
                return false;
            }

            section.items = itemList.slice(0, itemIndex).concat(itemList.slice(itemIndex + 1));
        }

        return true;
    };

    const deleteSection = (projectName, sectionName) => {
        const project = todoObject.findProject(projectName);

        if (project === undefined) {
            return false;
        }

        const sectionIndex = project.sections.findIndex(section => section.name === sectionName);

        if (sectionIndex === undefined) {
            return false;
        }

        project.sections = project.sections.slice(0, sectionIndex).concat(project.sections.slice(sectionIndex + 1));

        return true;
    };

    const deleteProject = projectName => {
        const projectIndex = todoObject.projects.findIndex(project => project.name === projectName);
        if (projectIndex === undefined) {
            return false;
        }

        todoObject.projects = todoObject.projects.slice(0, projectIndex).concat(todoObject.projects.slice(projectIndex + 1));

        return true;
    };

    return { getTodoObject, addProject, addSection, addTodoItem, deleteTodoItem, deleteSection, deleteProject };
})();

/* harmony default export */ const todo_manager = (todoManager);
// EXTERNAL MODULE: ./node_modules/date-fns/esm/format/index.js + 4 modules
var format = __webpack_require__(546);
// EXTERNAL MODULE: ./node_modules/date-fns/esm/isValid/index.js + 1 modules
var isValid = __webpack_require__(599);
// EXTERNAL MODULE: ./node_modules/date-fns/esm/isToday/index.js + 2 modules
var isToday = __webpack_require__(767);
// EXTERNAL MODULE: ./node_modules/date-fns/esm/isFuture/index.js
var isFuture = __webpack_require__(644);
// EXTERNAL MODULE: ./node_modules/date-fns/esm/isThisWeek/index.js + 2 modules
var isThisWeek = __webpack_require__(694);
;// CONCATENATED MODULE: ./src/svg-manager.js
const SVGObject = {
    edit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>pencil-outline</title><path d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z" /></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>information-outline</title><path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" /></svg>',
    delete: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>delete-outline</title><path d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z" /></svg>',
    add: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>plus</title><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>',
    arrowUp: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>chevron-right</title><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" /></svg>',
    arrowDown: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>chevron-down</title><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" /></svg>',
    project: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>format-list-checks</title><path d="M3,5H9V11H3V5M5,7V9H7V7H5M11,7H21V9H11V7M11,15H21V17H11V15M5,20L1.5,16.5L2.91,15.09L5,17.17L9.59,12.59L11,14L5,20Z" /></svg>',
    close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>window-close</title><path d="M13.46,12L19,17.54V19H17.54L12,13.46L6.46,19H5V17.54L10.54,12L5,6.46V5H6.46L12,10.54L17.54,5H19V6.46L13.46,12Z" /></svg>',
};

/* harmony default export */ const svg_manager = (SVGObject);
;// CONCATENATED MODULE: ./src/ui-manager.js




const main = document.querySelector('main');

const todoObject = todo_manager.getTodoObject();

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
    return (0,format/* default */.Z)(date, 'd MMM');
}

function clearPage() {
    main.innerHTML = '';
    domAssociatorObject.reset();
}

function createProjectButton(project) {
    const projectButton = createElementWithClass('sidebar-item project', 'button');
    projectButton.id = `project-${project.name}`;
    projectButton.dataset.name = project.name;
    projectButton.innerHTML = svg_manager.project + project.name;

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
            editButton.innerHTML = svg_manager.edit + 'Edit Project';
            buttons.appendChild(editButton);
        }

        const addSection = createElementWithClass('project-add-section', 'button');
        addSection.innerHTML = svg_manager.add + 'Add Section';

        buttons.appendChild(addSection);

        if (!isInbox) {
            const deleteProject = createElementWithClass('project-delete', 'button');
            deleteProject.innerHTML = svg_manager.delete + 'Delete Project';
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

    if ((0,isValid/* default */.Z)(item.dueDate) && !(0,isToday/* default */.Z)(item.dueDate) && !(0,isFuture/* default */.Z)(item.dueDate)) {
        date.classList.add('expired');
    }

    const priorityDiv = createElementWithClass('todo-priority');
    switch(item.priority) {
        case 'low':
            priorityDiv.classList.add('low');
            priorityDiv.textContent = 'Low';
            break;
        case 'medium':
            priorityDiv.classList.add('mid');
            priorityDiv.textContent = 'Medium';
            break;
        case 'high':
            priorityDiv.classList.add('high');
            priorityDiv.textContent = 'High';
            break;
    }

    const buttons = createElementWithClass('todo-buttons');

    const editButton = createElementWithClass('icon-button todo-edit', 'button');
    editButton.innerHTML = svg_manager.edit;

    const deleteButton = createElementWithClass('icon-button todo-delete', 'button');
    deleteButton.innerHTML = svg_manager.delete;

    buttons.appendChild(editButton);
    buttons.appendChild(deleteButton);

    itemDiv.appendChild(checkboxContainer);
    itemDiv.appendChild(title);
    itemDiv.appendChild(desc);
    itemDiv.appendChild(date);
    itemDiv.appendChild(priorityDiv);
    itemDiv.appendChild(buttons);

    return itemDiv;
}

function createTodoButton() {
    const buttonContainer = createElementWithClass('add-todo-button');

    const button = createElementWithClass('add-todo', 'button');
    button.innerHTML = svg_manager.add + 'Add Task';

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
    collapseSection.innerHTML = svg_manager.arrowDown;

    const sectionName = createElementWithClass('section-name', 'span');
    sectionName.textContent = section.name;

    const deleteSection = createElementWithClass('delete-section', 'button');
    deleteSection.innerHTML = svg_manager.delete;

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

    const getItem = itemIndex => assArray[itemIndex];
    const getIndex = todoItem => assArray.findIndex(item => item === todoItem);

    // Reset the associator when we change pages
    const reset = () => {
        index = 0;
        assArray = [];
    };

    // Add object to keep track of it
    const addObj = (todoItem) => {
        assArray.push(todoItem);

        return index++;
    };

    // Remove object from tracking
    const removeObj = indexToRemove => {
        assArray[indexToRemove] = undefined;
    };

    return { getAssArray, getItem, getIndex, reset, addObj, removeObj }
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
                    if (unlistedItem.dueDate !== null && unlistedItem.status === false && ((0,isToday/* default */.Z)(unlistedItem.dueDate) || (0,format/* default */.Z)(new Date(), 'yyyy-MM-dd') === (0,format/* default */.Z)(unlistedItem.dueDate, 'yyyy-MM-dd'))) {
                        itemList.appendChild(createItemElement(unlistedItem));
                    }
                }
                for (const section of project.sections) {
                    for (const item of section.items) {
                        if (item.dueDate !== null && item.status === false && ((0,isToday/* default */.Z)(item.dueDate) || (0,format/* default */.Z)(new Date(), 'yyyy-MM-dd') === (0,format/* default */.Z)(item.dueDate, 'yyyy-MM-dd'))) {
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
                    if (unlistedItem.dueDate !== null && unlistedItem.status === false && (0,isThisWeek/* default */.Z)(unlistedItem.dueDate, { weekStartsOn: 0 }) && (0,isFuture/* default */.Z)(unlistedItem.dueDate)) {
                        itemList.appendChild(createItemElement(unlistedItem));
                    }
                }
                for (const section of project.sections) {
                    for (const item of section.items) {
                        if (item.dueDate !== null && item.status === false && (0,isThisWeek/* default */.Z)(item.dueDate, { weekStartsOn: 0 }) && (0,isFuture/* default */.Z)(item.dueDate)) {
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
        closeButton.innerHTML = svg_manager.close;

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

        date.min = (0,format/* default */.Z)(new Date(), 'yyyy-MM-dd');

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

            date.value = todoItem.dueDate === null ? '' : (0,format/* default */.Z)(todoItem.dueDate, 'yyyy-MM-dd');
            if (date.value !== '' && !(0,isFuture/* default */.Z)(todoItem.dueDate)) {
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

        popupBody.innerHTML = svg_manager.info;

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
    };

    const editItem = (previousItemDiv, todoItem) => {
        const newDiv = createItemElement(todoItem);

        const parent = previousItemDiv.parentNode;

        parent.insertBefore(newDiv, previousItemDiv.nextElementSibling);

        parent.removeChild(previousItemDiv);
    };

    const remove = element => {
        element.parentNode.removeChild(element);
    };

    return { addItem, addSection, addProject, editItem, remove };
})();

const collapseSection = sectionDiv => {
    if (sectionDiv.id === 'unlisted') {
        return;
    }

    const collapseButton = sectionDiv.querySelector('button.collapse-section');

    if (sectionDiv.classList.contains('collapsed')) {
        sectionDiv.classList.remove('collapsed');
        collapseButton.innerHTML = svg_manager.arrowDown;
    } else {
        sectionDiv.classList.add('collapsed');
        collapseButton.innerHTML = svg_manager.arrowUp;
    }
};

const ui_manager_alertManager = (function() {
    const cornerPopupContainer = document.querySelector('.corner-popup-container');

    function createAlertElement(message) {
        const alert = createElementWithClass('corner-popup');
        alert.innerHTML = svg_manager.info;
        alert.appendChild(document.createTextNode(message));

        const closeButton = createElementWithClass('close-alert', 'button');
        closeButton.innerHTML = svg_manager.close;

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


;// CONCATENATED MODULE: ./src/cookie-manager.js

const cookie_manager_todoObject = todo_manager.getTodoObject();

if (!localStorage.getItem('projects')) {
    populateLocalStorage();
} else {
    fillTodoObject();
}

function populateLocalStorage() {
    // This fills the todoManager object with demo projects, assignments and todos
    createDemoTodoObject();

    // we fill up the array with everything except the methods
    let projects = [];
    for (const project of cookie_manager_todoObject.projects) {
        const unlistedItems = [];
        for (const item of project.unlistedItems) {
            unlistedItems.push(item);
        }

        const sections = [];
        for (const section of project.sections) {
            const itemList = [];
            for (const item of section.items) {
                itemList.push(item);
            }

            sections.push({
                name: section.name,
                items: itemList,
            });
        }

        projects.push({
            name: project.name,
            unlistedItems,
            sections
        });
    }

    setLocal(projects);
}

function fillTodoObject() {
    const projects = [];
    const projectsArrayFromLocal = JSON.parse(localStorage.getItem('projects'));

    if (!(projectsArrayFromLocal[0].name === 'default' && projectsArrayFromLocal[0].hasOwnProperty('unlistedItems') && projectsArrayFromLocal[0].hasOwnProperty('sections'))) {
        populateLocalStorage();
    }

    for (const project of projectsArrayFromLocal) {
        for (const item of project.unlistedItems) {
            item.dueDate = item.dueDate === null ? null : new Date(item.dueDate);
            Object.assign(item, { update: updateTodoItem });
        }

        for (const section of project.sections) {
            for (const item of section.items) {
                item.dueDate = item.dueDate === null ? null : new Date(item.dueDate);
                Object.assign(item, { update: updateTodoItem });
            }
        }

        Object.assign(project, { findSection: findSection, update: updateProject });
    }

    cookie_manager_todoObject.projects = projectsArrayFromLocal;
}

function createDemoTodoObject() {
    (todo_manager.addTodoItem('laundry', undefined, new Date('2023-11-17'), 'medium')).update(...Array(4), true);
    (todo_manager.addTodoItem('leg day', 'just go', new Date('2023-11-18'), 'low')).update(...Array(4), true);
    todo_manager.addTodoItem('brush teeth');

    todo_manager.addSection('weekly shopping');
    todo_manager.addTodoItem('buy new shoes', 'must', new Date('2023-11-25'), 'high', 'default', 'weekly shopping');
    todo_manager.addTodoItem('buy food', 'also must', new Date('2023-11-25'), 'high', 'default', 'weekly shopping');

    todo_manager.addProject('Home', 'Small stuff I just gotta do');

    todo_manager.addTodoItem('clean the living room', 'haven\'t done this in a while', new Date('2023-11-26'), 'medium', 'Home');
    (todo_manager.addTodoItem('water the plants', 'when free', undefined, 'high', 'Home')).update(...Array(4), true);

    todo_manager.addProject('Study', 'Gotta finish these before vacation');
    todo_manager.addSection('homework', 'Study');
    todo_manager.addSection('exams', 'Study');

    todo_manager.addTodoItem('math exercise 3.2', 'finish before monday', new Date('2023-11-20'), 'low', 'Study', 'homework');
    todo_manager.addTodoItem('biology-2 pg: 201-227', 'revise for test', new Date('2023-11-21'), 'medium', 'Study', 'homework');

    todo_manager.addTodoItem('physics-1', 'on chapter 4', new Date('2023-11-19'), 'high', 'Study', 'exams');
    todo_manager.addTodoItem('biology-2', 'on chapter 3', new Date('2023-11-22'), 'high', 'Study', 'exams')


    todo_manager.addProject('Work', 'When does vacation start');

    (todo_manager.addTodoItem('play cod with the bois', 'i dont work :D', undefined, 'high', 'Work')).update(...Array(4), true);
}

function saveProject(newProject) {
    const projectCopy = Object.assign({}, newProject);

    delete projectCopy.findSection;
    delete projectCopy.update;

    const projectsArray = getProjectsArray();

    projectsArray.push(projectCopy);

    setLocal(projectsArray);
}

function editProject(oldName, project) {
    const projectsArray = getProjectsArray()

    const foundProject = projectsArray.find(localProject => localProject.name === oldName);

    foundProject.name = project.name;
    foundProject.description = project.description;

    setLocal(projectsArray);
}

function deleteProject(projectName) {
    let projectsArray = getProjectsArray();

    const projectIndex = projectsArray.findIndex(localProject => localProject.name === projectName);

    projectsArray = projectsArray.slice(0, projectIndex).concat(projectsArray.slice(projectIndex + 1));

    setLocal(projectsArray);
}

function saveSection(projectName, newSection) {
    const sectionCopy = Object.assign({}, newSection);

    const projectsArray = getProjectsArray()

    const project = projectsArray.find(localProject => localProject.name === projectName);

    project.sections.push(sectionCopy);

    setLocal(projectsArray);
}

function deleteSection(projectName, sectionName) {
    const projectsArray = getProjectsArray();

    const project = projectsArray.find(localProject => localProject.name === projectName);

    const sectionIndex = project.sections.findIndex(localSection => localSection.name === sectionName);

    project.sections = project.sections.slice(0, sectionIndex).concat(project.sections.slice(sectionIndex + 1));

    setLocal(projectsArray);
}

function saveTodo(todoItem) {
    const todoItemCopy = Object.assign({}, todoItem);
    delete todoItemCopy.update;

    const projectsArray = getProjectsArray();

    const project = projectsArray.find(localProject => localProject.name === todoItem.projectName);

    if (todoItem.sectionName === null) {
        project.unlistedItems.push(todoItem);
    } else {
        const section = project.sections.find(localSection => localSection.name === todoItem.sectionName);
        section.items.push(todoItem);
    }

    setLocal(projectsArray);
}

// Change the whole item list, because otherwise we won't be able to allow users to have duplicate todos
function changeTodoList(projectName, sectionName) {
    const projectsArray = getProjectsArray();

    const projectInMemory = cookie_manager_todoObject.findProject(projectName);

    const project = projectsArray.find(localProject => localProject.name === projectName);

    if (sectionName === null) {
        project.unlistedItems = projectInMemory.unlistedItems;
    } else {
        const sectionInMemory = projectInMemory.findSection(sectionName);
        
        const section = project.sections.find(localSection => localSection.name === sectionName);

        section.items = sectionInMemory.items;
    }

    setLocal(projectsArray);
}

function getProjectsArray() {
    return JSON.parse(localStorage.getItem('projects'));
}

function setLocal(projectsArray) {
    localStorage.setItem('projects', JSON.stringify(projectsArray));
}


// EXTERNAL MODULE: ./node_modules/date-fns/esm/parse/index.js + 57 modules
var parse = __webpack_require__(111);
;// CONCATENATED MODULE: ./src/main.js






pageLoader.defaultLoader();

// Set up event listeners; all functions of this module called here are written down below
const eventListenersObject = (function() {
    const todoObject = todo_manager.getTodoObject();

    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('main');

    function setUpSidebar () {
        sidebar.addEventListener('click', event => {
            const target = event.target;

            const page = pageLoader.defaultPages.find(page => page.id === target.id);
            if (page !== undefined) {
                page.switchTo();
                return;
            }

            if (target.classList.contains('project')) {
                const projectName = target.dataset.name;

                if (target.id !== `project-${projectName}`) {
                    return;
                }

                const project = todoObject.findProject(projectName);

                if (project === undefined) {
                    return;
                }

                pageLoader.projectPageLoader(project);
                return;
            } else if (target.id === 'add-project-button') {
                // Open and manage popup modal for *adding projects*
                managePopupModal('add', target, 'project');
            }
        });
    };

    function setUpMain() {
        const itemType = 'item', sectionType = 'section', projectType = 'project';
        main.addEventListener('click', event => {
            const target = event.target;

            /*
                Note that, the project currently supports the following actions:
                    1. To-do Items: CRUD,
                    2. Sections: CRD,
                    3. Projects: CRUD;
            */
            if (target.classList.contains('todo-item') || target.classList.contains('todo-edit')) {
                // Open and manage popup modal for *editing items*
                managePopupModal('edit', target, itemType);
            } else if (target.classList.contains('add-todo')) {
                // Open and manage popup modal for *adding items*
                managePopupModal('add', target, itemType);
            } else if (target.classList.contains('todo-delete')) {
                // Open and manage popup modal for *deleting items*
                manageConfirmationModel(target, itemType);

            } else if (target.classList.contains('project-add-section')) {
                // Open and manage popup modal for *adding sections*
                managePopupModal('add', target, sectionType);
            } else if (target.classList.contains('delete-section')) {
                // Open and manage popup modal for *deleting sections*
                manageConfirmationModel(target, sectionType);

            } else if (target.classList.contains('project-edit')) {
                // Open and manage popup modal for *editing projects*
                managePopupModal('edit', target, projectType);
            } else if (target.classList.contains('project-delete')) {
                // Open and manage popup modal for *deleting projects*
                manageConfirmationModel(target, projectType);
            }

            // update status via checkbox
            else if (target.classList.contains('todo-checkbox')) {
                const todoElement = target.parentNode.parentNode;

                const todoIndex = todoElement.dataset.index;

                if (!todoIndex) {
                    createDOMMessAlert();
                    return;
                }

                const todoItem = domAssociatorObject.getItem(todoIndex);

                if (!todoItem) {
                    createDOMMessAlert();
                    return;
                }

                todoItem.update(...Array(4), target.checked);
                changeTodoList(todoItem.projectName, todoItem.sectionName);
            }

            // collapse section
            else if (target.classList.contains('collapse-section')) {
                const section = target.parentNode.parentNode;
                collapseSection(section);
            }
        });
    };

    const setUp = () => {
        setUpSidebar();
        setUpMain();
    };

    return { setUp };
})();

function createDOMMessAlert() {
    createErrorAlert('Messed with the DOM, have you?');
}

function createSuccessAlert(message) {
    const alert = alertManager.success(message);
    manageAlert(alert);
}

function createErrorAlert(message) {
    const alert = ui_manager_alertManager.error(message);
    manageAlert(alert);
}

function manageAlert(alert) {
    const timeOut = setTimeout(() => {
        alert.parentNode.removeChild(alert);
    }, 3000);

    alert.querySelector('button.close-alert').addEventListener('click', () => {
        clearTimeout(timeOut);
        alert.parentNode.removeChild(alert);
    });
}

// Load popup modal and add event listeners to it
function managePopupModal(mode = 'edit', targetElement, targetType = 'item') {
    let selectedTodoElement, selectedTodoItem, section, projectName, project;

    if (mode === 'edit' && targetType === 'item') {
        [selectedTodoElement, selectedTodoItem] = manageEditItemModalLoad(targetElement);
    } else if (mode === 'add' && targetType === 'item') {
        [section, projectName] = manageAddItemModalLoad(targetElement);
    } else if (mode === 'add' && targetType === 'section') {
        projectName = manageAddSectionModalLoad();
    } else if (mode === 'add' && targetType === 'project') {
        manageAddProjectModalLoad();
    } else if (mode === 'edit' && targetType === 'project') {
        project = manageEditProjectModalLoad();

        if (project === false) {
            createDOMMessAlert();
            return;
        }
    }

    const dialog = document.querySelector('.dialog');
    const popupForm = document.querySelector('.dialog form');

    dialog.parentNode.addEventListener('click', () => modalManager.closeModal());

    dialog.addEventListener('click', event => {
        event.stopPropagation();
        const target = event.target;
        if (targetType === 'item' && target.classList.contains('priority-button')) {
            modalManager.switchPriority(target.dataset.priority);
        } else if (target.id === 'close-popup-modal') {
            modalManager.closeModal();
        }
    });

    popupForm.addEventListener('submit', event => {
        event.preventDefault();

        if (!checkModalForm()) {
            createErrorAlert('Please fill up the form properly!');
            return;
        }

        let title = popupForm.querySelector('#edit-title').value;

        let description, dueDate, priority;
        if (targetType !== 'section') {
            description = popupForm.querySelector('#edit-desc').value;

            if (targetType === 'item') {
                dueDate = popupForm.querySelector('#edit-todo-date').value;
                priority = popupForm.querySelector('.priority-button.selected').dataset.priority;
                priority = ['low', 'medium', 'high'].includes(priority) ? priority : 'low';
            }
        }

        if (mode === 'edit' && targetType === 'item') {
            const status = popupForm.querySelector('#edit-todo-checkbox').checked;
            selectedTodoItem.update(title, description, processDate(dueDate), priority, status);

            changeTodoList(selectedTodoItem.projectName, selectedTodoItem.sectionName);
            DOMAdderRemover.editItem(selectedTodoElement, selectedTodoItem);
            modalManager.closeModal();

        } else if (mode === 'add' && targetType === 'item') {
            const sectionName = section.dataset.name;

            const newTodoItem = todo_manager.addTodoItem(title, description, processDate(dueDate), priority, projectName, sectionName);

            saveTodo(newTodoItem);
            DOMAdderRemover.addItem(section, newTodoItem);
            modalManager.closeModal();
        } else if (mode === 'add' && targetType === 'section') {
            const newSection = todo_manager.addSection(title, projectName);

            // Check sectionName for doubles
            if (newSection === false) {
                createErrorAlert('A section by this name already exists!');
                return;
            }

            saveSection(projectName, newSection);
            DOMAdderRemover.addSection(newSection);
            modalManager.closeModal();
        } else if (mode === 'add' && targetType === 'project') {
            const newProject = todo_manager.addProject(title, description);

            if (newProject === false) {
                createErrorAlert('A project by this name already exists!');
                return;
            }

            saveProject(newProject);
            DOMAdderRemover.addProject(newProject);
            modalManager.closeModal();
        } else if (mode === 'edit' && targetType === 'project') {
            const oldName = project.name;

            const success = project.update(title, description);

            if (success === false) {
                createErrorAlert('A project by this name already exists!');
                return;
            }

            editProject(oldName, project);
            pageLoader.loadSideBar();
            pageLoader.projectPageLoader(project);
            modalManager.closeModal();
        }
    });
}

function manageEditItemModalLoad(target) {
    const todoObject = todo_manager.getTodoObject();

    let todoElement;

    if (target.classList.contains('todo-item')) {
        todoElement = target;
    } else {
        // The first parent is the buttons div, the second is the todo element
        todoElement = target.parentNode.parentNode;
    }

    const itemIndex = todoElement.dataset.index;

    if (itemIndex === undefined) {
        return;
    }

    const todoItem = domAssociatorObject.getItem(itemIndex);

    const section = todoElement.parentNode.parentNode;

    let [projectName, sectionName] = getProjectAndSectionName(todoItem);
    if (projectName === 'default') {
        projectName = 'Inbox';
    }

    modalManager.loadEditItemModal(projectName, sectionName, todoItem);
    return [todoElement, todoItem];
}

function manageAddItemModalLoad(target) {
    // First parent is button div, second is item list container and the third is the section div
    const section = target.parentNode.parentNode.parentNode;

    const projectName = getProjectName();

    modalManager.loadAddItemModal(projectName === 'default' ? 'Inbox' : projectName, section.dataset.name);

    return [section, projectName];
}

function manageAddSectionModalLoad() {
    // First parent is button div, second is item list container and the third is the section div
    const projectName = getProjectName();

    modalManager.loadAddSectionModal(projectName !== 'default' ? projectName : 'Inbox');

    return projectName;
}

function manageAddProjectModalLoad() {
    modalManager.loadAddProjectModal();
}

function manageEditProjectModalLoad() {
    const projectName = getProjectName();
    const project = todo_manager.getTodoObject().findProject(projectName);

    if (project === undefined) {
        return false;
    }

    modalManager.loadEditProjectModal(project);
    return project;
}

function manageConfirmationModel(target, targetType) {
    const page = pageLoader.getCurrentPage();
    let todoItem, todoElement, sectionName, section, projectName;

    if (targetType === 'item') {
        // The target is the delete button whose first parent is the buttons div, the second is the todo element
        todoElement = target.parentNode.parentNode;

        if (todoElement.dataset.index === undefined) {
            createDOMMessAlert();
            return;
        }

        todoItem = domAssociatorObject.getItem(todoElement.dataset.index);

        modalManager.loadConfirmationModal('To-Do', todoItem.title);
    } else if (targetType === 'section') {
        if (page === 'inbox') {
            projectName = 'default';
        } else {
            projectName = page.slice('project-'.length);
        }

        // First parent is header div, second is second element
        section = target.parentNode.parentNode;
        if (section.id === 'unlisted') {
            window.location.reload();
        }

        sectionName = section.dataset.name;

        // null section is the unlisted items which cannot be deleted;
        if (projectName === undefined || sectionName === undefined || sectionName === null) {
            createDOMMessAlert();
            return;
        }

        modalManager.loadConfirmationModal('Section', sectionName);
    } else if (targetType === 'project') {
        if (page === 'inbox') {
            createDOMMessAlert();
            return;
        }

        projectName = page.slice('project-'.length);

        modalManager.loadConfirmationModal('Project', projectName);
    }

    const dialog = document.querySelector('.dialog');

    dialog.addEventListener('click', event => {
        const target = event.target;

        if (target.id === 'close-popup-modal' || target.id === 'confirm-no') {
            modalManager.closeModal();
        } else if (target.id === 'confirm-yes') {
            if (targetType === 'item') {
                const success = todo_manager.deleteTodoItem(todoItem);

                if (success === false) {
                    createErrorAlert('Could not delete item!');
                    return;
                }

                changeTodoList(todoItem.projectName, todoItem.sectionName);
                DOMAdderRemover.remove(todoElement);
                modalManager.closeModal();
            } else if (targetType === 'section') {
                const success = todo_manager.deleteSection(projectName, sectionName);

                if (success === false) {
                    createErrorAlert('Could not delete section!');
                    return;
                }

                deleteSection(projectName, sectionName);
                DOMAdderRemover.remove(section);
                modalManager.closeModal();
            } else if (targetType === 'project') {
                const success = todo_manager.deleteProject(projectName);

                if (success === false) {
                    createErrorAlert('Could not delete project');
                    return;
                }

                deleteProject(projectName);
                modalManager.closeModal();
                pageLoader.defaultLoader();
            }
        }
    });
}

// Does a light check to see if one of the priority buttons are selected or not, since they are required and are not native HTML input elements
// The only other required field is the title, which is checked automatically due to the required attribute
function checkModalForm() {
    if (document.querySelector('.popup.overlay') === undefined || document.querySelector('.priority-button.selected') === undefined) {
        return false;
    }

    return true;
}

function processDate(date) {
    if (date === undefined || date === null || date === '' || date === 'none') {
        return null;
    }

    // Check for validity
    const parsedDate = (0,parse/* default */.Z)(date, 'yyyy-MM-dd', new Date());

    if (!(0,isValid/* default */.Z)(parsedDate)) {
        return null;
    }

    // Store it as a date object
    return new Date(date);
}

function getProjectName() {
    const pageName = pageLoader.getCurrentPage();

    let projectName;
    if (pageName.startsWith('project-')) {
        projectName = pageName.slice('project-'.length);
    } else {
        projectName = 'default';
    }

    return projectName;
}

function getProjectAndSectionName(todoItem) {
    return [todoItem.projectName, todoItem.sectionName];
}

eventListenersObject.setUp();

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ __webpack_require__.O(0, [115], () => (__webpack_exec__(54)));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);