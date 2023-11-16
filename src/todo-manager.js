import { format, parse, isValid } from 'date-fns';

/*
    The first 3 functions below are responsible for creating and
    returning Todo items, sections and projects respectively
    Note for future: properties can be skipped by the spread operator
        ex: exampleItem.update(...Array(3), 'high'); will only update the priority
*/

function createTodoItem(title, description = '', dueDate = null, priority = 'low') {
    const todo = {
        title,
        description,
        dueDate,
        priority,
        status: false, // status = false means this todo has not been completed
    };
    const update = (newTitle, newDescription, newDueDate, newPriority, newStatus, newStarredStatus) => {
        todo.title = newTitle !== undefined ? newTitle: todo.title;
        todo.description = newDescription !== undefined ? newDescription : todo.description;
        todo.dueDate = newDueDate !== undefined ? newDueDate : todo.dueDate;
        todo.priority = newPriority !== undefined ? newPriority : todo.priority;
        todo.status = newStatus !== undefined ? newStatus : todo. status;
        todo.starred = newStarredStatus !== undefined ? newStarredStatus : todo.starred;
    };

    return todo;
}

function createSection(name) {
    const section = {
        name,
        items: [],
    };
    const update = newName => {
        section.name = newName !== undefined ? newName : section.name;
    };

    return Object.assign(section, { update });
}

function createProject(name, description = '') {
    const project = {
        name,
        description,
        unlistedItems: [],
        sections: [],
    };

    // Finds section by name
    const findSection = sectionName => project.sections.find(section => section.name === sectionName);

    const update = (newName, newDescription) => {
        project.name = newName !== undefined ? newName : project.name;
        project.description = newDescription !== undefined ? newDescription : project.description;
    }

    return Object.assign(project, { findSection, update });
}

function checkForEmpty(...args) {
    args.forEach(arg => {
        if (arg === undefined || arg === null || arg === '') {
            return true;
        }
    });

    return false;
}

// REMOVE: MOVE THIS TO UI MANAGER LATER
function processDate(date) {
    if (checkForEmpty(date) || date === 'none') {
        return null;
    }

    // Check for validity
    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());

    if (!isValid(parsedDate)) {
        return null;
    }

    // This is for the UI manager
    // return format(dateObject, 'd MMM yyyy');

    // Store it as a date object
    return new Date(date);
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
    const addTodoItem = (title, description, dueDate, priority, projectName = 'default', sectionName = null) => {
        const project = todoObject.findProject(projectName);

        // Project must exist
        if (checkForEmpty(title, priority) || project === undefined) {
            return false;
        }

        const item = createTodoItem(title, description, processDate(dueDate), priority);

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

export default todoManager;