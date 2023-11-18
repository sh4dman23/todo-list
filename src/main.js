import todoManager from "./todo-manager.js";
import { domAssociatorObject, pageLoader, modalManager, DOMAdderRemover } from "./ui-manager.js";
import { parse, isValid } from 'date-fns';
import './assets/style.css';

window.todoManager = todoManager;

todoManager.addProject('HOme', 'asjdhasdaosadsa');
todoManager.addProject('Study', 'lorem * 5');
todoManager.addProject('Work');

todoManager.addSection('homework');
const item = todoManager.addTodoItem('laundry', 'must do today', new Date('2023-11-17'), 'low', 'default', 'homework');
todoManager.addTodoItem('laundry22', 'must do today too', new Date('2023-11-18'), 'high', 'HOme');

pageLoader.defaultLoader();

// Set up event listeners; all functions of this module called here are written down below
const eventListenersObject = (function() {
    const todoObject = todoManager.getTodoObject();

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
            }
        });
    };

    function setUpMain() {
        main.addEventListener('click', event => {
            const target = event.target;

            if (target.classList.contains('todo-item') || target.classList.contains('todo-edit')) {
                // Open and manage popup modal for *editing items*
                managePopupModal('edit', target, 'item');
            } else if (target.classList.contains('add-todo')) {
                // Open and manage popup modal for *adding items*
                managePopupModal('add', target, 'item');
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
    let selectedTodoElement, selectedTodoItem, section, projectName;

    if (mode === 'edit' && targetType === 'item') {
        [selectedTodoElement, selectedTodoItem] = manageEditItemModalLoad(targetElement);
    } else if (mode === 'add' && targetType === 'item') {
        [section, projectName] = manageAddItemModalLoad(targetElement);
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
        priority = ['low', 'medium', 'high'].includes(priority) ? priority : 'low';

        if (mode === 'edit' && targetType === 'item') {
            const status = popupForm.querySelector('#edit-todo-checkbox').checked;
            selectedTodoItem.update(title, description, processDate(dueDate), priority, status);
            modalManager.closeModal();
            pageLoader.refreshItem(selectedTodoElement, selectedTodoItem);

        } else if (mode === 'add' && targetType === 'item') {
            const sectionName = section.dataset.name;
            const newTodoItem = todoManager.addTodoItem(title, description, processDate(dueDate), priority, projectName, sectionName);
            DOMAdderRemover.addItem(section, newTodoItem);
            modalManager.closeModal();
            // Why do we not use a refresh page here? because, we are already adding the element using the add item method
        }
    });
}

function manageEditItemModalLoad(target) {
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

    const pageName = pageLoader.getCurrentPage();

    let projectName;
    if (pageName.startsWith('project-')) {
        projectName = pageName.slice('project-'.length);
    } else {
        projectName = 'default';
    }

    modalManager.loadAddItemModal(projectName === 'default' ? 'Inbox' : projectName, section.dataset.name);

    return [section, projectName];
}

function manageConfirmationModel(target, targetType) {
    // load modal with args (targetType)
    // add event listener to delete from both memory and dom if yes is clicked
    // add event listener to close popup if cancel is clicked
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

function getProjectAndSectionName(todoItem) {
    return [todoItem.projectName, todoItem.sectionName];
}

function refreshPage() {
    const currentPage = pageLoader.getCurrentPage();

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
    pageLoader.projectPageLoader(projectName);
}

eventListenersObject.setUp();