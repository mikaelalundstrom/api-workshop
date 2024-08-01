window.addEventListener("load", () => {

  // Get the url from the window, and get the search value
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const searchTerm = urlParams.get("search");

  enableNav();
  setupSearch();
  if (searchTerm) {
    const searchContainer = document.querySelector(".search-container");
    searchContainer.classList.remove("d-none");
    const search = document.querySelector("#search");
    search.value = searchTerm;
  }
  fetchCountries(searchTerm)
    .then(displayCountries)
    .catch((error) => console.log(error));
});

// Adding to favorites
async function addToFavorites() {

  // Get favorites from localStorage and fetch countryList
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const countryList = await fetchCountries();

  const cards = document.querySelectorAll(".card-country");
  cards.forEach((card) => {
    card.addEventListener("click", () => {

      // If the country exists and it's not already in favorites, add it and update favorites
      if (
        countryList.some((country) => String(country.ccn3) === card.dataset.id) &&
        !favorites.some((favorite) => String(favorite.ccn3) === card.dataset.id)
      ) {
        const findCountry = countryList.find((country) => country.ccn3 === card.dataset.id);

        favorites.push(findCountry);

        localStorage.setItem("favorites", JSON.stringify(favorites));
      }
    });
  });
}

// Fetch countries from API
async function fetchCountries(search) {
  try {
    let url = "";
    
    // Fetch and return the data from RESTCountries API
    if (search) {
      url = "https://restcountries.com/v3.1/name/" + search;
    } else {
      url = "https://restcountries.com/v3.1/all";
    }
    const response = await fetch(url);

    // If it's a bad request throw error to move to error handler
    if (response.status !== 200) {
      throw new Error();
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);

    // Construct error card if promise was rejected
    error = [
      {
        flags: {
          png: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/505px-FullMoon2010.jpg",
        },
        name: { common: "Out of this world" },
        region: "solar system",
        population: 0,
      },
    ];

    return error;
  }
}

// Render the countries to the screen
function displayCountries(countries) {
  const countriesGrid = document.querySelector(".countries-container");

  // Clear results in container
  clearCountries(countriesGrid);

  // Create a card for each country and append to the container
  countries.forEach((country) => {
    const card = createCard(country);
    countriesGrid.appendChild(card);
  });

  addToFavorites();
}

// Function to clear results before rendering new ones
function clearCountries(node) {
  while (node.firstChild) {
    node.removeChild(node.lastChild);
  }
}

// Create card to display country information
function createCard(countryObj) {
  const card = document.createElement("article");
  card.classList.add("card-country");
  card.dataset.id = countryObj.ccn3;
  const figure = document.createElement("figure");
  const img = document.createElement("img");

  img.src = countryObj.flags.png;
  img.alt = countryObj.flags.alt;

  figure.appendChild(img);
  card.appendChild(figure);

  const div = document.createElement("div");
  div.classList.add("details");

  const smallHeading = document.createElement("h3");
  smallHeading.textContent = countryObj.name.common;

  div.appendChild(smallHeading);

  const ul = document.createElement("ul");
  ul.classList.add("country-facts");

  if (countryObj.capital) {
    ul.appendChild(createLi("Capital: " + countryObj.capital[0]));
  }
  ul.appendChild(createLi("Region: " + countryObj.region));
  if (countryObj.currencies) {
    ul.appendChild(createLi("Currency: " + Object.keys(countryObj.currencies)[0]));
  }
  if (countryObj.languages) {
    ul.appendChild(createLi("Language: " + Object.values(countryObj.languages)[0]));
  }
  ul.appendChild(createLi("Population: " + countryObj.population.toLocaleString()));

  div.appendChild(ul);
  card.appendChild(div);
  return card;
}

// Create li element to display country details on country card
function createLi(string) {
  const li = document.createElement("li");
  li.textContent = string;
  return li;
}

// Enabling navigation links (showing / hiding the search from)
function enableNav() {
  const searchContainer = document.querySelector(".search-container");
  const favoritesContainer = document.querySelector(".favorites-container");
  const navLinks = document.querySelectorAll(".navigation-links > li");

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.target.id === "home-link") {
        searchContainer.classList.add("d-none");
        favoritesContainer.classList.add("d-none");
      } else if (event.target.id === "search-link") {
        searchContainer.classList.remove("d-none");
        favoritesContainer.classList.add("d-none");
      } else if (event.target.id === "favorites-link") {
        searchContainer.classList.add("d-none");
        favoritesContainer.classList.remove("d-none");
        displayCountries(JSON.parse(localStorage.getItem("favorites")));
      }
    });
  });
}

// Setup the search form
function setupSearch() {
  const search = document.querySelector("#search");

  // Block to prevent fetch too often.
  let block = false;

  search.addEventListener("input", (event) => {
    if (!block) {
      block = true;
      setTimeout(() => {
        block = false;

        fetchCountries(event.target.value)
          .then(displayCountries)
          .catch((error) => console.log(error));
      }, 1000);
    }
  });
}
