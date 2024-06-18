document.addEventListener('DOMContentLoaded', function () {
    const compareBtn = document.getElementById('compareBtn');
    const item1Select = document.getElementById('item1');
    const item2Select = document.getElementById('item2');
    const comparisonResults = document.getElementById('comparison-results');

    compareBtn.addEventListener('click', function (event) {
        event.preventDefault();

        const item1 = item1Select.value;
        const item2 = item2Select.value;

        if (!item1 || !item2) {
            alert('Please select both items to compare.');
            return;
        }

        fetch('food_data.csv')
            .then(response => response.text())
            .then(data => {
                const results = Papa.parse(data, { header: true });
                const items = results.data;

                const item1Data = items.find(item => item.Name === item1 && item.Details.includes('Nutritional Info:'));
                const item2Data = items.find(item => item.Name === item2 && item.Details.includes('Nutritional Info:'));

                if (!item1Data || !item2Data) {
                    alert('Nutritional information for one or both selected items is missing.');
                    return;
                }

                const item1Nutrients = parseNutrients(item1Data.Details);
                const item2Nutrients = parseNutrients(item2Data.Details);

                displayComparison(item1, item1Nutrients, item2, item2Nutrients);
            })
            .catch(error => {
                console.error('Error fetching CSV data:', error);
            });
    });

    function parseNutrients(details) {
        const nutritionalInfo = details.match(/Nutritional Info: (.*)/);
        if (!nutritionalInfo) {
            return {};
        }
        const nutrients = nutritionalInfo[1].split(',').map(n => n.trim());
        const nutrientObj = {};

        nutrients.forEach(nutrient => {
            const [key, value] = nutrient.split(/-(.+)/).map(str => str.trim());
            if (['Energy', 'Carbohydrate', 'Sugar', 'Fat', 'Protein'].includes(key)) {
                nutrientObj[key] = value;
            }
        });

        return nutrientObj;
    }

    function displayComparison(item1, item1Nutrients, item2, item2Nutrients) {
        let tableHTML = `<table>
                            <tr>
                                <th>Nutrient</th>
                                <th>${item1}</th>
                                <th>${item2}</th>
                            </tr>`;

        const nutrients = ['Energy', 'Carbohydrate', 'Sugar', 'Fat', 'Protein'];

        nutrients.forEach(nutrient => {
            tableHTML += `<tr>
                            <td>${nutrient}</td>
                            <td>${item1Nutrients[nutrient] || 'N/A'}</td>
                            <td>${item2Nutrients[nutrient] || 'N/A'}</td>
                          </tr>`;
        });

        tableHTML += '</table>';
        comparisonResults.innerHTML = tableHTML;
    }
});