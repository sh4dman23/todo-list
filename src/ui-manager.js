import todoManager from "./todo-manager.js";
import { format, isToday, isThisWeek, isFuture } from "date-fns";
import SVGObject from "./svg-manager.js";

const main = document.querySelector('main');

const todoObject = todoManager.getTodoObject();

function createElementWithClass(classProperty = '', tag = 'div') {
    const element = document.createElement(tag);
    element.setAttribute('class', classProperty);
    return element;
}

function dateFormatter(date) {
    return format(date, 'd MMM');
}

function clearPage() {
    main.innerHTML = '';
    domAssociatorObject.reset();
}

function createSimpleTopBar(title) {
    const topBar = createElementWithClass('pg-top-section');

    const topBarHeader = createElementWithClass('', 'h1');
    topBarHeader.textContent = title;
    topBar.appendChild(topBarHeader);

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

    const infoButton = createElementWithClass('icon-button todo-info', 'button');
    infoButton.innerHTML = SVGObject.info;

    const deleteButton = createElementWithClass('icon-button todo-delete', 'button');
    deleteButton.innerHTML = SVGObject.delete;

    buttons.appendChild(editButton);
    buttons.appendChild(infoButton);
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
    button.innerHTML = SVGObject.addTodo + 'Add Task';

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
}

/*
    This object keeps track of dom todo items
*/

const domAssociatorObject = (function() {
    // Keep track of dom object
    let index = 0;

    let assArray = [];
    const getAssArray = () => assArray;

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

    return { getAssArray, reset, addObj, removeObj }
})();


/*
    The following objects are responsible for loading pages
*/

const inboxPage = {
    id: 'inbox',
    switchTo() {
        clearPage();

        const page = createElementWithClass('page');
        page.dataset.page = 'inbox';

        page.appendChild(createSimpleTopBar('Inbox'));

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

        page.appendChild(createSimpleTopBar('Today'));

        const itemList = createElementWithClass('todo-items');

        for (const project of todoObject.projects) {
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

        page.appendChild(createSimpleTopBar('Week'));

        const itemList = createElementWithClass('todo-items');

        for (const project of todoObject.projects) {
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

const sidebarLoader = () => {
    const projectsList = document.querySelector('.sidebar-list.project-list');
    projectsList.innerHTML = '';

    for (const project of todoObject.projects) {
        if (project.name === 'default') {
            continue;
        }

        const projectButton = createElementWithClass('sidebar-item project', 'button');
        projectButton.id = `project-${project.name}`;
        projectButton.dataset.name = project.name;
        projectButton.innerHTML = SVGObject.project + project.name;

        projectsList.appendChild(projectButton);
    }
};

const defaultLoader = () => {
    // Loads the elements on the sidebar
    sidebarLoader();

    // Loads the inbox page by default
    inboxPage.switchTo();
};

export { domAssociatorObject, inboxPage, todayPage, weekPage, sidebarLoader, defaultLoader };