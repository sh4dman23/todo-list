import todoManager from '../todo-manager.js';
import {
    default as createElementWithClass,
    createProjectButton,
    createItemElement,
    createSectionElement,
    createEmptyDiv,
    createTodoButton,
} from './common.js';
import { isToday, isThisWeek, format, isFuture } from 'date-fns';
import SVGObject from './svg-manager.js';

const main = document.querySelector('main');

const todoObject = todoManager.getTodoObject();

function clearPage() {
    main.innerHTML = '';
}

function setActivePage(pageId = 'inbox') {
    document
        .querySelectorAll('.sidebar-item.active')
        .forEach((item) => item.classList.remove('active'));

    const pageButton =
        document.querySelector(`.sidebar-item#${pageId}`) ||
        document.querySelector(`.sidebar-item[data-name="${pageId.slice('project-'.length)}"]`);

    pageButton.classList.add('active');
    setCurrentPage(pageId);
}

let currentPage = 'inbox';

const getCurrentPage = () => currentPage;
const setCurrentPage = (newPage) => (currentPage = newPage);

function createTopBar(
    title,
    hasExtra = false,
    projectDescription = '',
    isInbox = false,
) {
    const topBar = createElementWithClass('pg-top-section');

    const topBarHeader = createElementWithClass(
        hasExtra ? 'project-name' : '',
        'h1',
    );
    topBarHeader.textContent = title;

    topBar.appendChild(topBarHeader);

    if (hasExtra) {
        const desc = createElementWithClass('project-desc');
        desc.textContent = projectDescription;

        const buttons = createElementWithClass('project-buttons');

        if (!isInbox) {
            const editButton = createElementWithClass('project-edit', 'button');
            editButton.innerHTML = SVGObject.edit + 'Edit Project';
            buttons.appendChild(editButton);
        }

        const addSection = createElementWithClass(
            'project-add-section',
            'button',
        );
        addSection.innerHTML = SVGObject.add + 'Add Section';

        buttons.appendChild(addSection);

        if (!isInbox) {
            const deleteProject = createElementWithClass(
                'project-delete',
                'button',
            );
            deleteProject.innerHTML = SVGObject.delete + 'Delete Project';
            buttons.appendChild(deleteProject);
        }

        topBar.appendChild(desc);
        topBar.appendChild(buttons);
    }

    return topBar;
}

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
                if (
                    unlistedItem.dueDate !== null &&
                    unlistedItem.status === false &&
                    (isToday(unlistedItem.dueDate) ||
                        format(new Date(), 'yyyy-MM-dd') ===
                            format(unlistedItem.dueDate, 'yyyy-MM-dd'))
                ) {
                    itemList.appendChild(createItemElement(unlistedItem));
                }
            }
            for (const section of project.sections) {
                for (const item of section.items) {
                    if (
                        item.dueDate !== null &&
                        item.status === false &&
                        (isToday(item.dueDate) ||
                            format(new Date(), 'yyyy-MM-dd') ===
                                format(item.dueDate, 'yyyy-MM-dd'))
                    ) {
                        itemList.appendChild(createItemElement(item));
                    }
                }
            }
        }

        if (itemList.childElementCount === 0) {
            itemList.appendChild(
                createEmptyDiv(
                    'Woah! You seem to have finished all your tasks for today. Good Job!',
                ),
            );
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
                if (
                    unlistedItem.dueDate !== null &&
                    unlistedItem.status === false &&
                    isThisWeek(unlistedItem.dueDate, { weekStartsOn: 0 }) &&
                    isFuture(unlistedItem.dueDate)
                ) {
                    itemList.appendChild(createItemElement(unlistedItem));
                }
            }
            for (const section of project.sections) {
                for (const item of section.items) {
                    if (
                        item.dueDate !== null &&
                        item.status === false &&
                        isThisWeek(item.dueDate, { weekStartsOn: 0 }) &&
                        isFuture(item.dueDate)
                    ) {
                        itemList.appendChild(createItemElement(item));
                    }
                }
            }
        }

        if (itemList.childElementCount === 0) {
            itemList.appendChild(
                createEmptyDiv(
                    'Woah! You seem to have finished all your tasks for this week. Good Job!',
                ),
            );
        }

        page.appendChild(itemList);
        main.appendChild(page);
        setActivePage('week');
    },
};

const defaultPages = [inboxPage, todayPage, weekPage];

const projectPageLoader = (project) => {
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
    defaultPages.forEach((page) => {
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

export {
    getCurrentPage,
    setCurrentPage,
    defaultPages,
    projectPageLoader,
    loadSideBar,
    defaultLoader,
    refreshPage,
};
