"use strict";

// Safe text sanitization
function sanitizeInput(value) {
    return value
        .replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
}

// Sample events
let events = JSON.parse(
    localStorage.getItem("bookstoreEvents")
) || [
    {
        id: 1,
        title: "Summer Book Reading",
        category: "Book Reading",
        date: "2026-10-10",
        time: "16:00",
        location: "Main Bookstore",
        description: "Join us for an exciting book reading session."
    },
    {
        id: 2,
        title: "Creative Writing Workshop",
        category: "Workshop",
        date: "2026-10-15",
        time: "14:00",
        location: "Reading Hall",
        description: "Learn creative writing techniques."
    },
    {
        id: 3,
        title: "Classic Literature Discussion",
        category: "Discussion",
        date: "2026-10-20",
        time: "17:00",
        location: "Community Room",
        description: "Discuss your favourite classic novels."
    }
];

let activeFilter = "All";

const eventList = document.getElementById("eventList");
const searchInput = document.getElementById("searchInput");
const eventForm = document.getElementById("eventForm");
const loading = document.getElementById("loading");
const emptyMessage = document.getElementById("emptyMessage");

function trackAction() {
    console.log(
        "[Analytics] User interacted with Independent Bookstore Events Page"
    );
}

// Update dashboard
function updateStats() {
    document.getElementById("totalEvents").textContent = events.length;

    const today = new Date().toISOString().split("T")[0];

    const upcoming = events.filter(event => event.date >= today);
    document.getElementById("upcomingEvents").textContent = upcoming.length;

    const categories = new Set(events.map(event => event.category));
    document.getElementById("totalCategories").textContent =
        categories.size;
}

// Display events
function displayEvents() {
    const searchText = searchInput.value.toLowerCase().trim();

    const filteredEvents = events.filter(event => {
        const matchesSearch =
            event.title.toLowerCase().includes(searchText) ||
            event.location.toLowerCase().includes(searchText);

        const matchesCategory =
            activeFilter === "All" ||
            event.category === activeFilter;

        return matchesSearch && matchesCategory;
    });

    eventList.replaceChildren();

    emptyMessage.hidden = filteredEvents.length !== 0;

    filteredEvents.forEach(event => {
        const card = document.createElement("article");
        card.className = "event-card";

        const title = document.createElement("h3");
        title.textContent = event.title;

        const category = document.createElement("span");
        category.className = "category-tag";
        category.textContent = event.category;

        const date = document.createElement("p");
        date.textContent = "Date: " + event.date;

        const time = document.createElement("p");
        time.textContent = "Time: " + event.time;

        const location = document.createElement("p");
        location.textContent = "Location: " + event.location;

        const description = document.createElement("p");
        description.textContent = event.description;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete Event";
        deleteButton.type = "button";
        deleteButton.setAttribute(
            "aria-label",
            "Delete event " + event.title
        );

        deleteButton.addEventListener("click", function () {

    events = events.filter(function (item) {
        return item.id !== event.id;
    });

    localStorage.setItem(
        "bookstoreEvents",
        JSON.stringify(events)
    );

    updateStats();
    displayEvents();
    trackAction();

});

        card.append(
            category,
            title,
            date,
            time,
            location,
            description,
            deleteButton
        );

        eventList.appendChild(card);
    });

    updateStats();
}

// Loading simulation
function loadEvents() {
    loading.hidden = false;
    eventList.hidden = true;

    setTimeout(() => {
        loading.hidden = true;
        eventList.hidden = false;
        displayEvents();
    }, 500);
}

// Category filters
document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");
        activeFilter = button.dataset.filter;

        displayEvents();
        trackAction();
    });
});

// Search
searchInput.addEventListener("input", displayEvents);

// Scroll to form
document.getElementById("addEventButton").addEventListener("click", () => {
    document.getElementById("add-event").scrollIntoView({
        behavior: "smooth"
    });

    document.getElementById("eventTitle").focus();
    trackAction();
});

// Form validation
eventForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const fields = [
        "eventTitle",
        "eventCategory",
        "eventDate",
        "eventTime",
        "eventLocation",
        "eventDescription"
    ];

    let valid = true;

    fields.forEach(id => {
        const field = document.getElementById(id);
        const error = field.parentElement.querySelector(".error-message");

        field.classList.remove("invalid");
        error.textContent = "";

        const value = field.value.trim();

        if (!value) {
            field.classList.add("invalid");
            error.textContent = "This field is required.";
            valid = false;
        }
    });

    const dateField = document.getElementById("eventDate");

    if (dateField.value &&
        dateField.value < new Date().toISOString().split("T")[0]) {
        dateField.classList.add("invalid");
        dateField.parentElement.querySelector(".error-message").textContent =
            "Please select a current or future date.";
        valid = false;
    }

    if (!valid) {
        document.getElementById("formMessage").textContent =
            "Please correct the highlighted fields.";
        return;
    }

    const newEvent = {
        id: Date.now(),
        title: sanitizeInput(
            document.getElementById("eventTitle").value.trim()
        ),
        category: document.getElementById("eventCategory").value,
        date: dateField.value,
        time: document.getElementById("eventTime").value,
        location: sanitizeInput(
            document.getElementById("eventLocation").value.trim()
        ),
        description: sanitizeInput(
            document.getElementById("eventDescription").value.trim()
        )
    };

    events.push(newEvent);
localStorage.setItem("bookstoreEvents", JSON.stringify(events));
    eventForm.reset();

    document.getElementById("formMessage").textContent =
        "Event created successfully!";

    activeFilter = "All";

    document.querySelectorAll(".filter-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === "All"
        );
    });

    displayEvents();
    trackAction();
});

// Start application
loadEvents();