import todoManager from "./todo-manager.js";
import { getCurrentPage, domAssociatorObject, inboxPage, todayPage, weekPage, projectPageLoader, defaultLoader,
        modalManager } from "./ui-manager.js";
import { parse, isValid } from 'date-fns';
import './assets/style.css';

window.todoManager = todoManager;

todoManager.addProject('Home', 'asjdhasdaosadsa');
todoManager.addProject('Study', 'lorem * 5');
todoManager.addProject('Work');

todoManager.addSection('homework');
const item = todoManager.addTodoItem('laundry', 'must do today', new Date('2023-11-17'), 'low', 'default', 'homework');
todoManager.addTodoItem('laundry22', 'must do today too', new Date('2023-11-18'), 'high', 'Home');

defaultLoader();

// Set up event listeners; all functions of this module called here are written down below
const eventListenersObject = (function() {
    const todoObject = todoManager.getTodoObject();

    const defaultPages = [inboxPage, todayPage, weekPage];

    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('main');

    function setUpSidebar () {
        sidebar.addEventListener('click', event => {
            const target = event.target;

            const page = defaultPages.find(page => page.id === target.id);
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

                projectPageLoader(project);
                return;
            }
        });
    };

    function setUpMain() {
        main.addEventListener('click', event => {
            const target = event.target;

            if (target.classList.contains('todo-item') || target.classList.contains('todo-edit')) {
                // This function will add necessary event listeners to the form in the popup
                managePopupModal('edit', target);
            }
        });
    };

    const setUp = () => {
        setUpSidebar();
        setUpMain();
    };

    return { setUp };
})();

// Load popup modal and add event listeners to it
function managePopupModal(mode = 'edit', targetElement, targetType = 'item') {
    let selectedTodoItem;
    if (mode === 'edit') {
        selectedTodoItem = manageEditModalPopupLoad(targetElement);
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
            // EDIT: will add corner popup here
            return;
        }

        const title = popupForm.querySelector('#edit-todo-title').value;
        const description = popupForm.querySelector('#edit-todo-desc').value;
        const dueDate = popupForm.querySelector('#edit-todo-date').value;
        let priority = popupForm.querySelector('.priority-button.selected').dataset.priority;
        priority = ['low', 'mid', 'high'].includes(priority) ? priority : 'low';
        const status = popupForm.querySelector('#edit-todo-checkbox').checked;

        if (mode === 'edit') {
            selectedTodoItem.update(title, description, processDate(dueDate), priority, status);
            modalManager.closeModal();
        }
    });
}

function manageEditModalPopupLoad(target) {
    const todoObject = todoManager.getTodoObject();

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

    const pageName = document.querySelector('.page').dataset.page;

    const lowercaseProjectName = pageName === 'inbox' ? 'default'
                        : pageName === 'today' || projectName === 'week' ? ''
                        : pageName.slice('project-'.length);

    const section = todoElement.parentNode.parentNode;

    let sectionName;

    let projectName;
    let project;

    if (['inbox', 'today', 'week'].includes(pageName)) {
        if (pageName === 'inbox') {
            project = todoObject.findProject('default');
            sectionName = section.id;
        }

        projectName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
    } else {
        project = todoObject.findProject(lowercaseProjectName);

        if (project === undefined) {
            return;
        }

        projectName = project.name;
        sectionName = section.id;
    }

    const properCaseSectionName = sectionName === 'unlisted' || sectionName === '' || sectionName === undefined ? null
                                                    : project.findSection(sectionName).name;

    modalManager.loadEditModal(projectName, properCaseSectionName, todoItem);
    return todoItem;
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
    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());

    if (!isValid(parsedDate)) {
        return null;
    }

    // Store it as a date object
    return new Date(date);
}

eventListenersObject.setUp();