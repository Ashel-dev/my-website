// ======================================================
// TOURSPHERE - MAIN JAVASCRIPT
// ======================================================

// Check that the destination database has loaded
if (typeof destinations === "undefined") {
    console.error("ERROR: destinations database was not loaded.");
} else {
    console.log("TourSphere database loaded:", destinations.length, "destinations");
}


// ======================================================
// SETTINGS
// ======================================================

let visibleDestinations = 6;
const destinationsPerLoad = 6;


// ======================================================
// SHOW DESTINATIONS
// ======================================================

function displayDestinations() {

    const container = document.getElementById("destination-container");

    if (!container) {
        console.error("ERROR: destination-container was not found.");
        return;
    }

    if (typeof destinations === "undefined") {
        container.innerHTML = `
            <p style="text-align:center;">
                Destination database could not be loaded.
            </p>
        `;
        return;
    }

    // Clear existing cards
    container.innerHTML = "";

    // Display only the number currently allowed
    const destinationsToDisplay =
        destinations.slice(0, visibleDestinations);

    destinationsToDisplay.forEach(function(destination) {

        const card = document.createElement("div");

        card.className = "destination-card";

        // Get first image
        const image =
            destination.images &&
            destination.images.length > 0
                ? destination.images[0]
                : "images/default-destination.jpg";


        // Create card
        card.innerHTML = `
            <img 
                src="${image}" 
                alt="${destination.name}"
                data-destination-id="${destination.id}"
            >

            <div class="destination-info">

                <h3>${destination.name}</h3>

                <p class="location">
                    📍 ${destination.location || "Zimbabwe"}
                </p>

                <p>
                    ${destination.description || "Discover this amazing Zimbabwean destination."}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${destination.category || "Tourist Attraction"}
                </p>

                <button 
                    type="button"
                    class="directions-btn"
                    onclick="getDirections(
                        ${destination.latitude || 0},
                        ${destination.longitude || 0}
                    )"
                >
                    Get Directions
                </button>

            </div>
        `;

        container.appendChild(card);
    });

    console.log(
        "Displayed",
        destinationsToDisplay.length,
        "destinations."
    );

    // Update View More button
    updateViewMoreButton();
}


// ======================================================
// VIEW MORE / SHOW LESS
// ======================================================

function updateViewMoreButton() {

    const button = document.getElementById("viewMoreBtn");

    if (!button) {
        return;
    }

    if (visibleDestinations >= destinations.length) {

        button.textContent = "Show Less";

    } else {

        button.textContent = "View More Destinations";
    }
}


const viewMoreButton =
    document.getElementById("viewMoreBtn");

if (viewMoreButton) {

    viewMoreButton.addEventListener("click", function() {

        if (visibleDestinations < destinations.length) {

            visibleDestinations += destinationsPerLoad;

            if (visibleDestinations > destinations.length) {
                visibleDestinations = destinations.length;
            }

        } else {

            visibleDestinations = 6;

            document
                .getElementById("destinations")
                .scrollIntoView({
                    behavior: "smooth"
                });
        }

        displayDestinations();
    });
}


// ======================================================
// SORT A-Z
// ======================================================

const sortAZButton =
    document.getElementById("sortAZ");

if (sortAZButton) {

    sortAZButton.addEventListener("click", function() {

        destinations.sort(function(a, b) {

            return a.name.localeCompare(b.name);
        });

        visibleDestinations = 6;

        displayDestinations();
    });
}


// ======================================================
// SORT Z-A
// ======================================================

const sortZAButton =
    document.getElementById("sortZ-A");

if (sortZAButton) {

    sortZAButton.addEventListener("click", function() {

        destinations.sort(function(a, b) {

            return b.name.localeCompare(a.name);
        });

        visibleDestinations = 6;

        displayDestinations();
    });
}


// ======================================================
// ROTATING DESTINATION IMAGES
// ======================================================

const imageIndexes = {};


function rotateDestinationImages() {

    if (typeof destinations === "undefined") {
        return;
    }

    destinations.forEach(function(destination) {

        // Only rotate if there are multiple images
        if (
            !destination.images ||
            destination.images.length <= 1
        ) {
            return;
        }

        const image = document.querySelector(
            `img[data-destination-id="${destination.id}"]`
        );

        if (!image) {
            return;
        }

        // Start from image 0
        if (imageIndexes[destination.id] === undefined) {
            imageIndexes[destination.id] = 0;
        }

        // Move to next image
        imageIndexes[destination.id] =
            (imageIndexes[destination.id] + 1)
            % destination.images.length;

        // Change image
        image.src =
            destination.images[
                imageIndexes[destination.id]
            ];
    });
}


// Change images every 4 seconds
setInterval(rotateDestinationImages, 4000);


// ======================================================
// GOOGLE MAPS DIRECTIONS
// ======================================================

function getDirections(latitude, longitude) {

    if (!latitude || !longitude) {

        alert(
            "Location coordinates are not available for this destination."
        );

        return;
    }

    const mapsUrl =
        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    window.open(mapsUrl, "_blank");
}


// ======================================================
// SMART TRIP PLANNER
// ======================================================

const tripForm =
    document.getElementById("tripForm");


