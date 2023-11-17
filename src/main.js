import todoManager from "./todo-manager.js";
import { domAssociatorObject, inboxPage, todayPage, weekPage, defaultLoader } from "./ui-manager.js";
import './assets/style.css';

window.todoManager = todoManager;

todoManager.addProject('Home');
todoManager.addProject('Study');
todoManager.addProject('Work');

todoManager.addSection('homework');
const item = todoManager.addTodoItem('laundry', 'must do today', '2023-11-17', 'low', 'default', 'homework');
todoManager.addTodoItem('laundry22', 'must do today too', '2023-11-18', 'high', 'default', 'homework');

defaultLoader();

// Sets up event listeners
const eventListenersObject = (function() {
    const defaultPages = [inboxPage, todayPage, weekPage];
    const sidebar = document.querySelector('.sidebar');

    const setUp = () => {
        sidebar.addEventListener('click', event => {
            const target = event.target;

            let page = defaultPages.find(page => page.id === target.id);
            if (page !== undefined) {
                page.switchTo();
            }
        });
    };

    return { setUp };
})();

eventListenersObject.setUp();