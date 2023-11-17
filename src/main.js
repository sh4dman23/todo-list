import todoManager from "./todo-manager.js";
import { domAssociatorObject, inboxPage, todayPage, weekPage, projectPageLoader, defaultLoader } from "./ui-manager.js";
import './assets/style.css';

window.todoManager = todoManager;

todoManager.addProject('Home', 'asjdhasdaosadsa');
todoManager.addProject('Study', 'lorem * 5');
todoManager.addProject('Work');

todoManager.addSection('homework');
const item = todoManager.addTodoItem('laundry', 'must do today', '2023-11-17', 'low', 'default', 'homework');
todoManager.addTodoItem('laundry22', 'must do today too', '2023-11-18', 'high', 'Home');

defaultLoader();

// Sets up event listeners
const eventListenersObject = (function() {
    const defaultPages = [inboxPage, todayPage, weekPage];
    const sidebar = document.querySelector('.sidebar');

    const setUp = () => {
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

                const project = todoManager.getTodoObject().findProject(projectName);

                if (project === undefined) {
                    return;
                }

                projectPageLoader(project);
                return;
            }
        });
    };

    return { setUp };
})();

eventListenersObject.setUp();