if (tripForm) {

    tripForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const budget =
                document.getElementById("budget").value;

            const duration =
                document.getElementById("duration").value;

            const interest =
                document.getElementById("interest").value;

            const travelStyle =
                document.getElementById("travelStyle").value;


            // Check selections
            if (
                !budget ||
                !duration ||
                !interest ||
                !travelStyle
            ) {

                document.getElementById(
                    "recommendationResult"
                ).innerHTML = `
                    <div class="recommendation-box">
                        ⚠️ Please select all your travel preferences.
                    </div>
                `;

                return;
            }


            // Calculate scores
            const rankedDestinations =
                destinations.map(function(destination) {

                    let score = 0;


                    // Interest = 40 points
                    if (
                        destination.interests &&
                        destination.interests.includes(interest)
                    ) {

                        score += 40;
                    }


                    // Budget = 25 points
                    if (
                        destination.budgets &&
                        destination.budgets.includes(budget)
                    ) {

                        score += 25;
                    }


                    // Travel style = 20 points
                    if (
                        destination.styles &&
                        destination.styles.includes(travelStyle)
                    ) {

                        score += 20;
                    }


                    // Duration = 15 points
                    if (
                        destination.durations &&
                        destination.durations.includes(duration)
                    ) {

                        score += 15;
                    }


                    return {
                        ...destination,
                        score: score
                    };
                });


            // Highest score first
            rankedDestinations.sort(
                function(a, b) {
                    return b.score - a.score;
                }
            );


            // Display recommendations
            const result =
                document.getElementById(
                    "recommendationResult"
                );


            result.innerHTML = `

                <div class="recommendation-box">

                    <h2>
                        ✨ Your TourSphere Recommendations
                    </h2>

                    <p>
                        Destinations matching your preferences:
                    </p>

                    <div class="recommendation-list">

                        ${rankedDestinations
                            .slice(0, 5)
                            .map(function(destination, index) {

                                return `

                                    <div class="recommendation-card">

                                        <div class="rank">
                                            #${index + 1}
                                        </div>

                                        <div>

                                            <h3>
                                                ${destination.name}
                                            </h3>

                                            <p>
                                                Match score:
                                                <strong>
                                                    ${destination.score}%
                                                </strong>
                                            </p>

                                        </div>

                                    </div>

                                `;

                            })
                            .join("")}

                    </div>

                </div>

            `;
        }
    );
}


// ======================================================
// HERO BUTTON
// ======================================================

function showDestinations() {

    const section =
        document.getElementById("destinations");

    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });
    }
}


// ======================================================
// INITIALISE TOURSPHERE
// ======================================================

displayDestinations();

console.log(
    "TourSphere is running successfully!"
);
v// =====================================
// SMART TRIP RECOMMENDATION SYSTEM
// =====================================

const tripForm = document.getElementById("tripForm");

if (tripForm) {

    tripForm.addEventListener("submit", function(event) {

        event.preventDefault();

        // Get user information
        const budget = Number(
            document.getElementById("budget").value
        );

        const interest = document
            .getElementById("interest")
            .value
            .toLowerCase()
            .trim();

        const duration = Number(
            document.getElementById("duration").value
        );

        const travellers = Number(
            document.getElementById("travellers").value
        );

        const travelStyleElement =
            document.getElementById("travelStyle");

        const travelStyle = travelStyleElement
            ? travelStyleElement.value.toLowerCase()
            : "";

        const result =
            document.getElementById("recommendationResult");


        // Check that database exists

        if (
            typeof destinations === "undefined" ||
            !Array.isArray(destinations)
        ) {

            result.innerHTML = `
                <p>
                    Sorry, the TourSphere destination database
                    could not be loaded.
                </p>
            `;

            console.error(
                "TourSphere destination database was not loaded."
            );

            return;
        }


        // Check user inputs

        if (
            budget <= 0 ||
            interest === "" ||
            duration <= 0 ||
            travellers <= 0
        ) {

            result.innerHTML = `
                <p>
                    Please enter your budget, interests,
                    trip duration and number of travellers.
                </p>
            `;

            return;
        }


        // =====================================
        // RANK ALL 40+ DESTINATIONS
        // =====================================

        const rankedDestinations = destinations.map(
            function(destination) {

                let score = 0;


                // Convert destination information to text
                // so we can search your existing database.

                const destinationText = [

                    destination.name || "",

                    destination.location || "",

                    destination.category || "",

                    destination.description || "",

                    Array.isArray(destination.activities)
                        ? destination.activities.join(" ")
                        : ""

                ]
                .join(" ")
                .toLowerCase();


                // =====================================
                // INTEREST MATCH
                // =====================================

                const interestWords =
                    interest.split(",");

                interestWords.forEach(function(word) {

                    const cleanWord =
                        word.trim();

                    if (
                        cleanWord !== "" &&
                        destinationText.includes(cleanWord)
                    ) {

                        score += 50;

                    }

                });


                // =====================================
                // CATEGORY MATCH
                // =====================================

                if (
                    destination.category &&
                    destination.category
                        .toLowerCase()
                        .includes(interest)
                ) {

                    score += 20;

                }
                if (duration >=5) {
                    score += 10;
                } else if
                (duration >= 3) {
                    score += 7;
                } else {
                    score += 5;
                }
                if (travellers >= 1) {
                    score += 5;
                }
                if (destination.price !== undefined) {
                    const price =  Number(destination.price);
                    if (
                        !
                        isNaN(price) &&
                        price <= budget
                    ) {
                        score += 15;
                    }
                } else {
                    score += 5;
                }
                return {
                    destination: destination,
                    score: score
                };
            }
        );
    rankedDestinations.sort(
        function(a, b) {
            return b.score - a.score;
        }
    );
    const topRecommendatios = rankedDestinations.slice(0, 5);
    let output = `
    <div class="recommendation-box">
    <h2> Your TourSphere Recommendations </h2>
    <p> We found destinations based on your trip preferences. </p>
    <div class="recommendation-list">
    `


            