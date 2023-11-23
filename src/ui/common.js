import SVGObject from './svg-manager.js';
import { format, isValid, isToday, isFuture } from 'date-fns';

function dateFormatter(date) {
    if (date === null) {
        return 'No Due Date';
    } else if (!(date instanceof Date)) {
        date = new Date(date);
    }
    return format(date, 'd MMM');
}

export default function createElementWithClass(
    classProperty = '',
    tag = 'div',
) {
    const element = document.createElement(tag);
    element.setAttribute('class', classProperty);
    return element;
}

export function createProjectButton(project) {
    const projectButton = createElementWithClass(
        'sidebar-item project',
        'button',
    );
    projectButton.id = `project-${project.name}`;
    projectButton.dataset.name = project.name;
    projectButton.innerHTML = SVGObject.project + project.name;

    return projectButton;
}

export function createItemElement(item) {
    const itemDiv = createElementWithClass('todo-item');

    itemDiv.dataset.uid = item.uid;
    itemDiv.dataset.pr = item.projectName;

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

    if (
        isValid(item.dueDate) &&
        !isToday(item.dueDate) &&
        !isFuture(item.dueDate)
    ) {
        date.classList.add('expired');
    }

    const priorityDiv = createElementWithClass('todo-priority');

    priorityDiv.classList.add(item.priority || 'low');
    priorityDiv.textContent =
        item.priority.charAt(0).toUpperCase() + item.priority.slice(1) || 'Low';

    const buttons = createElementWithClass('todo-buttons');

    const editButton = createElementWithClass(
        'icon-button todo-edit',
        'button',
    );
    editButton.innerHTML = SVGObject.edit;

    const deleteButton = createElementWithClass(
        'icon-button todo-delete',
        'button',
    );
    deleteButton.innerHTML = SVGObject.delete;

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

export function createTodoButton() {
    const buttonContainer = createElementWithClass('add-todo-button');

    const button = createElementWithClass('add-todo', 'button');
    button.innerHTML = SVGObject.add + 'Add Task';

    buttonContainer.appendChild(button);
    return buttonContainer;
}

export function createEmptyDiv(text) {
    const emptyDiv = createElementWithClass('empty');
    emptyDiv.textContent = text;
    return emptyDiv;
}

export function createSectionElement(section) {
    const sectionDiv = createElementWithClass('section');
    sectionDiv.dataset.name = section.name;

    const sectionHeader = createElementWithClass('section-header');

    const collapseSection = createElementWithClass(
        'collapse-section',
        'button',
    );
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

export function collapseSection(sectionDiv) {
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
}
