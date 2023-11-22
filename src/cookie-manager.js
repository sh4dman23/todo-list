import {
    default as todoManager,
    findSection,
    updateTodoItem,
    updateProject,
} from './todo-manager';
const todoObject = todoManager.getTodoObject();

if (!localStorage.getItem('projects')) {
    populateLocalStorage();
} else {
    fillTodoObject();
}

function populateLocalStorage() {
    // This fills the todoManager object with demo projects, assignments and todos
    createDemoTodoObject();

    // we fill up the array with everything except the methods
    let projects = [];
    for (const project of todoObject.projects) {
        const unlistedItems = [];
        for (const item of project.unlistedItems) {
            // backwards compatibility for when items did not have uids in this project
            if (!('uid' in item)) {
                item.uid = crypto.randomUUID();
            }
            unlistedItems.push(item);
        }

        const sections = [];
        for (const section of project.sections) {
            const itemList = [];
            for (const item of section.items) {
                if (!('uid' in item)) {
                    item.uid = crypto.randomUUID();
                }
                itemList.push(item);
            }

            sections.push({
                name: section.name,
                items: itemList,
            });
        }

        projects.push({
            name: project.name,
            unlistedItems,
            sections,
        });
    }

    setLocal(projects);
}

function fillTodoObject() {
    const projectsArrayFromLocal = JSON.parse(localStorage.getItem('projects'));

    if (
        !(
            projectsArrayFromLocal[0].name === 'default' &&
            projectsArrayFromLocal[0].hasOwnProperty('unlistedItems') &&
            projectsArrayFromLocal[0].hasOwnProperty('sections')
        )
    ) {
        populateLocalStorage();
    }

    for (const project of projectsArrayFromLocal) {
        for (const item of project.unlistedItems) {
            item.dueDate =
                item.dueDate === null ? null : new Date(item.dueDate);
            Object.assign(item, { update: updateTodoItem });
        }

        for (const section of project.sections) {
            for (const item of section.items) {
                item.dueDate =
                    item.dueDate === null ? null : new Date(item.dueDate);
                Object.assign(item, { update: updateTodoItem });
            }
        }

        Object.assign(project, { findSection, update: updateProject });
    }

    todoObject.projects = projectsArrayFromLocal;
}

function createDemoTodoObject() {
    todoManager
        .addTodoItem('laundry', undefined, new Date('2023-11-17'), 'medium')
        .update(...Array(4), true);
    todoManager
        .addTodoItem('leg day', 'just go', new Date('2023-11-18'), 'low')
        .update(...Array(4), true);
    todoManager.addTodoItem('brush teeth');

    todoManager.addSection('weekly shopping');
    todoManager.addTodoItem(
        'buy new shoes',
        'must',
        new Date('2023-11-25'),
        'high',
        'default',
        'weekly shopping',
    );
    todoManager.addTodoItem(
        'buy food',
        'also must',
        new Date('2023-11-25'),
        'high',
        'default',
        'weekly shopping',
    );

    todoManager.addProject('Home', 'Small stuff I just gotta do');

    todoManager.addTodoItem(
        'clean the living room',
        "haven't done this in a while",
        new Date('2023-11-26'),
        'medium',
        'Home',
    );
    todoManager
        .addTodoItem('water the plants', 'when free', undefined, 'high', 'Home')
        .update(...Array(4), true);

    todoManager.addProject('Study', 'Gotta finish these before vacation');
    todoManager.addSection('homework', 'Study');
    todoManager.addSection('exams', 'Study');

    todoManager.addTodoItem(
        'math exercise 3.2',
        'finish before monday',
        new Date('2023-11-20'),
        'low',
        'Study',
        'homework',
    );
    todoManager.addTodoItem(
        'biology-2 pg: 201-227',
        'revise for test',
        new Date('2023-11-21'),
        'medium',
        'Study',
        'homework',
    );

    todoManager.addTodoItem(
        'physics-1',
        'on chapter 4',
        new Date('2023-11-19'),
        'high',
        'Study',
        'exams',
    );
    todoManager.addTodoItem(
        'biology-2',
        'on chapter 3',
        new Date('2023-11-22'),
        'high',
        'Study',
        'exams',
    );

    todoManager.addProject('Work', 'When does vacation start');

    todoManager
        .addTodoItem(
            'play cod with the bois',
            'i dont work :D',
            undefined,
            'high',
            'Work',
        )
        .update(...Array(4), true);
}

