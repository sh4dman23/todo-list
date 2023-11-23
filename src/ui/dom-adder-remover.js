import {
    createItemElement,
    createSectionElement,
    createProjectButton,
} from './common.js';

const addItem = (sectionElement, todoItem) => {
    if (sectionElement === undefined) {
        return false;
    }

    const itemDiv = createItemElement(todoItem);

    const todoItemsList = sectionElement.querySelector('.todo-items');
    todoItemsList.insertBefore(itemDiv, todoItemsList.lastElementChild);
};

const addSection = (section) => {
    const page = document.querySelector('.page');

    const sectionDiv = createSectionElement(section);

    page.appendChild(sectionDiv);
};

const addProject = (project) => {
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

const remove = (element) => {
    element.parentNode.removeChild(element);
};

export { addItem, addSection, addProject, editItem, remove };
