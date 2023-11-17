import todoManager from "./todo-manager.js";
import { format } from "date-fns";
import SVGObject from "./svg-manager.js";

const main = document.querySelector('main');

const todoObject = todoManager.getTodoObject();

function createElementWithClass(class = '', tag = 'div') {
    const element = document.createElement(tag);
    element.class = class;
    return element;
}

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

function dateFormatter(date) {
    return format(date, 'dd-MM');
}

function clearPage() {
    main.innerHTML = '';
    domAssociatorObject.reset();
}

function createItemElement(item) {
    const itemDiv = createElementWithClass('todo-item');
    itemDiv.dataset.index = domAssociatorObject.addObj(item);

    const checkboxContainer = createElementWithClass('checkbox-container');

    const checkbox = createElementWithClass('todo-checkbox', 'input');
    checkbox.type = 'checkbox';
    checkboxContainer.appendChild(checkbox);

    const checkmark = createElementWithClass('checkmark', 'span');
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
    const button = createElementWithClass('add-todo', 'button');
    button.innerHTML = SVGObject.addTodo + 'Add Task';

    return button;
}

function createSectionElement(section) {
    const sectionDiv = createElementWithClass('section');
    sectionDiv.id = section.name.toLowerCase();

    const sectionHeader = createElementWithClass('section-header');

    const collapseSection = createElementWithClass('collapse-section', 'button');
    collapseButton.innerHTML = SVGObject.arrowDown;

    const sectionName = createElementWithClass('section-name', 'span');
    sectionName.textContent = section.name;

    const deleteSection = createElementWithClass('delete-section', 'button');
    deleteButton.innerHTML = SVGObject.delete;

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

export default function loadInbox() {
    clearPage();

    const page = createElementWithClass('page');
    page.id = 'inbox';

    const topBar = createElementWithClass('pg-top-section');

    const topBarHeader = createElementWithClass('', 'h1');
    topBarHeader.textContent = 'Inbox';
    topBar.appendChild(topBarHeader);

    page.appendChild(topBar);

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
}