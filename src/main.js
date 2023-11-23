import './assets/style.css';

import todoManager from './todo-manager.js';

import * as pageLoader from './ui/page-loader.js';
import * as modalManager from './ui/modal-manager.js';
import * as DOMAdderRemover from './ui/dom-adder-remover.js';
import * as alertManager from './ui/alert-manager.js';
import { collapseSection } from './ui/common.js';

import * as cookieManager from './cookie-manager.js';
import { parse, isValid } from 'date-fns';

pageLoader.defaultLoader();

// Set up event listeners; all functions of this module called here are written down below
const eventListenersObject = (function () {
    const todoObject = todoManager.getTodoObject();

    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('main');

    function setUpSidebar() {
        sidebar.addEventListener('click', (event) => {
            const target = event.target;

            const page = pageLoader.defaultPages.find(
                (page) => page.id === target.id,
            );
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
    }

    function setUpMain() {
        const itemType = 'item',
            sectionType = 'section',
            projectType = 'project';
        main.addEventListener('click', (event) => {
            const target = event.target;

            /*
                Note that, the project currently supports the following actions:
                    1. To-do Items: CRUD,
                    2. Sections: CRD,
                    3. Projects: CRUD;
            */
            if (
                target.classList.contains('todo-item') ||
                target.classList.contains('todo-edit')
            ) {
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

                let [projectName, itemUid] = [
                    todoElement.dataset.pr,
                    todoElement.dataset.uid,
                ];

                const todoItem = todoManager.getItem(projectName, itemUid);

                if (!todoItem) {
                    event.preventDefault();
                    createDOMMessAlert();
                    return;
                }

                todoItem.update(...Array(4), target.checked);
                cookieManager.editTodo(todoItem);
            }

            // collapse section
            else if (target.classList.contains('collapse-section')) {
                const section = target.parentNode.parentNode;
                collapseSection(section);
            }
        });
    }

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
    const alert = alertManager.error(message);
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
        [selectedTodoElement, selectedTodoItem] =
            manageEditItemModalLoad(targetElement);

        if (!selectedTodoElement || !selectedTodoItem) return;
    } else if (mode === 'add' && targetType === 'item') {
        [section, projectName] = manageAddItemModalLoad(targetElement);

        if (!section || !projectName) return;
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

    dialog.parentNode.addEventListener('click', () =>
        modalManager.closeModal(),
    );

    dialog.addEventListener('click', (event) => {
        event.stopPropagation();
        const target = event.target;
        if (
            targetType === 'item' &&
            target.classList.contains('priority-button')
        ) {
            modalManager.switchPriority(target.dataset.priority);
        } else if (target.id === 'close-popup-modal') {
            modalManager.closeModal();
        }
    });

    popupForm.addEventListener('submit', (event) => {
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
                priority = popupForm.querySelector('.priority-button.selected')
                    .dataset.priority;
                priority = ['low', 'medium', 'high'].includes(priority)
                    ? priority
                    : 'low';
            }
        }

        if (mode === 'edit' && targetType === 'item') {
            const status = popupForm.querySelector(
                '#edit-todo-checkbox',
            ).checked;
            selectedTodoItem.update(
                title,
                description,
                processDate(dueDate),
                priority,
                status,
            );

            cookieManager.editTodo(selectedTodoItem);
            DOMAdderRemover.editItem(selectedTodoElement, selectedTodoItem);
            modalManager.closeModal();
        } else if (mode === 'add' && targetType === 'item') {
            const sectionName = section.dataset.name;

            const newTodoItem = todoManager.addTodoItem(
                title,
                description,
                processDate(dueDate),
                priority,
                projectName,
                sectionName,
            );

            cookieManager.saveTodo(newTodoItem);
            DOMAdderRemover.addItem(section, newTodoItem);
            modalManager.closeModal();
        } else if (mode === 'add' && targetType === 'section') {
            const newSection = todoManager.addSection(title, projectName);

            // Check sectionName for doubles
            if (newSection === false) {
                createErrorAlert('A section by this name already exists!');
                return;
            }

            cookieManager.saveSection(projectName, newSection);
            DOMAdderRemover.addSection(newSection);
            modalManager.closeModal();
        } else if (mode === 'add' && targetType === 'project') {
            const newProject = todoManager.addProject(title, description);

            if (newProject === false) {
                createErrorAlert('A project by this name already exists!');
                return;
            }

            cookieManager.saveProject(newProject);
            DOMAdderRemover.addProject(newProject);
            modalManager.closeModal();
        } else if (mode === 'edit' && targetType === 'project') {
            const oldName = project.name;

            const success = project.update(title, description);

            if (success === false) {
                createErrorAlert('A project by this name already exists!');
                return;
            }

            cookieManager.editProject(oldName, project);
            pageLoader.loadSideBar();
            pageLoader.projectPageLoader(project);
            modalManager.closeModal();
        }
    });
}

function manageEditItemModalLoad(target) {
    let todoElement;

    if (target.classList.contains('todo-item')) {
        todoElement = target;
    } else {
        // The first parent is the buttons div, the second is the todo element
        todoElement = target.parentNode.parentNode;
    }

    let [projectName, itemUid] = [
        todoElement.dataset.pr,
        todoElement.dataset.uid,
    ];

    const todoItem = todoManager.getItem(projectName, itemUid);

    if (!todoItem) {
        createDOMMessAlert();
        return [undefined, undefined];
    }

    if (projectName === 'default') {
        projectName = 'Inbox';
    }

    modalManager.loadEditItemModal(todoItem);
    return [todoElement, todoItem];
}

function manageAddItemModalLoad(target) {
    // First parent is button div, second is item list container and the third is the section div
    const section = target.parentNode.parentNode.parentNode;

    const projectName = getProjectName();

    modalManager.loadAddItemModal(
        projectName === 'default' ? 'Inbox' : projectName,
        section.dataset.name,
    );

    return [section, projectName];
}

function manageAddSectionModalLoad() {
    // First parent is button div, second is item list container and the third is the section div
    const projectName = getProjectName();

    modalManager.loadAddSectionModal(
        projectName !== 'default' ? projectName : 'Inbox',
    );

    return projectName;
}

function manageAddProjectModalLoad() {
    modalManager.loadAddProjectModal();
}

function manageEditProjectModalLoad() {
    const projectName = getProjectName();
    const project = todoManager.getTodoObject().findProject(projectName);

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

        let [projectName, itemUid] = [
            todoElement.dataset.pr,
            todoElement.dataset.uid,
        ];

        todoItem = todoManager.getItem(projectName, itemUid);

        if (!todoItem) {
            createDOMMessAlert();
            return;
        }

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
        if (
            projectName === undefined ||
            sectionName === undefined ||
            sectionName === null
        ) {
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

    dialog.addEventListener('click', (event) => {
        const target = event.target;

        if (target.id === 'close-popup-modal' || target.id === 'confirm-no') {
            modalManager.closeModal();
        } else if (target.id === 'confirm-yes') {
            if (targetType === 'item') {
                const success = todoManager.deleteTodoItem(todoItem);

                if (success === false) {
                    createErrorAlert('Could not delete item!');
                    return;
                }

                cookieManager.removeTodo(todoItem);
                DOMAdderRemover.remove(todoElement);
                modalManager.closeModal();
            } else if (targetType === 'section') {
                const success = todoManager.deleteSection(
                    projectName,
                    sectionName,
                );

                if (success === false) {
                    createErrorAlert('Could not delete section!');
                    return;
                }

                cookieManager.deleteSection(projectName, sectionName);
                DOMAdderRemover.remove(section);
                modalManager.closeModal();
            } else if (targetType === 'project') {
                const success = todoManager.deleteProject(projectName);

                if (success === false) {
                    createErrorAlert('Could not delete project');
                    return;
                }

                cookieManager.deleteProject(projectName);
                modalManager.closeModal();
                pageLoader.defaultLoader();
            }
        }
    });
}

// Does a light check to see if one of the priority buttons are selected or not, since they are required and are not native HTML input elements
// The only other required field is the title, which is checked automatically due to the required attribute
function checkModalForm() {
    if (
        document.querySelector('.popup.overlay') === undefined ||
        document.querySelector('.priority-button.selected') === undefined
    ) {
        return false;
    }

    return true;
}

function processDate(date) {
    if (date === undefined || date === null || date === '' || date === 'none') {
        return null;
    }

    // Check for validity
    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());

    if (!isValid(parsedDate)) {
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

eventListenersObject.setUp();
