document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const resultsDiv = document.getElementById('results');

  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      const query = searchInput.value.trim();
      if (query !== '') {
        const newTabUrl = `results.html?query=${encodeURIComponent(query)}`;
        window.open(newTabUrl, '_blank');
      } else {
        alert('Please enter a search query.');
      }
    });
  } else {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');

    if (query) {
      fetchData().then(data => {
        const filteredData = filterData(data, query);
        displayResults(filteredData);
      });
    } else {
      resultsDiv.textContent = 'No search query provided.';
    }
  }

  // Function to fetch data from CSV file
  async function fetchData() {
    const response = await fetch('food_data.csv');
    const data = await response.text();
    return data;
  }

  // Function to filter data based on search query
  function filterData(data, query) {
    const rows = data.split('\n');
    const filteredRows = rows.filter(row => {
      const rowData = row.split(',');
      return rowData[0].toLowerCase().includes(query.toLowerCase());
    });
    return filteredRows;
  }

  // Function to display search results
  function displayResults(results) {
    resultsDiv.innerHTML = ''; // Clear previous results

    if (results.length === 0) {
      const noResultsItem = document.createElement('div');
      noResultsItem.textContent = 'No matching items found.';
      resultsDiv.appendChild(noResultsItem);
    } else {
      const uniqueItems = {};

      results.forEach(row => {
        const rowData = row.split(',');
        const itemName = rowData[0].trim();
        const itemDetails = parseItemDetails(rowData);

        if (!uniqueItems[itemName]) {
          uniqueItems[itemName] = itemDetails;
        } else {
          // Merge details for the same item
          uniqueItems[itemName].details.push(...itemDetails.details);
        }
      });

      // Display unique items
      Object.values(uniqueItems).forEach(itemDetails => {
        const itemElement = createItemElement(itemDetails);
        resultsDiv.appendChild(itemElement);
      });
    }
  }

  // Function to parse item details from CSV row
  function parseItemDetails(rowData) {
    const itemDetails = {
      name: rowData[0],
      details: []
    };

    for (let i = 1; i < rowData.length; i++) {
      // Split by colon
      const parts = rowData[i].split(':');
      if (parts.length === 2) {
        // Format: bold for key, normal for value
        let detail = `<b>${parts[0].trim()}</b>: ${parts[1].trim()}`;
        itemDetails.details.push(detail);
      } else {
        // Handle unexpected format
        itemDetails.details.push(rowData[i].trim());
      }
    }

    return itemDetails;
  }

  // Function to create HTML element for each item
  function createItemElement(itemDetails) {
    const itemContainer = document.createElement('div');
    itemContainer.classList.add('item-container');

    // Create a link to Google search for the ingredient
    const googleLink = document.createElement('a');
    googleLink.href = `https://www.google.com/search?q=${encodeURIComponent(itemDetails.name)}`;
    googleLink.target = '_blank'; // Open link in new tab
    googleLink.textContent = itemDetails.name;
    googleLink.style.fontWeight = 'bold'; // Optional: Make link text bold
    googleLink.style.textDecoration = 'none'; // Optional: Remove underline

    itemContainer.appendChild(googleLink);

    const detailsContainer = document.createElement('div');
    itemDetails.details.forEach(detail => {
      const detailPara = document.createElement('p');
      detailPara.innerHTML = detail; // Use innerHTML to render bold tags
      detailsContainer.appendChild(detailPara);
    });
    itemContainer.appendChild(detailsContainer);

    return itemContainer;
  }
});