function saveProject(newProject) {
    const projectCopy = Object.assign({}, newProject);

    delete projectCopy.findSection;
    delete projectCopy.update;

    const projectsArray = getProjectsArray();

    projectsArray.push(projectCopy);

    setLocal(projectsArray);
}

function editProject(oldName, project) {
    const projectsArray = getProjectsArray();

    const foundProject = projectsArray.find(
        (localProject) => localProject.name === oldName,
    );

    foundProject.name = project.name;
    foundProject.description = project.description;

    setLocal(projectsArray);
}

function deleteProject(projectName) {
    let projectsArray = getProjectsArray();

    const projectIndex = projectsArray.findIndex(
        (localProject) => localProject.name === projectName,
    );

    projectsArray = projectsArray
        .slice(0, projectIndex)
        .concat(projectsArray.slice(projectIndex + 1));

    setLocal(projectsArray);
}

function saveSection(projectName, newSection) {
    const sectionCopy = Object.assign({}, newSection);

    const projectsArray = getProjectsArray();

    const project = projectsArray.find(
        (localProject) => localProject.name === projectName,
    );

    project.sections.push(sectionCopy);

    setLocal(projectsArray);
}

function deleteSection(projectName, sectionName) {
    const projectsArray = getProjectsArray();

    const project = projectsArray.find(
        (localProject) => localProject.name === projectName,
    );

    const sectionIndex = project.sections.findIndex(
        (localSection) => localSection.name === sectionName,
    );

    project.sections = project.sections
        .slice(0, sectionIndex)
        .concat(project.sections.slice(sectionIndex + 1));

    setLocal(projectsArray);
}

function saveTodo(todoItem) {
    const todoItemCopy = Object.assign({}, todoItem);
    delete todoItemCopy.update;

    const projectsArray = getProjectsArray();

    const project = projectsArray.find(
        (localProject) => localProject.name === todoItem.projectName,
    );

    if (todoItem.sectionName === null) {
        project.unlistedItems.push(todoItem);
    } else {
        const section = project.sections.find(
            (localSection) => localSection.name === todoItem.sectionName,
        );
        section.items.push(todoItem);
    }

    setLocal(projectsArray);
}

function editTodo(todoItem) {
    const projectsArray = getProjectsArray();

    const project = projectsArray.find(
        (localProject) => localProject.name === todoItem.projectName,
    );
    if (!project) {
        return false;
    }

    let localTodoItem;
    if (todoItem.sectionName === null) {
        localTodoItem = project.unlistedItems.find(
            (item) => item.uid === todoItem.uid,
        );
    } else {
        const section = project.sections.find(
            (localSection) => localSection.name === todoItem.sectionName,
        );
        if (!section) {
            return false;
        }

        localTodoItem = section.items.find((item) => item.uid === todoItem.uid);
    }

    if (!localTodoItem) {
        return false;
    }

    localTodoItem.title = todoItem.title;
    localTodoItem.description = todoItem.description;
    localTodoItem.dueDate = todoItem.dueDate;
    localTodoItem.priority = todoItem.priority;
    localTodoItem.status = todoItem.status;

    setLocal(projectsArray);
}

function removeTodo(todoItem) {
    const projectsArray = getProjectsArray();

    const project = projectsArray.find(
        (localProject) => localProject.name === todoItem.projectName,
    );
    if (!project) {
        return false;
    }

    if (todoItem.sectionName === null) {
        const localTodoItemIndex = project.unlistedItems.findIndex(
            (item) => item.uid === todoItem.uid,
        );
        if (localTodoItemIndex === -1) {
            return false;
        }

        project.unlistedItems = project.unlistedItems
            .slice(0, localTodoItemIndex)
            .concat(project.unlistedItems.slice(localTodoItemIndex + 1));
    } else {
        const section = project.sections.find(
            (localSection) => localSection.name === todoItem.sectionName,
        );
        if (!section) {
            return false;
        }

        const localTodoItemIndex = section.items.findIndex(
            (item) => item.uid === todoItem.uid,
        );
        if (localTodoItemIndex === -1) {
            return false;
        }

        section.items = section.items
            .slice(0, localTodoItemIndex)
            .concat(section.items.slice(localTodoItemIndex + 1));
    }

    setLocal(projectsArray);
}

function getProjectsArray() {
    return JSON.parse(localStorage.getItem('projects'));
}

function setLocal(projectsArray) {
    localStorage.setItem('projects', JSON.stringify(projectsArray));
}

export {
    saveProject,
    editProject,
    deleteProject,
    saveSection,
    deleteSection,
    saveTodo,
    editTodo,
    removeTodo,
};
