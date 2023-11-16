/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/todo-manager.js
/*
    The first 3 functions below are responsible for creating and
    returning Todo items, sections and projects respectively
    Note for future: properties can be skipped by the spread operator
        ex: exampleItem.update(...Array(3), 'high'); will only update the priority
*/

function createTodoItem(title, description = '', dueDate, priority = 'low') {
    const update = (newTitle, newDescription, newDueDate, newPriority, newStatus, newStarredStatus) => {
        this.title = newTitle !== undefined ? newTitle: this.title;
        this.description = newDescription !== undefined ? newDescription : this.description;
        this.dueDate = newDueDate !== undefined ? newDueDate : this.dueDate;
        this.priority = newPriority !== undefined ? newPriority : this.priority;
        this.status = newStatus !== undefined ? newStatus : this. status;
        this.starred = newStarredStatus !== undefined ? newStarredStatus : this.starred;
    };

    return {
        title,
        description,
        dueDate,
        priority,
        note,
        // status = false means this todo has not been completed
        status: false,
        update,
    };
}

function createSection(name) {
    const update = newName => {
        this.name = newName !== undefined ? newName : this.name;
    };

    return {
        name,
        items: [],
        update,
    };
}

function createProject(name, description) {
    // Finds section by name
    const findSection = sectionName => this.sections.find(section => section.name === sectionName);

    const update = (newName, newDescription) => {
        this.name = newName !== undefined ? newName : this.name;
        this.description = newDescription !== undefined ? newDescription : this.description;
    }

    return {
        name,
        description,
        unlistedItems: [],
        sections: [],
        findSection,
        update,
    };
}

function checkForEmpty(...args) {
    args.forEach(arg => {
        if (arg === undefined || arg === null || arg === '') {
            return true;
        }
    });

    return false;
}

/*
    The main ToDo object that stores the todo items.
    It has:
        1. a default list for items outside projects (accessible from inbox)
        2. projects for lists
            1. in projects, user can create new projects in which they can create lists (called sections)

    In every list, there are
            1. unlisted items
            2. sections
                1. in every section, there are todo items
*/

const todoManager = (function() {
    const toDoObject = {
        // Projects contains an array of lists each of which has a name, an array of unlisted items,
        // and a sections array which contains dictionaries containing their names and a list of items
        projects: [
            // Default project, accessible from inbox
            createProject(
                'default',
                '',
            ),
        ],

        // Finds project by name
        findProject(projectName) {
            return this.projects.find(project => project.name === projectName);
        },
    };

    const getTodoObject = () => toDoObject;

    // Create the new project and return it
    const addProject = (name, description) => {
        const findProject = toDoObject.findProject(name);

        // Project must not exist
        if (checkForEmpty(name, description) || findProject !== undefined) {
            return false;
        }

        const project = createProject(name, description);
        toDoObject.projects.push(project);

        return project;
    };

    // Add section and then return it
    const addSection = (name, projectName = 'default') => {
        if (checkForEmpty(name)) {
            return false;
        }

        const project = toDoObject.findProject(projectName);

        // Project must exist and section must not
        if (
            project === undefined ||
            project.findSection(name) !== undefined
        ) {
            return false;
        }

        const section = createSection(name);
        project.sections.push(section);

        return section;
    };

    // Add item and then return it
    const addTodoItem = (title, description, dueDate, priority, projectName = 'default', sectionName = null) => {
        const project = toDoObject.findProject(projectName);

        // Project must exist
        if (checkForEmpty(title, description, dueDate, priority) || project === undefined) {
            return false;
        }

        const item = createTodoItem(title, description, dueDate, priority);

        // If section is null, add to unlisted items, else find and then add to that section's item list
        if (sectionName === null) {
            project.unlistedItems.push(item);
        } else {
            const section = project.findSection(sectionName);
            if (section === undefined) {
                return false;
            }

            section.items.push(item);
        }

        return item;
    }

    return { getTodoObject, addProject, addSection, addTodoItem };
})();

/* harmony default export */ const todo_manager = (todoManager);
;// CONCATENATED MODULE: ./src/main.js


window.todoManager = todo_manager;
/******/ })()
;
//# sourceMappingURL=bundle.js.map