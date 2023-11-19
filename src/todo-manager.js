import { format, parse, isValid } from 'date-fns';

export function updateTodoItem(newTitle, newDescription, newDueDate, newPriority, newStatus) {
    this.title = newTitle !== undefined ? newTitle : this.title;
    this.description = newDescription !== undefined ? newDescription : this.description;
    this.dueDate = newDueDate !== undefined ? newDueDate : this.dueDate;
    this.priority = newPriority !== undefined ? newPriority : this.priority;
    this.status = newStatus !== undefined ? newStatus : this.status;
};

// Finds section by name
export function findSection(sectionName) {
    return this.sections.find(section => section.name === sectionName);
}

// While To-Dos may have the same name, projects cannot. So, we need to perform a check
export function updateProject(newName, newDescription) {
    if (todoManager.getTodoObject().findProject(newName) !== undefined && newName !== this.name) {
        return false;
    }

    this.name = newName !== undefined ? newName : this.name;
    this.description = newDescription !== undefined ? newDescription : this.description;
}

/*
    The first 3 functions below are responsible for creating and
    returning Todo items, sections and projects respectively
    Note for future: properties can be skipped by the spread operator
        ex: exampleItem.update(...Array(3), 'high'); will only update the priority
*/

function createTodoItem(title, description = '', dueDate = null, priority = 'low', projectName = 'default', sectionName = null) {
    const todo = {
        title,
        description,
        dueDate,
        priority,
        status: false, // status = false means this todo has not been completed
        projectName,
        sectionName,
    };

    return Object.assign(todo, { update: updateTodoItem });
}

function createSection(name) {
    const section = {
        name,
        items: [],
    };

    return section;
}

function createProject(name, description = '') {
    const project = {
        name,
        description,
        unlistedItems: [],
        sections: [],
    };

    return Object.assign(project, { findSection, update: updateProject });
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
    The main ToDo object stores the todo items.
    It has:
        1. a default list for items outside projects (accessible from inbox)
        2. projects for lists
            1. in projects, user can create new projects in which they can create lists (called sections)

    In every list, there are
            1. unlisted items
            2. sections
                1. in every section, there are todo items
    The todoManager below manages the todoObject and other functions related to it
*/

const todoManager = (function() {
    const todoObject = {
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

    const getTodoObject = () => todoObject;

    // Create the new project and return it
    const addProject = (name, description) => {
        const findProject = todoObject.findProject(name);

        // Project must not exist
        if (checkForEmpty(name) || findProject !== undefined) {
            return false;
        }

        const project = createProject(name, description);
        todoObject.projects.push(project);

        return project;
    };

    // Add section and then return it
    const addSection = (name, projectName = 'default') => {
        if (checkForEmpty(name)) {
            return false;
        }

        const project = todoObject.findProject(projectName);

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
    const addTodoItem = (title, description, dueDate = null, priority, projectName = 'default', sectionName = null) => {
        const project = todoObject.findProject(projectName);

        // Project must exist
        if (checkForEmpty(title, priority) || project === undefined) {
            return false;
        }

        const item = createTodoItem(title, description, dueDate, priority, projectName, sectionName);

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
    };

    const deleteTodoItem = (todoItem) => {
        const project = todoObject.findProject(todoItem.projectName);

        if (project === undefined) {
            return false;
        }

        const sectionName = todoItem.sectionName;

        // We need to do the same thing twice here because, the property value isn't passed by reference, unlike the object itself
        let itemList;
        if (sectionName === null) {
            itemList = project.unlistedItems;
            const itemIndex = itemList.findIndex(item => item === todoItem);

            if (itemIndex === undefined) {
                return false;
            }

            project.unlistedItems = itemList.slice(0, itemIndex).concat(itemList.slice(itemIndex + 1));
        } else {
            const section = project.findSection(sectionName);
            if (section === undefined) {
                return false;
            }

            itemList = section.items;
            const itemIndex = itemList.findIndex(item => item === todoItem);
            if (itemIndex === undefined) {
                return false;
            }

            section.items = itemList.slice(0, itemIndex).concat(itemList.slice(itemIndex + 1));
        }

        return true;
    };

    const deleteSection = (projectName, sectionName) => {
        const project = todoObject.findProject(projectName);

        if (project === undefined) {
            return false;
        }

        const sectionIndex = project.sections.findIndex(section => section.name === sectionName);

        if (sectionIndex === undefined) {
            return false;
        }

        project.sections = project.sections.slice(0, sectionIndex).concat(project.sections.slice(sectionIndex + 1));

        return true;
    };

    const deleteProject = projectName => {
        const projectIndex = todoObject.projects.findIndex(project => project.name === projectName);
        if (projectIndex === undefined) {
            return false;
        }

        todoObject.projects = todoObject.projects.slice(0, projectIndex).concat(todoObject.projects.slice(projectIndex + 1));

        return true;
    };

    return { getTodoObject, addProject, addSection, addTodoItem, deleteTodoItem, deleteSection, deleteProject };
})();

export default todoManager;